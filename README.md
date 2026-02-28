# Hackathon-Mistral-2026

Next.js app for the ElevenLabs conversational support agent.

## Stack

- Next.js `16.1.6`
- React `19.2.4`
- App Router

The app is configured for:

- Agent name: `Support agent`
- Agent ID: `agent_2901kjhztrbmezq94c2dqnppp8mh`

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production

Build and run locally:

```bash
npm run build
npm run start
```

## Vercel-oriented implementation notes

- Uses Server Components by default for the landing page
- Loads the ElevenLabs widget script only after user activation
- Avoids sending unnecessary data across the server/client boundary

## Files

- `app/page.tsx`: main landing page
- `app/layout.tsx`: metadata and global layout
- `app/globals.css`: global styling
- `components/voice-console.tsx`: client-side widget activation
- `lib/agent.ts`: shared agent metadata
