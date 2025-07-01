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

// Chain IDs
const ETHEREUM_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000000001",
  "hex",
);
const BASE_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000002105",
  "hex",
);
const BSC_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000000038",
  "hex",
);
const SUI_CHAIN_ID = Buffer.from(
  "0100000000000000000000000000000000000000000000000000000035834a8a",
  "hex",
);
const SONIC_CHAIN_ID = Buffer.from(
  "0000000000000000000000000000000000000000000000000000000000000092",
  "hex",
);
const INK_CHAIN_ID = Buffer.from(
  "000000000000000000000000000000000000000000000000000000000000def1",
  "hex",
);
const SOLANA_CHAIN_ID = Buffer.from(
  "02296998a6f8e2a784db5d9f95e18fc23f70441a1039446801089879b08c7ef0",
  "hex",
);
const KATANA_CHAIN_ID = Buffer.from(
  "00000000000000000000000000000000000000000000000000000000000b67d2",
  "hex",
);

// Token Contracts
const ETHEREUM_STLBTC_CONTRACT = "8236a87084f8B84306f72007F36F2618A5634494";
const BASE_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1";
const BSC_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1";
const SUI_STLBTC_CONTRACT =
  "3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040";
const SONIC_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1";
const INK_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1";
const SOLANA_STLBTC_CONTRACT = "LomP48F7bLbKyMRHHsDVt7wuHaUQvQnVVspjcbfuAek";
const KATANA_STLBTC_CONTRACT = "ecAc9C5F704e954931349Da37F60E39f515c11c1";
const KATANA_LBTC_CONTRACT = "B0F70C0bD6FD87dbEb7C10dC692a2a6106817072";

// Blockchain configuration map
export const blockchainConfigMap = new Map([
  [
    SupportedBlockchains.Ethereum,
    {
      chainId: ETHEREUM_CHAIN_ID,
      stlbtcAddress: ETHEREUM_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_ETHEREUM",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Base,
    {
      chainId: BASE_CHAIN_ID,
      stlbtcAddress: BASE_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_BASE",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.BSC,
    {
      chainId: BSC_CHAIN_ID,
      stlbtcAddress: BSC_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_BSC",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Sui,
    {
      chainId: SUI_CHAIN_ID,
      stlbtcAddress: SUI_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_SUI",
      ecosystem: Ecosystem.Sui,
    },
  ],

  [
    SupportedBlockchains.Sonic,
    {
      chainId: SONIC_CHAIN_ID,
      stlbtcAddress: SONIC_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_SONIC",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Ink,
    {
      chainId: INK_CHAIN_ID,
      stlbtcAddress: INK_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_INK",
      ecosystem: Ecosystem.EVM,
    },
  ],

  [
    SupportedBlockchains.Solana,
    {
      chainId: SOLANA_CHAIN_ID,
      stlbtcAddress: SOLANA_STLBTC_CONTRACT,
      lbtcAddress: null,
      name: "DESTINATION_BLOCKCHAIN_SOLANA",
      ecosystem: Ecosystem.Solana,
    },
  ],

  [
    SupportedBlockchains.Katana,
    {
      chainId: KATANA_CHAIN_ID,
      stlbtcAddress: KATANA_STLBTC_CONTRACT,
      lbtcAddress: KATANA_LBTC_CONTRACT,
      name: "DESTINATION_BLOCKCHAIN_KATANA",
      ecosystem: Ecosystem.EVM,
    },
  ],
]);

// Type definition for the config structure
export interface BlockchainConfig {
  chainId: LChainId;
  stlbtcAddress: string;
  lbtcAddress: string | null;
  name: string;
  ecosystem: Ecosystem;
}

// Helper function to get config for a blockchain
export function getBlockchainConfig(
  blockchain: SupportedBlockchains,
): BlockchainConfig | undefined {
  return blockchainConfigMap.get(blockchain);
}
