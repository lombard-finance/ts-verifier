// Bitcoin Segwit Address Generator
// TypeScript implementation based on Go code

import bs58 from "bs58";
import * as crypto from "crypto-browserify";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  mainnetBlockchainConfigs,
  gastaldBlockchainConfigs,
  Address,
  Ecosystem,
  LChainId,
  SupportedBlockchains,
  BlockchainConfig,
  TokenConfig,
} from "./chain-id";
import { fetchAddressMetadata, trimHexPrefix } from "./api";
import { computeAuxData, DEPOSIT_AUX_V0, DEPOSIT_AUX_V1 } from "./aux-data";
import {
  sha256,
  Networks,
  NetworkParams,
  BitcoinAddressError,
} from "./bitcoin";
import { Tweaker } from "./tweaker";

const DEPOSIT_ADDR_TAG = "LombardDepositAddr";
const DEPRECATED_CHAIN_TAG = 0;

const SOLANA_RPC_DEFAULTS = {
  mainnet: "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
};

// Root deposit public keys for mainnet and Gastald testnet
export const MAINNET_PUBLIC_KEY = Buffer.from(
  "033dcf7a68429b23a0396ca61c1ab243ccbbcc629ff04c59394458d6db5dd2bb15",
  "hex",
);
export const GASTALD_PUBLIC_KEY = Buffer.from(
  "025615e9748b945bad807b56d3a723578673d08566a4818510c0ba2123317414f8",
  "hex",
);

/**
 * Result of online verification
 */
export interface AddressVerificationResult {
  addresses: {
    computed: string;
    expected: string;
    blockchain: string;
    referralId: string;
    nonce: number;
    auxVersion: number;
    tokenAddress: string;
  }[];
}

/**
 * Parameters for online verification
 */
export interface VerifyOnlineParams {
  /** Target blockchain */
  chain: SupportedBlockchains;
  /** Destination address on target chain (hex for EVM/Sui/Starknet, base58 for Solana) */
  toAddress: string;
  /** Bitcoin network (mainnet or gastald). Defaults to mainnet */
  network?: NetworkParams;
  /** Solana RPC connection. Used to look up the mint's owning token program when
   * deriving the Associated Token Address. Defaults based on `network`. */
  solanaConnection?: Connection;
}

/**
 * Parameters for offline address computation
 */
export interface ComputeOfflineParams {
  /** Target blockchain */
  chain: SupportedBlockchains;
  /** Destination address on target chain (hex for EVM/Sui/Starknet, base58 for Solana) */
  toAddress: string;
  /** Token address on target chain (hex for EVM/Sui/Starknet, base58 for Solana).
   * Required for auxVersion 1. 
   **/
  tokenAddress?: string;
  /** Partner referral code */
  referralId: string;
  /** Nonce value */
  nonce: number;
  /** Aux data version */
  auxVersion: number;
  /** Bitcoin network (mainnet or gastald). Defaults to mainnet */
  network?: NetworkParams;
  /** Solana RPC connection. Used to look up the mint's owning token program when
   * deriving the Associated Token Address. Defaults based on `network`. */
  solanaConnection?: Connection;
}

/**
 * Deposit address verifier with static methods for online and offline verification
 */
export class DepositAddressVerifier {
  /**
   * Verify deposit addresses by fetching metadata from API and computing locally.
   * Includes security checks to validate API response matches user-provided data.
   */
  static async verifyOnline(
    params: VerifyOnlineParams,
  ): Promise<AddressVerificationResult> {
    const { network, chainConfig, tweaker, solanaConnection } = this.getContext(
      params.chain,
      params.network,
      params.solanaConnection,
    );

    const addressData = await fetchAddressMetadata(
      chainConfig,
      params.toAddress,
      network,
    );

    const addresses = await Promise.all(
      addressData.addresses.map(async (addr) => {
        this.validateApiResponse(addr, params.toAddress, chainConfig);

        const tokenCfg = this.resolveTokenAddress(
          addr.tokenAddress,
          addr.auxVersion,
          chainConfig,
        );

        const toAddressBuffer = await this.resolveToAddress(
          addr.toAddress,
          tokenCfg,
          chainConfig,
          solanaConnection,
        );

        const computed = this.deriveAddress(
          tweaker,
          network,
          chainConfig,
          tokenCfg.tokenAddress,
          toAddressBuffer,
          addr.referralId,
          addr.nonce,
          addr.auxVersion,
        );

        return {
          computed,
          expected: addr.btcAddress,
          blockchain: chainConfig.name,
          referralId: addr.referralId,
          nonce: addr.nonce,
          auxVersion: addr.auxVersion,
          tokenAddress: this.addressToString(
            tokenCfg.tokenAddress,
            chainConfig.ecosystem,
          ),
        };
      }),
    );

    return { addresses };
  }

