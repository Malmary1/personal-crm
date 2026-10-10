import type { Metadata } from "next";

import { BackLink } from "@/components/back-link";
import { ContactForm } from "@/components/contact-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Новый контакт — Личная CRM",
};

export default function NewContactPage() {
  return (
    <main className="flex flex-col gap-4">
      <BackLink />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>Новый контакт</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm />
        </CardContent>
      </Card>
    </main>
  );
}
