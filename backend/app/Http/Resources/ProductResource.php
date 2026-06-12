<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'name_ar' => $this->name_ar,
            'description' => $this->description,
            'description_ar' => $this->description_ar,
            'price' => $this->price,
            'sale_price' => $this->sale_price,
            'effective_price' => $this->effectivePrice(),
            'image_url' => $this->resolvedImageUrl(),
            'stock_quantity' => $this->stock_quantity,
            'in_stock' => $this->stock_quantity > 0,
            'is_featured' => $this->is_featured,
            'specifications' => $this->specifications,
            'specifications_ar' => $this->specifications_ar,
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
