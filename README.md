# Lombard Deposit Address Verifier

This library can be used by users of the Lombard Finance protocol to ensure that the provided deposit addresses from the webpage actually match the derivation path in the backend code.

## Setup

Assuming `git` is installed, you can download this repository with:

```bash
git clone https://github.com/lombard-finance/ts-verifier
```

Then, navigate into the folder:

```bash
cd ts-verifier
```

And finally, run the installation (ensure you are using Node 18.10 or higher):

```bash
yarn
yarn global add ts-node
```

## Usage

The library can be used very simply:

```bash
ts-node src/verifier.ts <blockchain> <destination_address>
```

Possible options for blockchain are:

- `ethereum`
- `bsc`
- `base`
- `sui`
- `sonic`
- `ink`
- `solana`
- `katana`
- `monad`
- `stable`
- `megaeth`
- `avalanche`

You can also run an example:
```bash
ts-node src/example.ts
```

The library will query the Lombard API for deposit addresses, and then compute them internally to see if they match. For each deposit address linked to your destination address, the binary will attempt to match them, printing out 'match' or 'mismatch' in either case, and printing both addresses (fetched and derived) in all cases so that you may double-check the result yourself. It will look something like this:

```bash
$ ts-node src/verifier.ts ethereum 0x564974801D2ffBE736Ed59C9bE39F6c0A4274aE6                
Address 1: bc1qu6mwr50akfpfwjes4nh53taexuhzt6gsf8ysnn
Metadata used:
  - To Address: 0x564974801D2ffBE736Ed59C9bE39F6c0A4274aE6
  - Blockchain: ethereum
  - Partner Code: lombard
  - Nonce: 0
  - Aux Version: 0
  - Token Address: 0x8236a87084f8b84306f72007f36f2618a5634494
Addresses match!
```

or like this:
```bash
$  ts-node src/verifier.ts solana 74AYR1KpkXw3RYHia4KDGSGqNjGgEDWjLtdEvAgHcLu2      
Address 1: bc1qhvquxlsegnyc3fsuckvs8qqm28puu23mycdh7u
Metadata used:
  - To Address: 74AYR1KpkXw3RYHia4KDGSGqNjGgEDWjLtdEvAgHcLu2
  - Blockchain: solana
  - Partner Code: lombard
  - Nonce: 0
  - Aux Version: 0
  - Token Address: LomP48F7bLbKyMRHHsDVt7wuHaUQvQnVVspjcbfuAek
Addresses match!

------------------------------------------------------------

Address 2: bc1qast400qh327zr6gg8s0n0t05gu9q0z7utfmh00
Metadata used:
  - To Address: 74AYR1KpkXw3RYHia4KDGSGqNjGgEDWjLtdEvAgHcLu2
  - Blockchain: solana
  - Partner Code: okx
  - Nonce: 0
  - Aux Version: 0
  - Token Address: LomP48F7bLbKyMRHHsDVt7wuHaUQvQnVVspjcbfuAek
Addresses match!
```

## Programmatic Usage

This package can also be used as an npm dependency:

```bash
npm install @lombard.finance/ts-verifier
```

### Verify with API

```typescript
import { calculateDeterministicAddress, SupportedBlockchains, Networks } from "@lombard.finance/ts-verifier";

const result = await calculateDeterministicAddress(
  SupportedBlockchains.Ethereum,
  "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
  Networks.mainnet,
);

result.addresses.forEach((addr) => {
  if (addr.computed === addr.expected) {
    console.log("Match!", addr.computed);
  } else {
    console.log("Mismatch!", addr.computed, addr.expected);
  }
});
```

### Offline Verification

For fully offline verification without trusting the API, use `computeAddress` with all parameters provided manually:

```typescript
import { computeAddress, SupportedBlockchains, Networks } from "@lombard.finance/ts-verifier";

const btcAddress = await computeAddress({
  chain: SupportedBlockchains.Ethereum,
  toAddress: "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
  tokenAddress: "0x8236a87084f8B84306f72007F36F2618A5634494",
  referralId: "lombard",
  nonce: 0,
  auxVersion: 0,
  network: Networks.mainnet,
});

console.log(btcAddress); // bc1q24ens7l06vt8p6qqw3zvfmyh6ky0csxa7nwhcd
```

## Running Tests

```bash
yarn test
```

