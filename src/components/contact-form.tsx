"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createContactAction, type ContactFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactField } from "@/lib/validation";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    createContactAction,
    initialState,
  );

  // React resets the form after an action; submitted values come back
  // in the state so a validation error does not wipe what was typed
  const fieldProps = (field: ContactField) => ({
    id: field,
    name: field,
    defaultValue: state.values?.[field],
    "aria-invalid": state.errors?.[field] ? true : undefined,
    "aria-describedby": state.errors?.[field] ? `${field}-error` : undefined,
  });

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field label="Имя" field="name" error={state.errors?.name} required>
        <Input {...fieldProps("name")} autoComplete="off" autoFocus required />
      </Field>

      <Field
        label="Кто это"
        field="about"
        error={state.errors?.about}
        hint="Например: коллега, дизайнер, сосед по даче"
      >
        <Input {...fieldProps("about")} autoComplete="off" />
      </Field>

      <Field label="Откуда знакомы" field="howWeMet" error={state.errors?.howWeMet}>
        <Textarea {...fieldProps("howWeMet")} rows={2} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Телефон" field="phone" error={state.errors?.phone}>
          <Input {...fieldProps("phone")} type="tel" autoComplete="off" />
        </Field>
        <Field label="Почта" field="email" error={state.errors?.email}>
          <Input {...fieldProps("email")} type="email" autoComplete="off" />
        </Field>
      </div>

      <Field
        label="Заметка"
        field="note"
        error={state.errors?.note}
        hint="О чём договорились, что важно помнить"
      >
        <Textarea {...fieldProps("note")} rows={4} />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Сохраняю…" : "Сохранить"}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Отмена</Link>
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  field,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  field: ContactField;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${field}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
