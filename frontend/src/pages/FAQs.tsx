import { useFaqs } from "@/api/queries";
import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { editorialIndex } from "@/lib/format";

const FAQs = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useFaqs();

  return (
    <div>
      <PageHeader
        kicker={t("The Index", "الفهرس")}
        title={
          <>
            {t("Questions,", "أسئلة،")} <em className="text-gloss">{t("answered", "وأجوبة")}</em>
          </>
        }
        intro={t(
          "Everything readers ask before going solar — typeset for quick reference.",
          "كل ما يسأله القراء قبل التحول للطاقة الشمسية — منسق للمراجعة السريعة.",
        )}
      />

      <section className="container max-w-4xl py-16">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 bg-ink/10" />
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <Accordion type="single" collapsible className="w-full">
              {(data?.data ?? []).map((faq, i) => (
                <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-ink/15">
                  <AccordionTrigger className="gap-6 py-6 text-left font-serif text-xl hover:no-underline [&>svg]:text-solar-deep">
                    <span className="flex items-baseline gap-5">
                      <span className="font-mono text-sm text-muted-foreground">
                        {editorialIndex(i)}
                      </span>
                      {t(faq.question, faq.question_ar)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 pl-12 text-base leading-relaxed text-muted-foreground">
                    {t(faq.answer, faq.answer_ar)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollReveal>
        )}
      </section>
    </div>
  );
};

export default FAQs;
