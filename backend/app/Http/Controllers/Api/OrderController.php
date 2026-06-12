<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orders->place($request->customer(), $request->items());

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Track an order by its public reference code (e.g. SG-7K2M9QX4).
     */
    public function show(string $reference): OrderResource
    {
        $order = Order::query()
            ->with(['items', 'status'])
            ->where('reference', $reference)
            ->firstOrFail();

        return new OrderResource($order);
    }
}
