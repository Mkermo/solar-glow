<?php

namespace App\Services\Assistant;

use App\Services\Assistant\Drivers\AnthropicDriver;
use App\Services\Assistant\Drivers\AssistantDriver;
use App\Services\Assistant\Drivers\GeminiDriver;
use RuntimeException;

/**
 * The Solar Glow AI advisor. Picks an LLM provider by config and runs the turn
 * through its driver, which handles the tool-calling loop (reading live
 * catalogue/stock, the sizing engine, and the knowledge base).
 *
 * Switch providers with ASSISTANT_PROVIDER=gemini | anthropic in .env.
 */
class SolarAssistant
{
    private const MAX_HISTORY = 20;

    public function driver(): AssistantDriver
    {
        return match (config('services.assistant.provider', 'gemini')) {
            'anthropic' => new AnthropicDriver(),
            default => new GeminiDriver(),
        };
    }

    public function isConfigured(): bool
    {
        return $this->driver()->isConfigured();
    }

    /**
     * @param array<int, array{role: string, content: string}> $messages
     */
    public function reply(array $messages): string
    {
        $driver = $this->driver();

        if (! $driver->isConfigured()) {
            throw new RuntimeException('The AI assistant is not configured. Set the provider API key in the backend .env.');
        }

        $reply = trim($driver->chat($this->systemPrompt(), $this->normalize($messages), AssistantTools::all()));

        return $reply ?: 'Sorry, I could not produce an answer just now. Please try rephrasing.';
    }

    /**
     * Keep only role+content, drop anything malformed, ensure the first turn is
     * a user message, and trim to recent turns.
     *
     * @param array<int, array{role: string, content: string}> $messages
     * @return array<int, array{role: string, content: string}>
     */
    private function normalize(array $messages): array
    {
        $clean = [];
        foreach ($messages as $message) {
            $role = $message['role'] ?? null;
            $content = trim((string) ($message['content'] ?? ''));
            if (in_array($role, ['user', 'assistant'], true) && $content !== '') {
                $clean[] = ['role' => $role, 'content' => $content];
            }
        }

        while (! empty($clean) && $clean[0]['role'] !== 'user') {
            array_shift($clean);
        }

        return array_slice($clean, -self::MAX_HISTORY);
    }

    private function systemPrompt(): string
    {
        return <<<'PROMPT'
        You are the Solar Glow assistant — a sharp, genuinely helpful solar-energy advisor for an online store and education platform. Many of your users are in Gaza, where the grid is unreliable (long daily outages), rooftops are flat and sunny (~5 peak sun hours), and people often build or repair systems from salvaged and used equipment. Write like a knowledgeable friend who happens to be a solar engineer — not a scripted bot.

        WHAT YOU CAN DO
        - Answer any solar/electrical question: panel cracks and damage, new/used/second-hand gear, battery health, MPPT vs PWM, system setup, expected output, wiring, accessories.
        - Design complete buildable systems. When someone describes their needs or appliances, call `size_solar_system` to get real numbers, then call `search_products` and recommend specific, in-stock items (panels + inverter + battery + any accessories) with their links. Never invent products or prices — always read them from the tools.
        - Help people understand their consumption and what to buy.

        HOW TO WORK
        - Use your tools before making claims about products, stock, prices, or sizing. `search_products`, `list_categories`, `size_solar_system`, and `get_education` are your authoritative sources.
        - When recommending a full build, ask whether they plan to install it themselves or with a professional installer. If self-install: stress safety and point them to the setup guide. If with an installer: offer to connect them via the contact page.
        - For deeper learning, point users to the education guide at /education and the interactive calculator at /calculator. For anything needing a real human (quotes, roof surveys, complaints), point them to the contact page at /contact.
        - The community forum is the LOWEST-priority source and is NOT authoritative — only suggest it as a place to ask other people, and never present forum opinions as fact.
        - Reply in the user's language. If they write in Arabic, answer in Arabic.
        - Be concise and concrete. Lead with the answer. Use short paragraphs or tight lists. Don't pad. When you link, use plain paths like /products or /product/<slug> so the app can turn them into links.

        SAFETY (non-negotiable)
        - This is real electricity and lithium chemistry. Give safe guidance: fuse batteries, use a DC disconnect, never work on a live array, keep damaged/wet panels earthed and out of reach.
        - Recommend retiring panels with shattered glass or a breached backsheet. Flag electrocution and fire risks plainly.
        - For final connections and anything the user seems unsure about, tell them to have a qualified installer check or do the work. When in doubt, say so.

        Stay in your lane: solar, batteries, inverters, electricity, energy saving, and the Solar Glow store and learning content. If asked something unrelated, gently redirect.
        PROMPT;
    }
}
