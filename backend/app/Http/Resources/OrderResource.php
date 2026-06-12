<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'reference' => $this->reference,
            'status' => $this->whenLoaded('status', fn () => [
                'slug' => $this->status->slug,
                'name' => $this->status->name,
                'name_ar' => $this->status->name_ar,
            ]),
            'customer_name' => $this->customer_name,
            'city' => $this->city,
            'subtotal' => $this->subtotal,
            'shipping' => $this->shipping,
            'total' => $this->total,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'placed_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
