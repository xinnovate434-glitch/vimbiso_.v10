import { config } from "./config";

export function aiConfigured() {
  return Boolean(config.gemini.apiKey);
}

/** Short Vimbiso trade assistant via Gemini. */
export async function assistReply(userMessage: string): Promise<string> {
  const key = config.gemini.apiKey;
  if (!key) {
    return userMessage
      ? `Understood: "${userMessage}". Set quantity and your price, then post a bid to the live network.`
      : "Welcome to Vimbiso. Tell me what you need — traders on the network will respond.";
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "You are Vimbiso, assistant for Zimbabwe informal trade. 1-2 short sentences. No fake traders or demo names. User: " +
                    (userMessage || "opened the app"),
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 120 },
        }),
      },
    );
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const t =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ||
      "";
    return t.trim() || "Tell me what you need today.";
  } catch {
    return "Assistant offline — type what you need and post a bid.";
  }
}
