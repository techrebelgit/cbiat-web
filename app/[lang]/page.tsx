import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = await getDictionary(lang);

  return (
    <main>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">{d.hero.eyebrow}</p>
            <h1>{d.hero.title}</h1>
            <p className="hero-body">{d.hero.body}</p>
            <div className="hero-actions">
              <a className="button button-gold" href="#camara">{d.hero.primary}</a>
              <a className="text-link" href="#afiliate">{d.hero.secondary} ↗</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />
            <div className="visual-center"><strong>CBIAT</strong><small>Costa Rica</small></div>
            {d.hero.stakeholders.map((s, i) => <span className={`stakeholder s${i + 1}`} key={s}>{String(i + 1).padStart(2, "0")} · {s}</span>)}
          </div>
        </div>
        <div className="shell hero-rule"><span>Tecnología</span><span>Talento</span><span>Confianza</span><span>Desarrollo</span></div>
      </section>

      <section className="statement" id="camara">
        <div className="shell split">
          <p className="kicker">{d.statement.kicker}</p>
          <p className="statement-text">{d.statement.text}</p>
        </div>
      </section>

      <section className="work" id="trabajo">
        <div className="shell split section-head">
          <p className="kicker">{d.work.kicker}</p>
          <div><h2>{d.work.title}</h2><p className="intro">{d.work.intro}</p></div>
        </div>
        <div className="shell cards">
          {d.work.items.map((item) => (
            <article key={item.number}>
              <span className="number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="agenda" id="agenda">
        <div className="shell agenda-head"><p className="kicker light">{d.agenda.kicker}</p><h2>{d.agenda.title}</h2></div>
        <div className="shell agenda-list">
          {d.agenda.items.map((item, i) => (
            <article key={item.title}>
              <span>{String(i + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p><b>+</b>
            </article>
          ))}
        </div>
      </section>

      <section className="principles">
        <div className="shell split section-head">
          <div><p className="kicker">{d.purpose.kicker}</p><h2>{d.purpose.title}</h2></div>
          <p className="intro">{d.purpose.body}</p>
        </div>
        <div className="shell principles-grid">
          {d.purpose.principles.map((item, i) => (
            <article key={item.title}><span>{String(i + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p></article>
          ))}
        </div>
      </section>

      <section className="participation" id="participacion">
        <div className="shell participation-grid">
          <div><p className="kicker">{d.participation.kicker}</p><h2>{d.participation.title}</h2><p className="intro dark">{d.participation.intro}</p></div>
          <ol>{d.participation.items.map((item, i) => <li key={item}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item}</strong></li>)}</ol>
        </div>
      </section>

      <section className="knowledge" id="conocimiento">
        <div className="shell knowledge-grid">
          <div><p className="kicker">{d.knowledge.kicker}</p><h2>{d.knowledge.title}</h2></div>
          <div className="knowledge-panel">
            <p>{d.knowledge.body}</p>
            {d.knowledge.formats.map((item, i) => <div className="format" key={item}><span>{String(i + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
            <em>{d.knowledge.status}</em>
          </div>
        </div>
      </section>

      <section className="membership" id="afiliate">
        <div className="shell membership-head"><p className="kicker">{d.membership.kicker}</p><h2>{d.membership.title}</h2><p className="intro">{d.membership.body}</p></div>
        <div className="shell membership-grid">
          {d.membership.pillars.map((item, i) => <article key={item.title}><span>{String(i + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}
        </div>
        <div className="shell membership-cta"><a className="button button-dark" href="mailto:info@cbiat.org">{d.membership.cta}</a></div>
      </section>
    </main>
  );
}
