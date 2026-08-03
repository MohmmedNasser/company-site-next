import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="mx-auto flex min-h-screen max-w-[1280px] flex-col items-center justify-center gap-16 px-24 text-center">
      <p className="text-primary text-14 font-mono">404</p>
      <h1 className="text-32 text-text-primary font-semibold">{t("title")}</h1>
      <p className="text-16 text-text-secondary max-w-[480px]">
        {t("description")}
      </p>
      <Link
        href="/"
        className="rounded-control border-border text-14 text-text-primary hover:bg-surface border px-16 py-8"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
