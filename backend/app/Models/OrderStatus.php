<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderStatus extends Model
{
    public const PENDING = 'pending';
    public const CONFIRMED = 'confirmed';
    public const SHIPPED = 'shipped';
    public const DELIVERED = 'delivered';
    public const CANCELLED = 'cancelled';

    protected $fillable = [
        'slug',
        'name',
        'name_ar',
        'color',
        'sort_order',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public static function idFor(string $slug): int
    {
        return static::query()->where('slug', $slug)->value('id');
    }
}
