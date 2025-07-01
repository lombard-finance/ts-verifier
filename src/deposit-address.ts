// Bitcoin Segwit Address Generator
// TypeScript implementation based on Go code

import * as crypto from "crypto";
import {
  getBlockchainConfig,
  Address,
  Ecosystem,
  LChainId,
  SupportedBlockchains,
} from "./chain-id";
import { AddressesResponse, fetchAddressMetadata } from "./api";
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

// Root deposit public keys
export const MAINNET_PUBLIC_KEY = Buffer.from(
  "033dcf7a68429b23a0396ca61c1ab243ccbbcc629ff04c59394458d6db5dd2bb15",
  "hex",
);
export const SIGNET_PUBLIC_KEY = Buffer.from(
  "025615e9748b945bad807b56d3a723578673d08566a4818510c0ba2123317414f8",
  "hex",
);

// Config type
export interface Config {
  network: "mainnet" | "signet";
  depositPublicKey: Buffer;
}

export interface AddressCalculationResult {
  addresses: {
    computed: string;
    expected: string;
    referralId: string;
    nonce: number;
    auxVersion: number;
    tokenAddress: Address;
  }[];
}

/**
 * DepositTweak Compute the tweak bytes for a deposit address.
 *
 * This is generally defined as
 *
 *	taggedHash( AuxData || DeprecatedChainTag || LChainId || LBTCAddress || WalletAddress )
 *
 * where:
 * - 'taggedHash' is a sha256 instance as returned by 'depositHasher()'
 * - 'AuxData' is a 32-byte value encoding chain-agnostic auxiliary data
 * - 'DeprecatedChainTag' is the zero byte previously used to differentiate among chains
 * - 'LChainId' is a 32 bytes big-endian unique identifier of the chain, internally defined by Lombard
 * - 'TokenAddress' and 'ToAddress' are byte arrays representing the respective addresses on the selected chain
 */
export function depositTweak(
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
 * Calculate tweak bytes for a given request
 */
export function calcTweakBytes(
  blockchainType: Ecosystem,
  chainId: Uint8Array,
  toAddress: Address,
  tokenAddress: Address,
  auxData: Uint8Array | Buffer,
): Buffer {
  switch (blockchainType) {
    case Ecosystem.EVM:
      // EVM chain uses 20-byte address
      if (tokenAddress.length !== 20) {
        throw new BitcoinAddressError(
          `Bad TokenAddress (got ${tokenAddress.length} bytes, expected 20)`,
        );
      }

      if (toAddress.length !== 20) {
        throw new BitcoinAddressError(
          `Bad ToAddress (got ${toAddress.length} bytes, expected 20)`,
        );
      }

      return depositTweak(tokenAddress, toAddress, chainId, auxData);
    case Ecosystem.Sui:
      // Sui uses 32-byte address
      if (tokenAddress.length !== 32) {
        throw new BitcoinAddressError(
          `Bad TokenAddress (got ${tokenAddress.length} bytes, expected 32)`,
        );
      }

      if (toAddress.length !== 32) {
        throw new BitcoinAddressError(
          `Bad ToAddress (got ${toAddress.length} bytes, expected 32)`,
        );
      }

      return depositTweak(tokenAddress, toAddress, chainId, auxData);
    case Ecosystem.Solana:
      // TODO: Solana uses 32-byte address
      if (tokenAddress.length !== 32) {
        throw new BitcoinAddressError(
          `Bad TokenAddress (got ${tokenAddress.length} bytes, expected 32)`,
        );
      }

      if (toAddress.length !== 32) {
        throw new BitcoinAddressError(
          `Bad ToAddress (got ${toAddress.length} bytes, expected 32)`,
        );
      }

      return depositTweak(tokenAddress, toAddress, chainId, auxData);
    default:
      throw new BitcoinAddressError(
        `Unsupported blockchain type: ${blockchainType}`,
      );
  }
}

/**
 * Service class for calculating deterministic Bitcoin addresses
 */
export class AddressService {
  private tweaker: Tweaker;
  private network: NetworkParams;

  constructor(config: Config) {
    let network: NetworkParams;

    switch (config.network) {
      case "mainnet":
        network = Networks.mainnet;
        break;
      case "signet":
        network = Networks.signet;
        break;
      default:
        throw new BitcoinAddressError(`Unknown network: '${config.network}'`);
    }

    try {
      this.tweaker = new Tweaker(config.depositPublicKey);
    } catch (error) {
      throw new BitcoinAddressError("Bad public deposit key");
    }

    this.network = network;
  }

  /**
   * Calculate a deterministic address based on inputs
   */
  calculateDeterministicAddress(
    version: number,
    chainId: LChainId,
    lbtcAddress: Address,
    toAddress: Address,
    referralId: Buffer | Uint8Array,
    nonce: number,
    blockchainType: Ecosystem,
  ): string {
    // Compute aux data
    let auxData: Buffer;
    try {
      auxData = computeAuxData(nonce, referralId, version);
    } catch (error) {
      throw new BitcoinAddressError(
        `Computing aux data for nonce=${nonce}, referal_id=${referralId.toString("hex")}: ${error}`,
      );
    }

    // Calculate tweak bytes
    let tweakBytes: Buffer;
    try {
      tweakBytes = calcTweakBytes(
        blockchainType,
        chainId,
        toAddress,
        lbtcAddress,
        auxData,
      );
    } catch (error) {
      throw new BitcoinAddressError(
        `Computing tweakBytes for deterministic address: ${error}`,
      );
    }

    // Derive segwit address
    try {
      const { address } = this.tweaker.deriveSegwit(tweakBytes, this.network);
      return address;
    } catch (error) {
      throw new BitcoinAddressError(`Deriving segwit address: ${error}`);
    }
  }
}

/**
 * Create a new address service from a configuration
 */
export function createAddressService(config: Config): AddressService {
  return new AddressService(config);
}

/**
 * Main function for calculating a deterministic address
 */
export async function calculateDeterministicAddress(
  chain: SupportedBlockchains,
  toAddress: string,
  depositPublicKey: Buffer,
): Promise<AddressCalculationResult> {
  let config: Config = {
    network: "mainnet",
    depositPublicKey: depositPublicKey,
  };

  const chainConfig = getBlockchainConfig(chain);
  if (!chainConfig) {
    throw new BitcoinAddressError(`Unsupported blockchain: ${chain}`);
  }

  const addressData = await fetchAddressMetadata(chainConfig, toAddress);
  const service = createAddressService(config);
  const addresses = addressData.addresses.map((addr) => {
    const computed = service.calculateDeterministicAddress(
      addr.auxVersion,
      chainConfig.chainId,
      addr.tokenAddress,
      addr.toAddress,
      Buffer.from(addr.referralId),
      addr.nonce,
      chainConfig.ecosystem,
    );

    return {
      computed,
      expected: addr.btcAddress,
      referralId: addr.referralId,
      nonce: addr.nonce,
      auxVersion: addr.auxVersion,
      tokenAddress: addr.tokenAddress,
    };
  });

  return { addresses };
}
