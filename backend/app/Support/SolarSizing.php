<?php

namespace App\Support;

/**
 * Off-grid / backup solar sizing — server-side mirror of the frontend engine
 * (frontend/src/lib/solar.ts). Pure functions, Gaza-tuned defaults.
 */
class SolarSizing
{
    private const SYSTEM_DERATE = 0.75;        // wiring, dust, heat, MPPT, ageing
    private const INVERTER_SURGE_FACTOR = 1.25; // motor / compressor start-up headroom

    public const GAZA_PEAK_SUN_HOURS = 5.0;

    /** @var array<string, array{dod: float, efficiency: float, label: string}> */
    private const BATTERIES = [
        'lithium' => ['dod' => 0.9, 'efficiency' => 0.95, 'label' => 'Lithium (LFP)'],
        'lead-acid' => ['dod' => 0.5, 'efficiency' => 0.85, 'label' => 'Lead-acid'],
    ];

    /**
     * @param array<int, array{watts: float|int, hours: float|int, quantity?: int}> $loads
     * @return array<string, mixed>
     */
    public static function size(
        array $loads,
        float $peakSunHours = self::GAZA_PEAK_SUN_HOURS,
        float $autonomyDays = 1.0,
        int $panelWatts = 400,
        string $battery = 'lithium',
        ?float $dailyWhOverride = null,
    ): array {
        $spec = self::BATTERIES[$battery] ?? self::BATTERIES['lithium'];

        $dailyWh = 0.0;
        $peakLoadW = 0.0;
        foreach ($loads as $load) {
            $watts = (float) ($load['watts'] ?? 0);
            $hours = (float) ($load['hours'] ?? 0);
            $qty = (int) ($load['quantity'] ?? 1);
            $dailyWh += $watts * $hours * $qty;
            $peakLoadW += $watts * $qty;
        }

        if ($dailyWhOverride !== null) {
            $dailyWh = $dailyWhOverride;
            // Without an itemised load list, estimate peak as ~30% of daily draw.
            if ($peakLoadW === 0.0) {
                $peakLoadW = $dailyWh / 8;
            }
        }

        $safeSun = $peakSunHours > 0 ? $peakSunHours : self::GAZA_PEAK_SUN_HOURS;
        $arrayW = $dailyWh / ($safeSun * self::SYSTEM_DERATE);
        $panelCount = $panelWatts > 0 ? (int) ceil($arrayW / $panelWatts) : 0;
        $batteryWh = ($dailyWh * $autonomyDays) / ($spec['dod'] * $spec['efficiency']);
        $inverterW = $peakLoadW * self::INVERTER_SURGE_FACTOR;

        return [
            'daily_wh' => round($dailyWh),
            'monthly_kwh' => round($dailyWh * 30 / 1000, 1),
            'peak_load_w' => round($peakLoadW),
            'array_w' => round($arrayW),
            'panel_count' => $panelCount,
            'panel_watts' => $panelWatts,
            'battery_kwh' => round($batteryWh / 1000, 1),
            'inverter_kw' => round($inverterW / 1000, 1),
            'battery_type' => $spec['label'],
            'autonomy_days' => $autonomyDays,
            'peak_sun_hours' => $safeSun,
        ];
    }
}
