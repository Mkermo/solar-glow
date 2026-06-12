<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'author' => 'Layla Haddad',
                'role' => 'Homeowner, Amman',
                'quote' => 'Our bill dropped to almost nothing the first month. The panels look stunning on the roof and the whole process felt effortless.',
                'rating' => 5,
                'sort_order' => 1,
            ],
            [
                'author' => 'Omar Khalil',
                'role' => 'Farm Owner',
                'quote' => 'The hybrid inverter and battery kept our irrigation running through every outage this summer. Quality gear, honest advice.',
                'rating' => 5,
                'sort_order' => 2,
            ],
            [
                'author' => 'Sara Mansour',
                'role' => 'Architect',
                'quote' => 'I specify Solar Glow for my clients because the documentation is impeccable and the hardware always matches the spec sheet.',
                'rating' => 5,
                'sort_order' => 3,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::updateOrCreate(['author' => $testimonial['author']], $testimonial);
        }
    }
}
