<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            OrderStatusSeeder::class,
            SettingSeeder::class,
            ProductSeeder::class,
            FaqSeeder::class,
            TestimonialSeeder::class,
        ]);

        $this->seedAdminUser();
    }

    /**
     * Credentials come from the environment — never hardcode them.
     * If no ADMIN_PASSWORD is set, a random one is generated and printed once.
     */
    private function seedAdminUser(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@solarglow.test');

        if (User::query()->where('email', $email)->exists()) {
            return;
        }

        $password = env('ADMIN_PASSWORD') ?: Str::password(16);

        User::create([
            'name' => 'Admin',
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        if (! env('ADMIN_PASSWORD')) {
            $this->command?->warn("Admin user created: {$email}");
            $this->command?->warn("Generated password (save it now, it will not be shown again): {$password}");
        }
    }
}
