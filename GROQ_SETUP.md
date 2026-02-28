# Paper-to-Prototype: Groq Integration Guide

## Overview

This project converts research papers into executable experiment scaffolds using **Groq's free API** (Llama 3.3 70B). The Next.js frontend now calls a real API endpoint that queries Groq instead of using mock data.

## Getting Started

### 1. Get a Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Go to **API Keys** → Create key
4. Copy your key (format: `gsk_...`)

### 2. Configure Environment

**Edit `.env.local`:**

```bash
GROQ_API_KEY=gsk_YOUR_KEY_HERE
```

(Replace `YOUR_KEY_HERE` with your actual key from step 1)

### 3. Install Dependencies

```bash
npm install
```

This installs:
- `groq-sdk` — Groq Node.js client
- `dotenv` — Environment variable loader
- All other Next.js dependencies

### 4. Run the Development Server

```bash
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Project Structure

```
app/
  api/
    generate/
      route.ts          ← API endpoint that calls Groq
  page.tsx              ← Main homepage (calls /api/generate)
  mockData.ts           ← Old mock data (can be removed)

components/
  OutputPanel.tsx       ← Now accepts real data via props

lib/
  types.ts              ← TypeScript schemas (ScaffoldOutput, etc.)
  prompts.ts            ← System prompt, user template, fix prompts

.env.local              ← Your Groq API key (DO NOT commit)
.env.example            ← Template for git
```

## How It Works

### Frontend Flow (page.tsx)

1. User enters text/URL
2. Clicks "Generate Blueprint"
3. Calls `POST /api/generate` with the text
4. Displays loading spinner
5. Receives JSON scaffold from Groq
6. Renders output in OutputPanel

### Backend Flow (app/api/generate/route.ts)

1. Receives request with `{ text, title, source, inputType }`
2. Creates Groq client with API key
3. Builds messages with system prompt + user text
4. Calls Groq's `llama-3.3-70b-versatile` model
5. Parses JSON response
6. Validates schema (all required fields present)
7. Scores quality (0-100 based on completeness)
8. **If quality < 60:** Retries with targeted fix message (3 attempts max)
9. Returns `{ success: true, data: ScaffoldOutput, retries }` or error

### Quality Scoring

- **Base:** 70 points
- **+5** if `experiment_plan.step_by_step` ≥ 5 steps
- **+5** if `reproducibility.checklist` ≥ 3 items
- **+5** if `reproducibility.seeding_plan` ≥ 2 seeds
- **+5** if `pseudocode` ≥ 200 chars
- **+5** if `starter_code` ≥ 200 chars
- **Max:** 100 points

### Retry Logic

If quality < 60, the API:
1. Includes the model's previous response
2. Sends a targeted fix message explaining what's missing
3. Retries up to 3 times total
4. Returns error if all attempts fail

## TypeScript Schema

### Input (GenerateRequest)

```typescript
{
  text: string;           // Paper abstract, text, or URL
  title?: string;         // Paper title or filename
  source?: string;        // Source URL or "webapp"
  inputType?: "pdf" | "url" | "text";
}
```

### Output (ScaffoldOutput)

```typescript
{
  paper: {
    title: string;
    problem_statement: string;
    key_contributions: string[];
  };
  
  extracted: {
    model_architecture: string;
    // training details or other metadata
    training_details: Record<string, string>;
  };
  
  datasets: Array<{
    name: string;
    role: "pre-training" | "fine-tuning" | "evaluation";
    size: string;
  }>;
  
  experiment_plan: {
    problem_statement: string;
    step_by_step: string[];          // ≥5 concrete steps
    hardware_estimate: string;
    time_to_reproduce: string;
  };
  
  reproducibility: {
    checklist: Array<{ text: string; done: boolean }>;
    seeding_plan: string[];          // ≥2 seed lines
    known_issues: string[];
  };
  
  pseudocode: string;                // ≥10 lines
  starter_code: string;              // >200 chars, runnable Python
  confidence: number;                // 0-100 overall confidence
  assumptions: Array<{
    key: string;
    confidence: number;
    note: string;
  }>;
  
  _quality_score?: number;           // Internal: 0-100
  _retry?: boolean;                  // Internal: was retried?
}
```

## Testing

### Quick Test in Browser

1. Go to http://localhost:3000
2. Paste this text into the "Text" tab:

```
We propose a Transformer for image classification on ImageNet. 
AdamW optimizer, learning rate 1e-4, batch size 256, 90 epochs. 
Top-1 accuracy 85.2%, uses MixAugment for data augmentation.
```

3. Click "Generate Blueprint"
4. Wait 2-5 seconds for Groq response

### Debugging API Calls

Check browser DevTools → Network tab to see:
- Request to `/api/generate` with your text
- Response JSON with full scaffold
- Any error messages

### Logs

Server logs appear in your terminal where `npm run dev` is running:
```
GET /api/generate 200 in 3s
```

## Troubleshooting

### "GROQ_API_KEY is not configured"
- Make sure `.env.local` exists
- Verify it contains `GROQ_API_KEY=gsk_...`
- Restart dev server: `npm run dev`
- Note: `.env.local` is local-only, never pushed to git

### API takes >10 seconds
- Groq's free tier has rate limits (~30 req/min)
- Complex prompts take longer (~5-8s typical)
- Basic prompts are faster (~2-3s)

### "Could not generate valid scaffold..." error
- Input text might be too short or unclear
- Try a more detailed abstract with hyperparameters
- Try rephrasing the text

### JSON parse errors
- The API automatically retries with a fix message
- If still failing, check browser console for raw response
- Report the error message

## Production Deployment

### Environment Variables
On Vercel/production:
1. Add environment variable in dashboard: `GROQ_API_KEY=gsk_...`
2. Don't commit `.env.local` to git
3. Use `.env.example` as documentation

### Rate Limiting
Groq free tier: ~30 requests/minute
- Consider adding request queuing for high traffic
- Add client-side validation to prevent spam

### Cost
- **Groq API:** Free tier (up to reasonable limits)
- **Hosting:** Same as any Next.js app

## Architecture Decisions

| Decision | Why |
|----------|-----|
| Groq instead of Claude | Free tier, fast Llama 3.3 70B, good for JSON |
| No PDF parsing yet | Groq can't read files directly; extract text first |
| Retry with targeted fixes | Better quality than simple retries |
| Quality scoring | Ensures minimum completeness before returning |
| JSON-only output | Groq+Llama excels at structured output |

## Next Steps

### Optional: Add PDF Support

1. Install `pdf-parse` or `pdfjs-dist`
2. Extract text in frontend (multipart upload)
3. Send extracted text to `/api/generate`

### Optional: Add URL Fetching

1. Install `cheerio` or `jsdom`
2. Fetch URL, extract paper content
3. Send to `/api/generate`

### Optional: Persist Results

1. Add database (PostgreSQL, MongoDB)
2. Store scaffold results with user
3. Build a "My Experiments" page

---

**Built with Groq | Next.js | TypeScript**
