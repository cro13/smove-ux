# Brand Onboarding Wizard

The eight-step flow that builds a brand's profile, with autosave, a live preview, and optional import accelerators.

## Table of Contents

- [Flow](#flow)
- [Steps](#steps)
- [Autosave](#autosave)
- [Navigation and progress](#navigation-and-progress)
- [Live preview](#live-preview)
- [Persistence](#persistence)
- [Entry and completion](#entry-and-completion)
- [Related documentation](#related-documentation)

## Flow

The wizard lives at `app/(dashboard)/brands/[brandId]/setup/page.tsx`. On a brand that has no data yet, a pre-wizard entry screen offers to import from a website, upload a brand book, or start from scratch (see [10-brand-import-and-references.md](10-brand-import-and-references.md)). Otherwise the step content renders directly.

## Steps

Defined in `components/brand-setup/types.ts` (`STEPS`):

1. General Information — language, location, contact name and email.
2. Company Profile — field of business, identity, core message, tagline, mission, vision, values, products, reasons to believe, key messages.
3. Visual Identity — logo, colors, gradients, fonts (Google Font by name or uploaded file), and imagery split into Photography, Illustrations, and Icons (each supports multiple uploads).
4. Tone of Voice — archetype, voice attributes, writing mechanics, words to use/avoid, sample posts, guardrails, and reference posts.
5. Communication Channels — LinkedIn, Instagram, Facebook.
6. Target Personas — per-channel audience definitions (`brandPersonas`).
7. Content Buckets — per-channel content plans (`brandContentBuckets`).
8. Overview — review every section and finish.

Each step is a component under `components/brand-setup/steps/`.

## Autosave

Steps save continuously via the `useAutosave` hook (`components/brand-setup/use-autosave.ts`): debounced writes, a flush on unmount, and `beforeunload` protection so progress is never lost. Validation errors block navigation but do not block saving. Top-level brand fields are written through `brands.updateOnboarding`; personas and content buckets use their own `create`/`update`/`remove` mutations.

## Navigation and progress

- `WizardProgress` renders the step rail and supports jumping between steps.
- `WizardNav` provides inline Back/Next controls and a subtle save-status indicator.
- The current step is tracked in page state and seeded once per brand from `onboardingStep`.

## Live preview

On the Visual Identity and Tone of Voice steps, a sticky right rail shows a `BrandPreview` social-post card driven by the brand's colors, logo/icon, gradient, and voice. On the Voice step it also shows an `ArchetypeInsights` panel for the selected archetype.

## Persistence

`brands.updateOnboarding` accepts a partial patch keyed by section (`generalInfo`, `companyProfile`, `visualIdentity`, `voice`, `guardrails`, `referencePosts`, `channels`) plus `step`. Media (logos, fonts, imagery split across `iconStorageIds` / `photographyStorageIds` / `illustrationStorageIds`, reference screenshots) is uploaded to Convex storage and referenced by `storageId`; read URLs are resolved in `brands.getWithMedia`.

## Entry and completion

- A brand is considered fresh (and shown the entry screen) when it has no completion timestamp, no import source, `onboardingStep <= 1`, and no `generalInfo` / `companyProfile` / `visualIdentity`.
- `brands.completeOnboarding` sets `onboardingCompletedAt` and pins the step to the review step. Incomplete brands surface a resume affordance on the dashboard.

## Related documentation

- [02-data-model.md](02-data-model.md) — the fields each step writes.
- [10-brand-import-and-references.md](10-brand-import-and-references.md) — import accelerators and reference posts.
