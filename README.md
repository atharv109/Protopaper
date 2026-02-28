# proto paper

> Paper-to-Prototype: Upload a research paper or paste a URL/text → get runnable experiment scaffolding.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (no UI libraries)
- **Auth**: Simulated via React Context (client-side only)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|---|---|
| `/` | Home — input paper (PDF/URL/Text), generate blueprint |
| `/about` | About page — product overview |
| `/login` | Login — simulates auth, redirects to experiments |
| `/experiments` | List of past experiments (mock data, auth-gated) |
| `/experiments/[id]` | Detail view of a specific experiment |

## Logo

Place your logo at `/public/logo.png`. The provided crumpled paper logo is already included.

## Color Tokens (tailwind.config.ts)

| Token | Hex |
|---|---|
| `bg` | `#010104` |
| `surface-1` | `#1D1360` |
| `surface-2` | `#201186` |
| `accent` | `#5A47B1` |
| `accent-light` | `#8875D6` |
| `muted` | `#60606D` |
| `light` | `#FEFEFE` |
| `lavender` | `#A39ACF` |

## Features

- 🔐 Simulated auth with React Context (no backend)
- 📄 PDF drag-and-drop upload zone
- 🔗 URL input
- ✏️ Text paste with character count
- 🎭 Three output states: Empty / Loading (shimmer) / Populated
- 🪗 Accordion sections with smooth expand/collapse
- 💻 Code block with syntax highlighting + copy-to-clipboard
- 📱 Responsive (stacked on mobile, 2-col on desktop)
- ✨ Glow effects, gradient backgrounds, backdrop blur navbar
