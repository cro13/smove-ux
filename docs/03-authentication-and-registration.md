# Authentication and Registration

How users sign in and how agencies and brands are registered.

## Table of Contents

- [Authentication providers](#authentication-providers)
- [Identity helpers](#identity-helpers)
- [Agency registration](#agency-registration)
- [Access codes](#access-codes)
- [Brand registration](#brand-registration)
- [Ownership enforcement](#ownership-enforcement)
- [Related documentation](#related-documentation)

## Authentication providers

Configured in `convex/auth.ts` via `convexAuth`:

- Password — email and password, with an optional `name` captured on sign-up.
- Resend — email-based sign-in, sending from `AUTH_EMAIL_FROM`.

HTTP routes for auth are mounted in `convex/http.ts` through `auth.addHttpRoutes`.

## Identity helpers

- `agencies.currentUser` — returns the authenticated user document, or `null`.
- `agencies.myAgency` — returns the user's agency (with a resolved `logoUrl`), or `null`.
- Server functions resolve the current user with `getAuthUserId(ctx)`.

## Agency registration

`agencies.registerAgency` creates the agency for the signed-in user. It:

1. Requires an authenticated user.
2. Rejects if the account already owns an agency (one agency per user).
3. Validates and consumes an access code (decrements `usesRemaining` when a code row exists).
4. Inserts the agency with name, contact, address, branding, and access code.

Related: `agencies.updateAgency`, `agencies.removeLogo`, and `agencies.generateLogoUploadUrl` manage the agency profile and logo.

## Access codes

Registration is gated. `agencies.validateAccessCode` checks the `accessCodes` table by code (and remaining uses). A fallback set of always-valid codes (for development) lives in `agencies.ts`. Invalid codes return a message pointing users to contact the team for an invite.

## Brand registration

`brands.create` inserts a new brand for the user's agency with `status: 'active'` and `onboardingStep: 1`. The brand then enters the onboarding wizard. See [04-brand-onboarding-wizard.md](04-brand-onboarding-wizard.md).

## Ownership enforcement

All brand-scoped reads and writes verify that the authenticated user owns the brand's agency. The shared `assertBrandOwner` helper (in `brands.ts`, `brandPersonas.ts`, `brandContentBuckets.ts`) loads the brand, loads its agency, and confirms `agency.ownerId === userId`. Queries return empty/`null` for unauthorized access; mutations throw.

## Related documentation

- [01-architecture.md](01-architecture.md) — function types and runtime.
- [02-data-model.md](02-data-model.md) — `agencies`, `accessCodes`, and auth tables.
