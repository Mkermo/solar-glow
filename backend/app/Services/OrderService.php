<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatus;
use App\Models\Product;
use App\Models\Setting;
use App\Support\OrderReference;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Places orders inside a transaction. Prices and totals are always
 * recalculated server-side from the database — never trusted from the client.
 */
class OrderService
{
    public function place(array $customer, array $items): Order
    {
        return DB::transaction(function () use ($customer, $items) {
            $products = Product::query()
                ->visible()
                ->whereIn('id', collect($items)->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lines = [];

            foreach ($items as $item) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => ["Product {$item['product_id']} is unavailable."],
                    ]);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for {$product->name}."],
                    ]);
                }

                $unitPrice = $product->effectivePrice();
                $lineTotal = round($unitPrice * $item['quantity'], 2);
                $subtotal += $lineTotal;

                $lines[] = [
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $shipping = $this->shippingFor($subtotal);

            $order = Order::create([
                ...$customer,
                'reference' => OrderReference::generate(),
                'order_status_id' => OrderStatus::idFor(OrderStatus::PENDING),
                'subtotal' => $subtotal,
                'shipping' => $shipping,
                'total' => round($subtotal + $shipping, 2),
            ]);

            foreach ($lines as $line) {
                $order->items()->create([
                    'product_id' => $line['product']->id,
                    'product_name' => $line['product']->name,
                    'unit_price' => $line['unit_price'],
                    'quantity' => $line['quantity'],
                    'line_total' => $line['line_total'],
                ]);

                $line['product']->decrement('stock_quantity', $line['quantity']);
                $line['product']->increment('sold_quantity', $line['quantity']);
            }

            return $order->load(['items', 'status']);
        });
    }

    private function shippingFor(float $subtotal): float
    {
        $threshold = (float) Setting::get('free_shipping_threshold', '1000');
        $rate = (float) Setting::get('flat_shipping_rate', '25');

        return $subtotal >= $threshold ? 0.0 : $rate;
    }
}
