<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'reference',
        'order_status_id',
        'customer_name',
        'email',
        'phone',
        'address',
        'city',
        'notes',
        'subtotal',
        'shipping',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'shipping' => 'float',
            'total' => 'float',
        ];
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(OrderStatus::class, 'order_status_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
