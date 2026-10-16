import { describe, expect, it } from "vitest";
import { alanKonulari, cvGozlemleri, eksikBeceriOnerileri } from "./cv-oneri";

const kut = (beceri: string) => ({ beceri, baslik: `${beceri} kursu`, url: `https://x/${beceri}`, tur: "kurs", sureSaat: null });
const ilanlar = [
  { baslik: "Yapay Zekâ Stajyeri", aciklama: "Python ve PyTorch bilgisi zorunludur. Docker tercih edilir." },
  { baslik: "Görüntü İşleme", aciklama: "Python, OpenCV ve PyTorch kullanılır." },
  { baslik: "Gömülü", aciklama: "C ve RTOS bilgisi gerekir." },
];

describe("eksikBeceriOnerileri", () => {
  const o = eksikBeceriOnerileri(["python"], ilanlar, [kut("pytorch"), kut("docker")]);
  it("CV'de olmayan becerileri, geçtiği ilan sayısına göre sıralar", () => {
    expect(o[0]).toMatchObject({ beceri: "pytorch", ilanSayisi: 2 });
    expect(o.map((x) => x.beceri)).not.toContain("python");
  });
  it("kütüphanedeki kaynağı bağlar, olmayana kaynak uydurmaz", () => {
    expect(o.find((x) => x.beceri === "pytorch")!.kaynaklar).toHaveLength(1);
    expect(o.find((x) => x.beceri === "opencv")!.kaynaklar).toEqual([]);
  });
  it("alan adlarını (görüntü işleme, machine learning…) eksik beceri olarak önermez", () => {
    const x = eksikBeceriOnerileri([], [{ baslik: "Görüntü İşleme", aciklama: "Machine learning ve OpenCV kullanılır, gömülü sistemler üzerinde." }], []);
    expect(x.map((e) => e.beceri)).toEqual(["opencv"]);
  });
  it("sınırı uygular ve boş girdide hata vermez", () => {
    expect(eksikBeceriOnerileri([], ilanlar, [], 2)).toHaveLength(2);
    expect(eksikBeceriOnerileri([], [], [])).toEqual([]);
  });
});

describe("alanKonulari", () => {
  it("laboratuvar konularını sıklığa göre sayar, büyük/küçük harfi birleştirir", () => {
    const k = alanKonulari([{ konular: ["Robotik", "görüntü işleme"] }, { konular: ["robotik"] }, { konular: ["Robotik", "Robotik"] }]);
    expect(k[0]).toEqual({ konu: "robotik", sayi: 3 });
  });
});

describe("cvGozlemleri", () => {
  const iyiCv = `${"Staj deneyimi ve eğitim bilgileri. ".repeat(30)} github.com/ayse proje proje ve %92 doğruluk elde ettim`;
  it("iyi bir CV'de eksik gözlem çıkmaz", () => expect(cvGozlemleri(iyiCv, 8).filter((g) => !g.iyi)).toEqual([]));
  it("bağlantı, proje, sayı, beceri ve uzunluk eksiklerini yakalar", () => {
    const g = cvGozlemleri("Kısa bir metin", 1).map((x) => x.metin).join(" | ");
    expect(g).toMatch(/GitHub/);
    expect(g).toMatch(/Projelerini/);
    expect(g).toMatch(/sayıyla/);
    expect(g).toMatch(/Teknik becerileri/);
  });
  it("en fazla 5 gözlem döner", () => expect(cvGozlemleri("x", 0).length).toBeLessThanOrEqual(5));
});
