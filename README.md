# Amara & Mateo Wedding Invitation

A responsive, editorial-style wedding invitation built with Next.js App Router, React,
TypeScript, Tailwind CSS, Motion, Lucide, and `next/image`.

## Getting started

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the invitation.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Phase 1–2 demo

The site currently uses clearly illustrative sample wedding content in
[`src/lib/wedding-data.ts`](./src/lib/wedding-data.ts). The invitation includes an
open/skip/replay envelope introduction, a live countdown, story timeline, venue and
schedule details, dress-code palette, photo gallery lightbox, FAQ, and mobile-first
styling, plus a wedding-party section for principal sponsors, groomsmen, and bridesmaids.
Photos are served from Unsplash and the image host is explicitly configured in
`next.config.ts`.

The RSVP form is open to guests without personalized invitation links. It collects a
guest name, attendance, optional email or phone details, and optional questions.
Responses are stored in Supabase by the server-side API; the service role key is never
sent to the browser.

### Configure Supabase RSVP

1. Create a Supabase project. In its SQL Editor, run the migrations in timestamp order:
   [`20261023000000_rsvp.sql`](./supabase/migrations/20261023000000_rsvp.sql), then
   [`20261023010000_public_rsvps.sql`](./supabase/migrations/20261023010000_public_rsvps.sql),
   then [`20261023020000_rsvp_questions.sql`](./supabase/migrations/20261023020000_rsvp_questions.sql).
   If the first two migrations have already been applied, run only the last one. It adds
   an optional question field without deleting old responses.
2. Copy `.env.example` to `.env.local` and set `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` from the project dashboard. Keep the service role key
   private and server-side; never use it as a `NEXT_PUBLIC_` variable.
3. Restart the dev server, then open the RSVP section and submit a test response.

RLS remains enabled and public table access is revoked; only the server-side API writes
responses. Do not enter real guest details until Supabase is configured and the site is
deployed over HTTPS.

## Next steps

1. Replace the sample couple, schedule, venue, palette, images, and contact information.
2. Add protected administration for viewing and managing RSVP responses.
3. Add critical-flow tests and deployment configuration.

Do not enter real guest data until Supabase is configured.
