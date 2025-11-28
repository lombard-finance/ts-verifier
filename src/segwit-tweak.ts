import * as crypto from "crypto";
import * as secp256k1 from "@noble/secp256k1";
import { sha256, BitcoinAddressError } from "./bitcoin";

const TWEAK_SIZE = 32;
const SEGWIT_TWEAK_TAG = "SegwitTweak";

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
    // Convert Buffer to Uint8Array for @noble/secp256k1
    const pubKeyPoint = secp256k1.Point.fromHex(publicKey);
    const tweakPoint = secp256k1.Point.fromPrivateKey(tweakScalar);
    const tweakedPoint = pubKeyPoint.add(tweakPoint);
    
    // Convert back to Buffer (compressed format)
    return Buffer.from(tweakedPoint.toRawBytes(true));
  } catch (error) {
    throw new BitcoinAddressError(`Failed to tweak public key: ${error}`);
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
