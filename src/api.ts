import bs58 from "bs58";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Address, BlockchainConfig, Ecosystem } from "./chain-id";

// For Solana we mint to token account address associated with a user address
const SOLANA_MAINNET_MINT_ADDRESS =
  "LBTCgU4b3wsFKsPwBn1rRZDx5DoFutM6RPiEt1TPDsY";

// Get Addresses by Destination API
const URL = "https://mainnet.prod.lombard.finance/api/v1/address/destination/";

// API Response interfaces
export interface DepositMetadata {
  to_address: string;
  to_blockchain: string;
  referral: string;
  nonce?: number;
  token_address?: string;
  aux_version?: number;
}

export interface AddressInfo {
  btc_address: string;
  type: string;
  deposit_metadata: DepositMetadata;
  created_at: string;
  deprecated: boolean;
}

export interface ApiResponse {
  addresses: AddressInfo[];
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export interface AddressesResponse {
  addresses: {
    btcAddress: string;
    toAddress: Address;
    referralId: string;
    nonce: number;
    auxVersion: number;
    tokenAddress: Address;
  }[];
}

// Fetch address data from the Lombard API
export async function fetchAddressMetadata(
  chainConfig: BlockchainConfig,
  toAddress: string,
): Promise<AddressesResponse> {
  try {
    const url = `${URL}${chainConfig.name}/${toAddress}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new APIError(
        `API request failed with status: ${response.status}`,
        response.status,
      );
    }

    const data = (await response.json()) as ApiResponse;

    if (!data.addresses?.length) {
      throw new APIError("No addresses returned from API");
    }

    const nonDeprecatedAddresses = data.addresses.filter(
      (addr) => !addr.deprecated,
    );

    if (!nonDeprecatedAddresses.length) {
      throw new APIError("No non-deprecated addresses found");
    }

    const toAddresses = await Promise.all(
      nonDeprecatedAddresses.map(async (addr) => {
        if (chainConfig.ecosystem === Ecosystem.Solana) {
          return await findSolanaAssociatedTokenAddress(
            addr.deposit_metadata.to_address,
            SOLANA_MAINNET_MINT_ADDRESS,
          );
        } else {
          return Buffer.from(
            trimHexPrefix(addr.deposit_metadata.to_address),
            "hex",
          );
        }
      }),
    );

    const addresses = await Promise.all(
      nonDeprecatedAddresses.map(async (addr) => {
        const toAddr =
          chainConfig.ecosystem === Ecosystem.Solana
            ? await findSolanaAssociatedTokenAddress(
                addr.deposit_metadata.to_address,
                SOLANA_MAINNET_MINT_ADDRESS,
              )
            : Buffer.from(
                trimHexPrefix(addr.deposit_metadata.to_address),
                "hex",
              );

        let tokenAddress = chainConfig.stlbtc;
        if (addr.deposit_metadata.token_address != undefined) {
          tokenAddress =
            chainConfig.ecosystem === Ecosystem.Solana
              ? Buffer.from(bs58.decode(addr.deposit_metadata.token_address))
              : Buffer.from(
                  trimHexPrefix(addr.deposit_metadata.token_address),
                  "hex",
                );
        }

        return {
          btcAddress: addr.btc_address,
          toAddress: toAddr,
          referralId: addr.deposit_metadata.referral,
          nonce: addr.deposit_metadata.nonce ?? 0,
          auxVersion: addr.deposit_metadata.aux_version ?? 0,
          tokenAddress: tokenAddress,
        };
      }),
    );

    return { addresses };
  } catch (error: unknown) {
    if (error instanceof APIError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new APIError(`Failed to fetch address data: ${errorMessage}`);
  }
}

function trimHexPrefix(hex: string): string {
  return hex.startsWith("0x") ? hex.substring(2) : hex;
}

async function findSolanaAssociatedTokenAddress(
  addressBase58: string,
  mintBase58: string,
): Promise<Buffer> {
  const address = new PublicKey(addressBase58);
  const mint = new PublicKey(mintBase58);

  const ata = await getAssociatedTokenAddress(mint, address);
  return Buffer.from(ata.toBytes());
}
