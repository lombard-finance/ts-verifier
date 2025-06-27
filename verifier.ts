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
    case "sonic":
      blockchainType = SupportedBlockchains.Sonic;
      break;
    case "ink":
      blockchainType = SupportedBlockchains.Ink;
      break;
    case "solana":
      blockchainType = SupportedBlockchains.Solana;
      break;
    case "katana":
      blockchainType = SupportedBlockchains.Katana;
      break;
    default:
      throw new BitcoinAddressError(
        `Unrecognized destination network: ${type}`,
      );
  }

  const toAddress = process.argv[3];
  const { computedAddresses, expectedAddresses, referralIds, nonces } =
    await calculateDeterministicAddress(blockchainType, toAddress);

  const len = computedAddresses.length;
  for (let i = 0; i < len; i++) {
    console.log(`Checking for address ${expectedAddresses[i]}:`);
    if (referralIds[i] != undefined) {
      console.log(`- partner code: ${referralIds[i]}`);
    }
    if (nonces[i] != undefined) {
      console.log(`- nonce: ${nonces[i]}`);
    } else {
      console.log(`- nonce: 0`);
    }

    console.log(`Address fetched from API:\t${expectedAddresses[i]}`);
    console.log(`Address computed:\t\t${computedAddresses[i]}`);

    if (computedAddresses[i] === expectedAddresses[i]) {
      console.log("Addresses match!");
    } else {
      console.log("WARNING: Address mismatch!");
    }

    if (i !== len - 1) {
      console.log("");
    }
  }
}

main();
