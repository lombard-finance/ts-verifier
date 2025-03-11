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

    // Bitcoin address (20 bytes)
    const lbtcAddress = Buffer.from(
      "8236a87084f8B84306f72007F36F2618A5634494",
      "hex",
    ).slice(0, 20);

    // Destination address (20 bytes)
    const toAddress = Buffer.from(
      "57f9672ba603251c9c03b36cabdbbca7ca8cfcf4",
      "hex",
    ).slice(0, 20);

    // Referral ID (can be any size <= 256 bytes)
    const referralId = Buffer.from("lombard");

    // Calculate deterministic segwit address
    const address = calculateDeterministicAddress(
      "mainnet",
      chain,
      lbtcAddress,
      toAddress,
      referralId,
    );

    console.log("Generated Segwit Address:", address);
    return address;
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
