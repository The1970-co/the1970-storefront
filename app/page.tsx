import { headers } from "next/headers";
import { getProducts } from "@/lib/core-api";
import { marketFromHost } from "@/lib/market";
import { getHomepageConfig } from "@/lib/homepage-api";
import StorefrontHomeClient, { type HomeProduct } from "@/components/StorefrontHomeClient";

export default async function HomePage() {
  const h = await headers();
  const market = marketFromHost(h.get("host") || "");
  const marketCode = market.code === "VN" ? "VN" : "INTERNATIONAL";

  const [raw, homepage] = await Promise.all([
    getProducts(market.code),
    getHomepageConfig(marketCode),
  ]);

  const products: HomeProduct[] = raw.map((p) => {
    const prices = p.variants
      .map((v) => Number(v.price || 0))
      .filter((x) => Number.isFinite(x) && x > 0);

    const price = prices.length ? Math.min(...prices) : 0;
    const inStock = p.variants.some((v) => Number(v.stock || 0) > 0);
    const firstColor = p.variants.find((v) => v.color)?.color || "";

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      category: p.category,
      price,
      color: firstColor,
      inStock,
    };
  });

  return (
    <StorefrontHomeClient
      products={products}
      homepage={homepage}
    />
  );
}
