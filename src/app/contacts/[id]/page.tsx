import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { addNoteAction } from "@/app/actions";
import { BackLink } from "@/components/back-link";
import { NoteForm } from "@/components/note-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getContactWithNotes, parseContactId } from "@/lib/contacts";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Контакт — Личная CRM",
};

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <main className="flex flex-col gap-4">
      <BackLink />
      <Suspense fallback={<ContactSkeleton />}>
        <ContactDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ContactDetails({
  params,
}: Pick<PageProps<"/contacts/[id]">, "params">) {
  const { id } = await params;
  const contactId = parseContactId(id);
  if (!contactId) notFound();

  const contact = await getContactWithNotes(contactId);
  if (!contact) notFound();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            <h1>{contact.name}</h1>
          </CardTitle>
          {contact.about && (
            <p className="text-muted-foreground">{contact.about}</p>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-[10rem_1fr]">
            <DetailRow label="Откуда знакомы">
              {contact.howWeMet ? (
                <span className="whitespace-pre-line">{contact.howWeMet}</span>
              ) : null}
            </DetailRow>
            <DetailRow label="Телефон">
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                >
                  <Phone className="size-4 text-muted-foreground" />
                  {contact.phone}
                </a>
              ) : null}
            </DetailRow>
            <DetailRow label="Почта">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1.5 break-all underline-offset-4 hover:underline"
                >
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  {contact.email}
                </a>
              ) : null}
            </DetailRow>
            <DetailRow label="В списке с">
              {formatDate(contact.createdAt)}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4" aria-labelledby="notes-heading">
        <h2 id="notes-heading" className="text-lg font-semibold">
          Заметки
        </h2>

        <NoteForm action={addNoteAction.bind(null, contact.id)} />

        {contact.notes.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {contact.notes.map((note) => (
              <li key={note.id} className="rounded-xl border bg-background px-4 py-3 shadow-xs">
                <time
                  dateTime={note.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTime(note.createdAt)}
                </time>
                <p className="mt-1 whitespace-pre-line">{note.body}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">Заметок пока нет</p>
        )}
      </section>
    </>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-sm text-muted-foreground sm:pt-0.5">{label}</dt>
      <dd className="-mt-3 sm:mt-0">
        {children ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </>
  );
}

function ContactSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-56 animate-pulse rounded-xl border bg-background" />
      <p className="text-sm text-muted-foreground">Загружаю карточку…</p>
    </div>
  );
}
