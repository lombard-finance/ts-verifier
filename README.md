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
ts-node verifier.ts <blockchain> <destination_address>
```

Possible options for blockchain are:

- `ethereum`
- `bsc`
- `base`
- `sui`

The library will query the Lombard API for deposit addresses, and then compute them internally to see if they match. For each deposit address linked to your destination address, the binary will attempt to match them, printing out 'match' or 'mismatch' in either case, and printing both addresses (fetched and derived) in all cases so that you may double-check the result yourself. It will look something like this:

```bash
$ ts-node verifier.ts ethereum 0x57f9672ba603251c9c03b36cabdbbca7ca8cfcf4
Addresses match!
Address fetched from API: bc1q29nrqh3cj5q5r0n7yjea6hezkrxhf6nyfv3afz
Address computed: bc1q29nrqh3cj5q5r0n7yjea6hezkrxhf6nyfv3afz
```
