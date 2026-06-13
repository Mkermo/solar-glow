<?php

namespace App\Services\Assistant;

use App\Models\Category;
use App\Models\Product;
use App\Services\Assistant\Tools\AssistantTool;
use App\Support\SolarKnowledge;
use App\Support\SolarSizing;

/**
 * The provider-neutral tool surface the solar assistant uses to read live data:
 * catalogue/stock, the sizing engine, and the curated knowledge base. These are
 * the authoritative sources, so the assistant grounds answers in real data.
 */
class AssistantTools
{
    /** @return array<int, AssistantTool> */
    public static function all(): array
    {
        return [
            self::searchProducts(),
            self::listCategories(),
            self::sizeSystem(),
            self::getEducation(),
        ];
    }

    private static function searchProducts(): AssistantTool
    {
        return new AssistantTool(
            name: 'search_products',
            description: 'Search the live product catalogue and current stock. Use this whenever recommending hardware or answering availability/price questions — never invent products. Returns name, price, stock, key specs and a link path.',
            parameters: [
                'type' => 'object',
                'properties' => [
                    'category' => [
                        'type' => 'string',
                        'enum' => ['panels', 'inverters', 'batteries', 'accessories'],
                        'description' => 'Optional category slug to filter by.',
                    ],
                    'query' => ['type' => 'string', 'description' => 'Optional keyword to match name/description.'],
                    'max_price' => ['type' => 'number', 'description' => 'Optional maximum price in USD.'],
                    'in_stock_only' => ['type' => 'boolean', 'description' => 'If true, only return items currently in stock.'],
                ],
            ],
            handler: function (array $input): string {
                $products = Product::query()
                    ->visible()
                    ->with('category')
                    ->when($input['category'] ?? null, fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
                    ->when($input['query'] ?? null, fn ($q, $term) => $q->where(fn ($w) => $w->where('name', 'like', "%{$term}%")->orWhere('description', 'like', "%{$term}%")))
                    ->when($input['max_price'] ?? null, fn ($q, $price) => $q->where('price', '<=', $price))
                    ->when($input['in_stock_only'] ?? false, fn ($q) => $q->where('stock_quantity', '>', 0))
                    ->orderByDesc('is_featured')
                    ->limit(12)
                    ->get();

                $rows = $products->map(fn (Product $p) => [
                    'name' => $p->name,
                    'category' => $p->category?->name,
                    'price' => $p->effectivePrice(),
                    'in_stock' => $p->stock_quantity > 0,
                    'stock_quantity' => $p->stock_quantity,
                    'specifications' => $p->specifications,
                    'url' => "/product/{$p->slug}",
                ]);

                return json_encode(['count' => $rows->count(), 'products' => $rows], JSON_UNESCAPED_UNICODE);
            },
        );
    }

    private static function listCategories(): AssistantTool
    {
        return new AssistantTool(
            name: 'list_categories',
            description: 'List the product categories the store carries, with how many items are in each.',
            parameters: ['type' => 'object', 'properties' => (object) []],
            handler: function (): string {
                $categories = Category::query()
                    ->where('is_active', true)
                    ->withCount(['products' => fn ($q) => $q->visible()])
                    ->orderBy('sort_order')
                    ->get()
                    ->map(fn (Category $c) => [
                        'name' => $c->name,
                        'slug' => $c->slug,
                        'description' => $c->description,
                        'products' => $c->products_count,
                        'url' => "/products?category={$c->slug}",
                    ]);

                return json_encode($categories, JSON_UNESCAPED_UNICODE);
            },
        );
    }

    private static function sizeSystem(): AssistantTool
    {
        return new AssistantTool(
            name: 'size_solar_system',
            description: 'Calculate a recommended solar build (number of panels, battery kWh, inverter kW) from a list of appliances OR a known daily energy figure. Use this before recommending a full system so the numbers are real. Defaults are tuned for Gaza (~5 peak sun hours).',
            parameters: [
                'type' => 'object',
                'properties' => [
                    'loads' => [
                        'type' => 'array',
                        'description' => 'Appliances to power. Estimate watts/hours from the conversation if the user is unsure.',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'name' => ['type' => 'string'],
                                'watts' => ['type' => 'number'],
                                'hours' => ['type' => 'number', 'description' => 'Hours used per day.'],
                                'quantity' => ['type' => 'integer'],
                            ],
                            'required' => ['watts', 'hours'],
                        ],
                    ],
                    'daily_wh' => ['type' => 'number', 'description' => 'Alternative to loads: total daily consumption in watt-hours.'],
                    'autonomy_days' => ['type' => 'number', 'description' => 'Backup days with no sun/grid. Default 1.'],
                    'panel_watts' => ['type' => 'integer', 'description' => 'Wattage of a single panel to plan around. Default 400.'],
                    'battery_type' => ['type' => 'string', 'enum' => ['lithium', 'lead-acid'], 'description' => 'Default lithium.'],
                ],
            ],
            handler: function (array $input): string {
                $result = SolarSizing::size(
                    loads: $input['loads'] ?? [],
                    autonomyDays: (float) ($input['autonomy_days'] ?? 1.0),
                    panelWatts: (int) ($input['panel_watts'] ?? 400),
                    battery: $input['battery_type'] ?? 'lithium',
                    dailyWhOverride: isset($input['daily_wh']) ? (float) $input['daily_wh'] : null,
                );

                return json_encode($result, JSON_UNESCAPED_UNICODE);
            },
        );
    }

    private static function getEducation(): AssistantTool
    {
        return new AssistantTool(
            name: 'get_education',
            description: 'Fetch authoritative solar guidance on a topic to ground an answer. Prefer this over guessing. Topics: '.implode(', ', SolarKnowledge::topics()).'.',
            parameters: [
                'type' => 'object',
                'properties' => [
                    'topic' => [
                        'type' => 'string',
                        'enum' => SolarKnowledge::topics(),
                        'description' => 'The knowledge topic to retrieve.',
                    ],
                ],
                'required' => ['topic'],
            ],
            handler: function (array $input): string {
                $entry = SolarKnowledge::get($input['topic'] ?? '');

                if (! $entry) {
                    return json_encode(['error' => 'Unknown topic', 'available' => SolarKnowledge::topics()]);
                }

                return json_encode($entry + ['learn_more_url' => '/education'], JSON_UNESCAPED_UNICODE);
            },
        );
    }
}
