# API-Factory — Business-Only Policy

Effective: DRAFT — Please review with Legal and Product before publishing.

This document defines the Business-Only Policy and associated roadmap for enforcing that API-Factory services are used only by private businesses, startups, and enterprises. Government entities (federal, state, municipal, or foreign) are explicitly excluded.

## 1. Core Guardrail

- Eligibility: Only private businesses, startups, and enterprises may onboard and obtain API keys.
- Exclusion: No governments (federal, state, municipal, or foreign) may register, subscribe, or use API-Factory services.
- Legal Clause: A "Non-Government Use" clause will be added to both the Terms of Service (ToS) and Master Services Agreement (MSA). Legal review required.

## 2. Tier System Alignment

### Tier 1 — Core 🚀
- Features: Auth (JWT, API keys), rate limits, quotas.
- Signup: Sign-up form requires business registration fields (company name, EIN/tax ID optional initially but required at billing stage).
- Restrictions: Block domains and emails using `.gov` and `.mil` patterns.
- Billing: Stripe onboarding requires a valid EIN/business tax ID when collecting billing info.

### Tier 2 — Standard 💼
- Adds: usage tracking, tiered SDKs, revenue-ready APIs.
- Verification: Business verification using Dun & Bradstreet and Crunchbase lookups.
- Auto-reject: Signups flagged as government entities are automatically rejected.

### Tier 3 — Advanced 💰
- Adds: Stripe billing, detailed usage metrics, dedicated SDKs.
- Enterprise: Must provide incorporation documents for onboarding.
- SLA: Contracts include explicit clause excluding government use cases.

### Tier 4 — Enterprise 🏦
- Features: Dedicated gateways, audit logs, compliance add-ons.
- Contracts: All contracts carry a "Non-Government" restriction.
- Billing: Stripe enterprise flow auto-blocks government-linked bank accounts and domains.

## 3. Enforcement Layer

- Onboarding:
  - Remove any "Government" account type option in the sign-up flow.
  - Client-side validation: block and warn on `.gov` and `.mil` emails/domains.
  - Server-side enforcement: prevent account creation for blocked domains even if bypassed client-side.
- Billing:
  - Use Stripe account verification to identify and reject government-linked tax IDs or bank accounts.
- Contracts & Legal:
  - Add explicit Non-Government clause to ToS and MSA.
- Marketing:
  - Ensure all product marketing emphasizes business use-cases and contains no civic/public sector targeting.

## 4. Audit & Monitoring

- Quarterly reviews:
  - Run NAICS and industry tag checks against the client base and flag any suspicious accounts.
- Alerting:
  - Create an alert pipeline to notify admins and suspend accounts if a `.gov` or `.mil` domain or government indicators are discovered.
- Access logs and audit trails to be kept to support enforcement and legal follow-up.

## 5. Technical Implementation Plan (High-level)

1. Policy & Legal
   - Draft ToS/MSA language and get legal signoff.
2. Signup & Frontend
   - Remove government option, add business registration fields, validate emails/domains client-side.
3. Backend Enforcement
   - Middleware to block `.gov`/`.mil`, integrate with D&B/Crunchbase for enrichment.
   - Admin override workflows (manual review and appeals) for false positives.
4. Billing Integration
   - Require EIN / business tax ID at time of billing; use Stripe verification webhooks.
   - Auto-block if Stripe signals government-linked account.
5. Auditing
   - Implement scheduled audit jobs; run NAICS lookup and report generation.
6. Monitoring
   - Alerts and automated suspensions for flagged accounts.

## 6. Edge-cases & Considerations

- Public benefits contractors: Contractors working for governments may register as private companies; ensure contract terms and proof-of-incorporation checks cover intent and use.
- Nonprofit organizations: Decide policy for 501(c)(3) and other nonprofits — treat as businesses or exclude? Add explicit language.
- International: Define handling for foreign government-affiliated entities.

## 7. Acceptance Criteria

- No account with a verified government domain or flagged government NAICS/industry tag remains active.
- All signups pass the client-side and server-side domain checks.
- Stripe onboarding rejects government-linked billing info.
- Legal-approved ToS and MSA include Non-Government clauses.

---

For legal sign-off and product planning, propose a review session with Legal, Product, and Engineering to finalize rollout and timeline.
