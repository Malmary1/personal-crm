// Resolves the Postgres connection string from env.
// Uses DATABASE_URL when set, otherwise builds it from the same POSTGRES_* variables
// that docker-compose.yml uses, so .env does not have to repeat the password.
export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;
  const host = process.env.POSTGRES_HOST ?? "127.0.0.1";
  const port = process.env.POSTGRES_PORT ?? "5432";

  if (!user || !password || !database) {
    throw new Error(
      "Database settings are missing: set DATABASE_URL or POSTGRES_USER, POSTGRES_PASSWORD and POSTGRES_DB in .env",
    );
  }

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}
