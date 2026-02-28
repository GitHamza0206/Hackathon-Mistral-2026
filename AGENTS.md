# AGENTS.md

## UI System Rules

This repo uses a shared design system. Do not introduce ad hoc UI patterns.

### Component stack

- Use `shadcn` components and patterns first.
- Prefer existing primitives in `components/ui/*` before creating new markup.
- When a needed primitive does not exist, add it in `components/ui/*` using shadcn-compatible structure and `cn()` from `lib/utils.ts`.
- Prefer Radix-based, accessible components over custom interactive widgets.

### Design source of truth

- Theme tokens live in `app/globals.css`.
- The design reference page is `app/design/page.tsx`.
- Reusable UI primitives live in `components/ui/*`.
- Global font setup lives in `app/layout.tsx`.

If a UI change conflicts with those files, update the system instead of patching around it locally.

### Visual direction

- Light mode first.
- Use the CERNO palette as the brand basis:
  - `#6366F1`
  - `#8B5CF6`
  - `#A78BFA`
- Keep surfaces bright and readable; use indigo/violet as accents, focus, emphasis, and gradients.
- Do not default to dark mode unless the task explicitly requires it.
- Avoid generic SaaS styling and avoid introducing unrelated colors without a strong reason.

### Typography

- Display font: `Schibsted Grotesk`
- UI/body font: `Onest`
- Mono font: `IBM Plex Mono`

Use:
- display font for major headlines only
- body font for app UI, forms, tables, and dense operational content
- mono font for IDs, technical metadata, URLs, and score values

Do not swap fonts casually. If typography changes, update `app/layout.tsx` and ensure the design page reflects it.

### Implementation rules

- Prefer composing pages from `Card`, `Button`, `Badge`, `Input`, `Textarea`, and future `components/ui/*` primitives.
- Prefer token-driven Tailwind classes (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.) over one-off color literals in JSX.
- Do not hardcode random hex colors in components unless you are extending the design system itself.
- Keep radius large and consistent with the existing token setup.
- Preserve accessible contrast and visible focus states.

### When adding new UI

Before adding a custom section or component:

1. Check whether an existing `components/ui/*` primitive should be used.
2. Check whether the design tokens in `app/globals.css` already cover the needed styling.
3. If not, extend the system in a reusable way.

### Avoid

- bespoke button/input/card styling in feature components
- mixing multiple visual systems on the same page
- dark-only widgets inside otherwise light pages
- replacing shadcn primitives with raw HTML when a shared primitive exists
- generic default fonts like Arial, Inter, Roboto, or system stack fallbacks as the primary design choice

