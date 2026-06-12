<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'panels',
                'name' => 'Solar Panels',
                'name_ar' => 'الألواح الشمسية',
                'description' => 'High-efficiency monocrystalline and bifacial panels for homes, businesses and utility-scale arrays.',
                'sort_order' => 1,
            ],
            [
                'slug' => 'inverters',
                'name' => 'Inverters',
                'name_ar' => 'العاكسات',
                'description' => 'String, hybrid and micro inverters with advanced MPPT tracking and system monitoring.',
                'sort_order' => 2,
            ],
            [
                'slug' => 'batteries',
                'name' => 'Batteries',
                'name_ar' => 'البطاريات',
                'description' => 'Lithium storage systems that keep your home running after the sun goes down.',
                'sort_order' => 3,
            ],
            [
                'slug' => 'accessories',
                'name' => 'Accessories',
                'name_ar' => 'الإكسسوارات',
                'description' => 'Connectors, cabling, mounting and protection gear for a clean, safe installation.',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
