
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "الاسم يجب أن يتكون من حرفين على الأقل",
  }),
  email: z.string().email({
    message: "يرجى إدخال عنوان بريد إلكتروني صالح",
  }),
  location: z.string().min(2, {
    message: "يرجى إدخال موقعك",
  }),
  message: z.string().optional(),
});

const SolarEducation = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    toast({
      title: "تم إرسال طلبك",
      description: "سنتواصل معك قريبًا",
    });
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">الطاقة الشمسية لغزة</h1>
        <h2 className="text-xl text-muted-foreground mb-6">Solar Energy for Gaza</h2>
        <p className="max-w-2xl mx-auto text-lg">
          مصدر طاقة مستدام ومتجدد يمكن أن يساعد في تلبية احتياجات الطاقة في غزة
        </p>
      </div>

      <Tabs defaultValue="basics" className="w-full mb-10">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">أساسيات</TabsTrigger>
          <TabsTrigger value="how-works">كيف تعمل</TabsTrigger>
          <TabsTrigger value="benefits">الفوائد</TabsTrigger>
          <TabsTrigger value="gaza">حلول لغزة</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>أساسيات الطاقة الشمسية</CardTitle>
              <CardDescription>فهم المفاهيم الأساسية للطاقة الشمسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">ما هي الألواح الشمسية؟</h3>
                <p>
                  الألواح الشمسية (أو الوحدات الكهروضوئية) هي أجهزة تحول ضوء الشمس مباشرة إلى كهرباء. تتكون من خلايا شمسية مصنوعة من مواد شبه موصلة، عادة ما تكون من السليكون.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Solar panels (or photovoltaic modules) are devices that convert sunlight directly into electricity. They consist of solar cells made from semiconductor materials, typically silicon.
                </p>
              </div>
              
              {/* Arabic video about solar panels basics */}
              <div className="mt-4 border rounded-lg overflow-hidden">
                <h4 className="p-2 bg-muted text-center font-medium">شاهد: مقدمة عن الألواح الشمسية | Watch: Introduction to Solar Panels</h4>
                <div className="w-full">
                  <AspectRatio ratio={16 / 9}>
                    <iframe 
                      src="https://www.youtube.com/embed/6FYo1rJwG4o" 
                      title="مقدمة عن الألواح الشمسية" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="w-full h-full rounded-b-lg"
                    ></iframe>
                  </AspectRatio>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">أنواع الألواح الشمسية</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>أحادية البلورية - كفاءة أعلى، تكلفة أعلى</li>
                  <li>متعددة البلورية - كفاءة متوسطة، تكلفة أقل</li>
                  <li>الأغشية الرقيقة - مرنة، كفاءة أقل، مناسبة للمساحات المحدودة</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Monocrystalline - Higher efficiency, higher cost. Polycrystalline - Medium efficiency, lower cost. Thin-film - Flexible, lower efficiency, suitable for limited spaces.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="how-works" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>كيف تعمل الطاقة الشمسية</CardTitle>
              <CardDescription>آلية عمل الألواح الشمسية لإنتاج الكهرباء</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">المبدأ الأساسي</h3>
                <p>
                  تستخدم الألواح الشمسية التأثير الكهروضوئي لتحويل أشعة الشمس إلى كهرباء. عندما تصطدم الفوتونات (جزيئات الضوء) بالخلايا الشمسية، فإنها تحرر الإلكترونات، مما يخلق تيارًا كهربائيًا.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Solar panels use the photovoltaic effect to convert sunlight into electricity. When photons (particles of light) hit the solar cells, they knock electrons free, creating an electric current.
                </p>
              </div>
              
              {/* Arabic video about how solar panels work */}
              <div className="mt-4 border rounded-lg overflow-hidden">
                <h4 className="p-2 bg-muted text-center font-medium">شاهد: كيف تعمل الألواح الشمسية | Watch: How Solar Panels Work</h4>
                <div className="w-full">
                  <AspectRatio ratio={16 / 9}>
                    <iframe 
                      src="https://www.youtube.com/embed/H7_kFzFRLXE" 
                      title="كيف تعمل الألواح الشمسية" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="w-full h-full rounded-b-lg"
                    ></iframe>
                  </AspectRatio>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">مكونات النظام الشمسي</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>الألواح الشمسية - تحويل ضوء الشمس إلى كهرباء</li>
                  <li>العاكس - تحويل التيار المستمر إلى تيار متردد</li>
                  <li>البطاريات - تخزين الطاقة للاستخدام في الليل</li>
                  <li>وحدة التحكم في الشحن - تنظيم تدفق الكهرباء</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Solar panels - Convert sunlight to electricity. Inverter - Convert DC to AC current. Batteries - Store energy for nighttime use. Charge controller - Regulate electricity flow.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>فوائد الطاقة الشمسية</CardTitle>
              <CardDescription>لماذا تعتبر الطاقة الشمسية مفيدة بشكل خاص لغزة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">مزايا استخدام الطاقة الشمسية</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>طاقة متجددة - لا تنفد أبدًا طالما الشمس موجودة</li>
                  <li>الاستقلال الطاقي - تقليل الاعتماد على مصادر الطاقة الخارجية</li>
                  <li>صديقة للبيئة - لا تنتج انبعاثات ضارة</li>
                  <li>تكاليف صيانة منخفضة - عمر طويل مع صيانة قليلة</li>
                  <li>توفير المال على المدى الطويل - استثمار أولي مع عائد مستمر</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Renewable energy - Never runs out as long as the sun exists. Energy independence - Reduce dependence on external energy sources. Environmentally friendly - Produces no harmful emissions. Low maintenance costs - Long lifespan with little maintenance. Long-term cost savings - Initial investment with ongoing returns.
                </p>
              </div>
              
              {/* Arabic video about benefits of solar energy */}
              <div className="mt-4 border rounded-lg overflow-hidden">
                <h4 className="p-2 bg-muted text-center font-medium">شاهد: فوائد الطاقة الشمسية | Watch: Benefits of Solar Energy</h4>
                <div className="w-full">
                  <AspectRatio ratio={16 / 9}>
                    <iframe 
                      src="https://www.youtube.com/embed/2zc3T-oSW4U" 
                      title="فوائد الطاقة الشمسية" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="w-full h-full rounded-b-lg"
                    ></iframe>
                  </AspectRatio>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">أهمية خاصة لغزة</h3>
                <p>
                  تعاني غزة من انقطاع متكرر للكهرباء. يمكن للطاقة الشمسية أن توفر مصدرًا موثوقًا للكهرباء للمنازل والمدارس والمستشفيات، مما يحسن نوعية الحياة ويدعم الخدمات الأساسية.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Gaza suffers from frequent electricity outages. Solar energy can provide a reliable source of electricity for homes, schools, and hospitals, improving quality of life and supporting essential services.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaza" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>حلول الطاقة الشمسية لغزة</CardTitle>
              <CardDescription>تطبيقات عملية للطاقة الشمسية في غزة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">أنظمة منزلية صغيرة</h3>
                <p>
                  يمكن للأنظمة الصغيرة (1-3 كيلوواط) أن تلبي الاحتياجات الأساسية للمنزل، مثل الإضاءة وشحن الهواتف وتشغيل أجهزة صغيرة، مما يوفر الاستقلال الطاقي الأساسي.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Small systems (1-3 kW) can meet basic household needs such as lighting, phone charging, and running small appliances, providing basic energy independence.
                </p>
              </div>
              
              {/* Arabic video about solar solutions in Gaza */}
              <div className="mt-4 border rounded-lg overflow-hidden">
                <h4 className="p-2 bg-muted text-center font-medium">شاهد: حلول الطاقة الشمسية في غزة | Watch: Solar Solutions in Gaza</h4>
                <div className="w-full">
                  <AspectRatio ratio={16 / 9}>
                    <iframe 
                      src="https://www.youtube.com/embed/avyg1UMvhLw" 
                      title="حلول الطاقة الشمسية في غزة" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                      className="w-full h-full rounded-b-lg"
                    ></iframe>
                  </AspectRatio>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">أنظمة للمرافق الحيوية</h3>
                <p>
                  يمكن للأنظمة الأكبر أن تدعم المستشفيات والمدارس ومحطات تحلية المياه، مما يضمن استمرار الخدمات الأساسية حتى أثناء انقطاع التيار الكهربائي العام.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Larger systems can support hospitals, schools, and water desalination stations, ensuring essential services continue even during general power outages.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">تحديات التنفيذ</h3>
                <p>
                  تشمل التحديات القيود المفروضة على استيراد المعدات، والتكلفة الأولية، ومحدودية المساحة. ومع ذلك، هناك مبادرات مستمرة لتجاوز هذه التحديات من خلال التمويل المبتكر والتصميمات المتخصصة.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Challenges include restrictions on importing equipment, initial cost, and limited space. However, there are ongoing initiatives to overcome these challenges through innovative financing and specialized designs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Adding a shorts/quick tips section with Arabic videos */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-center">نصائح سريعة | Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance video */}
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <h3 className="p-3 bg-solar-blue text-white text-center font-medium">صيانة الألواح الشمسية | Solar Panel Maintenance</h3>
            <AspectRatio ratio={9 / 16} className="max-h-[350px]">
              <iframe 
                src="https://www.youtube.com/embed/UM3vMq2G1Sk" 
                title="صيانة الألواح الشمسية" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                className="w-full h-full"
              ></iframe>
            </AspectRatio>
          </div>
          
          {/* Energy saving tips */}
          <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <h3 className="p-3 bg-solar-blue text-white text-center font-medium">توفير الطاقة | Energy Saving Tips</h3>
            <AspectRatio ratio={9 / 16} className="max-h-[350px]">
              <iframe 
                src="https://www.youtube.com/embed/K8KHZ2-9Z_0" 
                title="نصائح لتوفير الطاقة" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
                className="w-full h-full"
              ></iframe>
            </AspectRatio>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">أسئلة شائعة</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>كم تكلف الألواح الشمسية؟</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                تختلف التكلفة حسب الحجم والنوع، لكن نظامًا منزليًا صغيرًا يمكن أن يكلف بين 1000-3000 دولار. رغم أن التكلفة الأولية مرتفعة، إلا أنها استثمار يوفر المال على المدى الطويل.
              </p>
              <p className="text-sm text-muted-foreground">
                Costs vary depending on size and type, but a small home system can cost between $1000-3000. While the initial cost is high, it is an investment that saves money in the long run.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>هل تعمل الألواح الشمسية في الأيام الغائمة؟</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                نعم، تعمل الألواح الشمسية حتى في الأيام الغائمة، لكن بكفاءة أقل. يمكن للبطاريات تخزين الطاقة الزائدة من الأيام المشمسة للاستخدام عند الحاجة.
              </p>
              <p className="text-sm text-muted-foreground">
                Yes, solar panels work even on cloudy days, but with less efficiency. Batteries can store excess energy from sunny days for use when needed.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>كم من الوقت تستغرق الألواح الشمسية حتى تسترد تكلفتها؟</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                في غزة، حيث الكهرباء غير منتظمة ومكلفة، يمكن أن تسترد الألواح الشمسية تكلفتها في غضون 3-5 سنوات، اعتمادًا على حجم النظام واستهلاك الطاقة.
              </p>
              <p className="text-sm text-muted-foreground">
                In Gaza, where electricity is irregular and expensive, solar panels can recover their cost within 3-5 years, depending on system size and energy consumption.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>كم تستمر الألواح الشمسية؟</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                معظم الألواح الشمسية عالية الجودة لديها ضمان لمدة 25 عامًا ويمكن أن تستمر في العمل لأكثر من 30 عامًا، مع انخفاض تدريجي في الكفاءة مع مرور الوقت.
              </p>
              <p className="text-sm text-muted-foreground">
                Most high-quality solar panels have a 25-year warranty and can continue to function for over 30 years, with a gradual decrease in efficiency over time.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>طلب المزيد من المعلومات</CardTitle>
          <CardDescription>املأ النموذج أدناه وسنتواصل معك</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input placeholder="محمد أحمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموقع في غزة</FormLabel>
                    <FormControl>
                      <Input placeholder="المدينة / الحي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسالتك (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="اكتب أسئلتك أو احتياجاتك الخاصة هنا" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      يمكنك طلب معلومات محددة أو استشارة حول احتياجاتك من الطاقة
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">
                <Send className="mr-2" />
                إرسال الطلب
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolarEducation;
