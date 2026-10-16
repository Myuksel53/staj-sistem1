type Props = React.ComponentPropsWithoutRef<"div"> & { as?: "div" | "li" | "section" | "article" };

/** Camsı yüzey (stili globals.css'teki `.cam`). Etiketi `as` ile değişir: liste öğesi, bölüm vb. */
export function Card({ as: Etiket = "div", className = "", ...kalan }: Props) {
  return <Etiket className={`kart p-5 ${className}`} {...(kalan as object)} />;
}
