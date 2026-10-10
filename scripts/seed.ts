// Fills an empty database with realistic test contacts and notes.
// Never deletes anything: if contacts already exist, it stops.
//
// Usage: pnpm db:seed

import { fakerRU as faker } from "@faker-js/faker";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "../src/db/database-url";
import { contacts, notes, type NewContact } from "../src/db/schema";

config({ quiet: true });

const CONTACT_COUNT = 1000;
const BATCH_SIZE = 200;

type Sex = "male" | "female";
// A phrase either fits both sexes or comes as [male, female]
type Gendered = string | readonly [male: string, female: string];

const ABOUT: Gendered[] = [
  "Коллега по прошлой работе",
  "Дизайнер интерфейсов",
  "Бухгалтер",
  ["Сосед по даче", "Соседка по даче"],
  ["Друг детства", "Подруга детства"],
  "Тренер в спортзале",
  "Стоматолог",
  ["Однокурсник", "Однокурсница"],
  "Юрист",
  "Продакт-менеджер",
  "Фотограф",
  "Риелтор",
  "Репетитор английского",
  "Врач-терапевт",
  "Мастер по ремонту квартир",
  "Бывший руководитель",
  "Организатор митапов",
  "Преподаватель в университете",
  "Программист",
  "Маркетолог",
  ["Владелец кофейни", "Владелица кофейни"],
  "Автомеханик",
  "Психолог",
  ["Сосед по подъезду", "Соседка по подъезду"],
  "Ветеринар",
  "Финансовый консультант",
  ["Переводчик", "Переводчица"],
  "Инструктор по вождению",
  "Музыкант",
  "Шеф-повар",
  "Флорист",
  "Нотариус",
  ["Предприниматель", "Предпринимательница"],
  "Аналитик данных",
  "Тренер по теннису",
  "Иллюстратор",
  "Арт-директор",
  "HR в IT-компании",
  "Архитектор",
  "Журналист",
  ["Друг брата", "Подруга брата"],
  ["Знакомый по йоге", "Знакомая по йоге"],
  "Инвестор",
  "Сооснователь стартапа",
];

const CITIES = [
  "в Москве",
  "в Санкт-Петербурге",
  "в Казани",
  "в Екатеринбурге",
  "в Новосибирске",
  "в Нижнем Новгороде",
  "в Сочи",
  "в Калининграде",
  "в Ереване",
  "в Тбилиси",
];

const HOW_WE_MET: Array<(city: string) => string> = [
  () => "Работали вместе в прошлой компании",
  (city) => `Познакомились на конференции ${city}`,
  () => "Учились в одной школе",
  () => "Учились вместе в университете",
  () => "Познакомил общий друг на дне рождения",
  () => "Соседи по даче в Подмосковье",
  () => "Встретились в походе на Алтай",
  () => "Ходили на одни курсы английского",
  () => "Познакомились на свадьбе у друзей",
  () => "Были в одной команде на хакатоне",
  (city) => `Летели рядом в самолёте, оказалось, оба живём ${city}`,
  () => "Порекомендовали знакомые, когда искали специалиста",
  () => "Вместе ходим в спортзал",
  () => "Познакомились в чате жильцов дома",
  (city) => `Снимали соседние квартиры ${city}`,
  () => "Пересеклись на митапе по продуктовому дизайну",
  () => "Работали над общим проектом как подрядчики",
  () => "Познакомились в очереди на концерт",
  (city) => `Ходили в одну волонтёрскую группу ${city}`,
  () => "Дети ходят в один кружок",
];

const NOTES: Gendered[] = [
  "Встретились на кофе, поговорили о работе и планах на лето.",
  ["Обещал прислать контакты хорошего юриста.", "Обещала прислать контакты хорошего юриста."],
  "Договорились созвониться после праздников.",
  "Поздравили с днём рождения. Любит красное вино и джаз.",
  ["Переехал в новую квартиру, звал на новоселье.", "Переехала в новую квартиру, звала на новоселье."],
  "Обсудили совместный проект — нужно подготовить смету до конца месяца.",
  "Ищет дизайнера в команду — можно порекомендовать знакомых.",
  [
    "Был в отпуске в Грузии, советует съездить в Кахетию осенью.",
    "Была в отпуске в Грузии, советует съездить в Кахетию осенью.",
  ],
  "Договорились встретиться в субботу в парке.",
  "Нужен совет по выбору ноутбука — отправить подборку ссылок.",
  "Напомнить про встречу выпускников в июне.",
  ["Сменил работу, теперь в финтехе.", "Сменила работу, теперь в финтехе."],
  "Занимается бегом, готовится к марафону.",
  "Обсудили идею подкаста, договорились сделать пилотный выпуск.",
  "Созвонились по видео, поговорили минут сорок. Всё хорошо, передаёт привет.",
  "Договорились: присылает материалы до пятницы, обратная связь — в понедельник.",
  "Скинуть ссылку на курс по фотографии.",
  "Отметили день рождения в грузинском ресторане.",
  "Ждёт ответа по поводу рекомендации — не забыть написать.",
  "Встретились случайно в метро, договорились пообедать на следующей неделе.",
  ["Помог с переездом — с меня ужин.", "Помогла с переездом — с меня ужин."],
  "Поговорили про ипотеку: советует не торопиться и сравнить предложения банков.",
  ["Открыл свою кофейню на Покровке — надо зайти.", "Открыла свою кофейню на Покровке — надо зайти."],
  "Переписывались про летний отпуск, зовёт в поход на байдарках.",
  [
    "Взял почитать «Мастера и Маргариту» — вернёт при встрече.",
    "Взяла почитать «Мастера и Маргариту» — вернёт при встрече.",
  ],
  ["Поделился номером хорошего стоматолога.", "Поделилась номером хорошего стоматолога."],
  "Договорились вместе пойти на выставку в Пушкинском музее.",
  ["Попросил помочь с резюме — посмотреть до среды.", "Попросила помочь с резюме — посмотреть до среды."],
  "Обсудили, как дела у родителей. Мама после операции, всё хорошо.",
  "Скоро свадьба, придёт приглашение.",
];

