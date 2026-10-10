import { describe, expect, it } from "vitest";

import { buildNameSearchPattern } from "./search";

describe("buildNameSearchPattern", () => {
  it("returns null for an empty query", () => {
    expect(buildNameSearchPattern("")).toBeNull();
    expect(buildNameSearchPattern("   ")).toBeNull();
    expect(buildNameSearchPattern(undefined)).toBeNull();
  });

  it("matches a substring case-insensitively", () => {
    expect(buildNameSearchPattern("  Петров ")).toBe("%петров%");
  });

  it("treats ё and е as the same letter", () => {
    expect(buildNameSearchPattern("Королёв")).toBe("%королев%");
    expect(buildNameSearchPattern("ЁЖИК")).toBe("%ежик%");
  });

  it("escapes LIKE wildcards so they are searched literally", () => {
    expect(buildNameSearchPattern("50%_off\\")).toBe("%50\\%\\_off\\\\%");
  });
});
