import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { ScaffoldOutput, GenerateRequest, GenerateResponse } from "@/lib/types";
import { SYSTEM_PROMPT, USER_PROMPT_TEMPLATE, FIX_JSON_PROMPT } from "@/lib/prompts";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.2; // Low for reliable JSON output
const QUALITY_THRESHOLD = 60;
const MAX_ATTEMPTS = 3;

/**
 * Validates that the JSON response has all required keys
 */
function validateScaffold(data: any): {
  valid: boolean;
  quality: number;
  error: string | null;
} {
  const requiredKeys = [
    "paper",
    "extracted",
    "datasets",
    "experiment_plan",
    "reproducibility",
    "pseudocode",
    "starter_code",
    "confidence",
    "assumptions",
  ];

  const missingKeys = requiredKeys.filter((key) => !(key in data));
  if (missingKeys.length > 0) {
    return {
      valid: false,
      quality: 0,
      error: `Missing keys: ${missingKeys.join(", ")}`,
    };
  }

  // Quality scoring
  let quality = 70; // base score

  // Bonus for thoroughness
  if (
    data.experiment_plan?.step_by_step &&
    data.experiment_plan.step_by_step.length >= 5
  )
    quality += 5;
  if (
    data.reproducibility?.checklist &&
    data.reproducibility.checklist.length >= 3
  )
    quality += 5;
  if (
    data.reproducibility?.seeding_plan &&
    data.reproducibility.seeding_plan.length >= 2
  )
    quality += 5;
  if (data.pseudocode && data.pseudocode.length >= 200) quality += 5;
  if (data.starter_code && data.starter_code.length >= 200) quality += 5;

  // Cap at 100
  quality = Math.min(100, quality);

  return { valid: true, quality, error: null };
}

/**
 * Calls Groq API and returns raw text response
 */
async function callGroq(
  client: Groq,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): Promise<string> {
  const fullMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...messages,
  ];

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: fullMessages,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    });

    return response.choices[0].message.content || "";
  } catch (err: any) {
    // Groq SDK may throw an error object with status/code info
    const msg = err?.message || JSON.stringify(err);
    if (
      err?.status === 429 ||
      msg.includes("Rate limit") ||
      msg.includes("rate_limit_exceeded")
    ) {
      // Bubble a clear rate-limit error message up
      throw new Error(
        `RateLimitError: ${msg}`
      );
    }
    throw err;
  }
}

/**
 * Builds targeted fix message based on error
 */
function buildFixMessage(error: string, quality: number): string {
  if (error.includes("Missing keys")) {
    return (
      `Your JSON is missing required keys. Details: ${error}\n\n` + FIX_JSON_PROMPT
    );
  }

  if (quality < QUALITY_THRESHOLD) {
    return (
      `Your JSON is valid but quality is too low (${quality}/100, need ${QUALITY_THRESHOLD}+). ` +
      "Expand the following:\n" +
      "- experiment_plan.step_by_step: at least 5 concrete steps\n" +
      "- reproducibility.checklist: at least 3 verification items\n" +
      "- reproducibility.seeding_plan: at least 2 explicit seed lines\n" +
      "- pseudocode: at least 10 lines\n" +
      "- starter_code: complete, runnable Python (>200 chars)\n\n" +
      FIX_JSON_PROMPT
    );
  }

  return FIX_JSON_PROMPT;
}

/**
 * POST /api/generate
 * Accepts paper text and returns a scaffold
 */
export async function POST(req: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY is not configured. Set it in .env.local",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as GenerateRequest;
    const { text, title = "unknown", source = "unknown", inputType = "text" } = body;

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Text must be at least 20 characters",
        },
        { status: 400 }
      );
    }

    const client = new Groq({ apiKey });

    const userContent = USER_PROMPT_TEMPLATE.replace(
      "{input_type}",
      inputType
    )
      .replace("{title}", title)
      .replace("{source}", source)
      .replace("{text}", text);

    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      { role: "user", content: userContent },
    ];

    let lastError = "";
    let lastQuality = 0;
    let retries = 0;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const raw = await callGroq(client, messages);

      // Parse JSON response
      let result: any;
      try {
        result = JSON.parse(raw);
      } catch (parseError) {
        lastError = `JSON parse error: ${(parseError as Error).message}`;
        lastQuality = 0;

        if (attempt < MAX_ATTEMPTS) {
          retries++;
          messages.push({ role: "assistant", content: raw });
          messages.push({ role: "user", content: FIX_JSON_PROMPT });
        }
        continue;
      }

      // Validate structure
      const validation = validateScaffold(result);
      if (!validation.valid) {
        lastError = validation.error || "Validation failed";
        lastQuality = 0;

        if (attempt < MAX_ATTEMPTS) {
          retries++;
          messages.push({ role: "assistant", content: raw });
          messages.push({
            role: "user",
            content: buildFixMessage(lastError, lastQuality),
          });
        }
        continue;
      }

      // Check quality threshold
      if (validation.quality < QUALITY_THRESHOLD) {
        lastError = `Quality too low (${validation.quality}/100)`;
        lastQuality = validation.quality;

        if (attempt < MAX_ATTEMPTS) {
          retries++;
          messages.push({ role: "assistant", content: raw });
          messages.push({
            role: "user",
            content: buildFixMessage(lastError, lastQuality),
          });
        }
        continue;
      }

      // Success! Return the result
      return NextResponse.json({
        success: true,
        data: {
          ...result,
          _quality_score: validation.quality,
          _retry: retries > 0,
        } as ScaffoldOutput,
        retries,
      });
    }

    // All attempts failed
    return NextResponse.json(
      {
        success: false,
        error: `Could not generate valid scaffold after ${MAX_ATTEMPTS} attempts. Last error: ${lastError}`,
        retries,
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Generate API error:", error);
    const msg = error?.message || String(error);
    let status = 500;
    // if we wrapped a rate-limit error, respond accordingly
    if (msg.startsWith("RateLimitError") || msg.includes("Rate limit")) {
      status = 429;
    }
    return NextResponse.json(
      {
        success: false,
        error: `Server error: ${msg}`,
      },
      { status }
    );
  }
}
