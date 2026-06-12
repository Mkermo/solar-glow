<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->visible()
            ->with('category')
            ->when($request->query('category'), fn ($query, $slug) => $query->whereHas(
                'category',
                fn ($category) => $category->where('slug', $slug),
            ))
            ->when($request->query('search'), fn ($query, $term) => $query->where(
                fn ($q) => $q
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%"),
            ))
            ->when($request->boolean('featured'), fn ($query) => $query->featured())
            ->orderByDesc('is_featured')
            ->orderBy('name')
            ->paginate(min((int) $request->query('per_page', 24), 48));

        return ProductResource::collection($products);
    }

    public function show(string $slug): ProductResource
    {
        $product = Product::query()
            ->visible()
            ->with('category')
            ->where('slug', $slug)
            ->orWhere(fn ($query) => $query->visible()->whereKey($slug))
            ->firstOrFail();

        return new ProductResource($product);
    }
}
