<?php

namespace Database\Seeders;

use App\Models\OrderStatus;
use Illuminate\Database\Seeder;

class OrderStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['slug' => OrderStatus::PENDING, 'name' => 'Pending', 'name_ar' => 'قيد الانتظار', 'color' => 'warning', 'sort_order' => 1],
            ['slug' => OrderStatus::CONFIRMED, 'name' => 'Confirmed', 'name_ar' => 'مؤكد', 'color' => 'info', 'sort_order' => 2],
            ['slug' => OrderStatus::SHIPPED, 'name' => 'Shipped', 'name_ar' => 'تم الشحن', 'color' => 'primary', 'sort_order' => 3],
            ['slug' => OrderStatus::DELIVERED, 'name' => 'Delivered', 'name_ar' => 'تم التوصيل', 'color' => 'success', 'sort_order' => 4],
            ['slug' => OrderStatus::CANCELLED, 'name' => 'Cancelled', 'name_ar' => 'ملغى', 'color' => 'danger', 'sort_order' => 5],
        ];

        foreach ($statuses as $status) {
            OrderStatus::updateOrCreate(['slug' => $status['slug']], $status);
        }
    }
}
