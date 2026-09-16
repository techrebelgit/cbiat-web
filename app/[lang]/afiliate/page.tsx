import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function LegacyMembershipPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${isLocale(lang) ? lang : "es"}/conecte`);
}
