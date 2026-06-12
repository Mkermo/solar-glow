<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'slug',
        'name',
        'name_ar',
        'description',
        'description_ar',
        'price',
        'sale_price',
        'image_url',
        'stock_quantity',
        'sold_quantity',
        'is_featured',
        'is_hidden',
        'specifications',
        'specifications_ar',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'sale_price' => 'float',
            'is_featured' => 'boolean',
            'is_hidden' => 'boolean',
            'specifications' => 'array',
            'specifications_ar' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_hidden', false);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /**
     * Filament uploads store a relative path; external seeds may store a full URL.
     */
    public function resolvedImageUrl(): ?string
    {
        if (! $this->image_url) {
            return null;
        }

        return Str::startsWith($this->image_url, ['http://', 'https://', '/'])
            ? $this->image_url
            : Storage::disk('public')->url($this->image_url);
    }

    public function effectivePrice(): float
    {
        return $this->sale_price !== null && $this->sale_price > 0
            ? $this->sale_price
            : $this->price;
    }
}
