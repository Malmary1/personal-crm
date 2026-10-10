import { describe, expect, it } from "vitest";

import { pluralizeRu } from "./format";

describe("pluralizeRu", () => {
  const forms = ["контакт", "контакта", "контактов"] as const;

  it.each([
    [0, "контактов"],
    [1, "контакт"],
    [2, "контакта"],
    [4, "контакта"],
    [5, "контактов"],
    [11, "контактов"],
    [12, "контактов"],
    [14, "контактов"],
    [21, "контакт"],
    [22, "контакта"],
    [111, "контактов"],
    [1000, "контактов"],
    [1001, "контакт"],
  ])("%i → %s", (count, expected) => {
    expect(pluralizeRu(count, forms)).toBe(expected);
  });
});
