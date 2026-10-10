import { describe, expect, it } from "vitest";

import { parseContactForm, parseNoteForm } from "./validation";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

describe("parseContactForm", () => {
  it("accepts a contact with only a name and turns empty fields into null", () => {
    const result = parseContactForm(
      formData({ name: "  Анна Смирнова ", about: "", howWeMet: " ", phone: "", email: "", note: "" }),
    );

    expect(result).toEqual({
      success: true,
      data: {
        name: "Анна Смирнова",
        about: null,
        howWeMet: null,
        phone: null,
        email: null,
        note: null,
      },
    });
  });

  it("keeps all filled fields trimmed", () => {
    const result = parseContactForm(
      formData({
        name: "Иван Петров",
        about: " Дизайнер ",
        howWeMet: "Учились вместе",
        phone: "+7 (916) 123-45-67",
        email: " ivan@example.com ",
        note: "Договорились созвониться",
      }),
    );

    expect(result).toEqual({
      success: true,
      data: {
        name: "Иван Петров",
        about: "Дизайнер",
        howWeMet: "Учились вместе",
        phone: "+7 (916) 123-45-67",
        email: "ivan@example.com",
        note: "Договорились созвониться",
      },
    });
  });

  it("requires a name", () => {
    const result = parseContactForm(formData({ name: "   " }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.name).toBeDefined();
    }
  });

  it("rejects a malformed email", () => {
    const result = parseContactForm(formData({ name: "Иван", email: "ivan@" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it("rejects a phone with letters", () => {
    const result = parseContactForm(formData({ name: "Иван", phone: "позвонить" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.phone).toBeDefined();
    }
  });

  it("returns submitted values so the form can show them again", () => {
    const result = parseContactForm(formData({ name: "", email: "bad", about: "Сосед" }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.values).toMatchObject({ name: "", email: "bad", about: "Сосед" });
    }
  });
});

describe("parseNoteForm", () => {
  it("accepts a note and trims it", () => {
    expect(parseNoteForm(formData({ body: "  Обсудили поездку  " }))).toEqual({
      success: true,
      data: { body: "Обсудили поездку" },
    });
  });

  it("rejects an empty note", () => {
    const result = parseNoteForm(formData({ body: "   " }));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.body).toBeDefined();
    }
  });
});
