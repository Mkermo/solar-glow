import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SolarEducationContent: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('Solar Energy Education', 'تعليم الطاقة الشمسية')}</CardTitle>
        <CardDescription>{t('Learn about solar energy technologies and applications', 'تعلم عن تقنيات وتطبيقات الطاقة الشمسية')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="panels">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="panels">{t('Panel Types', 'أنواع الألواح')}</TabsTrigger>
            <TabsTrigger value="components">{t('Components', 'المكونات')}</TabsTrigger>
            <TabsTrigger value="installation">{t('Installation', 'التركيب')}</TabsTrigger>
            <TabsTrigger value="maintenance">{t('Maintenance', 'الصيانة')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="panels" className="space-y-4">
            <div className="prose max-w-none dark:prose-invert">
              <h3>{t('Solar Panel Types', 'أنواع الألواح الشمسية')}</h3>
              
              <h4>{t('Monocrystalline Panels', 'الألواح أحادية البلورية')}</h4>
              <p>{t('Made from single-crystal silicon, these panels are the most efficient (18-22%) and longest-lasting. They have a distinctive black color and are ideal for limited space installations.', 'مصنوعة من السيليكون أحادي البلورة، هذه الألواح هي الأكثر كفاءة (18-22٪) والأطول عمراً. لها لون أسود مميز وهي مثالية للتركيبات ذات المساحة المحدودة.')}</p>
              
              <h4>{t('Polycrystalline Panels', 'الألواح متعددة البلورات')}</h4>
              <p>{t('Made from multiple silicon crystals, these blue panels are less efficient (15-17%) but more affordable. They work well in moderate climates and are a good balance of cost and performance.', 'مصنوعة من بلورات سيليكون متعددة، هذه الألواح الزرقاء أقل كفاءة (15-17٪) ولكنها أكثر اقتصادية. تعمل بشكل جيد في المناخات المعتدلة وتمثل توازنًا جيدًا بين التكلفة والأداء.')}</p>
              
              <h4>{t('Thin-Film Panels', 'ألواح الفيلم الرقيق')}</h4>
              <p>{t('These flexible panels are lightweight and versatile but less efficient (10-13%). They perform better in high temperatures and partial shading, making them suitable for specific applications.', 'هذه الألواح المرنة خفيفة الوزن ومتعددة الاستخدامات ولكنها أقل كفاءة (10-13٪). تعمل بشكل أفضل في درجات الحرارة المرتفعة والظل الجزئي، مما يجعلها مناسبة لتطبيقات محددة.')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="space-y-4">
            <div className="prose max-w-none dark:prose-invert">
              <h3>{t('System Components', 'مكونات النظام')}</h3>
              
              <h4>{t('Solar Panels', 'الألواح الشمسية')}</h4>
              <p>{t('The primary component that converts sunlight into electricity through the photovoltaic effect.', 'المكون الرئيسي الذي يحول ضوء الشمس إلى كهرباء من خلال التأثير الكهروضوئي.')}</p>
              
              <h4>{t('Inverters', 'العواكس')}</h4>
              <p>{t('Converts DC electricity from the panels to AC electricity used by home appliances. Types include string inverters, microinverters, and power optimizers.', 'تحول الكهرباء المستمرة من الألواح إلى كهرباء متناوبة تستخدمها الأجهزة المنزلية. تشمل الأنواع محولات السلسلة والمحولات الصغيرة ومحسنات الطاقة.')}</p>
              
              <h4>{t('Batteries', 'البطاريات')}</h4>
              <p>{t('Store excess electricity for use when the sun isn\'t shining. Common types include lead-acid, lithium-ion, and saltwater batteries.', 'تخزن الكهرباء الزائدة للاستخدام عندما لا تشرق الشمس. تشمل الأنواع الشائعة بطاريات الرصاص الحمضية وبطاريات الليثيوم أيون وبطاريات الماء المالح.')}</p>
              
              <h4>{t('Charge Controllers', 'متحكمات الشحن')}</h4>
              <p>{t('Regulate the voltage and current from solar panels to batteries, preventing overcharging and extending battery life.', 'تنظم الجهد والتيار من الألواح الشمسية إلى البطاريات، مما يمنع الشحن الزائد ويطيل عمر البطارية.')}</p>
              
              <h4>{t('Mounting Systems', 'أنظمة التثبيت')}</h4>
              <p>{t('Structures that secure panels to roofs, ground, or poles. Can be fixed or include tracking systems that follow the sun.', 'هياكل تثبت الألواح على الأسطح أو الأرض أو الأعمدة. يمكن أن تكون ثابتة أو تشمل أنظمة تتبع تتبع الشمس.')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="installation" className="space-y-4">
            <div className="prose max-w-none dark:prose-invert">
              <h3>{t('Installation Considerations', 'اعتبارات التركيب')}</h3>
              
              <h4>{t('Location and Orientation', 'الموقع والاتجاه')}</h4>
              <p>{t('Panels should face south in the northern hemisphere (north in southern hemisphere) at an angle approximately equal to your latitude for optimal year-round production.', 'يجب أن تواجه الألواح الجنوب في نصف الكرة الشمالي (الشمال في نصف الكرة الجنوبي) بزاوية تساوي تقريبًا خط العرض الخاص بك للإنتاج الأمثل على مدار العام.')}</p>
              
              <h4>{t('Shading Analysis', 'تحليل الظل')}</h4>
              <p>{t('Even small amounts of shade can significantly reduce panel output. A proper site analysis should identify potential shading throughout the year.', 'حتى كميات صغيرة من الظل يمكن أن تقلل بشكل كبير من إنتاج اللوحة. يجب أن يحدد تحليل الموقع المناسب الظل المحتمل على مدار العام.')}</p>
              
              <h4>{t('Structural Considerations', 'الاعتبارات الهيكلية')}</h4>
              <p>{t('Ensure the roof or ground mounting location can support the additional weight of the solar system.', 'تأكد من أن موقع التثبيت على السطح أو الأرض يمكنه دعم الوزن الإضافي لنظام الطاقة الشمسية.')}</p>
              
              <h4>{t('Permits and Regulations', 'التصاريح واللوائح')}</h4>
              <p>{t('Most installations require building permits, electrical permits, and utility interconnection agreements if grid-connected.', 'تتطلب معظم التركيبات تصاريح بناء وتصاريح كهربائية واتفاقيات ربط مرافق إذا كانت متصلة بالشبكة.')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            <div className="prose max-w-none dark:prose-invert">
              <h3>{t('Maintenance and Care', 'الصيانة والعناية')}</h3>
              
              <h4>{t('Panel Cleaning', 'تنظيف الألواح')}</h4>
              <p>{t('Clean panels 2-4 times per year with water and a soft brush. Remove debris, dust, and bird droppings. Avoid harsh chemicals or abrasive materials.', 'نظف الألواح 2-4 مرات في السنة بالماء وفرشاة ناعمة. قم بإزالة الحطام والغبار وفضلات الطيور. تجنب المواد الكيميائية القاسية أو المواد الكاشطة.')}</p>
              
              <h4>{t('System Inspection', 'فحص النظام')}</h4>
              <p>{t('Perform visual inspections monthly. Check for loose connections, corrosion, or damage to wiring. Verify that mounting hardware remains secure.', 'قم بإجراء فحوصات بصرية شهرية. تحقق من وجود توصيلات مفكوكة أو تآكل أو تلف في الأسلاك. تحقق من أن أجهزة التثبيت لا تزال آمنة.')}</p>
              
              <h4>{t('Performance Monitoring', 'مراقبة الأداء')}</h4>
              <p>{t('Track system output regularly to detect any unexpected drops in production that might indicate a problem.', 'تتبع إنتاج النظام بانتظام للكشف عن أي انخفاضات غير متوقعة في الإنتاج قد تشير إلى وجود مشكلة.')}</p>
              
              <h4>{t('Battery Maintenance', 'صيانة البطارية')}</h4>
              <p>{t('For lead-acid batteries, check water levels monthly and keep terminals clean. Lithium batteries require less maintenance but should be kept within their temperature operating range.', 'بالنسبة لبطاريات الرصاص الحمضية، تحقق من مستويات الماء شهريًا واحتفظ بالأطراف نظيفة. تتطلب بطاريات الليثيوم صيانة أقل ولكن يجب الاحتفاظ بها ضمن نطاق درجة حرارة التشغيل الخاصة بها.')}</p>
              
              <h4>{t('Professional Service', 'الخدمة المهنية')}</h4>
              <p>{t('Have a qualified technician perform a comprehensive system check every 2-3 years.', 'اطلب من فني مؤهل إجراء فحص شامل للنظام كل 2-3 سنوات.')}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SolarEducationContent;
