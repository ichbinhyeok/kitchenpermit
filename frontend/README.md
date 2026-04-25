# hood frontend

This workspace is the new browser-facing frontend for `hood`.

It owns:

- public marketing pages
- samples
- pricing
- the order-start flow
- future packet previews

It does not own:

- commercial truth
- scoring truth
- order truth
- delivery truth

Those remain in the Spring Boot backend.

## Local development

```bash
npm run dev
```

Default local URL:

- [http://localhost:3000](http://localhost:3000)

Planned backend API URL in local development:

- `http://localhost:8080`
- copy `.env.example` to `.env.local` if you want the frontend to proxy `/api/*` to Spring during development

## Current status

- Next.js App Router scaffold is live
- the marketing shell is in place
- core public routes exist
- start flow now saves a real inquiry record before the manual email handoff

## Next migration steps

1. connect `/start` to a real inquiry API
2. move sample and packet previews onto backend payloads
3. retire the public JTE pages after route parity is confirmed
