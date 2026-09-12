# CBIAT Web

Institutional website for the **Cámara Costarricense de Blockchain, Inteligencia Artificial y Tecnologías Emergentes (CBIAT)**.

## Direction

The first version takes inspiration from the information architecture and editorial clarity of DIGITALEUROPE while using CBIAT's existing navy/gold institutional identity. The site is intentionally designed to feel like a technology policy and industry institution rather than a crypto startup.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Native CSS design system
- Spanish + English locale architecture (`/es`, `/en`)

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The root route redirects to `/es`.

## Internationalization

Content lives in:

- `messages/es.json`
- `messages/en.json`

Spanish is the primary launch language. English is implemented from day one so content can evolve in parallel.

## Brand assets

The current header uses a temporary geometric CBIAT mark. Replace it with the official logo asset when received.


## Membership application email

The membership form at `/[lang]/afiliate` sends applications server-side using the Resend HTTP API.

Copy `.env.example` to `.env.local` for local development and configure these environment variables in the deployment platform:

- `RESEND_API_KEY` — Resend API key.
- `CBIAT_FORM_FROM_EMAIL` — verified sender, for example `CBIAT <formularios@cbiat.org>`.
- `CBIAT_FORM_TO_EMAIL` — optional destination; defaults to `info@cbiat.org`.

The form uses server-side validation plus a honeypot field for basic spam mitigation. No provider credentials are exposed to the browser.
