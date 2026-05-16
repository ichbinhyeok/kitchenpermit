# Axis 1 Success Criteria Review - 2026-05-14

Local server: http://127.0.0.1:8096

Latest simulation artifact:
- Markdown: `references/axis1-launch-qa/local-sim-2026-05-14/axis1-launch-local-sim.md`
- JSON: `references/axis1-launch-qa/local-sim-2026-05-14/axis1-launch-local-sim-results.json`

## Verdict

Controlled launch / paid beta: PASS.

Broad self-serve launch at $79/mo: PASS WITH ONE PRODUCT CONCERN.

## 2026-05-15 Builder Improvement Update

The main product concern has been improved.

Fresh `/axis-1/tool` sessions no longer start with `Sample Restaurant Group`, `Austin, TX`, or the static sample service date in the working builder state. New reports now start as a blank customer/service draft with today's local date, neutral service-system defaults, and no open-access sample exception preselected.

Outputs are now blocked until the real job basics are present:
- customer,
- site,
- service date,
- reviewer,
- system.

When a user confirms the job result but has not added the customer details, the review screen now says `Job details needed` instead of `Outputs ready`, opens the job basics panel, and explains that the link/PDF will not be generated from untouched defaults.

Regression coverage was added to the local simulation script. Latest run:

```json
{
  "ok": true,
  "companyReports": 7,
  "freeReports": 2,
  "photoAssist": {
    "mode": "live",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  },
  "browserPages": 7,
  "findings": []
}
```

Updated judgment: controlled launch / paid beta remains PASS. The first-report flow is now acceptable for self-serve testing, though a real timed human run should still confirm that a new operator can create a usable report in under 3 minutes.

The customer-facing deliverables are now strong enough for the target segment: hood cleaning companies that already take service photos and need a clean restaurant-facing record for manager review, insurance, landlord, or documentation requests.

The remaining concern is the first-time builder path. The first screen is clear and low-friction, but before outputs are generated the user still needs to confirm the job result and edit job basics that currently surface sample defaults. This is probably acceptable for a guided beta, but it is the weakest part of the $79 self-serve promise.

## Success Criteria

| Criterion | Status | Evidence | Product judgment |
| --- | --- | --- | --- |
| First report can be created quickly | Partial pass | Builder first screen opens directly to photos/notes, says photos are optional, and moves to review without photos. Output still requires result confirmation. | Good for beta; for self-serve, sample job basics and result-confirmation need to feel more foolproof. |
| Photos are sorted without overclaiming | Pass | Gemini live returned before/after/access/unknown suggestions with `needsVendorReview: true`; unknown restroom hand dryer stayed unassigned. | Good. It assists classification without pretending to certify completion. |
| Customer link makes the company look professional | Pass | Company customer link shows company name, accent color, service date, customer action, photos, and PDF copy. `Call vendor`, `mailto:`, invoice/payment copy, and backend PDF asset links were not found. | Strong enough for vendors with documentation-heavy customers. |
| PDF feels like a retained service record | Pass with caution | PDF route is `/p/server?reportId=<id>&format=pdf`, includes `Save PDF`, service title, customer/site fields, service areas, photo evidence, and no backend PDFBox CTA. | Much more document-like now. Still dense, but acceptable as a retained copy. |
| Dashboard feels like report history | Pass | `admin@kitchenpermit.com` has 7 company reports, 6 customer/sites, due soon, past due, next service, open access item, quote review, monitor review, written record, and record-only states. | This is the clearest $79 value: saved branded history. |
| Free vs company difference is obvious | Pass | Free reports show `Free test link`, no company name/contact branding, 7-day/watermark policy, and no history. | Good. Free feels like a test; company feels like the real product. |
| Restaurant/customer can save the result | Pass | Customer link and PDF both emphasize saved kitchen exhaust records, manager/insurance/documentation use, photos, open items, and next service. | Useful and understandable. |
| No stale sample data in saved reports | Pass | Simulation/browser checks found no `Sample Restaurant Group` or `Austin, TX` on saved customer/PDF outputs. | Fixed. |

## Commands Run

```powershell
node scripts\axis1-launch-local-sim-qa.cjs
```

Result:

```json
{
  "ok": true,
  "companyReports": 7,
  "freeReports": 2,
  "photoAssist": {
    "mode": "live",
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  },
  "browserPages": 6,
  "findings": []
}
```

## Direct Browser Checks

Representative customer link:
- http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd

Representative PDF screen:
- http://127.0.0.1:8096/p/server?reportId=67e4d189dc3b4fa5bd&format=pdf

Free test link:
- http://127.0.0.1:8096/p/server?reportId=cb6088588be94cdd90

Direct checks:
- Customer link contained `Canal Street Tacos`.
- Customer link contained `1 area needs your action`.
- Customer link did not contain `Call vendor`.
- Customer link PDF CTA pointed to `format=pdf`.
- Customer link did not expose `/api/axis1/assets/.../service-report.pdf`.
- PDF screen contained `Save PDF`.
- PDF screen contained `Kitchen Exhaust Cleaning Service Report`.
- PDF screen did not contain the web hero headline.
- PDF screen did not expose backend asset PDF links.
- Console error count was 0 on checked customer/PDF/free pages.

## Pricing Judgment

$79/mo is defensible for the right segment:
- vendors with recurring commercial accounts,
- vendors that already take photos,
- vendors that get manager, insurance, landlord, or inspection documentation requests,
- vendors that want a professional branded customer handoff and saved report history.

It is probably too high for tiny operators unless the first report flow becomes extremely obvious and the value is shown with a real output in the first session.

Recommended launch posture:
- Keep `$79/mo` as Company.
- Use founder pricing, first-month discount, or first 10 reports free to reduce trial friction.
- Do not lower the headline price yet.

## Main Remaining Product Concern

The first-time builder path should avoid any chance that a user ships a report with sample job basics. For paid self-serve, the builder should make the required real-world fields unavoidable before output:

- customer/site,
- service date,
- job result,
- next step or next service window,
- optional photos.

This is not a launch blocker for controlled beta, because the generated saved reports and dashboard history are strong. It is the next highest-leverage product improvement before wider paid acquisition.
