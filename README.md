# proto paper

> Paper-to-Prototype: Upload a research paper or paste a URL/text → get runnable experiment scaffolding powered by **Groq**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (no UI libraries)
- **AI**: Groq API (Llama 3.3 70B) — **free tier**
- **Auth**: Simulated via React Context (client-side only)

## Getting Started

### Quick Start (Windows)

```powershell
.\setup.bat
npm run dev
```

### Quick Start (macOS/Linux)

```bash
chmod +x setup.sh
./setup.sh
npm run dev
```

### Manual Setup

1. Install dependencies: `npm install`
2. Get a free Groq API key at [console.groq.com](https://console.groq.com)
3. Create `.env.local` and add: `GROQ_API_KEY=gsk_YOUR_KEY_HERE`
4. Run: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

**See [GROQ_SETUP.md](GROQ_SETUP.md) for detailed guide.**

## Features

✅ **AI-Powered Scaffold Generation**
- Groq API (free) with Llama 3.3 70B
- Fast 2-5 second generation time
- Extracts: problem statement, architecture, datasets
- Generates: checklist, seeding plan, pseudocode, runnable code
- **Graceful handling of rate limits** – shows friendly error when daily tokens are exhausted

✅ **Research Paper Input**
- Drag-and-drop PDF upload zone
- Paste paper URL (arXiv, Semantic Scholar)
- Paste paper text (abstract, methods, full paper)

✅ **Quality Assurance**
- JSON schema validation
- Quality scoring (0-100)
- Automatic retries with targeted fixes
- Up to 3 attempts per request

✅ **User Interface**
- Three output states: Empty / Loading / Populated
- Accordion sections with smooth expand/collapse
- Code block with syntax highlighting
- Responsive (stacked on mobile, 2-col on desktop)
- Glow effects, gradients, backdrop blur

## Routes

| Route | Description |
|---|---|
| `/` | Home — input paper, generate blueprint |
| `/about` | About page |
| `/login` | Login (simulated) |
| `/experiments` | List of experiments |
| `/experiments/[id]` | Experiment detail |

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/generate` | POST | Generate scaffold from paper text |

## Project Structure

```
app/
├── api/generate/route.ts     ← Groq API endpoint
├── page.tsx                  ← Main homepage
└── ...

components/
├── OutputPanel.tsx           ← Real scaffold display
└── ...

lib/
├── types.ts                  ← TypeScript schemas
└── prompts.ts                ← Groq system/user prompts

.env.local                     ← Your Groq API key
.env.example                   ← Template
GROQ_SETUP.md                  ← Setup guide
```

## Logo

Place logo at `/public/logo.png` (crumpled paper logo included).

## Color Tokens

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

---

**Built with Groq | Next.js | TypeScript | Tailwind CSS**
