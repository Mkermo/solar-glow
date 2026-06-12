import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";

interface SectionHeadingProps {
  index: string;
  kicker: string;
  className?: string;
  dark?: boolean;
}

/**
 * Print-magazine chapter rule: hairline, numbered index, mono kicker, asterisk.
 */
const SectionHeading = ({ index, kicker, className, dark = false }: SectionHeadingProps) => (
  <ScrollReveal className={cn("rule", dark ? "border-white/15" : "border-ink/15", className)}>
    <span className={cn("kicker", dark ? "text-solar" : "text-solar-deep")}>
      № {index} — {kicker}
    </span>
    <span aria-hidden className={cn("ml-auto", dark ? "text-solar" : "text-solar-deep")}>
      ✦
    </span>
  </ScrollReveal>
);

export const SectionTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <ScrollReveal delay={0.08}>
    <h2 className={cn("mt-6 font-serif text-display-md", className)}>{children}</h2>
  </ScrollReveal>
);

export default SectionHeading;
