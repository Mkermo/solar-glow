import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "@/components/ScrollReveal";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters",
  }),
});

const Contact = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({
      title: t("Message sent successfully!", "تم إرسال الرسالة بنجاح!"),
      description: t("We'll get back to you as soon as possible.", "سنرد عليك في أقرب وقت ممكن."),
    });
    form.reset();
  };

  return (
    <div className="min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-solar-blue to-blue-700 text-white">
        <div className="container py-16 md:py-24">
          <ScrollReveal initiallyVisible={true}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("Get in Touch", "تواصل معنا")}
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.1}>
            <p className="text-lg md:text-xl max-w-2xl mb-6 text-blue-100">
              {t("Have a question about solar energy solutions? Our team is here to help you.", "هل لديك سؤال حول حلول الطاقة الشمسية؟ فريقنا هنا لمساعدتك.")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div>
              <ScrollReveal>
                <h2 className="text-2xl font-bold mb-6">{t("Contact Information", "معلومات الاتصال")}</h2>
              </ScrollReveal>
              
              <div className="space-y-6">
                <ScrollReveal direction="left" delay={0.1}>
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("Our Location", "موقعنا")}</h3>
                      <p className="text-muted-foreground">
                        {t("123 Solar Street, Gaza City", "١٢٣ شارع الشمس، مدينة غزة")}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal direction="left" delay={0.2}>
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("Phone Number", "رقم الهاتف")}</h3>
                      <p className="text-muted-foreground">+970 59 123 4567</p>
                      <p className="text-muted-foreground">+970 82 123 456</p>
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal direction="left" delay={0.3}>
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("Email Address", "البريد الإلكتروني")}</h3>
                      <p className="text-muted-foreground">info@solarg.com</p>
                      <p className="text-muted-foreground">support@solarg.com</p>
                    </div>
                  </div>
                </ScrollReveal>
                
                <ScrollReveal direction="left" delay={0.4}>
                  <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("Working Hours", "ساعات العمل")}</h3>
                      <p className="text-muted-foreground">
                        {t("Sunday - Thursday: 9:00 AM - 5:00 PM", "الأحد - الخميس: ٩:٠٠ ص - ٥:٠٠ م")}
                      </p>
                      <p className="text-muted-foreground">
                        {t("Friday - Saturday: Closed", "الجمعة - السبت: مغلق")}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
              
              <ScrollReveal delay={0.5}>
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">{t("Find Us on Map", "ابحث عنا على الخريطة")}</h3>
                  <div className="h-[250px] w-full bg-muted rounded-lg overflow-hidden border">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54360.89027887029!2d34.45181225!3d31.502200349999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14fd7f054e542767%3A0x7ff98dc913046392!2sGaza!5e0!3m2!1sen!2s!4v1661271283909!5m2!1sen!2s"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="SolarG Office Location"
                    ></iframe>
                  </div>
                </div>
              </ScrollReveal>
            </div>
            
            {/* Contact Form */}
            <ScrollReveal direction="right">
              <div className="bg-white rounded-lg shadow-md p-6 border">
                <h2 className="text-2xl font-bold mb-6">{t("Send Us a Message", "أرسل لنا رسالة")}</h2>
                
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="name">
                        {t("Your Name", "اسمك")}
                      </label>
                      <Input
                        id="name"
                        placeholder={t("Enter your full name", "أدخل اسمك الكامل")}
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">
                        {t("Email Address", "البريد الإلكتروني")}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("Enter your email", "أدخل بريدك الإلكتروني")}
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="subject">
                        {t("Subject", "الموضوع")}
                      </label>
                      <Input
                        id="subject"
                        placeholder={t("What is your message about?", "ما هو موضوع رسالتك؟")}
                        {...form.register("subject")}
                      />
                      {form.formState.errors.subject && (
                        <p className="text-red-500 text-sm">{form.formState.errors.subject.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="message">
                        {t("Your Message", "رسالتك")}
                      </label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder={t("Please enter your message here...", "يرجى كتابة رسالتك هنا...")}
                        {...form.register("message")}
                      />
                      {form.formState.errors.message && (
                        <p className="text-red-500 text-sm">{form.formState.errors.message.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    {t("Send Message", "إرسال الرسالة")}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-center mb-10">
              {t("Frequently Asked Questions", "الأسئلة الشائعة")}
            </h2>
          </ScrollReveal>
          
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold">{t("What are your delivery options?", "ما هي خيارات التوصيل المتاحة؟")}</h3>
                  <p className="text-muted-foreground mt-2">
                    {t("We offer delivery throughout Gaza and the West Bank. Delivery times vary based on your location and the products ordered. Please contact us for specific delivery times for your area.", "نقدم خدمة التوصيل في جميع أنحاء غزة والضفة الغربية. تختلف أوقات التسليم حسب موقعك والمنتجات التي طلبتها. يرجى الاتصال بنا لمعرفة أوقات التسليم المحددة لمنطقتك.")}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold">{t("Do you offer installation services?", "هل تقدمون خدمات التركيب؟")}</h3>
                  <p className="text-muted-foreground mt-2">
                    {t("Yes, we provide professional installation services for all our solar products. Our experienced technicians will ensure your system is installed correctly and operating efficiently.", "نعم، نقدم خدمات تركيب احترافية لجميع منتجاتنا الشمسية. سيضمن فنيونا ذوو الخبرة تركيب نظامك بشكل صحيح وتشغيله بكفاءة.")}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold">{t("What warranty do your products have?", "ما هي الضمانات التي تتمتع بها منتجاتكم؟")}</h3>
                  <p className="text-muted-foreground mt-2">
                    {t("Our solar panels come with a 25-year performance warranty and a 10-year product warranty. Inverters typically have a 5-10 year warranty depending on the model. All our products are covered by manufacturer warranties and our own service guarantees.", "تأتي ألواحنا الشمسية مع ضمان أداء لمدة 25 عامًا وضمان منتج لمدة 10 سنوات. عادة ما تتمتع المحولات بضمان من 5 إلى 10 سنوات حسب الطراز. جميع منتجاتنا مغطاة بضمانات المصنّع وضمانات الخدمة الخاصة بنا.")}
                  </p>
                </div>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="group" onClick={() => window.location.href = '/FAQs'}>
                  {t("View All FAQs", "عرض جميع الأسئلة الشائعة")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;