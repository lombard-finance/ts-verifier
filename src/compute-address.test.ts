import { describe, it, expect } from "vitest";
import { computeAddress } from "./deposit-address";
import { SupportedBlockchains } from "./chain-id";
import { Networks } from "./bitcoin";

describe("computeAddress (offline)", () => {
  it("should compute correct BTC address for Ethereum", async () => {
    const address = await computeAddress({
      chain: SupportedBlockchains.Ethereum,
      toAddress: "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
      tokenAddress: "0x8236a87084f8B84306f72007F36F2618A5634494",
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
      toAddress: "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
      tokenAddress: "0x8236a87084f8B84306f72007F36F2618A5634494",
      nonce: 0,
      auxVersion: 0,
      network: Networks.mainnet,
    };

    const lombardAddr = await computeAddress({ ...baseParams, referralId: "lombard" });
    const okxAddr = await computeAddress({ ...baseParams, referralId: "okx" });

    expect(lombardAddr).toBe("bc1q24ens7l06vt8p6qqw3zvfmyh6ky0csxa7nwhcd");
    expect(okxAddr).toBe("bc1qaqaz88s7h55acxkt0jmzc4ey6gpt5pwe3e0k8y");
    expect(lombardAddr).not.toBe(okxAddr);
  });

  it("should compute different addresses for different nonces", async () => {
    const baseParams = {
      chain: SupportedBlockchains.Ethereum,
      toAddress: "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
      tokenAddress: "0x8236a87084f8B84306f72007F36F2618A5634494",
      referralId: "lombard",
      auxVersion: 0,
      network: Networks.mainnet,
    };

    const nonce0 = await computeAddress({ ...baseParams, nonce: 0 });
    const nonce1 = await computeAddress({ ...baseParams, nonce: 1 });

    expect(nonce0).not.toBe(nonce1);
  });

  it("should handle addresses without 0x prefix", async () => {
    const withPrefix = await computeAddress({
      chain: SupportedBlockchains.Ethereum,
      toAddress: "0x0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
      tokenAddress: "0x8236a87084f8B84306f72007F36F2618A5634494",
      referralId: "lombard",
      nonce: 0,
      auxVersion: 0,
    });

    const withoutPrefix = await computeAddress({
      chain: SupportedBlockchains.Ethereum,
      toAddress: "0F90793a54E809bf708bd0FbCC63d311E3bb1BE1",
      tokenAddress: "8236a87084f8B84306f72007F36F2618A5634494",
      referralId: "lombard",
      nonce: 0,
      auxVersion: 0,
    });

    expect(withPrefix).toBe(withoutPrefix);
  });
});
