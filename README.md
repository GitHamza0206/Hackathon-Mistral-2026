# Hackathon-Mistral-2026

Static landing page for the ElevenLabs conversational support agent.

## Local preview

Run any static file server from the project root, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

This project is a plain static site. You can deploy it to any static host, including:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

The page embeds the ElevenLabs widget directly from the CDN and is already configured with:

- Agent name: `Support agent`
- Agent ID: `agent_2901kjhztrbmezq94c2dqnppp8mh`

## Files

- `index.html`: landing page markup and ElevenLabs widget embed
- `styles.css`: layout, typography, motion, and responsive styling
