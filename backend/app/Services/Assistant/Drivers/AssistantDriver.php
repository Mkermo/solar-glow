<?php

namespace App\Services\Assistant\Drivers;

use App\Services\Assistant\Tools\AssistantTool;

interface AssistantDriver
{
    /**
     * True when the provider has the credentials it needs to run.
     */
    public function isConfigured(): bool;

    /**
     * Run one assistant turn (with automatic tool-calling) and return the reply text.
     *
     * @param array<int, array{role: string, content: string}> $messages
     * @param array<int, AssistantTool> $tools
     */
    public function chat(string $system, array $messages, array $tools): string;
}
