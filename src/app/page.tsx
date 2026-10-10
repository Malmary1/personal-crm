import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { AddedNotice } from "@/components/added-notice";
import { SearchBox, SearchBoxFallback } from "@/components/search-box";
import { Button } from "@/components/ui/button";
import {
  countContacts,
  getContactName,
  listContacts,
  parseContactId,
  type ContactListItem,
} from "@/lib/contacts";
import { pluralizeRu } from "@/lib/format";
import { cn } from "@/lib/utils";

const CONTACT_FORMS = ["контакт", "контакта", "контактов"] as const;

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Контакты</h1>
        <Button asChild>
          <Link href="/contacts/new">
            <Plus />
            Добавить контакт
          </Link>
        </Button>
      </div>

      <Suspense fallback={<SearchBoxFallback />}>
        <SearchBox />
      </Suspense>

      <Suspense fallback={<ContactListSkeleton />}>
        <ContactList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

async function ContactList({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const addedId = parseContactId(firstParam(params.added));

  const [contacts, total, addedName] = await Promise.all([
    listContacts(query),
    countContacts(),
    addedId ? getContactName(addedId) : null,
  ]);

  return (
    <>
      {addedId && addedName !== null && (
        <AddedNotice id={addedId} name={addedName} />
      )}

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {query
          ? `Найдено: ${contacts.length} из ${total}`
          : `${total} ${pluralizeRu(total, CONTACT_FORMS)}`}
      </p>

      {contacts.length > 0 ? (
        <ul className="divide-y overflow-hidden rounded-xl border bg-background shadow-xs">
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              highlighted={contact.id === addedId}
            />
          ))}
        </ul>
      ) : (
        <EmptyState query={query} />
      )}
    </>
  );
}

function ContactRow({
  contact,
  highlighted,
}: {
  contact: ContactListItem;
  highlighted: boolean;
}) {
  return (
    <li id={`contact-${contact.id}`} className="scroll-mt-4">
      <Link
        href={`/contacts/${contact.id}`}
        className={cn(
          "flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:gap-4",
          highlighted && "bg-emerald-50 hover:bg-emerald-100",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{contact.name}</div>
          {contact.about && (
            <div className="truncate text-sm text-muted-foreground">
              {contact.about}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-col text-sm text-muted-foreground sm:w-60 sm:items-end">
          {contact.phone && <span className="truncate">{contact.phone}</span>}
          {contact.email && <span className="truncate">{contact.email}</span>}
        </div>
      </Link>
    </li>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-background px-4 py-12 text-center">
      <p className="text-muted-foreground">
        {query
          ? `Никого не нашли по запросу «${query}»`
          : "Пока нет ни одного контакта"}
      </p>
      <Button asChild variant="outline">
        <Link href="/contacts/new">
          <Plus />
          Добавить контакт
        </Link>
      </Button>
    </div>
  );
}

function ContactListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <p className="text-sm text-muted-foreground">Загружаю контакты…</p>
      <div className="h-96 animate-pulse rounded-xl border bg-background" />
    </div>
  );
}
