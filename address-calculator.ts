// Bitcoin Segwit Address Generator
// TypeScript implementation based on Go code

import * as crypto from "crypto";
import * as secp256k1 from "secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import bs58 from 'bs58';

// Constants
const MAINNET_PUBLIC_KEY = Buffer.from(
  "033dcf7a68429b23a0396ca61c1ab243ccbbcc629ff04c59394458d6db5dd2bb15",
  "hex",
);
const SIGNET_PUBLIC_KEY = Buffer.from(
  "025615e9748b945bad807b56d3a723578673d08566a4818510c0ba2123317414f8",
  "hex",
);
const DEPOSIT_AUX_TAG = "LombardDepositAux";
const DEPOSIT_AUX_V0 = 0;
const DEPOSIT_AUX_V1 = 1;
const SUPPORTED_VERSIONS = new Set([DEPOSIT_AUX_V0, DEPOSIT_AUX_V1]);
const MAX_REFERRAL_ID_SIZE = 256;
const SEGWIT_TWEAK_TAG = "SegwitTweak";
const DEPOSIT_ADDR_TAG = "LombardDepositAddr";
const AUX_DATA_SIZE = 32;
const TWEAK_SIZE = 32;

// Chain IDs
const ETHEREUM_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000000001",
  "hex",
);
const BASE_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000002105",
  "hex",
);
const BSC_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000000038",
  "hex",
);
const SUI_CHAIN_ID = Buffer.from(
  "0100000000000000000000000000000000000000000000000000000035834a8a",
  "hex",
);
const SONIC_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000000092",
  "hex",
);
const INK_CHAIN_ID = Buffer.from(
  "000000000000000000000000000000000000000000000000000000000000def1",
  "hex",
);
const SOLANA_CHAIN_ID = Buffer.from(
  "02296998a6f8e2a784db5d9f95e18fc23f70441a1039446801089879b08c7ef0",
  "hex",
);
const KATANA_CHAIN_ID = Buffer.from(
  "0x00000000000000000000000000000000000000000000000000000000000b67d2",
  "hex",
);

// Token Contracts
const ETHEREUM_STLBTC_CONTRACT = "8236a87084f8B84306f72007F36F2618A5634494"
const BASE_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1"
const BSC_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1"
const SUI_STLBTC_CONTRACT = "3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040"
const SONIC_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1"
const INK_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1"
const SOLANA_STLBTC_CONTRACT = "LomP48F7bLbKyMRHHsDVt7wuHaUQvQnVVspjcbfuAek"
const KATANA_STLBTC_CONTRACT = "0xecAc9C5F704e954931349Da37F60E39f515c11c1"
const KATANA_LBTC_CONTRACT = "0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072"

// API
const URL = "https://mainnet.prod.lombard.finance/api/v1/address/destination/";

// Blockchain Types
export enum BlockchainType {
  EVM = "evm",
  Sui = "sui",
  Solana = "solana",
}

export enum SupportedBlockchains {
  Ethereum = "ethereum",
  Base = "base",
  BSC = "bsc",
  Sui = "sui",
  Sonic = "sonic",
  Ink = "ink",
  Solana = "solana",
  Katana = "katana",
}

// Network Parameters
export interface NetworkParams {
  messagePrefix: string;
  bech32: string;
  bip32: {
    public: number;
    private: number;
  };
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}

// Networks
export const Networks = {
  mainnet: bitcoin.networks.bitcoin,
  signet: {
    messagePrefix: "\x18Bitcoin Signed Message:\n",
    bech32: "tb",
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  } as NetworkParams,
};

// Config type
export interface Config {
  network: "mainnet" | "signet";
  depositPublicKey: Buffer;
}

// DestConfig type
export interface DestConfig {
  network: "ethereum" | "sui" | "solana";
  chainId: LChainId;
}

// Address type
export type Address = Buffer;

// ChainId type
export type LChainId = Buffer;

