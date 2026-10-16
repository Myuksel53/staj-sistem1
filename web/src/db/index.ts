import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// prepare:false: Supabase transaction pooler (port 6543) hazırlanmış sorguları desteklemez; session pooler'da da zararsız.
// Geliştirme modunda kod yenilenince bu dosya yeniden çalışır; her seferinde yeni istemci açılırsa bağlantılar birikir ve Supabase havuzu dolar
// (CONNECT_TIMEOUT). Bu yüzden istemci globalThis üzerinde tek kez oluşturulur. Boşta bağlantılar 20 sn sonra kapanır.
const g = globalThis as unknown as { __pgIstemci?: ReturnType<typeof postgres> };
const client = g.__pgIstemci ?? postgres(process.env.DATABASE_URL!, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 15 });
if (process.env.NODE_ENV !== "production") g.__pgIstemci = client;
export const db = drizzle(client, { schema });
