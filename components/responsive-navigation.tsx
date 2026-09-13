"use client";

import Link from "next/link";
import { useRef } from "react";

type NavLabels = {
  about: string;
  work: string;
  agenda: string;
  participation: string;
  knowledge: string;
};

export function ResponsiveNavigation({
  lang,
  labels,
}: {
  lang: "es" | "en";
  labels: NavLabels;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details ref={detailsRef} className="mobile-nav">
      <summary aria-label={lang === "es" ? "Abrir navegación" : "Open navigation"}>
        <span className="menu-label">{lang === "es" ? "Menú" : "Menu"}</span>
        <span className="menu-icon" aria-hidden="true"><i></i><i></i></span>
      </summary>
      <nav className="mobile-nav-panel" aria-label={lang === "es" ? "Navegación móvil" : "Mobile navigation"}>
        <Link onClick={close} href={`/${lang}#camara`}>{labels.about}</Link>
        <Link onClick={close} href={`/${lang}#trabajo`}>{labels.work}</Link>
        <Link onClick={close} href={`/${lang}#agenda`}>{labels.agenda}</Link>
        <Link onClick={close} href={`/${lang}#participacion`}>{labels.participation}</Link>
        <Link onClick={close} href={`/${lang}#conocimiento`}>{labels.knowledge}</Link>
      </nav>
    </details>
  );
}
