import { describe, expect, it } from "vitest";
import { cvBecerileri, cvTemizle } from "./cv";

describe("cvBecerileri", () => {
  it("yaygın becerileri bulur", () => {
    const b = cvBecerileri("Python ve PyTorch ile görüntü işleme projesi; Git, Docker kullandım. STM32 üzerinde C yazdım.");
    expect(b).toEqual(expect.arrayContaining(["python", "pytorch", "görüntü işleme", "git", "docker", "stm32", "c"]));
  });
  it("javascript içindeki java'yı ayrı beceri saymaz", () => {
    const b = cvBecerileri("JavaScript ve React ile arayüz");
    expect(b).toContain("javascript");
    expect(b).not.toContain("java");
  });
  it("C++ için c sayılmaz, c++ sayılır", () => {
    const b = cvBecerileri("C++ ile algoritmalar");
    expect(b).toContain("c++");
    expect(b).not.toContain("c");
  });
  it("sıradan kelimelerin içindeki harfleri beceri sanmaz", () => {
    expect(cvBecerileri("Cisco değil, sadece bir cümle: çalışkan ve takım oyuncusu")).not.toContain("c");
  });
  it("program kodundaki harfi (2247-C) dil sanmaz", () => expect(cvBecerileri("TÜBİTAK 2247-C Stajyer Araştırmacı Burs Programı")).not.toContain("c"));
  it("beceri yoksa boş döner", () => expect(cvBecerileri("Merhaba dünya")).toEqual([]));
});

describe("cvTemizle", () => {
  it("e-posta, telefon ve bağlantıyı çıkarır", () => {
    const t = cvTemizle("Ad Soyad ad@gmail.com +90 532 123 45 67 https://github.com/ad Python projesi");
    expect(t).not.toMatch(/@|532|github/);
    expect(t).toContain("Python projesi");
  });
  it("sınırı uygular", () => expect(cvTemizle("a ".repeat(2000)).length).toBeLessThanOrEqual(1200));
});
