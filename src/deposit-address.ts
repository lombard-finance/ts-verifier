// Bitcoin Segwit Address Generator
// TypeScript implementation based on Go code

import bs58 from "bs58";
import * as crypto from "crypto-browserify";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import {
  mainnetBlockchainConfigs,
  gastaldBlockchainConfigs,
  Address,
  Ecosystem,
  LChainId,
  SupportedBlockchains,
  BlockchainConfig,
} from "./chain-id";
import { fetchAddressMetadata, trimHexPrefix } from "./api";
import { computeAuxData } from "./aux-data";
import {
  sha256,
  Networks,
  NetworkParams,
  BitcoinAddressError,
} from "./bitcoin";
import { Tweaker } from "./tweaker";

const DEPOSIT_ADDR_TAG = "LombardDepositAddr";
const DEPRECATED_CHAIN_TAG = 0;

// Root deposit public keys for mainnet and Gastald testnet
export const MAINNET_PUBLIC_KEY = Buffer.from(
  "033dcf7a68429b23a0396ca61c1ab243ccbbcc629ff04c59394458d6db5dd2bb15",
  "hex",
);
export const GASTALD_PUBLIC_KEY = Buffer.from(
  "025615e9748b945bad807b56d3a723578673d08566a4818510c0ba2123317414f8",
  "hex",
);

// For Solana we mint to token account address associated with a user address
// Mint addresses for mainnet and Gastald testnet
const SOLANA_MAINNET_MINT_ADDRESS =
  "LBTCgU4b3wsFKsPwBn1rRZDx5DoFutM6RPiEt1TPDsY";

const SOLANA_GASTALD_MINT_ADDRESS =
  "1BTCPX3qyFtBvhQvJaHntfzZfB8qcJmJXfoRnD3vAgh";

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
  /** Destination address on target chain */
  address: string;
  /** Bitcoin network (mainnet or gastald). Defaults to mainnet */
  network?: NetworkParams;
}

/**
 * Parameters for offline address computation
 */
export interface ComputeOfflineParams {
  /** Target blockchain */
  chain: SupportedBlockchains;
  /** Destination address on target chain (hex for EVM/Sui/Starknet, base58 for Solana) */
  toAddress: string;
  /** Token address on target chain (hex for EVM/Sui/Starknet, base58 for Solana) */
  tokenAddress: string;
  /** Partner/referral code */
  referralId: string;
  /** Nonce value */
  nonce: number;
  /** Aux data version */
  auxVersion: number;
  /** Bitcoin network (mainnet or gastald). Defaults to mainnet */
  network?: NetworkParams;
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
    const { network, chainConfig, tweaker } = this.getContext(
      params.chain,
      params.network,
    );

    const addressData = await fetchAddressMetadata(
      chainConfig,
      params.address,
      network,
    );

    const addresses = await Promise.all(
      addressData.addresses.map(async (addr) => {
        this.validateApiResponse(addr, params.address, chainConfig);

        const toAddressBuffer = await this.parseToAddress(
          addr.toAddress,
          chainConfig.ecosystem,
          network,
        );

        const computed = this.deriveAddress(
          tweaker,
          network,
          chainConfig,
          addr.tokenAddress,
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
          tokenAddress: this.formatTokenAddress(
            addr.tokenAddress,
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
    const { network, chainConfig, tweaker } = this.getContext(
      params.chain,
      params.network,
    );

    const tokenAddressBuffer = this.parseTokenAddress(
      params.tokenAddress,
      chainConfig.ecosystem,
    );

    const toAddressBuffer = await this.parseToAddress(
      params.toAddress,
      chainConfig.ecosystem,
      network,
    );

    return this.deriveAddress(
      tweaker,
      network,
      chainConfig,
      tokenAddressBuffer,
      toAddressBuffer,
      params.referralId,
      params.nonce,
      params.auxVersion,
    );
  }

  /**
   * Get common context: resolved network, chain config, and tweaker
   */
  private static getContext(
    chain: SupportedBlockchains,
    network?: NetworkParams,
  ): { network: NetworkParams; chainConfig: BlockchainConfig; tweaker: Tweaker } {
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

    return { network: resolvedNetwork, chainConfig, tweaker };
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
  private static parseTokenAddress(address: string, ecosystem: Ecosystem): Buffer {
    return ecosystem === Ecosystem.Solana
      ? Buffer.from(bs58.decode(address))
      : Buffer.from(trimHexPrefix(address), "hex");
  }

  /**
   * Format token address for display
   */
  private static formatTokenAddress(address: Buffer, ecosystem: Ecosystem): string {
    return ecosystem === Ecosystem.Solana
      ? bs58.encode(address)
      : `0x${address.toString("hex")}`;
  }

  /**
   * Parse destination address to buffer based on ecosystem
   */
  private static async parseToAddress(
    address: string,
    ecosystem: Ecosystem,
    network: NetworkParams,
  ): Promise<Buffer> {
    if (ecosystem === Ecosystem.Solana) {
      return this.findSolanaAssociatedTokenAddress(
        address,
        network === Networks.mainnet
          ? SOLANA_MAINNET_MINT_ADDRESS
          : SOLANA_GASTALD_MINT_ADDRESS,
      );
    }
    return Buffer.from(trimHexPrefix(address), "hex");
  }

  /**
   * Find Solana Associated Token Address
   */
  private static async findSolanaAssociatedTokenAddress(
    addressBase58: string,
    mintBase58: string,
  ): Promise<Buffer> {
    const address = new PublicKey(addressBase58);
    const mint = new PublicKey(mintBase58);
    const ata = await getAssociatedTokenAddress(mint, address);
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
    address: toAddress,
    network,
  });
}