// Error classes
export class BitcoinAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BitcoinAddressError";
  }
}

/**
 * Helper function to create a SHA-256 hash
 */
function sha256(data: Buffer | Uint8Array): Buffer {
  return crypto.createHash("sha256").update(data).digest();
}

/**
 * Creates a tagged hasher used for deposit aux data
 */
function auxDepositHasher(): crypto.Hash {
  const tag = sha256(Buffer.from(DEPOSIT_AUX_TAG));

  const h = crypto.createHash("sha256");
  h.update(tag);
  h.update(tag);

  return h;
}

export function computeAuxData(
  nonce: number,
  referrerId: Buffer | Uint8Array,
  version: number,
): Buffer {
  if (referrerId.length > MAX_REFERRAL_ID_SIZE) {
    throw new BitcoinAddressError(
      `Wrong size for referrerId (got ${referrerId.length}, want not greater than ${MAX_REFERRAL_ID_SIZE})`,
    );
  }

  if (!SUPPORTED_VERSIONS.has(version)) {
    throw new BitcoinAddressError("version is not supported");
  }

  const nonceBytes = Buffer.alloc(4);
  nonceBytes.writeUInt32BE(nonce, 0);

  const h = auxDepositHasher();

  // Version0
  h.update(Buffer.from([version]));
  h.update(nonceBytes);
  h.update(Buffer.from(referrerId));

  return h.digest();
}

/**
 * EVM-specific deposit tweak calculations
 */
export function depositTweak(
  lbtcAddress: Buffer,
  depositAddress: Buffer,
  chainId: Buffer | Uint8Array,
  auxData: Buffer | Uint8Array,
): Buffer {
  const tag = sha256(Buffer.from(DEPOSIT_ADDR_TAG));
  const h = crypto.createHash("sha256");
  h.update(tag);
  h.update(tag);
  h.update(Buffer.from(auxData));
  h.update(Buffer.from([0])); // evm tag
  h.update(Buffer.from(chainId));
  h.update(lbtcAddress);
  h.update(depositAddress);
  return h.digest();
}

/**
 * Calculate tweak bytes for a given request
 */
export function calcTweakBytes(
  blockchainType: BlockchainType,
  chainId: Uint8Array,
  toAddress: Address,
  lbtcAddress: Address,
  auxData: Uint8Array | Buffer,
): Buffer {
  switch (blockchainType) {
    case BlockchainType.EVM:
      // EVM chain uses 20-byte address
      if (lbtcAddress.length !== 20) {
        throw new BitcoinAddressError(
          `Bad LbtcAddress (got ${lbtcAddress.length} bytes, expected 20)`,
        );
      }

      if (toAddress.length !== 20) {
        throw new BitcoinAddressError(
          `Bad ToAddress (got ${toAddress.length} bytes, expected 20)`,
        );
      }

      return depositTweak(lbtcAddress, toAddress, chainId, auxData);
    case BlockchainType.Sui:
      // Sui uses 32-byte address
      if (lbtcAddress.length !== 32) {
        throw new BitcoinAddressError(
          `Bad LbtcAddress (got ${lbtcAddress.length} bytes, expected 32)`,
        );
      }

      if (toAddress.length !== 32) {
        throw new BitcoinAddressError(
          `Bad ToAddress (got ${toAddress.length} bytes, expected 32)`,
        );
      }

      return depositTweak(lbtcAddress, toAddress, chainId, auxData);
    default:
      throw new BitcoinAddressError(
        `Unsupported blockchain type: ${blockchainType}`,
      );
  }
}

/**
 * Compute tweak value for a given public key from a byte string
 */
