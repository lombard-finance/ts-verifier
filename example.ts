import {
  calculateDeterministicAddress,
  Config,
  BlockchainType,
  BitcoinAddressError,
  SupportedBlockchains,
} from "./bitcoin-segwit-address-generator";

// Example usage
async function generateSegwitAddress() {
  try {
    // Sample chain
    const chain = SupportedBlockchains.Ethereum;

    // Destination address (20 bytes)
    const toAddress = "0x57f9672ba603251c9c03b36cabdbbca7ca8cfcf4";

    // Calculate deterministic segwit address
    const match = await calculateDeterministicAddress(chain, toAddress);

    console.log("Match:", match);
  } catch (error) {
    if (error instanceof BitcoinAddressError) {
      console.error("Bitcoin Address Generation Error:", error.message);
    } else {
      console.error("Unexpected Error:", error);
    }
    throw error;
  }
}

// Run the example
generateSegwitAddress().catch(console.error);
