<?php

use Illuminate\Support\Facades\Route;

/*
 * Serve the built React SPA (frontend/ compiled into public/index.html) for every
 * non-API, non-admin route. Filament registers /admin itself and the API lives in
 * routes/api.php, so this catch-all only handles storefront URLs and lets React
 * Router take over client-side. Static assets in public/ are served by the web
 * server before routing, so they never reach this fallback.
 */
Route::get('/{any}', function () {
    $spa = public_path('index.html');

    abort_unless(file_exists($spa), 404, 'Frontend build not found. Run "npm run build" in frontend/.');

    return response()->file($spa);
})->where('any', '^(?!api|admin|storage|livewire).*$');