  /**
   * Compute a deterministic Bitcoin deposit address without API calls.
   * Use this for fully offline verification when you have all parameters.
   */
  static async computeOffline(params: ComputeOfflineParams): Promise<string> {
    const { network, chainConfig, tweaker, solanaConnection } = this.getContext(
      params.chain,
      params.network,
      params.solanaConnection,
    );

    const tokenAddress = params.tokenAddress
      ? this.addressFromString(params.tokenAddress, chainConfig.ecosystem)
      : null;

    const tokenCfg = this.resolveTokenAddress(
      tokenAddress,
      params.auxVersion,
      chainConfig,
    );

    const toAddressBuffer = await this.resolveToAddress(
      params.toAddress,
      tokenCfg,
      chainConfig,
      solanaConnection,
    );

    return this.deriveAddress(
      tweaker,
      network,
      chainConfig,
      tokenCfg.tokenAddress,
      toAddressBuffer,
      params.referralId,
      params.nonce,
      params.auxVersion,
    );
  }

  /**
   * Get common context: resolved network, chain config, tweaker, and a Solana
   * RPC connection (used to look up the mint's owning token program for ATA
   * derivation).
   */
  private static getContext(
    chain: SupportedBlockchains,
    network?: NetworkParams,
    solanaConnection?: Connection,
  ): {
    network: NetworkParams;
    chainConfig: BlockchainConfig;
    tweaker: Tweaker;
    solanaConnection: Connection;
  } {
    const resolvedNetwork = network ?? Networks.mainnet;

    const chainConfigs =
      resolvedNetwork === Networks.mainnet
        ? mainnetBlockchainConfigs
        : gastaldBlockchainConfigs;

    const chainConfig = chainConfigs.get(chain);
    if (!chainConfig) {
      throw new BitcoinAddressError(`Unsupported blockchain: ${chain}`);
    }

    const publicKey =
      resolvedNetwork === Networks.mainnet
        ? MAINNET_PUBLIC_KEY
        : GASTALD_PUBLIC_KEY;
    const tweaker = new Tweaker(publicKey);

    const conn =
      solanaConnection ??
      new Connection(
        resolvedNetwork === Networks.mainnet
          ? SOLANA_RPC_DEFAULTS.mainnet
          : SOLANA_RPC_DEFAULTS.devnet,
        "confirmed",
      );

    return {
      network: resolvedNetwork,
      chainConfig,
      tweaker,
      solanaConnection: conn,
    };
  }

  /**
   * Validate API response matches user-provided data
   */
  private static validateApiResponse(
    addr: { toAddress: string; toBlockchain: string },
    expectedAddress: string,
    chainConfig: BlockchainConfig,
  ): void {
    // Security check: verify API response matches user-provided address
    const addressesMatch =
      chainConfig.ecosystem === Ecosystem.Solana
        ? addr.toAddress === expectedAddress // Solana: case-sensitive base58
        : trimHexPrefix(addr.toAddress).toLowerCase() ===
          trimHexPrefix(expectedAddress).toLowerCase(); // EVM/Sui/Starknet: case-insensitive hex

    if (!addressesMatch) {
      throw new BitcoinAddressError(
        `API returned mismatched to_address: expected ${expectedAddress}, got ${addr.toAddress}`,
      );
    }

    // Security check: verify API response matches user-provided blockchain
    if (addr.toBlockchain !== chainConfig.name) {
      throw new BitcoinAddressError(
        `API returned mismatched to_blockchain: expected ${chainConfig.name}, got ${addr.toBlockchain}`,
      );
    }
  }

  /**
   * Parse token address to buffer based on ecosystem
   */
  private static resolveTokenAddress(
    targetTokenAddress: Address | null,
    auxVersion: number,
    chainConfig: BlockchainConfig,
  ): TokenConfig {
    switch (auxVersion) {
      case DEPOSIT_AUX_V0: {
        if (chainConfig.ecosystem === Ecosystem.Solana) {
          // For aux v0, the token address is the LBTC program address and the mint address is the LBTC token address
          if (!chainConfig.stlbtcProgram) {
            throw new Error("stlbtcProgram is required for Solana aux v0");
          }

          const tokenAddress = targetTokenAddress
            ? targetTokenAddress
            : chainConfig.stlbtcProgram;
          return { tokenAddress: tokenAddress, solanaMintAddress: chainConfig.stlbtc }
        }

        const tokenAddress = targetTokenAddress
          ? targetTokenAddress
          : chainConfig.stlbtc;
        return { tokenAddress: tokenAddress }
      }

      case DEPOSIT_AUX_V1: {
        if (!targetTokenAddress) {
          throw new Error("target token address is required for aux v1");
        }

        if (chainConfig.ecosystem === Ecosystem.Solana) {
          return { tokenAddress: targetTokenAddress, solanaMintAddress: targetTokenAddress }
        }

        return { tokenAddress: targetTokenAddress }
      }

      default:
        throw new Error(`unknown aux version ${auxVersion}`);
    }
  }

  /**
   * Convert address to string based on ecosystem
   */
  private static addressToString(
    address: Address,
    ecosystem: Ecosystem,
  ): string {
    return ecosystem === Ecosystem.Solana
      ? bs58.encode(address)
      : `0x${address.toString("hex")}`;
  }

