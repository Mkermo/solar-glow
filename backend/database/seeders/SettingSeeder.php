<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'store_name', 'value' => 'Solar Glow', 'group' => 'general'],
            ['key' => 'store_tagline', 'value' => 'The new editorial standard in solar energy.', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'hello@solarglow.test', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+962 7 0000 0000', 'group' => 'contact'],
            ['key' => 'free_shipping_threshold', 'value' => '1000', 'group' => 'shop'],
            ['key' => 'flat_shipping_rate', 'value' => '25', 'group' => 'shop'],
            ['key' => 'currency', 'value' => 'USD', 'group' => 'shop'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
