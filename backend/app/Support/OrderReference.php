<?php

namespace App\Support;

use App\Models\Order;
use Illuminate\Support\Str;

/**
 * Generates short, human-friendly, unique order tracking codes (e.g. SG-7K2M9QX4).
 */
class OrderReference
{
    public static function generate(): string
    {
        do {
            $reference = 'SG-'.Str::upper(Str::random(8));
        } while (Order::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
