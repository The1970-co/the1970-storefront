import { headers } from "next/headers";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/core-api";
import { marketFromHost } from "@/lib/market";

function normalizeCollectionSlug(value: string) {
  return decodeURIComponent(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

export default async function Collection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeCollectionSlug(rawSlug);

  const h = await headers();
  const market = marketFromHost(h.get("host") || "");

  let products = await getProducts(market.code);

  // Menu website là nguồn danh mục duy nhất:
  // /collections/shirts -> WebsiteProduct.websiteCategorySlugs chứa "shirts".
  if (!["all", "sale"].includes(slug)) {
    products = products.filter((product) =>
      product.websiteCategorySlugs.includes(slug),
    );
  }

  return (
    <main className="section wrap">
      <div className="eyebrow">COLLECTION</div>

      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 400,
          fontSize: 44,
        }}
      >
        {slug.replaceAll("-", " ").toUpperCase()}
      </h2>

      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            p={product}
            market={market.code}
          />
        ))}
      </div>
    </main>
  );
}
