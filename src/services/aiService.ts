import { generateSolarAIResponse } from "@/lib/solarAIResponses";

export type AIRole = "system" | "user" | "assistant";

export type AIMessage = {
  role: AIRole;
  content: string;
};

type GetAIResponseOpts = {
  language?: "en" | "ar";
  abortSignal?: AbortSignal;
};

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_MODEL = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || "gpt-4o-mini";
const CUSTOM_AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT as string | undefined; // Optional proxy endpoint

function buildSystemPrompt(language: "en" | "ar" = "en"): string {
  const base =
    "You are Solar Assistant, a helpful expert in solar energy systems. " +
    "Answer clearly, concisely (under 200 words unless asked), and provide practical steps. " +
    "When appropriate, include simple bullet points and cautions. " +
    "If asked for calculations, explain the formula and show a short example. ";

  const langHint =
    language === "ar"
      ? "Respond in clear Modern Standard Arabic."
      : "Respond in English.";
  return `${base}${langHint}`;
}

async function callCustomEndpoint(messages: AIMessage[], opts?: GetAIResponseOpts): Promise<string> {
  if (!CUSTOM_AI_ENDPOINT) throw new Error("Missing VITE_AI_ENDPOINT");
  const res = await fetch(CUSTOM_AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, language: opts?.language }),
    signal: opts?.abortSignal,
  });
  if (!res.ok) throw new Error(`AI endpoint error: ${res.status}`);
  const data = await res.json();
  // Expect { content: string }
  return data.content || data.answer || "";
}

async function callOpenAI(messages: AIMessage[], opts?: GetAIResponseOpts): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error("Missing VITE_OPENAI_API_KEY");

  // OpenAI API expects messages including system
  const payload = {
    model: OPENAI_MODEL,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: 0.3,
  } as const;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
    signal: opts?.abortSignal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  return content ?? "";
}

export async function getAIResponse(
  userMessage: string,
  history: AIMessage[],
  opts?: GetAIResponseOpts
): Promise<string> {
  const language = opts?.language ?? "en";

  // Compose message array with system prompt
  const system: AIMessage = { role: "system", content: buildSystemPrompt(language) };
  const messages: AIMessage[] = [system, ...history, { role: "user", content: userMessage }];

  // Preferred: custom proxy endpoint
  try {
    if (CUSTOM_AI_ENDPOINT) {
      return await callCustomEndpoint(messages, opts);
    }
  } catch (e) {
    console.warn("Custom AI endpoint failed, falling back:", e);
  }

  // Direct OpenAI call (not recommended for production in the browser)
  try {
    if (OPENAI_API_KEY) {
      return await callOpenAI(messages, opts);
    }
  } catch (e) {
    console.warn("OpenAI call failed, falling back to local responses:", e);
  }

  // Fallback: local, keyword-based responses
  // Double check for Arabic characters to ensure proper language detection
  const hasArabicChars = /[\u0600-\u06FF]/.test(userMessage);
  const detectedLanguage = hasArabicChars ? "ar" : language;
  return generateSolarAIResponse(userMessage, history, detectedLanguage);
}

export function getAIProvider(): "custom" | "openai" | "local" {
  if (CUSTOM_AI_ENDPOINT) return "custom";
  if (OPENAI_API_KEY) return "openai";
  return "local";
}
