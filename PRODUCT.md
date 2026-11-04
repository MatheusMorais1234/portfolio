# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: tech leads and developers who decide whether Matheus joins their team. They arrive from a job application, LinkedIn or GitHub, open the site on a work computer, and want to know quickly whether he can really ship software and whether the code holds up.

Secondary: recruiters, who need to find role, availability, location and the CV within seconds.

## Product Purpose

Personal portfolio of Matheus Morais, a junior full-stack developer in Goiânia looking for a junior developer position. Success means a tech lead opens a live project or the code, and then makes contact or downloads the CV.

## Positioning

A junior who already put real systems in production: internal systems used by more than 100 employees, an app for about 9 thousand members, payment integrations with Sicoob and Itaú, and six projects that are live now. He wants to grow on a team that reviews code. Seniority must stay honest: junior, never presented as senior.

## Operating Context

Static site on Hostinger, in Portuguese and English (`?lang=en`), with a CV download in each language. Visitors compare it with other candidates and often spend under a minute before deciding to go deeper.

## Capabilities and Constraints

- Plain static HTML, CSS and JS, with no build step required beyond `_ferramentas/gerar-estatico.mjs`.
- Content comes from `assets/js/data.js` and `assets/js/i18n.js`; both languages must keep working.
- `/servicos/` (separate client-facing brand) and `/ferramentas/` (working payment tools) are separate surfaces.
- The contact form, the CV links and the live GitHub commit dates must keep working.
- `prefers-reduced-motion` must be respected, and pages must remain usable on mobile connections.

## Brand Commitments

- Dark theme, chosen by the user as the look of a junior developer.
- The previous banking and boleto identity is retired as a visual identity. The tools stay as work.
- Video is a leading part of the experience, chosen by the user.

## Evidence on Hand

- Projects with real screenshots in `assets/img/projetos/`: Shopilot, StudioSports, FreelaManager, Bella Napoli, VitaGesta, HipocratIA.
- Internal systems from ASSEGO have no public link and no shareable screenshots.
- Working tools: Pix, boleto and CNAB in `/ferramentas/`.
- Certificates in `assets/img/certificados/`.
- Portrait in `assets/img/matheus.jpeg`, a casual selfie that the user may replace.
- FreelaManager has 95 tests running in CI.
- Absent, never to be fabricated: testimonials, metrics for internal systems (boletos per month, hours saved, number of contracts), client logos, employer endorsements.

## Product Principles

1. Prove it, don't claim it: a live project and readable code beat any adjective.
2. Honest about level: state what is solid, what is daily use and what is beginner.
3. Impact must never hide the facts: role, availability and contact stay reachable at any moment.
4. The site is itself a code sample, and a tech lead may open the source.

## Accessibility & Inclusion

WCAG AA contrast, full keyboard use, and a complete experience without motion or video under `prefers-reduced-motion`.
