# Axis 1 Launch Handoff - 2026-05-13

## Current Product Lock

Axis 1 is the first launch surface. The product is not "proof link" as an internal feature name. The customer-facing value is:

`A branded hood cleaning service report link/PDF that a restaurant can save for inspections, with photos, open items, and next action.`

Launch policy:

- Free builder: no login, no branding, 7-day hosted link, watermarked PDF, no report history.
- Company version: `$79/mo`, login required, saved branding/contact, clean PDF, live links while subscribed, report history.
- Optional design help: separate request, from `$249`.
- Paid access is now controlled by Paddle subscription state, not just login.

## Locked Surfaces

- Landing page: rebuilt around the restaurant-ready report value, not old "builder" language.
- Sample page: shows actual customer link/PDF as output evidence, with framing that this is what the restaurant receives.
- Product page: `/company-version` exists for paid company version.
- Pricing page: `/pricing` explains free vs company vs design help.
- Legal pages for Paddle verification: `/terms`, `/privacy`, `/refund-policy`.
- Common header/footer: shared Next header/footer, mobile hamburger.
- Dashboard: account profile + report history surface exists.
- Tool: free vs company policies exist in client logic; server storage supports free/company report records.

## Backend State

Spring owns auth/session/API. Next is statically exported and served by Spring.

Important routes:

- `GET /api/account/entitlements`
- `GET/PUT /api/account/company-profile`
- `POST /api/axis1/reports`
- `GET /api/axis1/reports/history`
- `GET /api/axis1/reports/public/{publicId}`
- `GET /api/axis1/assets/{publicId}/{fileName}`
- `GET /api/billing/paddle/config`
- `POST /api/billing/paddle/checkout`
- `POST /api/billing/paddle/webhook`

Database migrations now include:

- `V12__account_users.sql`
- `V13__axis1_account_storage.sql`
- `V14__billing_subscriptions.sql`

`V14` adds:

- `billing_subscriptions`
- `billing_webhook_events`

## Auth And Entitlement

Login:

- Email/password signup/login implemented.
- Google OAuth path exists but needs provider env vars.

Entitlement behavior:

- Anonymous: free builder only.
- Authenticated with `HOOD_BILLING_PROVIDER=abstract`: launch access, company unlocked.
- Authenticated with `HOOD_BILLING_PROVIDER=paddle`: company unlock only if `billing_subscriptions.status` is `active` or `trialing`.

This means production with Paddle enabled requires a successful Paddle webhook before company access opens.

## R2 Storage

R2 is integrated for report photos.

Expected production env names:

- `HOOD_AXIS1_ASSET_STORAGE_DRIVER=r2`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_REGION=auto`
- `CLOUDFLARE_R2_KEY_PREFIX=axis1-reports`

Verified previously:

- Upload to R2 works.
- API asset read works.
- Report delete deletes R2 objects.

## Supabase

Supabase is only used as Postgres through Spring JPA/Flyway. Do not add Supabase Storage/API keys for Axis 1 unless architecture changes.

Keepalive:

- `DatabaseKeepAliveService` runs `select 1`.
- Only prevents Supabase inactivity if the app is running.

Expected production DB env:

- `APP_DATASOURCE_URL`
- `APP_DATASOURCE_DRIVER=org.postgresql.Driver`
- `APP_DATASOURCE_USERNAME`
- `APP_DATASOURCE_PASSWORD`
- `APP_HIBERNATE_DDL_AUTO=validate`

## Paddle Sandbox State

Sandbox product/price:

- Company version price id: `pri_01krg69azme52abxdbmcx5gw28`
- Price: `$79/mo`

Sandbox checkout verified:

- Paddle transaction creation works.
- `/api/billing/paddle/checkout` returns `checkoutMode=transaction`.
- Browser opens Paddle checkout overlay.
- Paddle checkout shows `US$79.00 billed monthly`, test mode, card/PayPal.

Sandbox webhook destination was created:

- Destination: `https://kitchenpermit.com/api/billing/paddle/webhook`
- Notification setting id: `ntfset_01krgagc77jb13ytqqb48d3427`

