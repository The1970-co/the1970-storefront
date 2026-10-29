import { headers } from "next/headers";
import { getProducts } from "@/lib/core-api";
import { marketFromHost } from "@/lib/market";
import { getHomepageConfig } from "@/lib/homepage-api";
import { getPublicWebsiteSettings } from "@/lib/website-settings";
import StorefrontHomeClient, {
  type HomeProduct,
} from "@/components/StorefrontHomeClient";
import "./storefront-editorial.css";

function resolveHomepageMarket(hostValue: string) {
  const hostname = String(hostValue || "")
    .split(":")[0]
    .trim()
    .toLowerCase();

  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  const isVietnam =
    isLocal ||
    hostname === "web.the1970.co" ||
    hostname === "the1970.vn" ||
    hostname === "www.the1970.vn";

  return isVietnam ? "VN" : "INTERNATIONAL";
}

export default async function HomePage() {
  const h = await headers();
  const host = h.get("host") || "";

  const detectedMarket = marketFromHost(host);
  const homepageMarket = resolveHomepageMarket(host);

  const catalogMarket =
    homepageMarket === "VN"
      ? "VN"
      : detectedMarket.code;

  const [raw, homepage, settings] = await Promise.all([
    getProducts(catalogMarket),
    getHomepageConfig(homepageMarket),
    getPublicWebsiteSettings(homepageMarket),
  ]);

  const products: HomeProduct[] = raw.map((p) => {
    const prices = p.variants
      .map((v) => Number(v.price || 0))
      .filter(
        (x) =>
          Number.isFinite(x) &&
          x > 0,
      );

    const price = prices.length
      ? Math.min(...prices)
      : 0;

    const inStock = p.variants.some(
      (v) => Number(v.stock || 0) > 0,
    );

    const firstColor =
      p.variants.find((v) => v.color)
        ?.color || "";

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
      settings={settings}
    />
  );
}
