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
  Starknet = "starknet",
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
  Monad = "monad",
  Stable = "stable",
  MegaETH = "megaeth",
  Avalanche = "avalanche",
  Starknet = "starknet",
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

  [
    SupportedBlockchains.Monad,
    {
      chainId: Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000008f",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: Buffer.from(
        "B0F70C0bD6FD87dbEb7C10dC692a2a6106817072",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_MONAD",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Stable,
    {
      chainId: Buffer.from(
        "00000000000000000000000000000000000000000000000000000000000003dc",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: Buffer.from(
        "B0F70C0bD6FD87dbEb7C10dC692a2a6106817072",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_STABLE",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.MegaETH,
    {
      chainId: Buffer.from(
        "00000000000000000000000000000000000000000000000000000000000010e6",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: Buffer.from(
        "B0F70C0bD6FD87dbEb7C10dC692a2a6106817072",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_MEGAETH",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Avalanche,
    {
      chainId: Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000a86a",
        "hex",
      ),
      stlbtc: Buffer.from("ecAc9C5F704e954931349Da37F60E39f515c11c1", "hex"),
      nativeLbtc: Buffer.from(
        "85D1D52e11290F174444d21C2a167bEDBE36e4d2",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_AVALANCHE",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Starknet,
    {
      chainId: Buffer.from(
        "04000000000000000000000000000000000000000000000000534e5f4d41494e",
        "hex",
      ),
      stlbtc: Buffer.from(
        "05b1886d0f844ab930fc0ee066f1655a873437f15a5d2c41ee3e884fd5299976",
        "hex",
      ),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_STARKNET",
      ecosystem: Ecosystem.Starknet,
    },
  ],
]);

// Blockchain configuration map for Gastald testnet
export const gastaldBlockchainConfigs = new Map([
  [
    SupportedBlockchains.Ethereum,
    {
      chainId: Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000aa36a7",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: Buffer.from(
        "20eA7b8ABb4B583788F1DFC738C709a2d9675681",
        "hex",
      ),
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

  [
    SupportedBlockchains.Avalanche,
    {
      chainId: Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000a869",
        "hex",
      ),
      stlbtc: Buffer.from("107Fc7d90484534704dD2A9e24c7BD45DB4dD1B5", "hex"),
      nativeLbtc: Buffer.from(
        "41BCd71e7C92b1c8dDe53037F9b2c4AA2058b1cB",
        "hex",
      ),
      name: "DESTINATION_BLOCKCHAIN_AVALANCHE",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Starknet,
    {
      chainId: Buffer.from(
        "04000000000000000000000000000000000000000000534e5f5345504f4c4941",
        "hex",
      ),
      stlbtc: Buffer.from(
        "063b7b5c8b114ebd5b9602fbd5d0ffd2cc3a598f1d91c6904cc0997cd8fea760",
        "hex",
      ),
      nativeLbtc: null,
      name: "DESTINATION_BLOCKCHAIN_STARKNET",
      ecosystem: Ecosystem.Starknet,
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