Secrets are stored in GitHub Actions by name, not value:

- `PADDLE_API_KEY`
- `PADDLE_CLIENT_TOKEN`
- `PADDLE_COMPANY_PRICE_ID`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_WEBHOOK_TOLERANCE_SECONDS`
- `HOOD_BILLING_PROVIDER`
- `HOOD_BILLING_ENVIRONMENT`

Local `deploy/.env` currently includes sandbox values. Do not paste secrets into public docs or commits.

## Verification Already Run

Frontend:

- `npm --prefix frontend run lint`
- `npm --prefix frontend run build`

Backend focused tests:

- `./gradlew.bat --no-daemon test --tests owner.hood.web.BillingApiControllerTest`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.PaddleWebhookIntegrationTest`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.PublicSiteControllerTest`
- `./gradlew.bat --no-daemon test --tests owner.hood.web.Axis1AccountStorageApiTest`

Important note:

- Do not run standalone `npm --prefix frontend run build` in parallel with Gradle tests because Gradle also runs Next build and Next locks the build directory.

## Current Local Test URL

Spring app was tested on:

- `http://127.0.0.1:8091/company-version`

The user's in-app browser may also have `http://127.0.0.1:3007`, but `3007` is only Next dev/static and does not have Spring APIs. Payment/auth/report API verification must use Spring-served URL.

## What Is Still Missing

1. Deploy latest code.

   Production must include migrations through `V14`, Paddle env vars, R2 env vars, and Supabase DB env vars.

2. Run one real Paddle sandbox payment against deployed `https://kitchenpermit.com/company-version`.

   Use Paddle test card. Confirm Paddle notification log shows success for `transaction.completed`.

3. Verify entitlement after payment.

   After sandbox payment, log in with the same email and confirm:

   - `/api/account/entitlements` returns `companyAccess=true`.
   - Dashboard/tool company mode is unlocked.

4. Add visible post-checkout UX polish.

   Current success URL is `/dashboard?billing=checkout-complete`. Dashboard should show a clear success/processing banner. If webhook is delayed, show "Payment received, activating company access" rather than looking broken.

5. Add subscription management path.

   Not implemented yet:

   - Customer portal / manage billing
   - Cancel subscription
   - Update card
   - Failed payment recovery UI

6. Decide live Paddle migration.

   For live launch, create live Paddle product/price and live webhook destination. Then update:

   - `HOOD_BILLING_ENVIRONMENT=production`
   - live `PADDLE_API_KEY`
   - live `PADDLE_CLIENT_TOKEN`
   - live `PADDLE_COMPANY_PRICE_ID`
   - live `PADDLE_WEBHOOK_SECRET`

7. Website approval.

   Paddle live approval likely requires:

   - `https://kitchenpermit.com/pricing`
   - `https://kitchenpermit.com/terms`
   - `https://kitchenpermit.com/privacy`
   - `https://kitchenpermit.com/refund-policy`

8. Security cleanup before public/live.

   Several secrets were exposed in chat during setup. For live launch, rotate any production-equivalent credentials and keep only GitHub/host secrets.

9. Full regression pass.

   Run a complete manual pass on:

   - Landing page
   - `/samples/axis-1`
   - `/axis-1/tool`
   - Free report output
   - Company report output
   - Dashboard profile save
   - Report history
   - Paddle checkout
   - Paddle webhook entitlement

## Recommended Next Session Prompt

Use this prompt to resume:

```text
Read references/axis1-launch-handoff-2026-05-13.md first. Continue from the Axis 1 launch state. Priority: deploy latest code, verify Paddle sandbox payment + webhook on kitchenpermit.com, then add dashboard post-checkout success/processing UX and subscription management placeholder. Do not rework landing/sample design unless a regression is found.
```
