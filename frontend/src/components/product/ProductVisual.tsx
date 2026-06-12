import type { Product } from "@/api/types";
import { cn } from "@/lib/utils";

const categoryGradients: Record<string, string> = {
  panels: "from-[#1B2540] via-[#27375F] to-[#0B0B0F]",
  inverters: "from-[#3A1D0B] via-[#6B3410] to-[#0B0B0F]",
  batteries: "from-[#11321F] via-[#1E5435] to-[#0B0B0F]",
  accessories: "from-[#2E1B3A] via-[#4A2D5E] to-[#0B0B0F]",
};

interface ProductVisualProps {
  product: Product;
  className?: string;
}

/**
 * Large editorial product visual. Uses the uploaded image when present,
 * otherwise renders an intentional typographic plate: glossy category
 * gradient, oversized serif initial and the product index as print furniture.
 */
const ProductVisual = ({ product, className }: ProductVisualProps) => {
  if (product.image_url) {
    return (
      <div className={cn("overflow-hidden bg-ink-soft", className)}>
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  }

  const gradient = categoryGradients[product.category?.slug ?? ""] ?? categoryGradients.panels;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-paper",
        gradient,
        className,
      )}
    >
      {/* gloss highlight */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent" />
      {/* halo */}
      <div className="absolute -bottom-1/3 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full bg-solar/25 blur-3xl" />

      <span className="select-none font-serif italic text-[clamp(5rem,14vw,11rem)] leading-none text-paper/90">
        {product.name.replace(/^SolarG\s*/i, "").charAt(0)}
      </span>

      <span className="kicker absolute left-4 top-4 text-paper/60">
        {product.category?.name ?? "Solar"}
      </span>
      <span className="kicker absolute bottom-4 right-4 text-solar">
        SG/{String(product.id).padStart(3, "0")}
      </span>
    </div>
  );
};

export default ProductVisual;
