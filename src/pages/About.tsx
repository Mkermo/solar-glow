import { Info, Sun, Users, GraduationCap, Sparkles, BarChart, Globe, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const { lang, t } = useLanguage();

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-solar-blue to-blue-700 text-white py-16">
        <div className="container">
          <ScrollReveal initiallyVisible={true}>
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-white/20 text-white hover:bg-white/30 mb-4">
                {t("Established 2025", "تأسست عام 2025")}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t("Powering a Sustainable Future", "نحو مستقبل مستدام للطاقة")}
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                {t(
                  "SolarG is leading the renewable energy revolution in Gaza, providing clean power solutions for homes and businesses.",
                  "شركة سولار جي هي رائدة ثورة الطاقة المتجددة في غزة، حيث توفر حلول طاقة نظيفة للمنازل والشركات."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" variant="outline" className="text-black border-black/30 hover:bg-white/10">
                  {t("Our Products", "منتجاتنا")}
                </Button>
                <Button size="lg" variant="outline" className="text-black border-black/30 hover:bg-white/10">
                  {t("Contact Us", "اتصل بنا")}
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
      
      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t("Our Mission & Vision", "مهمتنا ورؤيتنا")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "We're on a mission to transform how Gaza powers its future through sustainable solar solutions.",
                  "نحن في مهمة لتحويل كيفية تشغيل غزة لمستقبلها من خلال حلول الطاقة الشمسية المستدامة."
                )}
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal direction="left">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 p-3 w-12 h-12 rounded-full flex items-center justify-center">
                    <Sun className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t("Our Mission", "مهمتنا")}</h3>
                  <p className="text-muted-foreground">
                    {t(
                      "To accelerate the transition to sustainable energy in Gaza by providing reliable, affordable, and accessible solar solutions that meet the unique needs of our community.",
                      "تسريع التحول إلى الطاقة المستدامة في غزة من خلال توفير حلول شمسية موثوقة وبأسعار معقولة ويسهل الوصول إليها تلبي الاحتياجات الفريدة لمجتمعنا."
                    )}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
            
            <ScrollReveal direction="right">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 p-3 w-12 h-12 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t("Our Vision", "رؤيتنا")}</h3>
                  <p className="text-muted-foreground">
                    {t(
                      "A Gaza where clean, reliable energy powers every home and business, creating a more sustainable, prosperous, and independent community.",
                      "غزة حيث تعمل الطاقة النظيفة والموثوقة على تشغيل كل منزل وشركة، مما يخلق مجتمعًا أكثر استدامة وازدهارًا واستقلالية."
                    )}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t("Our Core Values", "قيمنا الأساسية")}
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal direction="up" delay={0.1}>
              <Card className="h-full border-0 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 p-3 w-12 h-12 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("Quality", "الجودة")}</h3>
                  <p className="text-muted-foreground">
                    {t(
                      "We source only the highest-quality components for maximum reliability and performance.",
                      "نحن نوفر فقط المكونات ذات الجودة العالية لتحقيق أقصى قدر من الموثوقية والأداء."
                    )}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.2}>
              <Card className="h-full border-0 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 p-3 w-12 h-12 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("Sustainability", "الاستدامة")}</h3>
                  <p className="text-muted-foreground">
                    {t(
                      "We're committed to environmental responsibility in everything we do.",
                      "نحن ملتزمون بالمسؤولية البيئية في كل ما نقوم به."
                    )}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.3}>
              <Card className="h-full border-0 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 p-3 w-12 h-12 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("Community", "المجتمع")}</h3>
                  <p className="text-muted-foreground">
                    {t(
                      "We support the communities we serve through education and accessible energy solutions.",
                      "نحن ندعم المجتمعات التي نخدمها من خلال التعليم وحلول الطاقة التي يسهل الوصول إليها."
                    )}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>
      
      {/* Leadership Team */}
      <section className="py-16 bg-white">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t("Our Leadership Team", "فريق القيادة")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "Meet the experts behind SolarG's mission to bring renewable energy to Gaza.",
                  "تعرف على الخبراء وراء مهمة سولار جي لجلب الطاقة المتجددة إلى غزة."
                )}
              </p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0.1}>
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src="/images/team/mohammed.jpg" alt="Mohammed Al Jamal" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">MJ</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">Mohammed Al Jamal</h3>
                <p className="text-primary mb-2">{t("Founder & CEO", "المؤسس والرئيس التنفيذي")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "With over 15 years of experience in renewable energy, Mohammed leads our mission to power Gaza with sustainable solutions.",
                    "مع أكثر من 15 عامًا من الخبرة في مجال الطاقة المتجددة، يقود محمد مهمتنا لتزويد غزة بحلول مستدامة."
                  )}
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.2}>
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src="/images/team/sarah.jpg" alt="Sarah Khalidi" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">SK</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">Sarah Khalidi</h3>
                <p className="text-primary mb-2">{t("Chief Technology Officer", "رئيسة قسم التكنولوجيا")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "An electrical engineer with expertise in solar system design and optimization for maximum efficiency.",
                    "مهندسة كهربائية خبيرة في تصميم أنظمة الطاقة الشمسية وتحسينها لتحقيق أقصى قدر من الكفاءة."
                  )}
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={0.3}>
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarImage src="/images/team/ahmad.jpg" alt="Ahmad Nasser" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">AN</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">Ahmad Nasser</h3>
                <p className="text-primary mb-2">{t("Chief Operations Officer", "رئيس العمليات")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Ahmad ensures our installation and support services maintain the highest standards of quality and customer satisfaction.",
                    "يضمن أحمد أن خدمات التركيب والدعم لدينا تحافظ على أعلى معايير الجودة ورضا العملاء."
                  )}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-solar-blue to-blue-700 text-white">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold mb-4">
              {t("Ready to Make the Switch to Solar?", "هل أنت مستعد للتحول إلى الطاقة الشمسية؟")}
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              {t(
                "Contact our team today to learn more about our solar solutions and how they can benefit your home or business.",
                "اتصل بفريقنا اليوم لمعرفة المزيد عن حلول الطاقة الشمسية لدينا وكيف يمكن أن تفيد منزلك أو عملك."
              )}
            </p>
            <Button size="lg" className="bg-white text-solar-blue hover:bg-blue-50" asChild>
              <Link to="/">
                {t("Get Started", "ابدأ الآن")}
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default About;
