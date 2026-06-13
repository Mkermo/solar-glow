<?php

namespace App\Services\Assistant\Drivers;

use Anthropic\Client;
use Anthropic\Lib\Tools\BetaRunnableTool;
use App\Services\Assistant\Tools\AssistantTool;

/**
 * Claude (Anthropic) driver — uses the SDK's tool runner to handle the
 * reason → call tool → feed result loop automatically.
 */
class AnthropicDriver implements AssistantDriver
{
    public function isConfigured(): bool
    {
        return ! empty(config('services.anthropic.key'));
    }

    public function chat(string $system, array $messages, array $tools): string
    {
        $client = new Client(apiKey: (string) config('services.anthropic.key'));

        $runnable = array_map(
            fn (AssistantTool $tool) => new BetaRunnableTool(
                definition: [
                    'name' => $tool->name,
                    'description' => $tool->description,
                    'input_schema' => $tool->parameters,
                ],
                run: fn (array $input): string => $tool->run($input),
            ),
            $tools,
        );

        $runner = $client->beta->messages->toolRunner(
            maxTokens: 1500,
            messages: $messages,
            model: (string) config('services.anthropic.model', 'claude-opus-4-8'),
            tools: $runnable,
            maxIterations: 6,
            extraParams: ['system' => $system],
        );

        $final = $runner->runUntilDone();

        $reply = '';
        foreach ($final->content as $block) {
            if ($block->type === 'text') {
                $reply .= $block->text;
            }
        }

        return $reply;
    }
}
