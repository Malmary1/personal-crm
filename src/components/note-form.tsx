"use client";

import { useActionState } from "react";

import type { NoteFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: NoteFormState = {};

export function NoteForm({
  action,
}: {
  action: (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const error = state.errors?.body;

  return (
    <form action={formAction} className="flex flex-col gap-2" noValidate>
      <Label htmlFor="note-body">Новая заметка</Label>
      <Textarea
        id="note-body"
        name="body"
        rows={3}
        placeholder="О чём поговорили, о чём договорились"
        defaultValue={state.values?.body}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "note-body-error" : undefined}
        className="bg-background"
      />
      {error && (
        <p id="note-body-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Сохраняю…" : "Добавить заметку"}
      </Button>
    </form>
  );
}
