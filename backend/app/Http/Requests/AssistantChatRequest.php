<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssistantChatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'messages' => ['required', 'array', 'min:1', 'max:40'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:4000'],
        ];
    }

    /**
     * Named `conversation()` rather than `messages()` — the latter is a reserved
     * FormRequest hook for custom validation messages.
     *
     * @return array<int, array{role: string, content: string}>
     */
    public function conversation(): array
    {
        return $this->validated()['messages'];
    }
}
