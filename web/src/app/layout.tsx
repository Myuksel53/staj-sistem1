import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AltBilgi } from "@/layout/AltBilgi";
import { UstMenu } from "@/layout/UstMenu";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"], // Türkçe harfler (ş, ğ, İ, ı) latin-ext içindedir
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Çalışmanın Yolu", template: "%s · Çalışmanın Yolu" },
  description: "Bilgisayar ve elektronik mühendisliği öğrencileri için staj ve araştırma fırsatları: her bilgi kaynağı ve kontrol tarihiyle.",
  applicationName: "Çalışmanın Yolu",
  openGraph: { title: "Çalışmanın Yolu", description: "İlgi alanına uygun staj, araştırma programı, laboratuvar ve akademisyenleri kaynağıyla bul.", locale: "tr_TR", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_DEMO === "1" && (
          <div className="border-b border-line bg-sand px-4 py-1.5 text-center text-xs text-ink-mute">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-amber-300 align-middle" />
            Gösterim sürümü: <strong className="font-medium text-ink">DEMO</strong> etiketli kayıtlar örnektir; diğerleri kaynak bağlantılı gerçek kayıtlardır.
          </div>
        )}
        <a href="#icerik" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">İçeriğe geç</a>
        <UstMenu />
        <div id="icerik" className="flex flex-1 flex-col">{children}</div>
        <AltBilgi />
      </body>
    </html>
  );
}
