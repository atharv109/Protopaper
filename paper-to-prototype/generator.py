import os
from groq import Groq
from prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE, FIX_JSON_PROMPT
from schema import parse_and_validate

MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS = 8000
TEMPERATURE = 0.2        # Low for reliable JSON output
QUALITY_THRESHOLD = 60   # Minimum quality score to accept a result
MAX_ATTEMPTS = 3


def _call_llm(client: Groq, messages: list[dict]) -> str:
    """
    Call Groq with system prompt prepended to messages.
    Returns the text content of the response.
    """
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    response = client.chat.completions.create(
        model=MODEL,
        messages=full_messages,
        temperature=TEMPERATURE,
        max_tokens=MAX_TOKENS,
    )
    return response.choices[0].message.content


def _build_targeted_fix_message(error: str, quality: int) -> str:
    """
    Build a specific, actionable fix prompt based on what went wrong.
    More effective than a generic retry because the model sees exactly what to fix.
    """
    if "JSON parse error" in error:
        return (
            f"Your output had a JSON syntax error: {error}\n\n"
            + FIX_JSON_PROMPT
        )
    if "Structural errors" in error or "Missing top-level keys" in error:
        return (
            f"Your output was missing required fields.\nDetails: {error}\n\n"
            "You MUST include ALL of these top-level keys in your JSON object:\n"
            "  paper, confidence, extracted, datasets, experiment_plan,\n"
            "  reproducibility, pseudocode, starter_code\n\n"
            + FIX_JSON_PROMPT
        )
    if quality < QUALITY_THRESHOLD:
        return (
            f"Your output was valid JSON but the quality score was {quality}/100 "
            f"(minimum required: {QUALITY_THRESHOLD}/100). "
            "The response is too thin. Expand these sections:\n"
            "- experiment_plan.step_by_step: at least 5 concrete, ordered steps.\n"
            "- reproducibility.checklist: at least 3 verification items.\n"
            "- reproducibility.seeding_plan: at least 2 explicit seed lines.\n"
            "- pseudocode: at least 10 lines describing the main loop.\n"
            "- starter_code: a complete, runnable Python script (>200 characters).\n"
            "Return the full improved JSON object now."
        )
    return FIX_JSON_PROMPT


def generate_scaffold(
    text: str,
    title: str = "unknown",
    source: str = "unknown",
    input_type: str = "abstract",
) -> dict:
    """
    Main entry point. Returns parsed scaffold dict.
    Raises ValueError with a user-friendly message on total failure.

    Returned dict includes metadata keys:
      _retry: bool        — True if a retry was needed
      _quality_score: int — 0-100 completeness score
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set. Get a free key at console.groq.com")

    client = Groq(api_key=api_key)

    user_content = USER_PROMPT_TEMPLATE.format(
        input_type=input_type,
        title=title,
        source=source,
        text=text,
    )

    messages = [{"role": "user", "content": user_content}]
    last_error = ""
    last_quality = 0

    for attempt in range(1, MAX_ATTEMPTS + 1):
        raw = _call_llm(client, messages)
        result, error, quality = parse_and_validate(raw)

        # Accept if parsed cleanly and quality meets the threshold
        if result is not None and quality >= QUALITY_THRESHOLD:
            result["_retry"] = (attempt > 1)
            result["_quality_score"] = quality
            return result

        # Determine failure reason for the next targeted fix message
        if result is not None and quality < QUALITY_THRESHOLD:
            last_error = f"quality too low ({quality}/100)"
            last_quality = quality
        else:
            last_error = error or "unknown error"
            last_quality = 0

        if attempt < MAX_ATTEMPTS:
            fix_msg = _build_targeted_fix_message(last_error, last_quality)
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": fix_msg})

    raise ValueError(
        f"Could not generate a valid scaffold after {MAX_ATTEMPTS} attempts. "
        f"Last issue: {last_error}. "
        "Try shortening your abstract or rephrasing it."
    )
