# Axis 1 Core Skeleton Full Context Handoff - 2026-05-13

This is the full handoff for continuing the Axis 1 launch skeleton, not just billing.

## Original Goal

We were trying to lock the basic launch skeleton before moving wider. The user wanted the scattered context reduced and the first launch axis locked.

Core skeleton to evaluate and lock:

- Landing page `/`
- Axis 1 product page `/axis-1`
- Sample/output page `/samples/axis-1`
- Actual customer links `/p/sample-*`, `/p/server?reportId=...`
- Tool UX `/axis-1/tool`
- Pricing page `/pricing`
- Company version/subscription page `/company-version`
- Login/dashboard/account surfaces `/login`, `/dashboard`
- Legal/policy pages needed for payment approval: `/terms`, `/privacy`, `/refund-policy`
- Shared header/footer/navigation across all of the above

The broad goal is not "add more stuff." It is to decide what should exist, what should be removed, what is draft, and what must be locked for Axis 1 launch.

## Product Thesis

Axis 1 is for hood cleaning companies.

The customer-facing value is:

`A branded hood cleaning service report link/PDF that restaurants can save for inspections, with photos, open items, and next action.`

Important framing:

- The vendor is not buying "a builder."
- The restaurant is not buying anything.
- The vendor wants a clean post-service handoff that looks professional under their company name.
- The restaurant receives one link/PDF it can file for inspections.
- Photos are evidence, not the whole report.
- The report should reduce messy explanation after service.
- Avoid overusing internal terms like "proof link" or "customer link" as if they are obvious product names.
- Use concrete language: branded service report, inspection-ready PDF, restaurant-ready link, open items, next action, saved company profile, report history.

## Design/Copy Direction Learned

The user explicitly rejected merely optimizing the old structure. The next agent must not treat the current page as sacred.

Design/copy principles:

- Review like a top-tier SaaS/product designer, not like a developer cleaning labels.
- Do not "덧대기" existing sections with minor wording. Reframe if the structure is weak.
- The first 3-5 seconds matter most, especially mobile.
- A hood company owner should immediately understand what this does and why it is worth paying for.
- Marketing hook should not be "here is a link/PDF sample" only. The link/PDF are evidence of value, not the entire hook.
- The output should feel like a real deliverable sent to a restaurant, not a generic web feature.
- Use actual output screenshots/edited slices if that communicates value better than long scrolling samples.
- Avoid "setup" language unless policy is truly setup. The current paid product direction is self-serve subscription, with optional design help.

## Current Product Policy

Current draft policy:

- Free builder: no login, no branding, 7-day hosted link, watermarked PDF, no report history.
- Company version: `$79/mo`, login required, saved branding/contact, clean PDF, live links while subscribed, report history.
- Optional design help: separate request, from `$249`.
- Free can be used without login.
- Branding is locked/gated for free users.
- Paid users can save branding in dashboard and use it in tool.
- Tool may also allow direct branding input for logged-in/paid users.
- History and reload-from-history belong to paid/dashboard flow.

These are still launch-policy decisions, not eternal product truth. Do not hard-code new policy without checking whether it is launch-safe.

## Page-by-Page State And Intent

### Landing Page `/`

Role:

- Top-of-funnel explanation.
- Must answer "what is this?" in one screen.
- Must make the value obvious to a hood cleaning company owner.
- Should point to the sample/output first, because the output is the evidence.

Current direction:

- Stronger message around branded service report link/PDF after every hood cleaning job.
- Main CTA should likely be sample/result oriented, not "Try neutral builder."
- The old "setup" CTA was weak/confusing because the product direction is self-serve subscription.

Still needs review:

- Does the first mobile viewport show branded report/PDF + inspection value clearly?
- Are CTAs clear and consistent with the rest of product?
- Is any section still old/internal language?
- Does it sell a customer-ready artifact, not internal software?
- Is there any remaining "nice SaaS page" filler that does not help a hood vendor decide?

### Axis 1 Product Page `/axis-1`

Role:

- Explain the Axis 1 product in more detail than landing.
- Should clarify free builder vs company version.
- Should show workflow: build job report -> send branded link/PDF -> restaurant files it.

Risk:

- Could overlap with landing or pricing.
- Needs a clear role in the funnel, or it should be simplified.

Still needs review:

- Does it explain the product better than landing?
- Is it redundant?
- Does it connect to tool/sample/pricing cleanly?
- Does it use vendor language rather than internal framework language?

### Sample Page `/samples/axis-1`

Role:

- Show the actual deliverables: customer link and PDF.
- This is evidence, not the main marketing hook by itself.
- It must feel like "this is what your restaurant customer receives," not "this is a web demo page."

Current work done:

