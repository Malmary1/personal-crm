// Picks the Russian plural form: [1 контакт, 2 контакта, 5 контактов]
export function pluralizeRu(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const lastTwo = Math.abs(count) % 100;
  const last = lastTwo % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}
