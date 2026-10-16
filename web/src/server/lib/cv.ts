/** CV metninden beceri çıkarma. Saf fonksiyonlar: sunucuya hiçbir şey yazmaz, ağa çıkmaz. */

type Giris = { ad: string; takma: string[]; duyarli?: boolean };

// ad: kaynak_kutuphanesi.beceri ile aynı küçük harfli ad. duyarli: büyük/küçük harfe bakılır (tek harfli adlar için).
const SOZLUK: Giris[] = [
  { ad: "python", takma: ["python"] },
  { ad: "c", takma: ["C"], duyarli: true },
  { ad: "c++", takma: ["c++", "cpp"] },
  { ad: "c#", takma: ["c#", "csharp"] },
  { ad: "java", takma: ["java"] },
  { ad: "javascript", takma: ["javascript", "js"] },
  { ad: "typescript", takma: ["typescript"] },
  { ad: "react", takma: ["react", "react.js", "reactjs"] },
  { ad: "node.js", takma: ["node.js", "nodejs", "node"] },
  { ad: "kotlin", takma: ["kotlin"] },
  { ad: "swift", takma: ["swift"] },
  { ad: "flutter", takma: ["flutter"] },
  { ad: "android", takma: ["android"] },
  { ad: "php", takma: ["php"] },
  { ad: "sql", takma: ["sql", "mysql", "postgresql", "postgres", "sqlite"] },
  { ad: "mongodb", takma: ["mongodb"] },
  { ad: "git", takma: ["git", "github", "gitlab"] },
  { ad: "linux", takma: ["linux", "ubuntu"] },
  { ad: "docker", takma: ["docker"] },
  { ad: "kubernetes", takma: ["kubernetes", "k8s"] },
  { ad: "aws", takma: ["aws", "amazon web services"] },
  { ad: "azure", takma: ["azure"] },
  { ad: "pytorch", takma: ["pytorch"] },
  { ad: "tensorflow", takma: ["tensorflow", "keras"] },
  { ad: "scikit-learn", takma: ["scikit-learn", "sklearn"] },
  { ad: "machine learning", takma: ["machine learning", "makine öğrenmesi", "makine öğrenimi", "deep learning", "derin öğrenme"] },
  { ad: "opencv", takma: ["opencv"] },
  { ad: "görüntü işleme", takma: ["görüntü işleme", "computer vision", "image processing", "bilgisayarlı görü"] },
  { ad: "nlp", takma: ["nlp", "doğal dil işleme", "natural language processing"] },
  { ad: "numpy", takma: ["numpy"] },
  { ad: "pandas", takma: ["pandas"] },
  { ad: "matlab", takma: ["matlab", "simulink"] },
  { ad: "verilog", takma: ["verilog", "systemverilog"] },
  { ad: "vhdl", takma: ["vhdl"] },
  { ad: "fpga", takma: ["fpga"] },
  { ad: "arduino", takma: ["arduino"] },
  { ad: "stm32", takma: ["stm32"] },
  { ad: "esp32", takma: ["esp32"] },
  { ad: "raspberry pi", takma: ["raspberry pi"] },
  { ad: "rtos", takma: ["rtos", "freertos"] },
  { ad: "gömülü sistemler", takma: ["gömülü sistem", "gömülü yazılım", "embedded"] },
  { ad: "ros", takma: ["ros", "ros2", "ros 2"], duyarli: true },
  { ad: "pcb", takma: ["pcb", "altium", "kicad", "eagle"] },
  { ad: "devre tasarımı", takma: ["devre tasarımı", "analog devre", "sayısal devre", "circuit design"] },
  { ad: "plc", takma: ["plc", "scada"] },
  { ad: "labview", takma: ["labview"] },
  { ad: "ağ", takma: ["tcp/ip", "ağ güvenliği", "bilgisayar ağları", "cisco", "ccna", "networking"] },
  { ad: "siber güvenlik", takma: ["siber güvenlik", "cyber security", "cybersecurity", "sızma testi", "penetration testing", "wireshark", "kali linux"] },
  { ad: "rest api", takma: ["rest api", "restful", "api geliştirme"] },
  { ad: "django", takma: ["django"] },
  { ad: "flask", takma: ["flask"] },
  { ad: "fastapi", takma: ["fastapi"] },
  { ad: "spring", takma: ["spring boot", "spring"] },
  { ad: "iot", takma: ["iot", "nesnelerin interneti"] },
  { ad: "5g", takma: ["5g", "haberleşme sistemleri", "sinyal işleme", "dsp"] },
  { ad: "veri analizi", takma: ["veri analizi", "data analysis", "power bi", "tableau", "excel"] },
  { ad: "robotik", takma: ["robotik", "robotics", "slam"] },
];

const kacis = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const HARF = "\\p{L}\\p{N}";

function eslesir(metin: string, g: Giris): boolean {
  return g.takma.some((t) => {
    // Önünde/arkasında harf-rakam (ya da c++/c# için +,#) olmasın: "javascript" içindeki "java" ya da "Cisco" içindeki "c" sayılmasın.
    const re = new RegExp(`(?<![${HARF}+#.\\-])${kacis(t)}(?![${HARF}]|\\+|#)`, g.duyarli ? "u" : "iu");
    return re.test(metin);
  });
}

export function cvBecerileri(metin: string): string[] {
  return SOZLUK.filter((g) => eslesir(metin, g)).map((g) => g.ad);
}

/** Eşleştirmeye gidecek metinden kişisel veriyi çıkarır (e-posta, telefon, bağlantı), boşlukları sadeleştirir. */
export function cvTemizle(metin: string, sinir = 1200): string {
  return metin
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, " ")
    .replace(/https?:\/\/\S+|www\.\S+/gi, " ")
    .replace(/(\+?\d[\d\s().-]{8,}\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, sinir);
}
