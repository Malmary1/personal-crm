"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

import { Input } from "@/components/ui/input";

const SEARCH_DELAY_MS = 250;

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isPending, startTransition] = useTransition();

  // Keep the field in sync when the URL changes from outside (a link, Back button),
  // but never overwrite what the user is typing right now
  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement !== input) {
      input.value = urlQuery;
    }
  }, [urlQuery]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function search(value: string) {
    clearTimeout(timerRef.current);
    const query = value.trim();
    startTransition(() => {
      router.replace(query ? `/?q=${encodeURIComponent(query)}` : "/", {
        scroll: false,
      });
    });
  }

  return (
    <form
      role="search"
      action="/"
      onSubmit={(event) => {
        event.preventDefault();
        search(inputRef.current?.value ?? "");
      }}
    >
      <label htmlFor="contact-search" className="sr-only">
        Поиск по имени
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="contact-search"
          name="q"
          type="search"
          defaultValue={urlQuery}
          placeholder="Найти по имени"
          autoComplete="off"
          className="h-11 bg-background pl-9 text-base"
          onChange={(event) => {
            const value = event.target.value;
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => search(value), SEARCH_DELAY_MS);
          }}
        />
        {isPending && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
            Ищу…
          </span>
        )}
      </div>
    </form>
  );
}

export function SearchBoxFallback() {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        disabled
        placeholder="Найти по имени"
        className="h-11 bg-background pl-9 text-base"
      />
    </div>
  );
}
