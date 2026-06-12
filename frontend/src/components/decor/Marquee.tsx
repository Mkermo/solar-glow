import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  slow?: boolean;
  separator?: string;
}

/** Infinite horizontal ticker — content is doubled so the loop is seamless. */
const Marquee = ({ items, className, slow = false, separator = "✦" }: MarqueeProps) => {
  const strip = (
    <>
      {items.map((item, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 whitespace-nowrap">
          {item}
          <span aria-hidden className="text-solar">
            {separator}
          </span>
        </span>
      ))}
    </>
  );

  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "inline-flex w-max items-center",
          slow ? "animate-marquee-slow" : "animate-marquee",
        )}
      >
        {strip}
        {strip}
      </div>
    </div>
  );
};

export default Marquee;
