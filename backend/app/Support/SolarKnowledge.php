<?php

namespace App\Support;

/**
 * Authoritative, concise solar facts the AI assistant can quote. This is the
 * high-priority knowledge source (the public forum, by contrast, is the
 * lowest-priority source and is not authoritative).
 *
 * Grounded in Gaza realities: ~5 peak sun hours, long daily grid outages,
 * widespread reuse of salvaged/damaged panels.
 */
class SolarKnowledge
{
    /** @return array<string, array{title: string, body: string}> */
    public static function all(): array
    {
        return [
            'system_basics' => [
                'title' => 'How a solar system works',
                'body' => 'Panels make DC electricity from sunlight. A charge controller (prefer MPPT) feeds it into a battery. An inverter converts stored DC into the AC a home uses. Order: panels → charge controller → battery → inverter. With grid present the inverter can pass mains through and charge the battery; when the grid is down the battery and panels carry the house.',
            ],
            'sizing' => [
                'title' => 'Sizing panels, battery and inverter',
                'body' => 'Daily energy (Wh) = sum of every appliance watts × hours/day. Panels = daily energy ÷ peak sun hours, +~25% for losses (Gaza ≈ 5 sun hours). Battery (Wh) = daily energy × backup days ÷ usable depth of discharge (lithium ~90%, lead-acid ~50%). Inverter must cover the PEAK simultaneous load (not the daily total) with ~25% surge headroom. Point users to the on-site calculator at /calculator for exact numbers.',
            ],
            'mppt_vs_pwm' => [
                'title' => 'MPPT vs PWM charge controllers',
                'body' => 'PWM is cheaper but wastes power when panel voltage exceeds battery voltage — only fine for tiny setups. MPPT tracks the panel\'s optimal point and harvests 15–30% more energy, especially in cold or low light, and allows higher-voltage panel strings. For any home backup system, choose MPPT.',
            ],
            'battery_health' => [
                'title' => 'Battery health and care',
                'body' => 'Life is measured in cycles: lithium (LFP) 4,000–8,000; lead-acid far fewer. Deep discharges and heat kill batteries early. Warning signs: charges full but empties much faster than before, runs hot, or voltage sags hard under load. Keep batteries cool and shaded, avoid draining lithium below ~10–20%, and never mix old and new cells in one bank.',
            ],
            'damaged_panels' => [
                'title' => 'Used or damaged panels — what is safe',
                'body' => 'A panel with only cosmetic scratches can still be useful. Treat these as warnings: cracked glass, burnt or bubbled backsheet, scorched junction box, shattered cells or "snail trails". A cracked panel often still produces power but at reduced output and can let moisture in — risking corrosion, hot spots, and electric shock when wet. Test open-circuit voltage in sun, inspect the back, keep damaged panels earthed and out of reach. If glass is shattered or the backsheet is breached, retire it. (In Gaza many systems are rebuilt from salvaged parts — judge each panel on these checks.)',
            ],
            'saving_power' => [
                'title' => 'Saving power to stretch a system',
                'body' => 'The cheapest kWh is the one you never use. Switch all lighting to LED. Run heavy loads (washing, pumping, ironing) during peak sun straight off the panels, not the battery at night. Choose a high-efficiency/inverter fridge — usually the biggest always-on load. Kill standby power with switched sockets. Keep panels clean and unshaded; one shaded cell drags down a whole string.',
            ],
            'setup_safety' => [
                'title' => 'Setup and safety',
                'body' => 'Mount panels facing the sun, unshaded, tilted roughly to your latitude; a simple angled frame suits Gaza\'s flat roofs. Keep DC runs short and correctly sized, fuse every battery, and fit a DC disconnect. This is real electricity: DC arcs do not self-extinguish like AC, and lithium batteries are dangerous if short-circuited or crushed. Plan the design yourself but have final connections checked or made by a qualified installer.',
            ],
        ];
    }

    /** @return array<int, string> */
    public static function topics(): array
    {
        return array_keys(self::all());
    }

    public static function get(string $topic): ?array
    {
        return self::all()[$topic] ?? null;
    }
}