function computeTweakValue(
  publicKey: Buffer,
  tweak: Buffer | Uint8Array,
): Buffer {
  if (tweak.length !== TWEAK_SIZE) {
    throw new BitcoinAddressError(
      `Wrong size for tweak (got ${tweak.length}, want ${TWEAK_SIZE})`,
    );
  }

  if (!publicKey) {
    throw new BitcoinAddressError("Nil public key");
  }

  // First, compute the tag bytes, sha256(SegwitTweakTag)
  const tag = sha256(Buffer.from(SEGWIT_TWEAK_TAG));

  // Now compute sha256(tag || tag || pk || tweak)
  const h = crypto.createHash("sha256");
  h.update(tag);
  h.update(tag);
  h.update(publicKey);
  h.update(Buffer.from(tweak));

  return h.digest();
}

/**
 * Tweaks a public key with the provided tweak value
 */
export function tweakPublicKey(
  publicKey: Buffer,
  tweak: Buffer | Uint8Array,
): Buffer {
  const tweakScalar = computeTweakValue(publicKey, tweak);

  // Add the private key & tweak scalar (G*tweak + publicKey)
  try {
    return Buffer.from(secp256k1.publicKeyTweakAdd(publicKey, tweakScalar));
  } catch (error) {
    throw new BitcoinAddressError(`Failed to tweak public key: ${error}`);
  }
}

/**
 * Converts a public key to a segwit address
 */
export function pubkeyToSegwitAddr(
  publicKey: Buffer,
  network: NetworkParams,
): string {
  const publicKeyHash = bitcoin.crypto.hash160(publicKey);
  const address = bitcoin.payments.p2wpkh({
    hash: publicKeyHash,
    network: network,
  });

  return address.address!;
}

/**
 * Tweaker class for handling public key tweaking operations
 */
export class Tweaker {
  private publicKey: Buffer;

  constructor(publicKey: Buffer) {
    // Validate the public key
    if (!secp256k1.publicKeyVerify(publicKey)) {
      throw new BitcoinAddressError("Invalid public key");
    }

    this.publicKey = publicKey;
  }

  /**
   * Derive a new deposit public key from a 32-byte tweak
   */
  derivePubkey(tweakBytes: Buffer | Uint8Array): Buffer {
    return tweakPublicKey(this.publicKey, tweakBytes);
  }

  /**
   * Derive a new deposit public key and build a segwit address
   */
  deriveSegwit(
    tweakBytes: Buffer | Uint8Array,
    network: NetworkParams,
  ): {
    address: string;
    tweakedPublicKey: Buffer;
  } {
    const tweakedPublicKey = this.derivePubkey(tweakBytes);
    const address = pubkeyToSegwitAddr(tweakedPublicKey, network);

    return {
      address,
      tweakedPublicKey,
    };
  }

