/**
 * Types for solar system components and calculations
 */

// Solar panel health status
export enum SolarPanelHealth {
  PERFECT = 'Perfect',
  MINOR_ISSUES = 'Minor Issues',
  NEEDS_ATTENTION = 'Needs Attention',
  CRITICAL = 'Critical'
}

// Solar panel type
export enum SolarPanelType {
  MONOCRYSTALLINE = 'Monocrystalline',
  POLYCRYSTALLINE = 'Polycrystalline',
  THIN_FILM = 'Thin Film',
  BIFACIAL = 'Bifacial'
}

// Battery type
export enum BatteryType {
  LEAD_ACID = 'Lead Acid',
  LITHIUM_ION = 'Lithium Ion',
  FLOW = 'Flow Battery',
  SALT_WATER = 'Salt Water'
}

// Solar panel specification
export interface SolarPanel {
  id: string;
  type: SolarPanelType;
  wattage: number;
  efficiency: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  weight: number;
  manufacturer?: string;
  model?: string;
  warrantyYears: number;
  health?: SolarPanelHealth;
  installDate?: Date;
}

// Battery specification
export interface Battery {
  id: string;
  type: BatteryType;
  capacityAh: number;
  voltage: number;
  depthOfDischarge: number;
  cycleLife: number;
  manufacturer?: string;
  model?: string;
  warrantyYears: number;
  health?: SolarPanelHealth;
  installDate?: Date;
}

// Inverter specification
export interface Inverter {
  id: string;
  type: string;
  ratedOutputW: number;
  efficiency: number;
  inputVoltage: number;
  outputVoltage: number;
  manufacturer?: string;
  model?: string;
  warrantyYears: number;
  features: string[];
}

// Complete solar system
export interface SolarSystem {
  id: string;
  name: string;
  panels: SolarPanel[];
  batteries?: Battery[];
  inverters: Inverter[];
  mountType: string;
  gridConnected: boolean;
  installationDate: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  estimatedDailyProduction: number;
  actualDailyProduction?: number;
  maintenanceHistory?: {
    date: Date;
    description: string;
    technician?: string;
  }[];
}
