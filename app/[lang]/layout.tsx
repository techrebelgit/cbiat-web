import type { Metadata } from "next";
import Link from "next/link";
import { MembershipApplicationModal } from "@/components/membership-application-modal";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const d = await getDictionary(lang);
  return {
    title: d.meta.title,
    description: d.meta.description,
    metadataBase: new URL("https://cbiat.org"),
    alternates: { canonical: `/${lang}`, languages: { es: "/es", en: "/en" } },
    openGraph: {
      title: d.meta.title,
      description: d.meta.description,
      type: "website",
      locale: lang === "es" ? "es_CR" : "en_US",
      siteName: "CBIAT",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang: rawLang } = await params;
  if (!isLocale(rawLang)) notFound();
  const lang: Locale = rawLang;
  const d = await getDictionary(lang);
  const altLang = lang === "es" ? "en" : "es";
  const altLabel = lang === "es" ? "EN" : "ES";

  return (
    <html lang={lang}>
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link className="brand" href={`/${lang}`} aria-label="CBIAT">
              <span className="brand-mark">C</span>
              <span><strong>CBIAT</strong><small>Costa Rica</small></span>
            </Link>
            <nav className="desktop-nav" aria-label="Primary">
              <Link href={`/${lang}#camara`}>{d.nav.about}</Link>
              <Link href={`/${lang}#trabajo`}>{d.nav.work}</Link>
              <Link href={`/${lang}#agenda`}>{d.nav.agenda}</Link>
              <Link href={`/${lang}#participacion`}>{d.nav.participation}</Link>
              <Link href={`/${lang}#conocimiento`}>{d.nav.knowledge}</Link>
            </nav>
            <div className="header-actions">
              <Link className="lang-link" href={`/${altLang}`}>{altLabel}</Link>
              <MembershipApplicationModal copy={d.application} locale={lang} triggerLabel={d.nav.join} triggerClassName="button button-dark button-small" />
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="shell footer-grid">
            <div><div className="footer-brand">CBIAT</div><p>{d.footer.tagline}</p></div>
            <div className="footer-meta">
              <div><span>{d.footer.contact}</span><a href={`mailto:${d.footer.email}`}>{d.footer.email}</a></div>
              <div><span>{d.footer.location}</span><a href="https://cbiat.org">cbiat.org</a></div>
              <div><span>{lang === "es" ? "Idioma" : "Language"}</span><Link href={`/${altLang}`}>{d.footer.language}</Link></div>
            </div>
          </div>
          <div className="shell footer-bottom">
            <span>© {new Date().getFullYear()} CBIAT</span>
            <span>Cámara Costarricense de Blockchain, IA y Tecnologías Emergentes</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
