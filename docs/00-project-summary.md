# Project Summary

Smove is a platform for marketing agencies to onboard and manage client brands, capturing a structured brand identity that an AI agent uses to generate on-brand social content.

## Table of Contents

- [What Smove is](#what-smove-is)
- [Core concepts](#core-concepts)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Related documentation](#related-documentation)

## What Smove is

Agencies register an account (gated by an access code), then onboard each client brand through a guided wizard. The wizard captures the brand's identity, visual system, voice, guardrails, channels, personas, and content plan. That data becomes the source of truth for downstream AI content generation.

## Core concepts

- Agency — the top-level tenant. One user account owns exactly one agency.
- Brand — a client of the agency. An agency owns many brands.
- Onboarding — an eight-step wizard that builds a brand's profile, with autosave and optional import accelerators.
- Personas and content buckets — per-channel audience definitions and content plans attached to a brand.

## Tech stack

- Next.js 16 (App Router, React 19) with TypeScript.
- Tailwind CSS v4 for styling; shadcn-style primitives in `components/ui`.
- Convex for the database, server functions (queries, mutations, actions), file storage, and realtime updates.
- `@convex-dev/auth` for authentication (Password and Resend email providers).
- framer-motion for animation; lucide-react for icons.
- Google Gemini (brand-book extraction) and the Brandfetch API (website import).

## Repository structure

```
app/                      Next.js routes
  (dashboard)/            Authenticated app (brands, settings, brand setup)
  register/               Sign-up flows (agency, brand)
  login/                  Sign-in
  page.tsx, agents/, ...  Marketing and legal pages
components/
  brand-setup/            Onboarding wizard, steps, fields, preview
  dashboard/              Brand dashboard and overview
  home/, agents/          Marketing sections
  layout/, animations/    Shared layout and motion
  ui/                     Reusable primitives
convex/                   Schema and server functions
docs/                     This documentation
lib/utils.ts              Shared helpers (cn, etc.)
public/images/archetypes  Archetype artwork
```

## Related documentation

- [01-architecture.md](01-architecture.md) — system architecture and data flow.
- [02-data-model.md](02-data-model.md) — Convex schema reference.
- [03-authentication-and-registration.md](03-authentication-and-registration.md) — auth and sign-up.
- [04-brand-onboarding-wizard.md](04-brand-onboarding-wizard.md) — the onboarding wizard.
- [10-brand-import-and-references.md](10-brand-import-and-references.md) — import accelerators and reference posts.
