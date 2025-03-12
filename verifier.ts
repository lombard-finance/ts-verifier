import {
  calculateDeterministicAddress,
  BitcoinAddressError,
  SupportedBlockchains,
} from "./address-calculator";

async function main() {
  const type = process.argv[2];
  let blockchainType: SupportedBlockchains;
  switch (type) {
    case "ethereum":
      blockchainType = SupportedBlockchains.Ethereum;
      break;
    case "base":
      blockchainType = SupportedBlockchains.Base;
      break;
    case "bsc":
      blockchainType = SupportedBlockchains.BSC;
      break;
    case "sui":
      blockchainType = SupportedBlockchains.Sui;
      break;
    default:
      throw new BitcoinAddressError(
        `Unrecognized destination network: ${type}`,
      );
  }

  const toAddress = process.argv[3];
  const { computedAddresses, claimedAddresses, referralIds, nonces } =
    await calculateDeterministicAddress(blockchainType, toAddress);

  const len = computedAddresses.length;
  for (let i = 0; i < len; i++) {
    console.log(`Checking for address ${i}:`);
    if (referralIds[i] !== undefined) {
      console.log(`    partner code ${referralIds[i]}`);
    }
    if (nonces[i] !== undefined) {
      console.log(`    and nonce ${nonces[i]}...`);
    }
    if (computedAddresses[i] === claimedAddresses[i]) {
      console.log("Addresses match!");
    } else {
      console.log("WARNING: Address mismatch!");
    }

    console.log("Address fetched from API:", claimedAddresses[i]);
    console.log("Address computed:", computedAddresses[i]);
  }
}

main();
