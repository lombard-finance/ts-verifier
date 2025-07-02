import * as crypto from "crypto";
import { sha256, BitcoinAddressError } from "./bitcoin";

const DEPOSIT_AUX_TAG = "LombardDepositAux";
const DEPOSIT_AUX_V0 = 0;
const DEPOSIT_AUX_V1 = 1;
const SUPPORTED_VERSIONS = new Set([DEPOSIT_AUX_V0, DEPOSIT_AUX_V1]);
const MAX_REFERRAL_ID_SIZE = 256;

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
