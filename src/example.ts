import {
  calculateDeterministicAddress,
  MAINNET_PUBLIC_KEY,
} from "./deposit-address";
import { SupportedBlockchains } from "./chain-id";
import { BitcoinAddressError } from "./bitcoin";
import { APIError } from "./api";

// Example usage
async function generateSegwitAddress() {
  try {
    {
      // Sample chain
      const chain = SupportedBlockchains.Ethereum;

      // Destination address (20 bytes)
      const toAddress = "0x57f9672ba603251c9c03b36cabdbbca7ca8cfcf4";

      // Calculate deterministic segwit address
      const match = await calculateDeterministicAddress(
        chain,
        toAddress,
        MAINNET_PUBLIC_KEY,
      );

      console.log("Match:", match);
    }

    {
      // Sample chain
      const chain = SupportedBlockchains.BSC;

      // Destination address (20 bytes)
      const toAddress = "0xf594c30b28435afb37f0b10f71ac9fe45389fbdc";

      // Calculate deterministic segwit address
      const match = await calculateDeterministicAddress(
        chain,
        toAddress,
        MAINNET_PUBLIC_KEY,
      );

      console.log("Match:", match);
    }

    {
      // Sample chain
      const chain = SupportedBlockchains.Base;

      // Destination address (20 bytes)
      const toAddress = "0x0f90793a54e809bf708bd0fbcc63d311e3bb1be1";

      // Calculate deterministic segwit address
      const match = await calculateDeterministicAddress(
        chain,
        toAddress,
        MAINNET_PUBLIC_KEY,
      );

      console.log("Match:", match);
    }

    {
      // Sample chain
      const chain = SupportedBlockchains.Sui;

      // Destination address (32 bytes)
      const toAddress =
        "0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8";

      // Calculate deterministic segwit address
      const match = await calculateDeterministicAddress(
        chain,
        toAddress,
        MAINNET_PUBLIC_KEY,
      );

      console.log("Match:", match);
    }
  } catch (error) {
    if (error instanceof BitcoinAddressError || error instanceof APIError) {
      console.error("Bitcoin Address Generation Error:", error.message);
    } else {
      console.error("Unexpected Error:", error);
    }
    throw error;
  }
}

// Run the example
generateSegwitAddress().catch(console.error);
