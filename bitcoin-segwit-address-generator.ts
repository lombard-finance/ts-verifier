// Bitcoin Segwit Address Generator
// TypeScript implementation based on Go code

import * as crypto from 'crypto';
import * as secp256k1 from 'secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

// Constants
const DEPOSIT_AUX_TAG = 'LombardDepositAux';
const DEPOSIT_AUX_V0 = 0;
const MAX_REFERRAL_ID_SIZE = 256;
const SEGWIT_TWEAK_TAG = 'SegwitTweak';
const DEPOSIT_ADDR_TAG = 'LombardDepositAddr';
const AUX_DATA_SIZE = 32;
const TWEAK_SIZE = 32;

// Blockchain Types
export enum BlockchainType {
  EVM = 'evm'
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
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
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
  network: 'mainnet' | 'signet';
  depositPublicKey: Buffer;
}

// Address type
export type Address = Buffer;

// ChainId type
export type LChainId = Uint8Array;

// Error classes
export class BitcoinAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BitcoinAddressError';
  }
}

/**
 * Helper function to create a SHA-256 hash
 */
function sha256(data: Buffer | Uint8Array): Buffer {
  return crypto.createHash('sha256').update(data).digest();
}

/**
 * Creates a tagged hasher used for deposit aux data
 */
function auxDepositHasher(): crypto.Hash {
  const tag = sha256(Buffer.from(DEPOSIT_AUX_TAG));
  
  const h = crypto.createHash('sha256');
  h.update(tag);
  h.update(tag);
  
  return h;
}

/**
 * Compute v0 AuxData given a nonce and referrerId
 */
export function computeAuxDataV0(nonce: number, referrerId: Buffer | Uint8Array): Buffer {
  if (referrerId.length > MAX_REFERRAL_ID_SIZE) {
    throw new BitcoinAddressError(`Wrong size for referrerId (got ${referrerId.length}, want not greater than ${MAX_REFERRAL_ID_SIZE})`);
  }

  const nonceBytes = Buffer.alloc(4);
  nonceBytes.writeUInt32BE(nonce, 0);

  const h = auxDepositHasher();
  
  // Version0
  h.update(Buffer.from([DEPOSIT_AUX_V0]));
  h.update(nonceBytes);
  h.update(Buffer.from(referrerId));

  return h.digest();
}

/**
 * EVM-specific deposit tweak calculations
 */
export function evmDepositTweak(
  lbtcAddress: Buffer,
  depositAddress: Buffer,
  chainId: Buffer | Uint8Array,
  auxData: Buffer | Uint8Array
): Buffer {
  const tag = sha256(Buffer.from(DEPOSIT_ADDR_TAG));
  const h = crypto.createHash('sha256');
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
  auxData: Uint8Array | Buffer
): Buffer {
  switch (blockchainType) {
    case BlockchainType.EVM:
      // EVM chain uses 20-byte address
      if (lbtcAddress.length !== 20) {
        throw new BitcoinAddressError(`Bad LbtcAddress (got ${lbtcAddress.length} bytes, expected 20)`);
      }
      
      if (toAddress.length !== 20) {
        throw new BitcoinAddressError(`Bad ToAddress (got ${toAddress.length} bytes, expected 20)`);
      }
      
      return evmDepositTweak(lbtcAddress, toAddress, chainId, auxData);
    default:
      throw new BitcoinAddressError(`Unsupported blockchain type: ${blockchainType}`);
  }
}

/**
 * Compute tweak value for a given public key from a byte string
 */
function computeTweakValue(publicKey: Buffer, tweak: Buffer | Uint8Array): Buffer {
  if (tweak.length !== TWEAK_SIZE) {
    throw new BitcoinAddressError(`Wrong size for tweak (got ${tweak.length}, want ${TWEAK_SIZE})`);
  }

  if (!publicKey) {
    throw new BitcoinAddressError('Nil public key');
  }

  // First, compute the tag bytes, sha256(SegwitTweakTag)
  const tag = sha256(Buffer.from(SEGWIT_TWEAK_TAG));

  // Now compute sha256(tag || tag || pk || tweak)
  const h = crypto.createHash('sha256');
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
  tweak: Buffer | Uint8Array
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
export function pubkeyToSegwitAddr(publicKey: Buffer, network: NetworkParams): string {
  const publicKeyHash = bitcoin.crypto.hash160(publicKey);
  const address = bitcoin.payments.p2wpkh({ 
    hash: publicKeyHash,
    network: network
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
      throw new BitcoinAddressError('Invalid public key');
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
  deriveSegwit(tweakBytes: Buffer | Uint8Array, network: NetworkParams): { 
    address: string, 
    tweakedPublicKey: Buffer
  } {
    const tweakedPublicKey = this.derivePubkey(tweakBytes);
    const address = pubkeyToSegwitAddr(tweakedPublicKey, network);
    
    return { 
      address, 
      tweakedPublicKey 
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
      case 'mainnet':
        network = Networks.mainnet;
        break;
      case 'signet':
        network = Networks.signet;
        break;
      default:
        throw new BitcoinAddressError(`Unknown network: '${config.network}'`);
    }

    try {
      this.tweaker = new Tweaker(config.depositPublicKey);
    } catch (error) {
      throw new BitcoinAddressError('Bad public deposit key');
    }

    this.network = network;
  }

  /**
   * Calculate a deterministic address based on inputs
   */
  calculateDeterministicAddress(
    chainId: LChainId,
    lbtcAddress: Address,
    toAddress: Address,
    referralId: Buffer | Uint8Array,
    nonce: number
  ): string {
    // Compute aux data
    let auxData: Buffer;
    try {
      auxData = computeAuxDataV0(nonce, referralId);
    } catch (error) {
      throw new BitcoinAddressError(`Computing aux data for nonce=${nonce}, referal_id=${referralId.toString('hex')}: ${error}`);
    }

    // Calculate tweak bytes
    let tweakBytes: Buffer;
    try {
      tweakBytes = calcTweakBytes(BlockchainType.EVM, chainId, toAddress, lbtcAddress, auxData);
    } catch (error) {
      throw new BitcoinAddressError(`Computing tweakBytes for deterministic address: ${error}`);
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
export function calculateDeterministicAddress(
  config: Config,
  chainId: LChainId,
  lbtcAddress: Address,
  toAddress: Address,
  referralId: Buffer | Uint8Array,
  nonce: number
): string {
  const service = createAddressService(config);
  return service.calculateDeterministicAddress(
    chainId, 
    lbtcAddress, 
    toAddress, 
    referralId, 
    nonce
  );
}
