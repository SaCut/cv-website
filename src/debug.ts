/**
 * Debug sprite logger.
 * POSTs raw AI responses to the Vite dev server which writes them into
 * debug-sprites/ at the repo root.  In production the endpoint doesn't
 * exist so fetch fails silently — nothing ever leaks to the public build.
 */

function timestamp(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  )
}

function safeName(name: string): string {
  return name.replace(/[^a-z0-9_-]/gi, "_").slice(0, 40)
}

/**
 * Log a raw sprite response from the worker.
 * Only active in dev (Vite serves /debug-log).  In prod the request
 * simply fails with a 404 and is silently swallowed.
 *
 * @param request     The user's creature name / prompt.
 * @param imageBase64 Raw base64 or data-URL PNG from CF Workers AI.
 * @param rawResponse Full parsed JSON from the worker (anything goes).
 */
export async function logSpriteResponse(
  request: string,
  imageBase64: string,
  rawResponse: unknown,
): Promise<void> {
  const ts = timestamp()
  const name = safeName(request)
  // Strip imageBase64 from the JSON — it's already saved as the .png.
  const { imageBase64: _omit, ...meta } = rawResponse as Record<string, unknown>
  try {
    await fetch("/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: ts,
        name,
        imageBase64,
        rawResponse: meta,
      }),
    })
    console.info(`[debug] Saved debug-sprites/${ts}_${name}.{png,json}`)
  } catch (e) {
    console.warn("[debug] Log failed (expected in prod):", e)
  }
}
