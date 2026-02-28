# Hackathon-Mistral-2026

**Repository:** [GitHamza0206/Hackathon-Mistral-2026](https://github.com/GitHamza0206/Hackathon-Mistral-2026)

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

## video

Cerno Demo Video — Ready                                                                                                                      
                                                                                                                                                
  Location: video/ subfolder
                                                                                                                                                
  Structure                                                                                                                                   
                                                                                                                                                
  video/src/                                                                                                                                    
  ├── Root.tsx / CernoDemo.tsx     — Composition (2700 frames, 30fps, 1920×1080)                                                                
  ├── constants.ts                 — Colors, springs, scene timing                                                                              
  ├── scenes/                      — 8 scenes sequenced across 90 seconds                                                                       
  │   ├── ProblemCompany.tsx       — 0–3s: CV cards rain, "500 applicants"
  │   ├── ProblemCandidate.tsx     — 3–6s: hourglass, cycling rejection bubbles
  │   ├── CernoReveal.tsx          — 6–9s: "CERNO" materializes with tagline
  │   ├── Pipeline.tsx             — 9–17s: 4-node pipeline, AI→Human flow
  │   ├── HowItWorks.tsx           — 17–22s: inputs→waveform→ScoreCard
  │   ├── Specialization.tsx       — 22–24s: 2×2 domain grid
  │   ├── Metrics.tsx              — 24–27s: 75%, 3, 100%, 0 cards
  │   └── CTA.tsx                  — 27–30s: closing message + "CERNO"
  └── components/                  — 10 reusable components

  Commands

  cd video
  npm run studio     # Preview in browser at localhost:3000
  npm run render     # Render to out/cerno-demo.mp4

  Music

  The <Audio> block in CernoDemo.tsx is commented out. When you have your music file:
  1. Place it in video/public/music.mp3
  2. Uncomment the <Audio> block (and add the imports for Audio, staticFile, interpolate, CLAMP)

Assets                                                                                                                                        
   
  Place everything in video/ public:                                                                                                            
                                                            
  video/public/
  ├── logo.png (or logo.svg)
  ├── music.mp3
  └── any other assets (screenshots, icons, etc.)

  I'll reference them via staticFile("logo.png") etc.

  Providing feedback to me

  Just describe what you see and what's wrong. The most useful formats:

  For timing issues:
  "Scene 4 (Pipeline) feels too fast — the nodes illuminate before I can read the labels. Give each node 45 frames instead of 30."

  For visual issues:
  "The CV cards in Scene 1 overlap the headline text. Move the cards higher or the text lower."

  For color/design changes:
  "Change the blue to #3B82F6. The current one feels too light against the dark background."

  For frame-specific feedback:
  Scrub the timeline in Remotion Studio (npm run studio) — the frame counter is in the top bar. Then tell me:
  "At frame 320, node 2 is still muted when it should already be illuminated."

  For adding/removing content:
  "Add a scene between Pipeline and HowItWorks showing a phone screen with the voice interview UI."

  To get started

  1. Drop your logo + music into video/public/
  2. Run cd video && npm run studio
  3. Scrub through, take notes on what to adjust
  4. Tell me everything in one pass — I'll fix it all at once