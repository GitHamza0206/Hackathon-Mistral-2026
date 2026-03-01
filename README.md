# AI Engineer Screener

Role-driven AI screening app built with Next.js, ElevenLabs, and Mistral. Admins create reusable interview templates from a job description, candidates upload their materials, and the system spins up a voice interview agent and produces an admin-only scorecard after the session.

## Project Context

This repo is organized around a simple hiring workflow:

1. An admin authenticates with a passcode on `/`.
2. The admin creates a reusable role template manually or from a job-description PDF.
3. A candidate opens `/apply/[roleId]` and submits their name, CV, optional cover letter, GitHub URL, and optional note.
4. The backend preprocesses the candidate context, creates a dedicated ElevenLabs conversational agent, and starts a live screening session at `/session/[sessionId]`.
5. Before the interview starts, the candidate completes a readiness checklist (mic test, browser check, quiet environment) and sees role-specific prep tips.
6. During the live session, the candidate sees a progress bar, mic level meter, and connection quality indicator.
7. The transcript is synced during the call and finalized at the end of the session.
8. After the session, the candidate can leave star-rating feedback about their experience.
9. Mistral generates the scorecard for `/admin/sessions/[sessionId]`.

Important evaluation rule: uploaded materials are used to tailor the interview, but scoring is intended to rely on the interview transcript.

## Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- shadcn-style UI primitives in `components/ui/*`
- Phosphor Icons (`@phosphor-icons/react`) with `weight="duotone"`
- Radix UI primitives (`@radix-ui/react-checkbox`, `@radix-ui/react-dialog`, etc.)
- ElevenLabs Conversational AI for live voice interviews
- Mistral for job-description extraction, preprocessing, and scorecards
- Web Audio API for real-time mic level metering
- Vercel KV for deployed persistence
- Local JSON fallback in `.data/storage.json` for local development
- Remotion for demo video generation

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

