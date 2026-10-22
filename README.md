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
styling. Photos are served from Unsplash and the image host is explicitly configured in
`next.config.ts`.

This is a frontend demo, not a production RSVP system. It does not store RSVP responses,
validate guest invitation tokens, provide admin authentication, or connect to Supabase.
The RSVP section explains that personalized links will be added later; the contact link
is a sample address and must be replaced before publishing.

The invitation gate currently demonstrates the guest-name animation with the sample
name `Juan Dela Cruz`. Change `demoGuestName` in `src/lib/wedding-data.ts` to preview a
different name. Individual guest names are not loaded from URL parameters; secure,
guest-specific greetings should be connected to validated invitation tokens when the
Supabase invitation backend is implemented.

## Next steps

1. Replace the sample couple, schedule, venue, palette, images, and contact information.
2. Build the remaining guest interactions and wedding-content customization.
3. Add Supabase migrations, storage, RLS, server-side invitation validation, and persisted
   RSVP workflows before collecting real guest data.
4. Add protected administration, critical-flow tests, and deployment configuration.

Do not enter real guest data into this frontend demo.
