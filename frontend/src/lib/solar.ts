/**
 * Off-grid / backup solar sizing engine — pure functions, no UI.
 *
 * Formulas follow standard off-grid design practice:
 *   daily energy (Wh) = Σ(watts × hours × qty)
 *   array (W)        = daily Wh / (peak sun hours × system derate)
 *   battery (Wh)     = daily Wh × autonomy days / (DoD × round-trip efficiency)
 *   inverter (W)     = peak simultaneous load × surge factor
 *
 * Defaults are tuned for Gaza: ~5 peak sun hours, long daily grid outages,
 * so a backup battery and honest derating matter more than in grid-tied design.
 */

export interface Appliance {
  id: string;
  name: string;
  name_ar: string;
  /** Typical running power in watts. */
  watts: number;
  /** Sensible default hours of use per day. */
  defaultHours: number;
}

export interface LoadItem {
  appliance: Appliance;
  /** Effective wattage — defaults to the preset but the user can override it. */
  watts: number;
  quantity: number;
  hoursPerDay: number;
}

export type BatteryChemistry = "lithium" | "lead-acid";

export interface BatterySpec {
  label: string;
  /** Usable depth of discharge (0–1). */
  dod: number;
  /** Round-trip efficiency (0–1). */
  efficiency: number;
}

export const BATTERY_SPECS: Record<BatteryChemistry, BatterySpec> = {
  lithium: { label: "Lithium (LFP)", dod: 0.9, efficiency: 0.95 },
  "lead-acid": { label: "Lead-acid", dod: 0.5, efficiency: 0.85 },
};

export interface SizingInput {
  loads: LoadItem[];
  /** Peak sun hours for the worst month (Gaza ≈ 5). */
  peakSunHours: number;
  /** Days the battery must run with no sun / no grid. */
  autonomyDays: number;
  /** Wattage of a single panel you plan to buy. */
  panelWatts: number;
  battery: BatteryChemistry;
}

export interface SizingResult {
  dailyWh: number;
  monthlyKwh: number;
  peakLoadW: number;
  arrayW: number;
  panelCount: number;
  batteryWh: number;
  batteryKwh: number;
  inverterW: number;
  inverterKw: number;
}

/** Real-world losses: wiring, dust, heat, controller/MPPT and panel ageing. */
const SYSTEM_DERATE = 0.75;
/** Headroom so the inverter survives motor/compressor start-up surges. */
const INVERTER_SURGE_FACTOR = 1.25;

export const GAZA_DEFAULTS = {
  peakSunHours: 5,
  autonomyDays: 1,
  panelWatts: 400,
} as const;

/** Common household appliances with typical running wattage. */
export const APPLIANCE_PRESETS: Appliance[] = [
  { id: "led", name: "LED light", name_ar: "إضاءة LED", watts: 10, defaultHours: 5 },
  { id: "phone", name: "Phone charger", name_ar: "شاحن هاتف", watts: 10, defaultHours: 3 },
  { id: "router", name: "Wi-Fi router", name_ar: "راوتر إنترنت", watts: 15, defaultHours: 24 },
  { id: "laptop", name: "Laptop", name_ar: "حاسوب محمول", watts: 65, defaultHours: 4 },
  { id: "tv", name: "LED TV", name_ar: "تلفاز", watts: 100, defaultHours: 4 },
  { id: "fan", name: "Fan", name_ar: "مروحة", watts: 60, defaultHours: 6 },
  { id: "fridge", name: "Fridge", name_ar: "ثلاجة", watts: 150, defaultHours: 8 },
  { id: "freezer", name: "Freezer", name_ar: "فريزر", watts: 200, defaultHours: 8 },
  { id: "washer", name: "Washing machine", name_ar: "غسالة", watts: 500, defaultHours: 1 },
  { id: "pump", name: "Water pump", name_ar: "مضخة ماء", watts: 750, defaultHours: 1 },
  { id: "microwave", name: "Microwave", name_ar: "ميكروويف", watts: 1000, defaultHours: 0.5 },
  { id: "ac", name: "Air conditioner", name_ar: "مكيف", watts: 1200, defaultHours: 4 },
];

const round = (value: number, decimals = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Daily energy for a single load line, in watt-hours. */
export const loadDailyWh = (item: LoadItem): number =>
  item.watts * item.hoursPerDay * item.quantity;

export function sizeSystem(input: SizingInput): SizingResult {
  const { loads, peakSunHours, autonomyDays, panelWatts, battery } = input;
  const spec = BATTERY_SPECS[battery];

  const dailyWh = loads.reduce((sum, item) => sum + loadDailyWh(item), 0);
  const peakLoadW = loads.reduce((sum, item) => sum + item.watts * item.quantity, 0);

  // Guard against divide-by-zero when the form is empty.
  const safeSun = peakSunHours > 0 ? peakSunHours : GAZA_DEFAULTS.peakSunHours;
  const arrayW = dailyWh / (safeSun * SYSTEM_DERATE);
  const panelCount = panelWatts > 0 ? Math.ceil(arrayW / panelWatts) : 0;

  const batteryWh = (dailyWh * autonomyDays) / (spec.dod * spec.efficiency);
  const inverterW = peakLoadW * INVERTER_SURGE_FACTOR;

  return {
    dailyWh: round(dailyWh),
    monthlyKwh: round((dailyWh * 30) / 1000, 1),
    peakLoadW: round(peakLoadW),
    arrayW: round(arrayW),
    panelCount,
    batteryWh: round(batteryWh),
    batteryKwh: round(batteryWh / 1000, 1),
    inverterW: round(inverterW),
    inverterKw: round(inverterW / 1000, 1),
  };
}