# AWS Bedrock (optional — routes preprocessing + scoring through Bedrock instead of Mistral API)
USE_BEDROCK=true
AWS_BEARER_TOKEN_BEDROCK=...
AWS_REGION=us-east-1
BEDROCK_MISTRAL_MODEL=mistral.mistral-large-2407-v1:0
```

Notes:

- `ADMIN_PASSCODE`, `ELEVENLABS_API_KEY`, and `MISTRAL_API_KEY` are required for the main app flow.
- If `KV_REST_API_URL` and `KV_REST_API_TOKEN` are missing, the app falls back to local file storage in `.data/storage.json`.
- GitHub enrichment is disabled unless `ENABLE_GITHUB_ENRICHMENT=true`.
- `NEXT_PUBLIC_APP_URL` falls back to the request origin or `http://localhost:3000`, but setting it explicitly is safer for shared environments.
- **Bedrock mode**: Set `USE_BEDROCK=true` to route preprocessing and scoring through AWS Bedrock instead of the Mistral API directly. You need a Bedrock API key (`AWS_BEARER_TOKEN_BEDROCK`) generated from the [AWS Bedrock console](https://console.aws.amazon.com/bedrock). PDF OCR still uses the Mistral API (`MISTRAL_API_KEY` is still required).

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

## Features

### Admin Experience

- **Admin console** — Single-page dashboard with tabbed views (Interviews, Candidates, Create Role) for managing the full hiring pipeline
- **Role creation** — Create interview templates manually or by uploading a job-description PDF (parsed via Mistral OCR)
- **Interview details page** — Deep-dive view per role showing configuration, metrics, job description, and all candidate sessions
- **Scorecard review** — Full transcript + AI-generated scorecard per candidate with dimensional scores, strengths, concerns, and follow-up questions
- **Candidate comparison** — Side-by-side scorecard comparison for 2-3 candidates on the same role, showing dimensional score bars, strengths, and concerns
- **Bulk actions** — Select multiple candidates via checkboxes in table/kanban view to reject or advance at once
- **Notification badges** — Highlight new sessions or freshly scored candidates since the admin's last visit (localStorage-tracked)
- **Score distribution chart** — Pure SVG histogram per role showing score spread across reject/review/advance zones
- **Session timeline** — Horizontal timeline showing when each candidate started and ended their interview
- **Download buttons** — Export transcript as `.txt` and scorecard as `.json` from the session review page
- **Candidate experience feedback** — View star ratings and comments left by candidates after their interviews
- **Table and Kanban views** — Toggle between table and card-based views for candidate management

### Candidate Experience

- **Pre-interview checklist** — Automated mic test (via `getUserMedia`), browser compatibility check, and manual quiet-environment confirmation before starting
- **Interview prep tips** — Role-specific tips based on focus areas (system design, coding, LLM engineering, etc.) shown before the interview
- **Progress bar** — Subtle time-remaining indicator during the interview that changes color at warning and danger thresholds
- **Connection quality indicator** — Real-time mic level meter (Web Audio API) and connectivity status dot (good/fair/poor based on message gap)
- **Dynamic speaking animation** — Visual feedback showing when the AI interviewer is speaking
- **Post-interview feedback** — Star rating and optional comment form after completing the interview

## Key Routes

### Pages

- `/` — Admin console: authentication, role creation, and session review
- `/apply/[roleId]` — Candidate intake flow (name, CV, cover letter, GitHub, notes)
- `/session/[sessionId]` — Candidate live interview session with voice AI
- `/admin/sessions/[sessionId]` — Admin transcript and scorecard view
- `/admin/interviews/[roleId]` — Admin interview details with metrics, charts, and candidate list
- `/design` — Design system reference page

### API Routes

- `POST /api/admin/roles` — Create a new role template
- `GET /api/admin/roles/[roleId]` — Get role template details
- `POST /api/admin/roles/extract` — Extract role from job-description PDF
- `GET /api/admin/session` — List all sessions (admin)
- `GET|PATCH /api/admin/sessions/[sessionId]` — Get or update a session (admin)
- `POST /api/admin/sessions/bulk-status` — Bulk update session statuses (reject/advance/review, max 50)
- `GET /api/roles/[roleId]` — Public role info for candidate apply page
- `POST /api/roles/[roleId]/candidate-session` — Create a new candidate session
- `GET /api/sessions/[sessionId]` — Get session bootstrap data
- `POST /api/sessions/[sessionId]/start` — Start the interview (creates ElevenLabs agent)
- `POST /api/sessions/[sessionId]/sync` — Sync transcript during live session
- `POST /api/sessions/[sessionId]/complete` — Finalize session and trigger scoring
- `POST /api/sessions/[sessionId]/feedback` — Submit candidate experience feedback

## Repo Map

```
app/                          App Router pages and API routes
├── admin/
│   ├── interviews/[roleId]/  Interview details page (metrics, charts, candidates)
│   └── sessions/[sessionId]/ Session review page (transcript, scorecard)
├── api/                      API route handlers
├── apply/[roleId]/           Candidate intake page
├── session/[sessionId]/      Live interview page
├── design/                   Design system reference
├── globals.css               Theme tokens and feature styles
└── layout.tsx                Root layout with fonts

components/                   Feature components
├── admin-console.tsx         Main admin dashboard (tabs, bulk selection, notifications)
├── bulk-action-bar.tsx       Floating bar for bulk reject/advance actions
├── candidate-apply.tsx       Candidate application form
├── candidate-comparison-dialog.tsx  Side-by-side scorecard comparison
├── download-buttons.tsx      Transcript/scorecard export
├── interview-prep-tips.tsx   Focus-area-based tips before interview
├── interview-session.tsx     Core interview UI (voice, timer, progress, mic meter)
├── interview-sessions-list.tsx  Candidate sessions list with compare button
├── pre-interview-checklist.tsx  Mic/browser/environment readiness checks
├── score-distribution-chart.tsx  SVG histogram of score distribution
├── session-timeline.tsx      Horizontal timeline of interview sessions
└── ui/                       Shared UI primitives (badge, button, card, checkbox,
                              dialog, input, table, tabs, textarea)

lib/                          Domain logic and services
├── admin-auth.ts             Admin authentication helpers
├── bedrock.ts                AWS Bedrock client for Mistral chat calls
├── elevenlabs.ts             Agent creation and transcript retrieval
├── env.ts                    Environment variable helpers
├── github.ts                 GitHub API client (fetch public repos)
├── interviews.ts             Core types (SessionBootstrap, CandidateSessionRecord, etc.)
├── mistral.ts                Transcript scoring via Mistral (or Bedrock)
├── preprocess.ts             Candidate/JD preprocessing and interview strategy
├── prompt.ts                 System prompt and session bootstrap builder
├── storage.ts                KV-backed persistence with local JSON fallback
├── utils.ts                  cn() utility for class merging
└── validation.ts             Input validation helpers

scripts/                      Local helper scripts
├── test-preprocess.ts        Exercise PDF parsing pipeline

video/                        Remotion demo video
├── src/                      Video source (scenes, components)
└── package.json              Separate dependency tree (Remotion 4.x)

.data/                        Local persistence fallback (storage.json)
```

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
- Use Phosphor Icons with `weight="duotone"` for all iconography.
- Prefer token-driven utility classes like `bg-background`, `text-foreground`, `bg-card`, `border-border`, and `bg-primary`.
- Do not introduce bespoke button, input, or card styling in feature components when a shared primitive exists.
- Do not hardcode random color literals in feature JSX unless you are extending the design system itself.

If a feature needs new visual behavior, update the system-level source of truth instead of patching around it locally.

## Development Notes

- The admin console is the main orchestration surface for creating and reviewing sessions.
- Candidate and session flows depend on browser microphone access for ElevenLabs voice interviews.
- Candidate interview sessions use the ElevenLabs WebSocket connection path with the public `agentId` flow for stability.
- Transcript syncing is handled during the live session and finalized again on completion to reduce loss.
- The pre-interview checklist auto-tests the microphone via `getUserMedia` and checks browser API support (`MediaDevices`, `AudioContext`, `WebSocket`).
- Real-time mic level metering uses `AudioContext` + `AnalyserNode` with `requestAnimationFrame` polling.
- Connection quality is derived from the gap between WebSocket messages (>20s = poor, >10s = fair, else good).
- Score distribution uses pure SVG (no charting library) for zero-dependency histograms.
- Notification badges track the admin's last visit time in `localStorage`.
- Bulk actions are capped at 50 sessions per request and use `Promise.allSettled` for partial-failure resilience.
- The repository includes `scripts/test-preprocess.ts` for exercising the PDF parsing and preprocessing pipeline against real files.

## Demo Video

The `video/` directory contains a Remotion project for generating a 90-second product demo video (1920x1080, 30fps, 8 scenes).

```bash
cd video
npm install

# Interactive preview
npx remotion studio src/index.ts

# Render to MP4
npx remotion render src/index.ts CernoDemo out/cerno-demo.mp4 --codec h264
```

## Deployment

For Vercel or another hosted environment:

1. Add the required app secrets.
2. Configure Vercel KV if you want persistent shared storage.
3. Set `NEXT_PUBLIC_APP_URL` to the deployed base URL.
4. Run a normal Next.js build and deploy flow.

Without KV, deployment will still boot, but data persistence is only appropriate for local development.
