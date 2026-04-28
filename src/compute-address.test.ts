import { describe, it, expect, vi } from "vitest";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { DepositAddressVerifier } from "./deposit-address";
import { SupportedBlockchains } from "./chain-id";
import { Networks } from "./bitcoin";

const EVM_OWNER = "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1";
const ETH_LBTC = "0x8236a87084f8B84306f72007F36F2618A5634494";

const SUI_OWNER =
  "0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8";
const SUI_LBTC =
  "0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040";

const STARKNET_OWNER =
  "0x07a04ca8f107ad0a923aea85db3b65ef2a0b084faf2e7ad911314f2a767aa5e2";
const STARKNET_LBTC =
  "0x05b1886d0f844ab930fc0ee066f1655a873437f15a5d2c41ee3e884fd5299976";

const SOLANA_OWNER = "ECC6SMkL7HquBz95Cmi8eM4Gg35NrTvAzNBxZhmZ7r1N";
const SOLANA_NATIVE_LBTC_MINT = "BTCbKVgfW4xMqTWEmxVwc6pzg2c5YtQWxSpBuQDhUrpu";
const SOLANA_STLBTC_MINT = "LBTCgU4b3wsFKsPwBn1rRZDx5DoFutM6RPiEt1TPDsY";

function makeMockConnection(
  programId: PublicKey = TOKEN_PROGRAM_ID,
): Connection {
  return {
    getAccountInfo: vi.fn().mockResolvedValue({
      owner: programId,
      lamports: 0,
      data: Buffer.alloc(0),
      executable: false,
      rentEpoch: 0,
    }),
  } as unknown as Connection;
}

