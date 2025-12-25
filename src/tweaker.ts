import * as secp256k1 from "@noble/secp256k1";
import {
  pubkeyToSegwitAddr,
  NetworkParams,
  BitcoinAddressError,
} from "./bitcoin";
import { tweakPublicKey } from "./segwit-tweak";

/**
 * Tweaker class for handling public key tweaking operations
 */
export class Tweaker {
  private publicKey: Buffer;

  constructor(publicKey: Buffer) {
    // Validate the public key
    try {
      secp256k1.Point.fromHex(publicKey);
    } catch (error) {
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
