<?php

namespace App\Services\Assistant\Tools;

/**
 * Provider-neutral tool definition. Each driver (Anthropic, Gemini, …) adapts
 * these into its own function-calling format, so the tool set is defined once.
 */
final class AssistantTool
{
    /**
     * @param array<string, mixed> $parameters JSON-schema object describing the input
     * @param callable(array<string, mixed>): string $handler
     */
    public function __construct(
        public readonly string $name,
        public readonly string $description,
        public readonly array $parameters,
        private readonly mixed $handler,
    ) {
    }

    /**
     * @param array<string, mixed> $args
     */
    public function run(array $args): string
    {
        return ($this->handler)($args);
    }
}
