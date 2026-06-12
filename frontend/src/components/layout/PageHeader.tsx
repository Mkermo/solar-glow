import type { ReactNode } from "react";
import ScrollReveal from "@/components/decor/ScrollReveal";

interface PageHeaderProps {
  kicker: string;
  title: ReactNode;
  intro?: string;
}

/** Shared editorial page masthead — dark plate with oversized serif title. */
const PageHeader = ({ kicker, title, intro }: PageHeaderProps) => (
  <section className="relative overflow-hidden bg-ink py-20 text-paper md:py-28">
    <div aria-hidden className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-solar/15 blur-3xl" />
    <div className="container relative">
      <ScrollReveal direction="none">
        <p className="kicker flex items-center gap-3 text-solar">
          <span aria-hidden>✦</span> {kicker}
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <h1 className="mt-6 max-w-4xl font-serif text-display-lg">{title}</h1>
      </ScrollReveal>
      {intro && (
        <ScrollReveal delay={0.2}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/65">{intro}</p>
        </ScrollReveal>
      )}
    </div>
  </section>
);

export default PageHeader;