describe("DepositAddressVerifier.computeOffline", () => {
  describe("Ethereum (EVM)", () => {
    it("should compute correct BTC address for Ethereum", async () => {
      const address = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Ethereum,
        toAddress: EVM_OWNER,
        tokenAddress: ETH_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });

      expect(address).toBe("bc1q24ens7l06vt8p6qqw3zvfmyh6ky0csxa7nwhcd");
    });

    it("should compute different addresses for different referral IDs", async () => {
      const baseParams = {
        chain: SupportedBlockchains.Ethereum,
        toAddress: EVM_OWNER,
        tokenAddress: ETH_LBTC,
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      };

      const lombardAddr = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        referralId: "lombard",
      });
      const okxAddr = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        referralId: "okx",
      });

      expect(lombardAddr).toBe("bc1q24ens7l06vt8p6qqw3zvfmyh6ky0csxa7nwhcd");
      expect(okxAddr).toBe("bc1qaqaz88s7h55acxkt0jmzc4ey6gpt5pwe3e0k8y");
      expect(lombardAddr).not.toBe(okxAddr);
    });

    it("should compute different addresses for different nonces", async () => {
      const baseParams = {
        chain: SupportedBlockchains.Ethereum,
        toAddress: EVM_OWNER,
        tokenAddress: ETH_LBTC,
        referralId: "lombard",
        auxVersion: 0,
        network: Networks.mainnet,
      };

      const nonce0 = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        nonce: 0,
      });
      const nonce1 = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        nonce: 1,
      });

      expect(nonce0).not.toBe(nonce1);
    });

    it("should handle addresses without 0x prefix", async () => {
      const withPrefix = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Ethereum,
        toAddress: EVM_OWNER,
        tokenAddress: ETH_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
      });

      const withoutPrefix = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Ethereum,
        toAddress: "0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
        tokenAddress: "8236a87084f8B84306f72007F36F2618A5634494",
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
      });

      expect(withPrefix).toBe(withoutPrefix);
    });

    it("should produce different mainnet vs signet addresses for the same inputs", async () => {
      const params = {
        chain: SupportedBlockchains.Ethereum,
        toAddress: EVM_OWNER,
        tokenAddress: ETH_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
      };

      const mainnetAddr = await DepositAddressVerifier.computeOffline({
        ...params,
        network: Networks.mainnet,
      });
      const signetAddr = await DepositAddressVerifier.computeOffline({
        ...params,
        network: Networks.signet,
      });

      expect(mainnetAddr.startsWith("bc1")).toBe(true);
      expect(signetAddr.startsWith("tb1")).toBe(true);
      expect(mainnetAddr).not.toBe(signetAddr);
    });

    it("should throw when EVM token address has wrong byte length", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Ethereum,
          toAddress: EVM_OWNER,
          tokenAddress: "0xdeadbeef", // 4 bytes, not 20
          referralId: "lombard",
          nonce: 0,
          auxVersion: 0,
        }),
      ).rejects.toThrow(/Bad TokenAddress/);
    });

    it("should throw when auxVersion 1 is used without a tokenAddress", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Ethereum,
          toAddress: EVM_OWNER,
          referralId: "lombard",
          nonce: 0,
          auxVersion: 1,
        }),
      ).rejects.toThrow(/target token address is required for aux v1/);
    });

    it("should throw on unknown auxVersion", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Ethereum,
          toAddress: EVM_OWNER,
          tokenAddress: ETH_LBTC,
          referralId: "lombard",
          nonce: 0,
          auxVersion: 99,
        }),
      ).rejects.toThrow(/unknown aux version/);
    });
  });

  describe("BSC (non-Ethereum EVM)", () => {
    it("produces a different mainnet address than Ethereum for the same inputs", async () => {
      const baseParams = {
        toAddress: EVM_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      };

      const eth = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        chain: SupportedBlockchains.Ethereum,
        tokenAddress: ETH_LBTC,
      });

      const bsc = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        chain: SupportedBlockchains.BSC,
        // BSC mainnet stlbtc per chain-id.ts
        tokenAddress: "0xecAc9C5F704e954931349Da37F60E39f515c11c1",
      });

      expect(bsc.startsWith("bc1")).toBe(true);
      expect(bsc).not.toBe(eth);
    });

    it("uses the chain config's default token when tokenAddress is omitted (aux v0)", async () => {
      const explicit = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.BSC,
        toAddress: EVM_OWNER,
        tokenAddress: "0xecAc9C5F704e954931349Da37F60E39f515c11c1",
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });

      const defaulted = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.BSC,
        toAddress: EVM_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });

      expect(defaulted).toBe(explicit);
    });
  });

  describe("Sui", () => {
    it("computes a valid mainnet address for Sui aux v0", async () => {
      const addr = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Sui,
        toAddress: SUI_OWNER,
        tokenAddress: SUI_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });
      expect(addr.startsWith("bc1")).toBe(true);
    });

    it("aux v1 with a different token yields a different address than aux v0", async () => {
      const v0 = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Sui,
        toAddress: SUI_OWNER,
        tokenAddress: SUI_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });

      const v1 = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Sui,
        toAddress: SUI_OWNER,
        // Arbitrary distinct 32-byte token address
        tokenAddress:
          "0x1111111111111111111111111111111111111111111111111111111111111111",
        referralId: "lombard",
        nonce: 0,
        auxVersion: 1,
        network: Networks.mainnet,
      });

      expect(v1.startsWith("bc1")).toBe(true);
      expect(v1).not.toBe(v0);
    });

    it("throws when the Sui to-address is not 32 bytes", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Sui,
          // 20-byte EVM-style address — wrong length for Sui
          toAddress: EVM_OWNER,
          tokenAddress: SUI_LBTC,
          referralId: "lombard",
          nonce: 0,
          auxVersion: 0,
          network: Networks.mainnet,
        }),
      ).rejects.toThrow(/Bad ToAddress/);
    });
  });

  describe("Starknet", () => {
    it("computes a valid mainnet address for Starknet aux v0", async () => {
      const addr = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Starknet,
        toAddress: STARKNET_OWNER,
        tokenAddress: STARKNET_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });
      expect(addr.startsWith("bc1")).toBe(true);
    });

    it("uses the chain config's default token when tokenAddress is omitted (aux v0)", async () => {
      const explicit = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Starknet,
        toAddress: STARKNET_OWNER,
        tokenAddress: STARKNET_LBTC,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });

      const defaulted = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Starknet,
        toAddress: STARKNET_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      });

      expect(defaulted).toBe(explicit);
    });

    it("throws when the Starknet token address is not 32 bytes", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Starknet,
          toAddress: STARKNET_OWNER,
          // 20 bytes — too short for Starknet (expects 32)
          tokenAddress: "0xecAc9C5F704e954931349Da37F60E39f515c11c1",
          referralId: "lombard",
          nonce: 0,
          auxVersion: 0,
          network: Networks.mainnet,
        }),
      ).rejects.toThrow(/Bad TokenAddress/);
    });
  });

  describe("Solana", () => {
    it("computes a valid mainnet bech32 address for aux v0 with default token", async () => {
      const addr = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });

      expect(addr.startsWith("bc1")).toBe(true);
    });

    it("computes a different address for the same owner with aux v1 + custom mint", async () => {
      const v0 = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });

      const v1 = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        tokenAddress: SOLANA_NATIVE_LBTC_MINT,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 1,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });

      expect(v0).not.toBe(v1);
      expect(v1.startsWith("bc1")).toBe(true);
    });

    it("is deterministic for the same Solana inputs", async () => {
      const params = {
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
      };
      const a = await DepositAddressVerifier.computeOffline({
        ...params,
        solanaConnection: makeMockConnection(),
      });
      const b = await DepositAddressVerifier.computeOffline({
        ...params,
        solanaConnection: makeMockConnection(),
      });
      expect(a).toBe(b);
    });

    it("produces different addresses for different Solana owners", async () => {
      const a = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });
      const b = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: "74AYR1KpkXw3RYHia4KDGSGqNjGgEDWjLtdEvAgHcLu2",
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });
      expect(a).not.toBe(b);
    });

    it("produces different addresses for different Solana mints under aux v1", async () => {
      const a = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        tokenAddress: SOLANA_NATIVE_LBTC_MINT,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 1,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });

      const b = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        tokenAddress: SOLANA_STLBTC_MINT,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 1,
        network: Networks.mainnet,
        solanaConnection: makeMockConnection(),
      });

      expect(a).not.toBe(b);
    });

    it("uses signet prefix when network is signet", async () => {
      const addr = await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.signet,
        solanaConnection: makeMockConnection(),
      });
      expect(addr.startsWith("tb1")).toBe(true);
    });

    it("throws when aux v1 is used without a token (mint) address", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Solana,
          toAddress: SOLANA_OWNER,
          referralId: "lombard",
          nonce: 0,
          auxVersion: 1,
          network: Networks.mainnet,
          solanaConnection: makeMockConnection(),
        }),
      ).rejects.toThrow(/target token address is required for aux v1/);
    });

    it("throws when given an invalid Solana base58 owner address", async () => {
      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Solana,
          toAddress: "not-a-real-base58-address!!!",
          referralId: "lombard",
          nonce: 0,
          auxVersion: 0,
          network: Networks.mainnet,
          solanaConnection: makeMockConnection(),
        }),
      ).rejects.toThrow();
    });

    it("looks up the mint owner program and passes it to ATA derivation", async () => {
      const mockConn = makeMockConnection();
      await DepositAddressVerifier.computeOffline({
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 0,
        network: Networks.mainnet,
        solanaConnection: mockConn,
      });

      expect(mockConn.getAccountInfo).toHaveBeenCalledTimes(1);
    });

    it("derives a different ATA when the mint is owned by Token-2022 vs the legacy Token Program", async () => {
      const baseParams = {
        chain: SupportedBlockchains.Solana,
        toAddress: SOLANA_OWNER,
        tokenAddress: SOLANA_NATIVE_LBTC_MINT,
        referralId: "lombard",
        nonce: 0,
        auxVersion: 1,
        network: Networks.mainnet,
      };

      const legacy = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        solanaConnection: makeMockConnection(TOKEN_PROGRAM_ID),
      });

      const token2022 = await DepositAddressVerifier.computeOffline({
        ...baseParams,
        solanaConnection: makeMockConnection(TOKEN_2022_PROGRAM_ID),
      });

      expect(legacy).not.toBe(token2022);
    });

    it("throws when the mint account does not exist on chain", async () => {
      const missingMintConn = {
        getAccountInfo: vi.fn().mockResolvedValue(null),
      } as unknown as Connection;

      await expect(
        DepositAddressVerifier.computeOffline({
          chain: SupportedBlockchains.Solana,
          toAddress: SOLANA_OWNER,
          referralId: "lombard",
          nonce: 0,
          auxVersion: 0,
          network: Networks.mainnet,
          solanaConnection: missingMintConn,
        }),
      ).rejects.toThrow(/Solana mint account not found/);
    });
  });
});
