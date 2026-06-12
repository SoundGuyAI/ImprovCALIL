import { useTranslations } from "next-intl";
import AppVersion from "./AppVersion";

export default function Footer() {
  const t = useTranslations("Common");

  return (
    <footer className="w-full border-t border-zinc-900/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500 font-semibold flex flex-col items-center gap-2">
      <p className="max-w-7xl mx-auto px-4">{t("footer")}</p>
      <AppVersion />
    </footer>
  );
}
