# On-Demand Submissions & Approval Workflow

The On-Demand feature allows brand employees to submit content (images + text) via WhatsApp. The system ingests these submissions, displays them in the dashboard, and supports an approval workflow where a designated brand contact can approve or reject posts directly from WhatsApp.

## Table of Contents

- [Overview](#overview)
- [WhatsApp Ingestion](#whatsapp-ingestion)
- [Brand Configuration](#brand-configuration)
- [Approval Workflow](#approval-workflow)
- [Technical Architecture](#technical-architecture)
- [Webhook Payload Reference](#webhook-payload-reference)

## Overview

The end-to-end flow:

1. A brand employee sends an image (or text) to the dedicated WhatsApp number, prefixed with the brand's ingest key (e.g., `AMAZON: Photo from the event`)
2. The system ingests the message via Whapi.Cloud webhook, stores media in Convex storage, and creates a submission record
3. The agency sees the submission in the brand dashboard's "On Demand" section
4. The agency clicks "Send for Approval" — the system sends the content to the brand's approval contact on WhatsApp with Approve/Reject buttons
5. The approver taps a button in WhatsApp — the system updates the submission status in real-time

## WhatsApp Ingestion

### Provider

We use [Whapi.Cloud](https://whapi.cloud) as the WhatsApp API provider. It connects via linked-device sessions (like WhatsApp Web) and requires no Meta Business verification.

### Ingest Key Mechanism

Each brand has a unique **Ingest Key** (2-20 alphanumeric characters). Employees prefix their WhatsApp message with this key followed by a colon:

```
BRANDKEY: Caption text here
```

For image/video messages, the key goes in the media caption. The system parses the key, looks up the brand, and stores the submission.

### Supported Message Types

- **Image with caption** — image stored in Convex `_storage`, caption parsed for brand key
- **Video with caption** — same as image
- **Text only** — parsed for brand key, stored without media

### Environment Variables

| Variable | Description |
|----------|-------------|
| `WHAPI_API_TOKEN` | Bearer token for Whapi.Cloud API |
| `WHAPI_BASE_URL` | API base URL (defaults to `https://gate.whapi.cloud`) |

## Brand Configuration

Two fields are configured during brand onboarding (Step 1 — General Info):

| Field | Purpose |
|-------|---------|
| **Ingest Key** | Short code employees use to identify the brand when submitting content |
| **Approval Contact** | WhatsApp number (with country code) of the person who approves/rejects posts |

Both fields are stored on the `brands` table and can be updated at any time through the onboarding wizard.

## Approval Workflow

### Sending for Approval

When the agency clicks "Send for Approval" on a submission card:

1. The system looks up the brand's `approvalPhone`
2. Sends a WhatsApp interactive message via `POST /messages/interactive` containing:
   - The submission image (as `media` field) if present
   - The message body text + sender info
   - Two quick-reply buttons: "Approve" and "Reject"
3. Updates the submission status to `processing`

### Receiving Approval Response

When the approver taps a button:

1. Whapi.Cloud sends a webhook with `msg.type = "reply"` and `msg.reply.buttons_reply.id`
2. The button ID format is `ButtonsV3:approve_<submissionId>` or `ButtonsV3:reject_<submissionId>`
3. The handler strips the `ButtonsV3:` prefix, extracts the action and submission ID
4. Updates the submission status to `published` (approved) or `rejected`

### Status Flow

```
pending → processing (sent for approval) → published (approved)
                                         → rejected
```

Resending is allowed from any status for testing/retry purposes.

## Technical Architecture

### Files

| File | Responsibility |
|------|---------------|
| `convex/schema.ts` | `submissions` table with `approvalMessageId` field, `brands` table with `approvalPhone` and `ingestKey` |
| `convex/http.ts` | Webhook endpoint at `/whapi/webhook` — handles incoming messages and button replies |
| `convex/submissions.ts` | CRUD operations for submissions, brand key lookup |
| `convex/approvals.ts` | `sendForApproval` action (calls Whapi API), `handleApprovalReply` mutation |
| `components/dashboard/brand/submissions-section.tsx` | Dashboard UI with list/feed toggle, lightbox, and approval buttons |
| `app/(dashboard)/brands/[brandId]/submissions/page.tsx` | Full submissions page |
| `components/brand-setup/steps/step-general.tsx` | Ingest Key and Approval Contact fields in onboarding |

### Submissions Table Schema

```typescript
submissions: defineTable({
  brandId: v.optional(v.id('brands')),
  agencyId: v.id('agencies'),
  senderPhone: v.string(),
  senderName: v.optional(v.string()),
  messageBody: v.string(),
  imageStorageId: v.optional(v.id('_storage')),
  status: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('published'),
    v.literal('rejected'),
  ),
  approvalMessageId: v.optional(v.string()),
  rawPayload: v.optional(v.string()),
  createdAt: v.number(),
})
```

### Webhook Route

The `/whapi/webhook` endpoint processes all incoming Whapi.Cloud events:

1. Checks for button replies (`msg.reply.buttons_reply.id`) — routes to approval handler
2. Extracts text/caption and parses the brand key
3. Downloads and stores media in Convex storage
4. Creates the submission record

## Webhook Payload Reference

### Incoming Submission (image with caption)

```json
{
  "messages": [{
    "type": "image",
    "from": "491234567890",
    "from_name": "John",
    "image": {
      "caption": "BRANDKEY: Photo from the event",
      "link": "https://..."
    }
  }],
  "event": { "type": "messages" }
}
```

### Button Reply (approval response)

```json
{
  "messages": [{
    "type": "reply",
    "from": "491234567890",
    "reply": {
      "type": "buttons_reply",
      "buttons_reply": {
        "id": "ButtonsV3:approve_<submissionId>",
        "title": "Approve"
      }
    }
  }],
  "event": { "type": "messages" }
}
```

### Interactive Message Sent (approval request)

```json
{
  "to": "491234567890@s.whatsapp.net",
  "type": "button",
  "body": { "text": "New content for approval:\n\n..." },
  "media": "https://convex-storage-url/...",
  "action": {
    "buttons": [
      { "type": "quick_reply", "title": "Approve", "id": "approve_<submissionId>" },
      { "type": "quick_reply", "title": "Reject", "id": "reject_<submissionId>" }
    ]
  }
}
```
