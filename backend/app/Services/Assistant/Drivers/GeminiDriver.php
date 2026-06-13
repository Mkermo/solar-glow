<?php

namespace App\Services\Assistant\Drivers;

use App\Services\Assistant\Tools\AssistantTool;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Google Gemini driver — talks to the generateContent REST endpoint directly
 * and runs the function-calling loop by hand (reason → functionCall → execute →
 * functionResponse → repeat). Works on Google AI Studio's free tier.
 */
class GeminiDriver implements AssistantDriver
{
    private const MAX_ITERATIONS = 6;
    private const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function isConfigured(): bool
    {
        return ! empty(config('services.gemini.key'));
    }

    public function chat(string $system, array $messages, array $tools): string
    {
        $model = (string) config('services.gemini.model', 'gemini-2.5-flash');
        $url = self::ENDPOINT."/{$model}:generateContent";

        /** @var array<string, AssistantTool> $toolsByName */
        $toolsByName = [];
        $declarations = [];
        foreach ($tools as $tool) {
            $toolsByName[$tool->name] = $tool;
            $declarations[] = [
                'name' => $tool->name,
                'description' => $tool->description,
                'parameters' => $tool->parameters,
            ];
        }

        $contents = array_map(fn (array $m) => [
            'role' => $m['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $m['content']]],
        ], $messages);

        for ($i = 0; $i < self::MAX_ITERATIONS; $i++) {
            $response = Http::timeout(60)
                ->retry(2, 300)
                ->post($url.'?key='.urlencode((string) config('services.gemini.key')), [
                    'systemInstruction' => ['parts' => [['text' => $system]]],
                    'contents' => $contents,
                    'tools' => [['functionDeclarations' => $declarations]],
                    'generationConfig' => ['maxOutputTokens' => 1500, 'temperature' => 0.4],
                ]);

            if (! $response->successful()) {
                throw new RuntimeException('Gemini API error: '.$response->status().' '.$response->body());
            }

            $parts = $response->json('candidates.0.content.parts', []);
            $functionCalls = array_filter($parts, fn ($p) => isset($p['functionCall']));

            if (empty($functionCalls)) {
                $text = implode('', array_map(fn ($p) => $p['text'] ?? '', $parts));

                return $text;
            }

            // Record the model's tool-call turn, then answer each call.
            $contents[] = ['role' => 'model', 'parts' => $parts];

            $responseParts = [];
            foreach ($functionCalls as $part) {
                $call = $part['functionCall'];
                $name = $call['name'] ?? '';
                $args = $call['args'] ?? [];
                $tool = $toolsByName[$name] ?? null;

                $result = $tool
                    ? $tool->run(is_array($args) ? $args : [])
                    : json_encode(['error' => "Unknown tool {$name}"]);

                $functionResponse = ['name' => $name, 'response' => ['result' => json_decode($result, true) ?? $result]];
                if (isset($call['id'])) {
                    $functionResponse['id'] = $call['id']; // Gemini 3+ requires echoing the call id
                }

                $responseParts[] = ['functionResponse' => $functionResponse];
            }

            $contents[] = ['role' => 'user', 'parts' => $responseParts];
        }

        return '';
    }
}
