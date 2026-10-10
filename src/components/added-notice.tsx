"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function AddedNotice({ id, name }: { id: number; name: string }) {
  // After saving, the list may open scrolled down (the form page was);
  // bring the notice into view
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  return (
    <div
      role="status"
      className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex items-center gap-2">
        <CircleCheck className="size-4 shrink-0" />
        Контакт «{name}» добавлен
      </span>
      <span className="flex gap-4 font-medium">
        <a href={`#contact-${id}`} className="underline underline-offset-4">
          Показать в списке
        </a>
        <Link href={`/contacts/${id}`} className="underline underline-offset-4">
          Открыть карточку
        </Link>
      </span>
    </div>
  );
}
