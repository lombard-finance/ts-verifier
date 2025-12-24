import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateDeterministicAddress } from "./deposit-address";
import { SupportedBlockchains } from "./chain-id";
import { Networks } from "./bitcoin";

// Mock the API module
vi.mock("./api", () => ({
  fetchAddressMetadata: vi.fn(),
  trimHexPrefix: (hex: string) =>
    hex.startsWith("0x") ? hex.substring(2) : hex,
}));

import { fetchAddressMetadata } from "./api";

describe("calculateDeterministicAddress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("security check: to_address validation", () => {
    it("should throw error when API returns mismatched to_address", async () => {
      const userAddress = "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1";
      const attackerAddress = "0xATTACKER1234567890123456789012345678901";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: attackerAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_ETHEREUM",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "8236a87084f8B84306f72007F36F2618A5634494",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Ethereum,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow(
        `API returned mismatched to_address: expected ${userAddress}, got ${attackerAddress}`,
      );
    });

    it("should pass when API returns matching to_address (case-insensitive for EVM)", async () => {
      const userAddress = "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1";
      const apiAddress = "0x0f90793a54e809bf708bd0fbcc63d311e3bb1be1"; // Different case

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: apiAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_ETHEREUM",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "8236a87084f8B84306f72007F36F2618A5634494",
              "hex",
            ),
          },
        ],
      });

      const result = await calculateDeterministicAddress(
        SupportedBlockchains.Ethereum,
        userAddress,
        Networks.mainnet,
      );

      expect(result.addresses).toHaveLength(1);
    });

    it("should throw error when API returns subtly different address", async () => {
      const userAddress = "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1";
      const similarAddress = "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE2";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: similarAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_ETHEREUM",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "8236a87084f8B84306f72007F36F2618A5634494",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Ethereum,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow("API returned mismatched to_address");
    });

    it("should throw error when Solana API returns mismatched to_address", async () => {
      const userAddress = "9Yb3kJXMMHUN9ry1w7UTFETe1zuM2pGzM66d4aBjtMCh";
      const attackerAddress = "AttackerAddressXXXXXXXXXXXXXXXXXXXXXXXXXX";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: attackerAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_SOLANA",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "05e4a3f7b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Solana,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow(
        `API returned mismatched to_address: expected ${userAddress}, got ${attackerAddress}`,
      );
    });

    it("should throw error when Solana address differs only in case (case-sensitive)", async () => {
      const userAddress = "9Yb3kJXMMHUN9ry1w7UTFETe1zuM2pGzM66d4aBjtMCh";
      const differentCaseAddress =
        "9yb3kJXMMHUN9ry1w7UTFETe1zuM2pGzM66d4aBjtMCh";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: differentCaseAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_SOLANA",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "05e4a3f7b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Solana,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow("API returned mismatched to_address");
    });

    it("should throw error when Sui API returns mismatched to_address", async () => {
      const userAddress =
        "0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8";
      const attackerAddress =
        "0xattacker52371626bb6894ce9b599c935f8dea92ca34668f2da7148df245864";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: attackerAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_SUI",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Sui,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow(
        `API returned mismatched to_address: expected ${userAddress}, got ${attackerAddress}`,
      );
    });

    it("should pass when Sui API returns matching to_address (case-insensitive)", async () => {
      const userAddress =
        "0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8";
      const apiAddress =
        "0xA51D5C52371626BB6894CE9B599C935F8DEA92CA34668F2DA7148DF2458640B8";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: apiAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_SUI",
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040",
              "hex",
            ),
          },
        ],
      });

      const result = await calculateDeterministicAddress(
        SupportedBlockchains.Sui,
        userAddress,
        Networks.mainnet,
      );

      expect(result.addresses).toHaveLength(1);
    });
  });

  describe("security check: to_blockchain validation", () => {
    it("should throw error when API returns mismatched blockchain", async () => {
      const userAddress = "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: userAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_BSC", // Wrong blockchain!
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "8236a87084f8B84306f72007F36F2618A5634494",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Ethereum,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow(
        "API returned mismatched to_blockchain: expected DESTINATION_BLOCKCHAIN_ETHEREUM, got DESTINATION_BLOCKCHAIN_BSC",
      );
    });

    it("should throw error when Solana API returns wrong blockchain", async () => {
      const userAddress = "9Yb3kJXMMHUN9ry1w7UTFETe1zuM2pGzM66d4aBjtMCh";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: userAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_ETHEREUM", // Wrong!
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "05e4a3f7b8c9d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Solana,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow(
        "API returned mismatched to_blockchain: expected DESTINATION_BLOCKCHAIN_SOLANA, got DESTINATION_BLOCKCHAIN_ETHEREUM",
      );
    });

    it("should throw error when Sui API returns wrong blockchain", async () => {
      const userAddress =
        "0xa51d5c52371626bb6894ce9b599c935f8dea92ca34668f2da7148df2458640b8";

      vi.mocked(fetchAddressMetadata).mockResolvedValue({
        addresses: [
          {
            btcAddress: "bc1qfakeaddress",
            toAddress: userAddress,
            toBlockchain: "DESTINATION_BLOCKCHAIN_BASE", // Wrong!
            referralId: "lombard",
            nonce: 0,
            auxVersion: 0,
            tokenAddress: Buffer.from(
              "3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040",
              "hex",
            ),
          },
        ],
      });

      await expect(
        calculateDeterministicAddress(
          SupportedBlockchains.Sui,
          userAddress,
          Networks.mainnet,
        ),
      ).rejects.toThrow(
        "API returned mismatched to_blockchain: expected DESTINATION_BLOCKCHAIN_SUI, got DESTINATION_BLOCKCHAIN_BASE",
      );
    });
  });
});
