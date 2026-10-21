/** LLM provider seam (blueprint §6).
 *
 * Today everything runs on the deterministic heuristics in `enhance.ts`.
 * To go live with a real model later:
 *  1. Implement `callLlm()` with your provider key in a SERVER function
 *     (never ship keys to the client bundle).
 *  2. Set `VITE_AI_PROVIDER` to the provider name (documented in .env.example).
 * Until then this module throws `AiNotConfiguredError` and callers fall back
 * to heuristics — the site works fully offline either way.
 */

export const AI_PROVIDER = (import.meta.env["VITE_AI_PROVIDER"] as string | undefined) || "";

export class AiNotConfiguredError extends Error {
  constructor() {
    super(
      "AI provider not configured: implement callLlm() in src/lib/ai/provider.ts with a server-side key.",
    );
    this.name = "AiNotConfiguredError";
  }
}

/** The single seam. Not implemented until a provider key exists. */

export async function callLlm(_prompt: string): Promise<string> {
  throw new AiNotConfiguredError();
}