  /**
   * Get the original public key
   */
  getPublicKey(): Buffer {
    return this.publicKey;
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
    blockchainType: BlockchainType,
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

// API Response interfaces
export interface DepositMetadata {
  to_address: string;
  to_blockchain: string;
  referral: string;
  nonce: number;
  token_address: string;
  aux_version: number;
}

export interface AddressInfo {
  btc_address: string;
  type: string;
  deposit_metadata: DepositMetadata;
  created_at: string;
  deprecated: boolean;
}

export interface AddressesResponse {
  addresses: AddressInfo[];
}

/**
 * Main function for calculating a deterministic address
 */
export async function calculateDeterministicAddress(
  chain: SupportedBlockchains,
  toAddress: string,
): Promise<{
  computedAddresses: string[];
  expectedAddresses: string[];
  referralIds: string[];
  nonces: number[];
  auxVersions: number[];
  tokenAddresses: string[];
}> {
  if (!toAddress.startsWith("0x")) {
    throw new BitcoinAddressError("Malformed toAddress");
  }

  let config: Config = {
    network: "mainnet",
    depositPublicKey: MAINNET_PUBLIC_KEY,
  };

  let chainId: Buffer;
  let defaultTokenAddress: string;
  let destination: string;
  let blockchainType: BlockchainType;
  switch (chain) {
    case SupportedBlockchains.Ethereum:
      chainId = ETHEREUM_CHAIN_ID;
      defaultTokenAddress = ETHEREUM_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_ETHEREUM";
      blockchainType = BlockchainType.EVM;
      break;
    case SupportedBlockchains.Base:
      chainId = BASE_CHAIN_ID;
      defaultTokenAddress = BASE_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_BASE";
      blockchainType = BlockchainType.EVM;
      break;
    case SupportedBlockchains.BSC:
      chainId = BSC_CHAIN_ID;
      defaultTokenAddress = BSC_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_BSC";
      blockchainType = BlockchainType.EVM;
      break;
    case SupportedBlockchains.Sui:
      chainId = SUI_CHAIN_ID;
      defaultTokenAddress = SUI_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_SUI";
      blockchainType = BlockchainType.Sui;
      break;
    case SupportedBlockchains.Sonic:
      chainId = SONIC_CHAIN_ID;
      defaultTokenAddress = SONIC_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_SONIC";
      blockchainType = BlockchainType.EVM;
      break;
    case SupportedBlockchains.Ink:
      chainId = INK_CHAIN_ID;
      defaultTokenAddress = INK_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_INK";
      blockchainType = BlockchainType.EVM;
      break;
    case SupportedBlockchains.Solana:
      chainId = SOLANA_CHAIN_ID;
      defaultTokenAddress = SOLANA_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_SOLANA";
      blockchainType = BlockchainType.Solana;
      break;
    case SupportedBlockchains.Katana:
      chainId = KATANA_CHAIN_ID;
      defaultTokenAddress = KATANA_STLBTC_CONTRACT;
      destination = "DESTINATION_BLOCKCHAIN_KATANA";
      blockchainType = BlockchainType.EVM;
      break;
    default:
      console.error("Unexpected destination chain:", chain);
      throw new BitcoinAddressError(`Unexpected destination chain: ${chain}`);
  }

  let expectedAddresses: string[] = [];
  let referralIds: string[] = [];
  let nonces: number[] = [];
  let tokenAddresses: string[] = [];
  let auxVersions: number[] = [];
  try {
    // Fetch data from the API
    const url = URL + destination + "/" + toAddress;
    const response = await fetch(url);

    if (!response.ok) {
      throw new BitcoinAddressError(
        `API request failed with status: ${response.status}`,
      );
    }

    const data = (await response.json()) as AddressesResponse;

    if (!data.addresses || data.addresses.length === 0) {
      throw new BitcoinAddressError("No addresses returned from API");
    }

    data.addresses.forEach((address) => {
      if (!address.deprecated || address.deprecated === undefined) {
        expectedAddresses.push(address.btc_address);
        referralIds.push(address.deposit_metadata.referral);
        nonces.push(address.deposit_metadata.nonce ?? 0);
        auxVersions.push(address.deposit_metadata.aux_version ?? 0);
        tokenAddresses.push(address.deposit_metadata.token_address ?? defaultTokenAddress);
      }
    });
  } catch (error: unknown) {
    if (error instanceof BitcoinAddressError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new BitcoinAddressError(
      `Failed to verify address with API: ${errorMessage}`,
    );
  }

  const address = Buffer.from(toAddress.substring(2), "hex");
  const service = createAddressService(config);
  const len = expectedAddresses.length;
  let computedAddresses: string[] = [];
  for (let i = 0; i < len; i++) {

    let tokenAddress: Address;
    if (blockchainType === BlockchainType.Solana) {
      tokenAddress = Buffer.from(bs58.decode(tokenAddresses[i]))
    } else {
      tokenAddress = Buffer.from(tokenAddresses[i], "hex")
    }

    const computedAddress = service.calculateDeterministicAddress(
      auxVersions[i],
      chainId,
      tokenAddress,
      address,
      Buffer.from(referralIds[i]),
      nonces[i],
      blockchainType,
    );

    computedAddresses.push(computedAddress);
  }

  return { computedAddresses, expectedAddresses, referralIds, nonces, auxVersions, tokenAddresses };
}
