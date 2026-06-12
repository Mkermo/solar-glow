import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/api/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import ProductVisual from "./ProductVisual";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/** Editorial catalogue card: large visual plate, hairline rules, mono price. */
const ProductCard = ({ product, className }: ProductCardProps) => {
  const { t } = useLanguage();

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        "group block border border-ink/15 bg-paper transition-colors duration-300 hover:border-ink",
        className,
      )}
    >
      <ProductVisual product={product} className="shine aspect-[4/3] w-full" />

      <div className="space-y-3 border-t border-ink/15 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl leading-tight">
            {t(product.name, product.name_ar)}
          </h3>
          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-45 group-hover:text-solar-deep" />
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {t(product.description ?? "", product.description_ar)}
        </p>

        <div className="flex items-center justify-between border-t border-ink/10 pt-3">
          <span className="font-mono text-sm font-bold">
            {formatCurrency(product.effective_price)}
            {product.sale_price && (
              <span className="ml-2 font-normal text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </span>
          <span className="kicker text-[0.6rem] text-muted-foreground">
            {product.in_stock ? t("In stock", "متوفر") : t("Sold out", "نفذ")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
