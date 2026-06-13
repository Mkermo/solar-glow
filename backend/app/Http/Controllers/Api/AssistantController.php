<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssistantChatRequest;
use App\Services\Assistant\SolarAssistant;
use Illuminate\Http\JsonResponse;
use Throwable;

class AssistantController extends Controller
{
    public function __construct(private readonly SolarAssistant $assistant)
    {
    }

    public function chat(AssistantChatRequest $request): JsonResponse
    {
        if (! $this->assistant->isConfigured()) {
            return response()->json([
                'message' => 'The AI assistant is not configured yet.',
            ], 503);
        }

        try {
            $reply = $this->assistant->reply($request->conversation());
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'The assistant is temporarily unavailable. Please try again.',
            ], 502);
        }

        return response()->json(['reply' => $reply]);
    }
}
