import { z } from "zod";

// Error messages are shown in the UI, so they are in Russian

const optionalText = (max: number, tooLongMessage: string) =>
  z
    .string()
    .trim()
    .max(max, tooLongMessage)
    .transform((value) => (value === "" ? null : value));

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(200, "Имя слишком длинное — не больше 200 символов"),
  about: optionalText(500, "Слишком длинно — не больше 500 символов"),
  howWeMet: optionalText(1000, "Слишком длинно — не больше 1000 символов"),
  phone: optionalText(50, "Слишком длинный номер").refine(
    (value) => value === null || /^[+\d\s()-]+$/.test(value),
    "Телефон может содержать только цифры, пробелы и символы + ( ) -",
  ),
  email: optionalText(254, "Слишком длинный адрес").refine(
    (value) => value === null || z.email().safeParse(value).success,
    "Похоже, в адресе почты опечатка",
  ),
  note: optionalText(5000, "Заметка слишком длинная — не больше 5000 символов"),
});

const noteSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Напишите текст заметки")
    .max(5000, "Заметка слишком длинная — не больше 5000 символов"),
});

export const contactFields = ["name", "about", "howWeMet", "phone", "email", "note"] as const;
export type ContactField = (typeof contactFields)[number];
export type ContactInput = z.output<typeof contactSchema>;

export type FormResult<Field extends string, Data> =
  | { success: true; data: Data }
  | {
      success: false;
      errors: Partial<Record<Field, string>>;
      values: Record<Field, string>;
    };

function readFields<Field extends string>(
  formData: FormData,
  fields: readonly Field[],
): Record<Field, string> {
  const values = {} as Record<Field, string>;
  for (const field of fields) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  return values;
}

function parseForm<Field extends string, Data>(
  schema: z.ZodType<Data, Record<Field, string>>,
  formData: FormData,
  fields: readonly Field[],
): FormResult<Field, Data> {
  const values = readFields(formData, fields);
  const parsed = schema.safeParse(values);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const errors: Partial<Record<Field, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as Field;
    errors[field] ??= issue.message;
  }
  return { success: false, errors, values };
}

export function parseContactForm(formData: FormData): FormResult<ContactField, ContactInput> {
  return parseForm(contactSchema, formData, contactFields);
}

export function parseNoteForm(formData: FormData): FormResult<"body", { body: string }> {
  return parseForm(noteSchema, formData, ["body"]);
}
