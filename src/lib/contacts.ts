import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { contacts, notes, type Contact, type Note } from "@/db/schema";

import { buildNameSearchPattern } from "./search";
import type { ContactInput } from "./validation";

export type ContactListItem = Pick<Contact, "id" | "name" | "about" | "phone" | "email">;
export type ContactWithNotes = Contact & { notes: Note[] };

// Contact ids in URLs are positive integers; anything else is "not found"
export function parseContactId(value: string): number | null {
  if (!/^\d{1,9}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

export async function listContacts(query?: string): Promise<ContactListItem[]> {
  const pattern = buildNameSearchPattern(query);

  return db
    .select({
      id: contacts.id,
      name: contacts.name,
      about: contacts.about,
      phone: contacts.phone,
      email: contacts.email,
    })
    .from(contacts)
    .where(
      pattern
        ? sql`replace(lower(${contacts.name}), 'ё', 'е') like ${pattern}`
        : undefined,
    )
    .orderBy(asc(contacts.name), asc(contacts.id));
}

export async function countContacts(): Promise<number> {
  return db.$count(contacts);
}

export async function getContactName(id: number): Promise<string | null> {
  const [row] = await db
    .select({ name: contacts.name })
    .from(contacts)
    .where(eq(contacts.id, id));
  return row?.name ?? null;
}

export async function getContactWithNotes(id: number): Promise<ContactWithNotes | null> {
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
  if (!contact) return null;

  const contactNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.contactId, id))
    .orderBy(desc(notes.createdAt), desc(notes.id));

  return { ...contact, notes: contactNotes };
}

export async function createContact(input: ContactInput): Promise<number> {
  const { note, ...fields } = input;

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(contacts)
      .values(fields)
      .returning({ id: contacts.id });

    if (note) {
      await tx.insert(notes).values({ contactId: created.id, body: note });
    }

    return created.id;
  });
}

// Returns false when the contact does not exist
export async function addNote(contactId: number, body: string): Promise<boolean> {
  const [contact] = await db
    .select({ id: contacts.id })
    .from(contacts)
    .where(eq(contacts.id, contactId));
  if (!contact) return false;

  await db.insert(notes).values({ contactId, body });
  return true;
}