- Sample page was reframed from generic content into output showcase.
- Link/PDF were visually edited to feel more like deliverables.
- Modal/explanatory behavior was considered for sample-output CTAs.

Still needs review:

- Do labels like customer link / PDF copy feel too product-internal?
- Should the page explicitly say "Below is a sample deliverable sent to a restaurant"?
- Does the PDF feel like a document on desktop and mobile?
- Does the customer link feel like a real link a restaurant receives?
- Are CTA actions clear, or are they accidentally acting like functional app controls?
- Does the sample page show value in 3-5 seconds without long scrolling?

### Public Sample/Report Links `/p/sample-*`, `/p/server?reportId=...`

Role:

- Actual restaurant-facing report link.
- Should have a common header/chrome but not feel like marketing navigation.
- Must feel like a customer deliverable.

Current work done:

- Shared header concern was raised because landing/tool/report headers were inconsistent.
- Common header/footer direction was improved.
- Mobile hamburger requested and added.

Still needs review:

- Does the report page feel like a real vendor/customer handoff?
- Is the navigation too much or too little for a customer-facing link?
- Does PDF/export posture make sense?
- Are sample CTAs blocked/explained with modal rather than causing confusing actions?

### Tool UX `/axis-1/tool`

Role:

- Let users create a report.
- Free users can use it, but branding/persistent company features are gated.
- Logged-in/paid users can save branding, get clean PDF, live link, history.

Current work done:

- Free/company policy objects exist in frontend.
- Server storage exists for hosted report records.
- R2 asset storage exists.
- Free reports expire after 7 days.
- Company reports stay live while subscribed.
- Watermark policy exists at product level.

Still needs full UX review:

- Is the first step clear for a hood vendor?
- Are free vs paid gates understandable at the moment of need?
- Does clicking locked branding explain subscription value clearly?
- Does output generation explain free limitations before surprise?
- Does logged-in/paid mode actually feel unlocked?
- Does report history reload into the builder cleanly?
- Is there any leftover "setup" language?
- Does PDF generation/download behavior match the promised policy?

### Pricing Page `/pricing`

Role:

- Explain free vs company vs optional design help.
- Make policy understandable without overwhelming.
- Support Paddle verification.

Current direction:

- `$79/mo` company version chosen over `$59/mo`.
- Free limitations: no branding, 7-day link, watermarked PDF, no history.
- Optional design help from `$249`.

Still needs review:

- Is `$79/mo` communicated as paid product, not setup fee?
- Is "Design help" clearly optional, not required onboarding?
- Does pricing page connect to checkout/company page correctly?
- Is refund language consistent with `/refund-policy`?
- Does it over-explain policy at the expense of product value?

### Company Version Page `/company-version`

Role:

- Paid product page.
- Should explain why company version is worth paying for.
- Checkout CTA lives here.

Current work done:

- Page exists.
- CTA opens Paddle checkout.
- Paddle checkout has been verified in sandbox locally.

Risk:

- This page can accidentally overweight subscription/payment instead of product value.
- It must stay a product/value page, not just a checkout page.

Still needs review:

- Does it feel like the natural next step from sample/pricing?
- Is the value clear before checkout?
- Does it duplicate pricing too much?
- Should it show "see it for my company" concept more visually?

### Login `/login`

Role:

- Account entry for company version.
- Free builder remains available without login.

Current work done:

- Email/password signup/login exists.
- Google OAuth path exists but requires provider env vars.

Still needs review:

- Is signup simple enough?
- Is login copy clear that account unlocks company output/history?
- Are Google OAuth missing-provider states acceptable before launch?

### Dashboard `/dashboard`

Role:

- Saved company profile.
- Report history.
- Future billing/subscription management.

Current work done:

- Company profile panel exists.
- Report history panel exists.
- Backend profile/history APIs exist.

Still missing:

- Post-checkout success/processing banner for `/dashboard?billing=checkout-complete`.
- Subscription status card.
- Manage billing placeholder.
- Update card / cancel subscription placeholder.
- Payment failed/recovery placeholder.
- Clear "free vs company" current account status.

### Legal Pages `/terms`, `/privacy`, `/refund-policy`

Role:

- Paddle approval support.
- Basic trust/compliance.

Current work done:

- Pages exist.
- Footer links exist.

Still needs review:

- Readability and consistency.
- Refund policy should match `$79/mo` subscription and optional design help.
- Should be adequate for Paddle approval before live.

## Backend/Infra State

Spring owns auth/session/API. Next frontend is static export served by Spring.

Do not verify full flows on `127.0.0.1:3007` because that is Next-only and does not have Spring APIs.

Use Spring-served URLs for full flow:

- local example: `http://127.0.0.1:8091/company-version`
- production: `https://kitchenpermit.com/company-version`

