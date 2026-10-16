import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  // db istemcisi import edilince bağlanmaz; sahte URL yalnızca import'u sağlar.
  test: { env: { DATABASE_URL: "postgres://test:test@localhost:5432/test" } },
});
