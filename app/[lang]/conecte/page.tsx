import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConnectionForm } from "@/components/connection-form";
import { getDictionary, isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = await getDictionary(lang);
  return {
    title: d.application.metaTitle,
    description: d.application.metaDescription,
    alternates: {
      canonical: `/${lang}/conecte`,
      languages: { es: "/es/conecte", en: "/en/conecte" },
    },
  };
}

export default async function ConnectionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = await getDictionary(lang);
  const a = d.application;

  return (
    <main>
      <section className="application-hero">
        <div className="shell application-hero-grid">
          <div>
            <p className="eyebrow">{a.kicker}</p>
            <h1>{a.title}</h1>
          </div>
          <div>
            <p>{a.intro}</p>
            <div className="application-note">
              <strong>{a.noteTitle}</strong>
              <span>{a.noteBody}</span>
            </div>
            <p className="application-disclaimer">{a.disclaimer}</p>
          </div>
        </div>
      </section>

      <section className="application-section">
        <div className="shell application-layout">
          <aside>
            <p className="kicker">{a.asideKicker}</p>
            <h2>{a.asideTitle}</h2>
            <ol>
              {a.steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </aside>
          <div>
            <ConnectionForm copy={a} locale={lang} />
          </div>
        </div>
      </section>
    </main>
  );
}
