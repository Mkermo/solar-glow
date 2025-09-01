import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateDailyEnergyProduction, calculateNumberOfPanelsNeeded, calculateBatteryCapacityNeeded, determineWiringConfiguration } from '@/lib/solarCalculations';
import { SolarPanelType } from '@/types/solarTypes';

const SolarCalculator: React.FC = () => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    dailyEnergyUsage: 15, // in kWh
    panelWattage: 300, // in watts
    sunlightHours: 5, // peak sun hours per day
    systemEfficiency: 0.75, // efficiency factor
    batteryBackupDays: 1, // days of autonomy
    batteryDepthOfDischarge: 0.5, // DoD
    systemVoltage: 24, // system voltage
  });

  const [results, setResults] = useState<any>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value),
    });
  };

  const calculateSystem = () => {
    // Convert daily energy from kWh to Wh for calculations
    const dailyEnergyWh = formData.dailyEnergyUsage * 1000;
    
    // Calculate number of panels needed
    const panelsNeeded = calculateNumberOfPanelsNeeded(
      dailyEnergyWh,
      formData.panelWattage,
      formData.sunlightHours,
      formData.systemEfficiency
    );
    
    // Calculate daily energy production
    const dailyProductionWh = calculateDailyEnergyProduction(
      formData.panelWattage,
      panelsNeeded,
      formData.sunlightHours,
      formData.systemEfficiency
    );
    
    // Calculate battery capacity needed
    const batteryCapacityAh = calculateBatteryCapacityNeeded(
      dailyEnergyWh,
      formData.batteryBackupDays,
      formData.batteryDepthOfDischarge,
      formData.systemVoltage
    );
    
    // Determine panel wiring configuration
    const wiringConfig = determineWiringConfiguration(
      panelsNeeded,
      formData.systemVoltage,
      formData.panelWattage / 30 // approximate panel voltage (assuming ~30V for a 300W panel)
    );
    
    // Set results
    setResults({
      panelsNeeded,
      dailyProductionWh,
      batteryCapacityAh,
      wiringConfig,
      excessEnergy: dailyProductionWh - dailyEnergyWh,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('Solar System Calculator', 'آلة حاسبة للنظام الشمسي')}</CardTitle>
        <CardDescription>{t('Calculate your solar system requirements', 'احسب متطلبات نظامك الشمسي')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="input">
          <TabsList className="mb-4">
            <TabsTrigger value="input">{t('Input', 'إدخال')}</TabsTrigger>
            <TabsTrigger value="results" disabled={!results}>{t('Results', 'النتائج')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyEnergyUsage">{t('Daily Energy Usage (kWh)', 'استخدام الطاقة اليومي (كيلوواط ساعة)')}</Label>
                <Input 
                  id="dailyEnergyUsage"
                  name="dailyEnergyUsage"
                  type="number" 
                  min="1"
                  value={formData.dailyEnergyUsage}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="panelWattage">{t('Panel Wattage (W)', 'قوة اللوحة (واط)')}</Label>
                <Input 
                  id="panelWattage"
                  name="panelWattage"
                  type="number" 
                  min="50" 
                  step="10"
                  value={formData.panelWattage}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sunlightHours">{t('Peak Sunlight Hours', 'ساعات ذروة أشعة الشمس')}</Label>
                <Input 
                  id="sunlightHours"
                  name="sunlightHours"
                  type="number" 
                  min="1" 
                  max="12" 
                  step="0.5"
                  value={formData.sunlightHours}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemEfficiency">{t('System Efficiency', 'كفاءة النظام')}</Label>
                <Input 
                  id="systemEfficiency"
                  name="systemEfficiency"
                  type="number" 
                  min="0.5" 
                  max="0.98" 
                  step="0.01"
                  value={formData.systemEfficiency}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batteryBackupDays">{t('Battery Backup Days', 'أيام احتياطي البطارية')}</Label>
                <Input 
                  id="batteryBackupDays"
                  name="batteryBackupDays"
                  type="number" 
                  min="0.5" 
                  max="14" 
                  step="0.5"
                  value={formData.batteryBackupDays}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="systemVoltage">{t('System Voltage', 'جهد النظام')}</Label>
                <Input 
                  id="systemVoltage"
                  name="systemVoltage"
                  type="number" 
                  min="12" 
                  step="12"
                  value={formData.systemVoltage}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <Button onClick={calculateSystem} className="w-full mt-4">
              {t('Calculate', 'احسب')}
            </Button>
          </TabsContent>
          
          <TabsContent value="results">
            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('Panels Needed', 'اللوحات المطلوبة')}</h3>
                    <p className="text-2xl font-bold">{results.panelsNeeded}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('Configuration', 'التكوين')}: {results.wiringConfig.series} {t('series', 'متسلسلة')} × {results.wiringConfig.parallel} {t('parallel', 'متوازية')}
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('Daily Production', 'الإنتاج اليومي')}</h3>
                    <p className="text-2xl font-bold">{(results.dailyProductionWh / 1000).toFixed(2)} kWh</p>
                    <p className="text-sm text-muted-foreground">
                      {results.excessEnergy > 0 ? 
                        `${t('Excess', 'فائض')}: ${(results.excessEnergy / 1000).toFixed(2)} kWh` : 
                        `${t('Deficit', 'عجز')}: ${(-results.excessEnergy / 1000).toFixed(2)} kWh`}
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('Battery Capacity Needed', 'سعة البطارية المطلوبة')}</h3>
                    <p className="text-2xl font-bold">{results.batteryCapacityAh.toFixed(0)} Ah</p>
                    <p className="text-sm text-muted-foreground">
                      {t('At', 'عند')} {formData.systemVoltage}V, {formData.batteryBackupDays} {t('day(s) backup', 'يوم احتياطي')}
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{t('System Power', 'قوة النظام')}</h3>
                    <p className="text-2xl font-bold">{(formData.panelWattage * results.panelsNeeded / 1000).toFixed(2)} kW</p>
                    <p className="text-sm text-muted-foreground">
                      {results.panelsNeeded} × {formData.panelWattage}W {t('panels', 'لوحة')}
                    </p>
                  </div>
                </div>
                
                <Button onClick={() => setResults(null)} variant="outline" className="w-full">
                  {t('Recalculate', 'إعادة الحساب')}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SolarCalculator;
