import { cn } from "@/lib/utils";

/**
 * Decorative CSS sun: glossy gold disc, slow-rotating tick ring and orbit lines.
 * Pure markup — no images needed.
 */
const SunDial = ({ className }: { className?: string }) => (
  <div aria-hidden className={cn("relative aspect-square", className)}>
    {/* halo */}
    <div className="absolute inset-[-18%] animate-pulse-glow rounded-full bg-solar/20 blur-3xl" />

    {/* rotating tick ring */}
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
      {Array.from({ length: 60 }).map((_, i) => (
        <line
          key={i}
          x1="100"
          y1="4"
          x2="100"
          y2={i % 5 === 0 ? "14" : "9"}
          stroke="currentColor"
          strokeWidth="1"
          opacity={i % 5 === 0 ? 0.9 : 0.35}
          transform={`rotate(${i * 6} 100 100)`}
        />
      ))}
    </svg>

    {/* orbit rings */}
    <div className="absolute inset-[12%] rounded-full border border-current opacity-20" />
    <div className="absolute inset-[24%] rounded-full border border-dashed border-current opacity-25" />

    {/* glossy core */}
    <div className="absolute inset-[32%] rounded-full bg-gradient-to-br from-solar-glow via-solar to-solar-ember shadow-[0_0_80px_rgba(255,181,39,0.55)]">
      <div className="absolute inset-x-[18%] top-[10%] h-[28%] rounded-full bg-white/45 blur-[6px]" />
    </div>
  </div>
);

export default SunDial;
