# AI Engineer Screener

Role-driven AI screening app built with Next.js, ElevenLabs, and Mistral. Admins create reusable interview templates from a job description, candidates upload their materials, and the system spins up a voice interview agent and produces an admin-only scorecard after the session.

## Project Context

This repo is organized around a simple hiring workflow:

1. An admin authenticates with a passcode on `/`.
2. The admin creates a reusable role template manually or from a job-description PDF.
3. A candidate opens `/apply/[roleId]` and submits their name, CV, optional cover letter, GitHub URL, and optional note.
4. The backend preprocesses the candidate context, creates a dedicated ElevenLabs conversational agent, and starts a live screening session at `/session/[sessionId]`.
5. The transcript is synced during the call and finalized at the end of the session.
6. Mistral generates the scorecard for `/admin/sessions/[sessionId]`.

Important evaluation rule: uploaded materials are used to tailor the interview, but scoring is intended to rely on the interview transcript.

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- shadcn-style UI primitives in `components/ui/*`
- ElevenLabs Conversational AI for live voice interviews
- Mistral for job-description extraction, preprocessing, and scorecards
- Vercel KV for deployed persistence
- Local JSON fallback in `.data/storage.json` for local development

## Setup

Use Node 20+ and `pnpm` 9.x.

```bash
pnpm install
```

Create `.env.local`:

```bash
ADMIN_PASSCODE=change-me
ELEVENLABS_API_KEY=...
MISTRAL_API_KEY=...

# recommended for deployed/shared persistence
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# recommended outside localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000

# optional overrides
MISTRAL_MODEL=mistral-large-latest
MISTRAL_OCR_MODEL=mistral-ocr-latest
GITHUB_TOKEN=...
# alias also supported:
# GITHUB_API_TOKEN=...
ENABLE_GITHUB_ENRICHMENT=false
```

Notes:

- `ADMIN_PASSCODE`, `ELEVENLABS_API_KEY`, and `MISTRAL_API_KEY` are required for the main app flow.
- If `KV_REST_API_URL` and `KV_REST_API_TOKEN` are missing, the app falls back to local file storage in `.data/storage.json`.
- GitHub enrichment is disabled unless `ENABLE_GITHUB_ENRICHMENT=true`.
- `NEXT_PUBLIC_APP_URL` falls back to the request origin or `http://localhost:3000`, but setting it explicitly is safer for shared environments.

Run the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
pnpm lint
pnpm build
pnpm start
```

## Key Routes

- `/` admin console for authentication, role creation, and session review
- `/apply/[roleId]` candidate intake flow
- `/session/[sessionId]` candidate live interview session
- `/admin/sessions/[sessionId]` admin transcript and scorecard view
- `/design` design system reference page

## Repo Map

- `app/` App Router pages and API routes
- `components/` feature components
- `components/ui/` shared UI primitives
- `lib/` domain logic, API clients, preprocessing, storage, and validation
- `scripts/` local helper scripts
- `.data/` local persistence fallback

The main service split is:

- `lib/elevenlabs.ts`: agent creation and transcript retrieval
- `lib/mistral.ts`: transcript scoring
- `lib/preprocess.ts`: candidate/job-description preprocessing and interview strategy generation
- `lib/storage.ts`: KV-backed persistence with local JSON fallback
- `lib/interviews.ts`: core types and validation helpers

## UI And Design Guidelines

This repo already defines a shared UI system. Keep new UI aligned with it instead of adding one-off patterns.

- Use shadcn patterns and existing primitives in `components/ui/*` first.
- If a primitive is missing, add it in `components/ui/*` with `cn()` from `lib/utils.ts`.
- Prefer Radix-based accessible primitives over custom interactive widgets.
- Theme tokens live in `app/globals.css`.
- The design reference page is `app/design/page.tsx`.
- Global font setup lives in `app/layout.tsx`.
- Light mode is the default direction.
- The CERNO palette is the brand basis: `#6366F1`, `#8B5CF6`, `#A78BFA`.
- Use `Schibsted Grotesk` for display headlines, `Onest` for UI/body, and `IBM Plex Mono` for technical metadata.
- Prefer token-driven utility classes like `bg-background`, `text-foreground`, `bg-card`, `border-border`, and `bg-primary`.
- Do not introduce bespoke button, input, or card styling in feature components when a shared primitive exists.
- Do not hardcode random color literals in feature JSX unless you are extending the design system itself.

If a feature needs new visual behavior, update the system-level source of truth instead of patching around it locally.

## Development Notes

- The admin console is the main orchestration surface for creating and reviewing sessions.
- Candidate and session flows depend on browser microphone access for ElevenLabs voice interviews.
- Transcript syncing is handled during the live session and finalized again on completion to reduce loss.
- The repository includes `scripts/test-preprocess.ts` for exercising the PDF parsing and preprocessing pipeline against real files.

## Deployment

For Vercel or another hosted environment:

1. Add the required app secrets.
2. Configure Vercel KV if you want persistent shared storage.
3. Set `NEXT_PUBLIC_APP_URL` to the deployed base URL.
4. Run a normal Next.js build and deploy flow.

Without KV, deployment will still boot, but data persistence is only appropriate for local development.
