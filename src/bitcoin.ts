import * as bitcoin from "bitcoinjs-lib";
import * as crypto from "crypto-browserify";

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

// Error classes
export class BitcoinAddressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BitcoinAddressError";
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
 * Helper function to create a SHA-256 hash
 */
export function sha256(data: Buffer | Uint8Array): Buffer {
  return crypto.createHash("sha256").update(data).digest();
}
