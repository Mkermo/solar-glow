<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    public static function get(string $key, ?string $default = null): ?string
    {
        return Cache::remember(
            "settings.{$key}",
            now()->addMinutes(10),
            fn () => static::query()->where('key', $key)->value('value') ?? $default,
        );
    }

    protected static function booted(): void
    {
        static::saved(fn (self $setting) => Cache::forget("settings.{$setting->key}"));
        static::deleted(fn (self $setting) => Cache::forget("settings.{$setting->key}"));
    }
}
