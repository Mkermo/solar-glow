<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'How much can I save by switching to solar?',
                'answer' => 'Most households cut their electricity bill by 50–90% depending on system size, roof orientation and local sunlight hours. Our team can run a free savings estimate for your home.',
                'sort_order' => 1,
            ],
            [
                'question' => 'How long do solar panels last?',
                'answer' => 'Our panels carry 20–35 year performance warranties. After 25 years a quality panel typically still produces over 85% of its original output.',
                'sort_order' => 2,
            ],
            [
                'question' => 'Do I need a battery with my solar system?',
                'answer' => 'No — grid-tied systems work without storage. A battery adds backup power during outages and lets you use your own solar energy at night, which makes sense where grid power is unreliable or expensive.',
                'sort_order' => 3,
            ],
            [
                'question' => 'What is the difference between string and micro inverters?',
                'answer' => 'A string inverter converts power for the whole array at one point, while microinverters optimise each panel individually — better for shaded or complex roofs, at a slightly higher cost.',
                'sort_order' => 4,
            ],
            [
                'question' => 'Do you ship and install?',
                'answer' => 'We ship nationwide with free delivery on orders over $1,000. Professional installation can be arranged through our certified partner network — contact us for a quote.',
                'sort_order' => 5,
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'Orders are placed online and confirmed by our team; we currently support cash on delivery and bank transfer. Card payments are coming soon.',
                'sort_order' => 6,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(['question' => $faq['question']], $faq);
        }
    }
}