  /**
   * Convert from string to Address based on ecosystem
   */
  private static addressFromString(
    address: string,
    ecosystem: Ecosystem,
  ): Buffer {
    return ecosystem === Ecosystem.Solana
      ? Buffer.from(bs58.decode(address))
      : Buffer.from(trimHexPrefix(address), "hex");
  }

  /**
   * Parse destination address to buffer based on ecosystem
   */
  private static async resolveToAddress(
    address: string,
    tokenCfg: TokenConfig,
    chainConfig: BlockchainConfig,
    solanaConnection: Connection,
  ): Promise<Buffer> {
    if (chainConfig.ecosystem === Ecosystem.Solana) {
      if (!tokenCfg.solanaMintAddress) {
        throw new Error("solana mint address is required");
      }

      return this.findSolanaAssociatedTokenAddress(
        address,
        this.addressToString(tokenCfg.solanaMintAddress, chainConfig.ecosystem),
        solanaConnection,
      );
    }
    return Buffer.from(trimHexPrefix(address), "hex");
  }

  /**
   * Find Solana Associated Token Address.
   *
   * The mint can be owned by either the legacy Token Program or the Token-2022
   * Program; ATA derivation differs by program. We look up the mint's account
   * info on chain to discover its owning program, then derive the ATA against
   * that program.
   */
  private static async findSolanaAssociatedTokenAddress(
    addressBase58: string,
    mintBase58: string,
    connection: Connection,
  ): Promise<Buffer> {
    const address = new PublicKey(addressBase58);
    const mint = new PublicKey(mintBase58);

    const mintAccount = await connection.getAccountInfo(mint);
    if (!mintAccount) {
      throw new BitcoinAddressError(
        `Solana mint account not found: ${mintBase58}`,
      );
    }

    const ata = await getAssociatedTokenAddress(
      mint,
      address,
      false,
      mintAccount.owner,
    );
    return Buffer.from(ata.toBytes());
  }

  /**
   * Derive Bitcoin deposit address from parameters
   */
  private static deriveAddress(
    tweaker: Tweaker,
    network: NetworkParams,
    chainConfig: BlockchainConfig,
    tokenAddress: Buffer,
    toAddress: Buffer,
    referralId: string,
    nonce: number,
    auxVersion: number,
  ): string {
    // Compute aux data
    const auxData = computeAuxData(nonce, Buffer.from(referralId), auxVersion);

    // Calculate tweak bytes
    const tweakBytes = this.calcTweakBytes(
      chainConfig.ecosystem,
      chainConfig.chainId,
      toAddress,
      tokenAddress,
      auxData,
    );

    // Derive segwit address
    const { address } = tweaker.deriveSegwit(tweakBytes, network);
    return address;
  }

  /**
   * Compute the deposit tweak hash
   */
  private static depositTweak(
    tokenAddress: Buffer,
    toAddress: Buffer,
    chainId: Buffer | Uint8Array,
    auxData: Buffer | Uint8Array,
  ): Buffer {
    const tag = sha256(Buffer.from(DEPOSIT_ADDR_TAG));
    const h = crypto.createHash("sha256");
    h.update(tag);
    h.update(tag);
    h.update(Buffer.from(auxData));
    h.update(Buffer.from([DEPRECATED_CHAIN_TAG]));
    h.update(Buffer.from(chainId));
    h.update(tokenAddress);
    h.update(toAddress);
    return h.digest();
  }

  /**
   * Calculate tweak bytes with address length validation
   */
  private static calcTweakBytes(
    ecosystem: Ecosystem,
    chainId: LChainId,
    toAddress: Address,
    tokenAddress: Address,
    auxData: Buffer,
  ): Buffer {
    const expectedLength = ecosystem === Ecosystem.EVM ? 20 : 32;

    if (tokenAddress.length !== expectedLength) {
      throw new BitcoinAddressError(
        `Bad TokenAddress (got ${tokenAddress.length} bytes, expected ${expectedLength})`,
      );
    }

    if (toAddress.length !== expectedLength) {
      throw new BitcoinAddressError(
        `Bad ToAddress (got ${toAddress.length} bytes, expected ${expectedLength})`,
      );
    }

    return this.depositTweak(tokenAddress, toAddress, chainId, auxData);
  }
}

// =============================================================================
// Deprecated exports for backward compatibility
// =============================================================================

/** @deprecated Use DepositAddressVerifier.verifyOnline() instead */
export interface AddressCalculationResult extends AddressVerificationResult {}

/**
 * @deprecated Use DepositAddressVerifier.verifyOnline() instead.
 * This function is kept for backward compatibility and will be removed in a future version.
 */
export async function calculateDeterministicAddress(
  chain: SupportedBlockchains,
  toAddress: string,
  network: NetworkParams = Networks.mainnet,
): Promise<AddressCalculationResult> {
  return DepositAddressVerifier.verifyOnline({
    chain,
    toAddress,
    network,
  });
}
