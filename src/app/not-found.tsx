import { BackLink } from "@/components/back-link";

export default function NotFound() {
  return (
    <main className="flex flex-col gap-4">
      <BackLink />
      <div className="rounded-xl border border-dashed bg-background px-4 py-12 text-center">
        <h1 className="text-lg font-semibold">Ничего не нашлось</h1>
        <p className="mt-1 text-muted-foreground">
          Такого контакта или страницы нет.
        </p>
      </div>
    </main>
  );
}
