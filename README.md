# AI Engineer HR Screener

Next.js app for creating reusable role-based AI engineering interviews from a company job-description PDF, collecting candidate materials before the interview, and generating admin-only scorecards after the voice session.

## Required environment variables

```bash
ADMIN_PASSCODE=change-me
ELEVENLABS_API_KEY=...
MISTRAL_API_KEY=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Optional:

```bash
MISTRAL_MODEL=mistral-large-latest
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Notes:
- If Vercel KV variables are missing, the app falls back to in-memory storage for local development only.
- The admin passcode is required before you can create interviews or open admin results pages.

## Routes

- `/` admin role-template creation
- `/apply/[roleId]` candidate intake form for CV, optional cover letter, and GitHub profile URL
- `/session/[sessionId]` candidate-facing live interview page using `@elevenlabs/react`
- `/admin/sessions/[sessionId]` admin-only transcript and scorecard view

## Flow

1. Admin uploads a job-description PDF and creates a reusable role link.
2. Candidate opens the role link and uploads:
   - CV PDF
   - optional cover letter PDF
   - public GitHub profile URL
3. Backend parses the PDFs, creates a candidate-specific ElevenLabs agent, and starts a session.
4. After the call, the transcript is fetched from ElevenLabs and scored with Mistral.

## Deploying on Vercel

1. Create a Vercel KV database and expose the KV env vars to the project.
2. Add the ElevenLabs and Mistral API keys in Vercel project settings.
3. Set `NEXT_PUBLIC_APP_URL` to the production URL.
4. Deploy normally with Vercel.