const EMAIL_DOMAINS = ["gmail.com", "yandex.ru", "mail.ru", "outlook.com", "icloud.com"];

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y",
  ь: "", э: "e", ю: "yu", я: "ya",
};

function translit(value: string): string {
  return [...value.toLowerCase()].map((char) => TRANSLIT[char] ?? char).join("");
}

function pickGendered(phrases: readonly Gendered[], sex: Sex): string {
  const phrase = faker.helpers.arrayElement(phrases);
  if (typeof phrase === "string") return phrase;
  return sex === "male" ? phrase[0] : phrase[1];
}

function makePhone(): string {
  const digits = faker.string.numeric(9);
  return `+7 9${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7)}`;
}

function makeEmail(firstName: string, lastName: string): string {
  const first = translit(firstName);
  const last = translit(lastName);
  const local = faker.helpers.arrayElement([
    `${first}.${last}`,
    `${first[0]}.${last}`,
    `${last}.${first}`,
    `${first}${faker.number.int({ min: 1, max: 99 })}`,
    `${first}_${last}${faker.number.int({ min: 70, max: 99 })}`,
  ]);
  return `${local}@${faker.helpers.arrayElement(EMAIL_DOMAINS)}`;
}

type SeedContact = { contact: NewContact; noteTexts: string[] };

function makeContact(): SeedContact {
  const sex: Sex = faker.helpers.arrayElement(["male", "female"]);
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);
  const city = faker.helpers.arrayElement(CITIES);

  const createdAt = faker.date.past({ years: 3 });
  const noteCount = faker.helpers.weightedArrayElement([
    { weight: 2, value: 0 },
    { weight: 3, value: 1 },
    { weight: 3, value: 2 },
    { weight: 2, value: 3 },
    { weight: 1, value: 5 },
  ]);

  return {
    contact: {
      name: `${firstName} ${lastName}`,
      about: faker.datatype.boolean(0.9) ? pickGendered(ABOUT, sex) : null,
      howWeMet: faker.datatype.boolean(0.8)
        ? faker.helpers.arrayElement(HOW_WE_MET)(city)
        : null,
      phone: faker.datatype.boolean(0.85) ? makePhone() : null,
      email: faker.datatype.boolean(0.7) ? makeEmail(firstName, lastName) : null,
      createdAt,
    },
    noteTexts: Array.from({ length: noteCount }, () => pickGendered(NOTES, sex)),
  };
}

async function main() {
  const client = postgres(getDatabaseUrl(), { max: 1 });
  const db = drizzle({ client });

  try {
    const existing = await db.$count(contacts);
    if (existing > 0) {
      console.log(
        `Database already has ${existing} contacts; seed skipped. It only runs on an empty database.`,
      );
      return;
    }

    faker.seed(2026);
    const seedContacts = Array.from({ length: CONTACT_COUNT }, makeContact);

    await db.transaction(async (tx) => {
      for (let start = 0; start < seedContacts.length; start += BATCH_SIZE) {
        const batch = seedContacts.slice(start, start + BATCH_SIZE);
        const inserted = await tx
          .insert(contacts)
          .values(batch.map((item) => item.contact))
          .returning({ id: contacts.id, createdAt: contacts.createdAt });

        const noteRows = batch.flatMap((item, index) => {
          const { id, createdAt } = inserted[index];
          return item.noteTexts.map((body) => ({
            contactId: id,
            body,
            createdAt: faker.date.between({ from: createdAt, to: new Date() }),
          }));
        });

        if (noteRows.length > 0) {
          await tx.insert(notes).values(noteRows);
        }
      }
    });

    const [contactCount, noteCount] = await Promise.all([
      db.$count(contacts),
      db.$count(notes),
    ]);
    console.log(`Seeded ${contactCount} contacts and ${noteCount} notes.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
