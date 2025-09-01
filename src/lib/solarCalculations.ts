/**
 * Solar Energy Calculator Utilities
 * 
 * This module provides calculation functions for solar system design and evaluation.
 * It includes formulas for calculating power needs, solar panel output, battery storage,
 * and system efficiency.
 */

/**
 * Calculate daily energy production of solar panels
 * @param panelWattage - Rated wattage of a single panel in watts
 * @param numberOfPanels - Number of panels in the system
 * @param sunlightHours - Average peak sunlight hours per day
 * @param efficiency - System efficiency factor (0-1, typically 0.7-0.8)
 * @returns Daily energy production in watt-hours
 */
export function calculateDailyEnergyProduction(
  panelWattage: number,
  numberOfPanels: number,
  sunlightHours: number,
  efficiency: number = 0.75
): number {
  return panelWattage * numberOfPanels * sunlightHours * efficiency;
}

/**
 * Calculate number of solar panels needed
 * @param dailyEnergyNeeds - Daily energy consumption in watt-hours
 * @param panelWattage - Rated wattage of a single panel in watts
 * @param sunlightHours - Average peak sunlight hours per day
 * @param efficiency - System efficiency factor (0-1, typically 0.7-0.8)
 * @returns Number of panels needed
 */
export function calculateNumberOfPanelsNeeded(
  dailyEnergyNeeds: number,
  panelWattage: number,
  sunlightHours: number,
  efficiency: number = 0.75
): number {
  return Math.ceil(dailyEnergyNeeds / (panelWattage * sunlightHours * efficiency));
}

/**
 * Calculate battery capacity needed
 * @param dailyEnergyNeeds - Daily energy consumption in watt-hours
 * @param daysOfAutonomy - Number of days of backup power needed
 * @param depthOfDischarge - Maximum recommended battery discharge (0-1, typically 0.5-0.8)
 * @param systemVoltage - Battery system voltage (typically 12, 24, or 48 volts)
 * @returns Battery capacity in amp-hours
 */
export function calculateBatteryCapacityNeeded(
  dailyEnergyNeeds: number,
  daysOfAutonomy: number = 1,
  depthOfDischarge: number = 0.5,
  systemVoltage: number = 12
): number {
  return Math.ceil((dailyEnergyNeeds * daysOfAutonomy) / (depthOfDischarge * systemVoltage));
}

/**
 * Calculate solar charge controller size
 * @param panelWattage - Rated wattage of a single panel in watts
 * @param numberOfPanels - Number of panels in the system
 * @param systemVoltage - Battery system voltage
 * @param safetyFactor - Safety margin for controller sizing (typically 1.25-1.3)
 * @returns Minimum controller rating in amps
 */
export function calculateChargeControllerSize(
  panelWattage: number,
  numberOfPanels: number,
  systemVoltage: number,
  safetyFactor: number = 1.25
): number {
  // Convert panel power to amps
  const totalWatts = panelWattage * numberOfPanels;
  const totalAmps = totalWatts / systemVoltage;
  return Math.ceil(totalAmps * safetyFactor);
}

/**
 * Calculate inverter size needed
 * @param peakLoadWatts - Maximum simultaneous power draw in watts
 * @param safetyFactor - Safety margin for inverter sizing (typically 1.2-1.5)
 * @returns Recommended inverter size in watts
 */
export function calculateInverterSize(
  peakLoadWatts: number,
  safetyFactor: number = 1.3
): number {
  return Math.ceil(peakLoadWatts * safetyFactor);
}

/**
 * Calculate the payback period for a solar system
 * @param systemCost - Total cost of the solar system
 * @param annualSavings - Annual energy cost savings
 * @param incentives - Value of tax credits and rebates
 * @returns Payback period in years
 */
export function calculatePaybackPeriod(
  systemCost: number,
  annualSavings: number,
  incentives: number = 0
): number {
  const netCost = systemCost - incentives;
  return netCost / annualSavings;
}

/**
 * Determine if panels should be wired in series or parallel
 * @param numberOfPanels - Number of panels in the system
 * @param systemVoltage - Target system voltage
 * @param panelVoltage - Nominal voltage of each panel
 * @returns Configuration recommendation {series, parallel}
 */
export function determineWiringConfiguration(
  numberOfPanels: number,
  systemVoltage: number,
  panelVoltage: number
): { series: number, parallel: number } {
  const panelsInSeries = Math.ceil(systemVoltage / panelVoltage);
  const panelsInParallel = Math.floor(numberOfPanels / panelsInSeries);
  
  return {
    series: panelsInSeries,
    parallel: panelsInParallel || 1
  };
}

/**
 * Calculate the area needed for solar panels
 * @param numberOfPanels - Number of panels in the system
 * @param panelWidth - Width of each panel in meters
 * @param panelHeight - Height of each panel in meters
 * @returns Area required in square meters
 */
export function calculateAreaNeeded(
  numberOfPanels: number,
  panelWidth: number,
  panelHeight: number
): number {
  // Add spacing factor of 1.2 for mounting and maintenance access
  return numberOfPanels * panelWidth * panelHeight * 1.2;
}

/**
 * Calculate the carbon offset from a solar system
 * @param annualEnergyProduction - Annual energy production in kWh
 * @param emissionFactor - CO2 emission factor in kg per kWh (varies by region)
 * @returns Annual carbon offset in kg of CO2
 */
export function calculateCarbonOffset(
  annualEnergyProduction: number,
  emissionFactor: number = 0.5
): number {
  return annualEnergyProduction * emissionFactor;
}
