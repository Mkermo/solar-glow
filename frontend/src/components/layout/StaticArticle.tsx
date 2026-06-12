import PageHeader from "@/components/layout/PageHeader";
import ScrollReveal from "@/components/decor/ScrollReveal";
import { editorialIndex } from "@/lib/format";
import type { ReactNode } from "react";

export interface ArticleSection {
  heading: string;
  body: string;
}

interface StaticArticleProps {
  kicker: string;
  title: ReactNode;
  intro?: string;
  sections: ArticleSection[];
}

/** Shared layout for editorial text pages (terms, returns, education…). */
const StaticArticle = ({ kicker, title, intro, sections }: StaticArticleProps) => (
  <div>
    <PageHeader kicker={kicker} title={title} intro={intro} />
    <section className="container max-w-4xl py-16">
      {sections.map((section, i) => (
        <ScrollReveal key={section.heading} delay={i * 0.05}>
          <article className="grid gap-4 border-t border-ink/15 py-10 last:border-b md:grid-cols-[auto,1fr] md:gap-10">
            <span className="font-serif text-4xl italic text-solar-deep">{editorialIndex(i)}</span>
            <div>
              <h2 className="font-serif text-2xl">{section.heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          </article>
        </ScrollReveal>
      ))}
    </section>
  </div>
);

export default StaticArticle;