Important API routes:

- `GET /api/account/entitlements`
- `GET/PUT /api/account/company-profile`
- `POST /api/axis1/reports`
- `GET /api/axis1/reports/history`
- `GET /api/axis1/reports/{publicId}/builder`
- `DELETE /api/axis1/reports/{publicId}`
- `GET /api/axis1/reports/public/{publicId}`
- `GET /api/axis1/reports/public/{publicId}/pdf-manifest`
- `GET /api/axis1/assets/{publicId}/{fileName}`
- `GET /api/billing/paddle/config`
- `POST /api/billing/paddle/checkout`
- `POST /api/billing/paddle/webhook`

Migrations added:

- `V12__account_users.sql`
- `V13__axis1_account_storage.sql`
- `V14__billing_subscriptions.sql`

## Supabase

Supabase is only Postgres through Spring JPA/Flyway.

Do not add Supabase Storage/API keys unless architecture changes.

Keepalive exists to run `select 1` while app is running.

## R2

R2 is for report photos.

Verified previously:

- Upload works.
- Asset read through API works.
- Deleting report deletes R2 objects.

## Paddle

Paddle is part of the skeleton, but not the whole project.

Current sandbox:

- Company price id: `pri_01krg69azme52abxdbmcx5gw28`
- Price: `$79/mo`
- Checkout works locally.
- Webhook route exists.
- Sandbox webhook destination exists:
  `https://kitchenpermit.com/api/billing/paddle/webhook`
- Notification setting id:
  `ntfset_01krgagc77jb13ytqqb48d3427`

Entitlement:

- `HOOD_BILLING_PROVIDER=paddle` means login alone does not unlock company access.
- Subscription status must be `active` or `trialing`.

Important:

- Final live testing comes after the core skeleton is reviewed and deployment is ready.
- Do not let Paddle tasks dominate every next step unless the user explicitly asks.

## Verification Already Run

Passed:

- `npm --prefix frontend run lint`
- `npm --prefix frontend run build`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.BillingApiControllerTest`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.PaddleWebhookIntegrationTest`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.PublicSiteControllerTest`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.Axis1AccountStorageApiTest`

Do not run standalone `npm --prefix frontend run build` in parallel with Gradle tests. Gradle also runs Next build and parallel Next builds lock each other.

## Broad Remaining Work

Before live launch:

1. Full skeleton review in this order:
   Landing -> sample/output -> Axis 1 product page -> tool UX -> pricing -> company version -> login/dashboard -> legal.

2. For each page, answer:
   - What is this page's job?
   - Is that job still needed?
   - Does a hood company owner understand it in 3-5 seconds?
   - Is the page showing product value or internal mechanics?
   - Are CTAs consistent with the funnel?
   - Is anything still draft/generic/old-language?

3. Tool UX review:
   - Anonymous free path.
   - Logged-in but unpaid path.
   - Paid/company path.
   - Branding gate.
   - Output generation.
   - Watermark/free expiry explanation.
   - Dashboard history/reload.

4. Dashboard/account review:
   - Account status.
   - Company profile.
   - Report history.
   - Post-checkout UX.
   - Subscription management placeholders.

5. Deployment and sandbox end-to-end:
   - Deploy latest code.
   - Verify migrations through V14.
   - Verify R2 env.
   - Verify Supabase env.
   - Verify Paddle sandbox checkout on production domain.
   - Verify Paddle webhook notification success.
   - Verify entitlement changes after payment.

6. Live readiness:
   - Paddle website approval.
   - Live Paddle product/price/webhook.
   - Rotate any exposed setup secrets before public/live.
   - Final live test only after skeleton and sandbox tests are locked.

## Recommended Next Session Prompt

Use this exact prompt:

```text
Read references/axis1-core-skeleton-full-context-2026-05-13.md fully before doing anything.

We are not only doing Paddle. We are locking the full Axis 1 launch skeleton: landing, Axis 1 product page, sample/output page, actual customer links/PDF, tool UX, pricing, company version page, login/dashboard, legal pages, shared navigation, and backend policy. Paddle subscription is only one part of the skeleton.

Main product value: a branded hood cleaning service report link/PDF that restaurants can save for inspections, with photos, open items, and next action. Avoid internal product language like "proof link" unless it is explained in customer terms.

First task: assess what remains to lock in the skeleton, page by page, without overweighting payment. Start with the current code and current local/production state. Do not rework pages blindly. For each page, identify its job, whether it is still needed, whether the message is clear in 3-5 seconds for a hood cleaning company owner, and what must be fixed before launch.

After that, implement the highest-leverage fixes that are safe to do now. Do not run Next build in parallel with Gradle tests. Do not revert unrelated changes.
```
