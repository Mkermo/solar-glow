import React from 'react';
import { SolarSystem } from '@/types/solarTypes';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/contexts/LanguageContext';

interface SolarSystemVisualizerProps {
  system?: SolarSystem;
}

const SolarSystemVisualizer: React.FC<SolarSystemVisualizerProps> = ({ system }) => {
  const { t } = useLanguage();

  // If no system is provided, show a placeholder
  if (!system) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-60 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground">
                {t('No system configuration to display', 'لا يوجد تكوين نظام لعرضه')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('Use the calculator to design a system', 'استخدم الآلة الحاسبة لتصميم نظام')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a visual representation of the solar system
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium mb-4">{t('System Visualization', 'تصور النظام')}: {system.name}</h3>
        
        <div className="border rounded-lg p-4 mb-4 bg-muted/30">
          <h4 className="text-sm font-medium mb-2">{t('Solar Array', 'مصفوفة الألواح الشمسية')}</h4>
          <div className="grid grid-cols-8 gap-1">
            {system.panels.map((panel, index) => (
              <div 
                key={index}
                className="aspect-square bg-blue-500 rounded-sm relative overflow-hidden"
                title={`${panel.type} - ${panel.wattage}W`}
              >
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px">
                  <div className="bg-blue-400"></div>
                  <div className="bg-blue-400"></div>
                  <div className="bg-blue-400"></div>
                  <div className="bg-blue-400"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3 bg-muted/30">
            <h4 className="text-sm font-medium mb-1">{t('Inverter', 'العاكس')}</h4>
            <div className="h-16 bg-slate-600 rounded-md flex items-center justify-center">
              <div className="w-2/3 h-2/3 bg-slate-800 rounded border border-slate-500 flex items-center justify-center">
                <div className="text-xs text-white">{system.inverters[0].ratedOutputW}W</div>
              </div>
            </div>
          </div>
          
          {system.batteries && system.batteries.length > 0 && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <h4 className="text-sm font-medium mb-1">{t('Batteries', 'البطاريات')}</h4>
              <div className="h-16 flex gap-1">
                {system.batteries.map((battery, index) => (
                  <div 
                    key={index} 
                    className="flex-grow bg-yellow-600 rounded-md flex items-center justify-center"
                    title={`${battery.type} - ${battery.capacityAh}Ah`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-1 bg-yellow-900 rounded-t"></div>
                      <div className="text-xs text-white">{battery.capacityAh}Ah</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="border rounded-lg p-3 bg-muted/30">
            <h4 className="text-sm font-medium mb-1">{t('Connections', 'الاتصالات')}</h4>
            <div className="h-16 flex items-center justify-center">
              {system.gridConnected ? (
                <div className="text-xs text-center">
                  <div className="mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>{t('Grid Connected', 'متصل بالشبكة')}</div>
                </div>
              ) : (
                <div className="text-xs text-center">
                  <div className="mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                  <div>{t('Off-Grid', 'خارج الشبكة')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="mb-1">
            {t('Daily Production', 'الإنتاج اليومي')}: {system.estimatedDailyProduction.toFixed(1)} kWh
          </p>
          <p>
            {t('Total System Power', 'إجمالي طاقة النظام')}: {system.panels.reduce((acc, panel) => acc + panel.wattage, 0) / 1000} kW
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolarSystemVisualizer;
