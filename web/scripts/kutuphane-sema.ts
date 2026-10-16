import { z } from "zod";

export const KutuphaneKaydi = z.object({
  beceri: z.string().min(1).transform((s) => s.trim().toLowerCase()), // normalizeKosul'daki "beceri:x" ile aynı yazılmalı
  baslik: z.string().min(3),
  url: z.string().url().refine((u) => u.startsWith("https://"), "https olmalı"),
  tur: z.enum(["kurs", "dokuman", "mini_proje"]),
  sureSaat: z.number().int().positive().optional(),
});
export const Kutuphane = z.object({ kaynaklar: z.array(KutuphaneKaydi) });
