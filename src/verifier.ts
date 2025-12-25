import { BitcoinAddressError, Networks, NetworkParams } from "./bitcoin";
import { SupportedBlockchains } from "./chain-id";
import { calculateDeterministicAddress } from "./deposit-address";

async function main() {
  const blockchain = process.argv[2];
  let blockchainType: SupportedBlockchains;
  switch (blockchain) {
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
    case "monad":
      blockchainType = SupportedBlockchains.Monad;
      break;
    case "stable":
      blockchainType = SupportedBlockchains.Stable;
      break;
    case "megaeth":
      blockchainType = SupportedBlockchains.MegaETH;
      break;
    case "avalanche":
      blockchainType = SupportedBlockchains.Avalanche;
      break;
    case "starknet":
      blockchainType = SupportedBlockchains.Starknet;
      break;
    default:
      throw new BitcoinAddressError(
        `Unrecognized destination network: ${blockchain}`,
      );
  }

  const toAddress = process.argv[3];

  const network =
    process.argv[4] === "signet"
      ? Networks.signet
      : process.argv[4] === "mainnet" || !process.argv[4]
        ? Networks.mainnet
        : (() => {
            throw new BitcoinAddressError(
              `Unknown network: '${process.argv[4]}'`,
            );
          })();

  const results = await calculateDeterministicAddress(
    blockchainType,
    toAddress,
    network,
  );

  results.addresses.forEach((addr, i) => {
    console.log(`Address ${i + 1}: ${addr.expected}`);

    console.log(`Metadata used:`);
    console.log(`  - To Address: ${toAddress}`);
    console.log(`  - Blockchain: ${addr.blockchain}`);
    console.log(`  - Partner Code: ${addr.referralId || "none"}`);
    console.log(`  - Nonce: ${addr.nonce}`);
    console.log(`  - Aux Version: ${addr.auxVersion}`);
    console.log(`  - Token Address: ${addr.tokenAddress}`);

    if (addr.computed === addr.expected) {
      console.log(`Addresses match!`);
    } else {
      console.log(`WARNING: Address mismatch!`);
      console.log(`  - Expected: ${addr.expected}`);
      console.log(`  - Computed: ${addr.computed}`);
    }

    if (i !== results.addresses.length - 1) {
      console.log("");
      console.log("-".repeat(60));
      console.log("");
    }
  });
}

main();
