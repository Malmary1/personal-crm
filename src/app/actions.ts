"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addNote, createContact } from "@/lib/contacts";
import {
  parseContactForm,
  parseNoteForm,
  type ContactField,
} from "@/lib/validation";

export type ContactFormState = {
  errors?: Partial<Record<ContactField, string>>;
  values?: Record<ContactField, string>;
};

export async function createContactAction(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const result = parseContactForm(formData);
  if (!result.success) {
    return { errors: result.errors, values: result.values };
  }

  const id = await createContact(result.data);

  revalidatePath("/");
  redirect(`/?added=${id}`);
}

export type NoteFormState = {
  errors?: { body?: string };
  values?: { body: string };
};

export async function addNoteAction(
  contactId: number,
  _previous: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const result = parseNoteForm(formData);
  if (!result.success) {
    return { errors: result.errors, values: result.values };
  }

  // Server Actions are public endpoints, so the bound id is checked too
  const added =
    Number.isSafeInteger(contactId) && contactId > 0
      ? await addNote(contactId, result.data.body)
      : false;

  if (!added) {
    return {
      errors: { body: "Контакт не найден — заметку некуда сохранить" },
      values: { body: result.data.body },
    };
  }

  refresh();
  return {};
}
