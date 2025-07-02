import bs58 from "bs58";

// Address type
export type Address = Buffer;

// ChainId type
export type LChainId = Buffer;

// Blockchain Types
export enum Ecosystem {
  EVM = "evm",
  Sui = "sui",
  Solana = "solana",
}

export enum SupportedBlockchains {
  Ethereum = "ethereum",
  Base = "base",
  BSC = "bsc",
  Sui = "sui",
  Sonic = "sonic",
  Ink = "ink",
  Solana = "solana",
  Katana = "katana",
}

// Blockchain configuration map for mainnet
export const mainnetBlockchainConfigs = new Map([
  [
    SupportedBlockchains.Ethereum,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000001",
        "hex",
      ),
      stlbtc: Buffer.from("8236a87084f8B84306f72007F36F2618A5634494", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_ETHEREUM",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Base,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000002105",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_BASE",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.BSC,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000038",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_BSC",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Sui,
    {
      chainId: Buffer.from(
        "0100000000000000000000000000000000000000000000000000000035834a8a",
        "hex",
      ),
      stlbtc: Buffer.from(
        "3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040",
        "hex",
      ),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_SUI",
      ecosystem: Ecosystem.Sui,
    },
  ],

  [
    SupportedBlockchains.Sonic,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000092",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_SONIC",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Ink,
    {
      chainId: Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000def1",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_INK",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Solana,
    {
      chainId: Buffer.from(
        "02296998a6f8e2a784db5d9f95e18fc23f70441a1039446801089879b08c7ef0",
        "hex",
      ),
      stlbtc: Buffer.from(
        bs58.decode("LomP48F7bLbKyMRHHsDVt7wuHaUQvQnVVspjcbfuAek"),
      ),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_SOLANA",
      ecosystem: Ecosystem.Solana,
    },
  ],

  [
    SupportedBlockchains.Katana,
    {
      chainId: Buffer.from(
        "00000000000000000000000000000000000000000000000000000000000b67d2",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: Buffer.from(
        "B0F70C0bD6FD87dbEb7C10dC692a2a6106817072",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_KATANA",
      ecosystem: Ecosystem.EVM,
    },
  ],
]);

// Blockchain configuration map for Gastald testnet
export const gastaldBlockchainConfigs = new Map([
  [
    SupportedBlockchains.Ethereum,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000004268",
        "hex",
      ),
      stlbtc: Buffer.from("38A13AB20D15ffbE5A7312d2336EF1552580a4E2", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_ETHEREUM",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Base,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000014a34",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_BASE",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.BSC,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000061",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_BSC",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Sui,
    {
      chainId: Buffer.from(
        "010000000000000000000000000000000000000000000000000000004c78adac",
        "hex",
      ),
      stlbtc: Buffer.from(
        "50454d0b0fbad1288a6ab74f2e8ce0905a3317870673ab7787ebcf6f322b45fa",
        "hex",
      ),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_SUI",
      ecosystem: Ecosystem.Sui,
    },
  ],

  [
    SupportedBlockchains.Sonic,
    {
      chainId: Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000dede",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_SONIC",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Ink,
    {
      chainId: Buffer.from(
        "00000000000000000000000000000000000000000000000000000000000ba5ed",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_INK",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Solana,
    {
      chainId: Buffer.from(
        "0259db5080fc2c6d3bcf7ca90712d3c2e5e6c28f27f0dfbb9953bdb0894c03ab",
        "hex",
      ),
      stlbtc: Buffer.from(
        bs58.decode("79cscM6J9Af24TGGWcXyDf56fDLoodkyXdVy4R9aZ6C6"),
      ),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_SOLANA",
      ecosystem: Ecosystem.Solana,
    },
  ],

  [
    SupportedBlockchains.Katana,
    {
      chainId: Buffer.from(
        "000000000000000000000000000000000000000000000000000000000001f977",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: Buffer.from(
        "20eA7b8ABb4B583788F1DFC738C709a2d9675681",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_KATANA",
      ecosystem: Ecosystem.EVM,
    },
  ],
]);

// Type definition for the config structure
export interface BlockchainConfig {
  chainId: LChainId;
  stlbtc: Address;
  nativeLbtc: Address | null;
  name: string;
  ecosystem: Ecosystem;
}
