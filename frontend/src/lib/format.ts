/** Shared formatting helpers — keep all display formatting in one place (DRY). */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatCurrency = (value: number): string => currencyFormatter.format(value);

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

/** Two-digit editorial index numbers: 01, 02, 03 … */
export const editorialIndex = (i: number): string => String(i + 1).padStart(2, "0");
