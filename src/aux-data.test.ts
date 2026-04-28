import { describe, it, expect } from "vitest";
import {
  computeAuxData,
  DEPOSIT_AUX_V0,
  DEPOSIT_AUX_V1,
} from "./aux-data";
import { BitcoinAddressError } from "./bitcoin";

describe("computeAuxData", () => {
  it("returns a 32-byte sha256 digest", () => {
    const out = computeAuxData(0, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    expect(out).toBeInstanceOf(Buffer);
    expect(out.length).toBe(32);
  });

  it("is deterministic for the same inputs", () => {
    const a = computeAuxData(7, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    const b = computeAuxData(7, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    expect(a.equals(b)).toBe(true);
  });

  it("differs when nonce changes", () => {
    const a = computeAuxData(0, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    const b = computeAuxData(1, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    expect(a.equals(b)).toBe(false);
  });

  it("differs when referrerId changes", () => {
    const a = computeAuxData(0, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    const b = computeAuxData(0, Buffer.from("okx"), DEPOSIT_AUX_V0);
    expect(a.equals(b)).toBe(false);
  });

  it("differs when version changes", () => {
    const a = computeAuxData(0, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    const b = computeAuxData(0, Buffer.from("lombard"), DEPOSIT_AUX_V1);
    expect(a.equals(b)).toBe(false);
  });

  it("accepts an empty referrerId", () => {
    const out = computeAuxData(0, Buffer.from(""), DEPOSIT_AUX_V0);
    expect(out.length).toBe(32);
  });

  it("accepts a Uint8Array referrerId", () => {
    const ref = new Uint8Array([108, 111, 109, 98, 97, 114, 100]); // "lombard"
    const fromUint8 = computeAuxData(0, ref, DEPOSIT_AUX_V0);
    const fromBuffer = computeAuxData(0, Buffer.from("lombard"), DEPOSIT_AUX_V0);
    expect(fromUint8.equals(fromBuffer)).toBe(true);
  });

  it("throws when referrerId exceeds 256 bytes", () => {
    const tooLong = Buffer.alloc(257, 0x61);
    expect(() => computeAuxData(0, tooLong, DEPOSIT_AUX_V0)).toThrow(
      BitcoinAddressError,
    );
    expect(() => computeAuxData(0, tooLong, DEPOSIT_AUX_V0)).toThrow(
      /Wrong size for referrerId/,
    );
  });

  it("accepts referrerId of exactly 256 bytes", () => {
    const exact = Buffer.alloc(256, 0x61);
    expect(() => computeAuxData(0, exact, DEPOSIT_AUX_V0)).not.toThrow();
  });

  it("throws on unsupported version", () => {
    expect(() => computeAuxData(0, Buffer.from("lombard"), 99)).toThrow(
      "version is not supported",
    );
  });
});
