"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="rounded-xl border border-dashed bg-background px-4 py-12 text-center">
      <h1 className="text-lg font-semibold">Что-то пошло не так</h1>
      <p className="mt-1 text-muted-foreground">
        Не получилось загрузить или сохранить данные. Проверьте, что база
        данных запущена, и попробуйте ещё раз.
      </p>
      <Button className="mt-4" onClick={() => retry()}>
        Попробовать снова
      </Button>
    </main>
  );
}
