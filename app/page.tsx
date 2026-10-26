import { headers } from "next/headers";
import { getProducts } from "@/lib/core-api";
import { marketFromHost } from "@/lib/market";
import { getHomepageConfig } from "@/lib/homepage-api";
import { getPublicWebsiteSettings } from "@/lib/website-settings";
import StorefrontHomeClient, { type HomeProduct } from "@/components/StorefrontHomeClient";
import "./storefront-editorial.css";

export default async function HomePage() {
  const h = await headers();
  const market = marketFromHost(h.get("host") || "");
  const [raw, homepage, settings] = await Promise.all([
    getProducts(market.code),
    getHomepageConfig(market.code === "VN" ? "VN" : "INTERNATIONAL"),
    getPublicWebsiteSettings(market.code === "VN" ? "VN" : "INTERNATIONAL"),
  ]);

  const products: HomeProduct[] = raw.map((p: any) => {
    const prices = (p.variants || []).map((v:any)=>Number(v.price||0)).filter((x:number)=>x>0);
    return {
      id:p.id,slug:p.slug,name:p.name,description:p.description,
      imageUrl:p.imageUrl,category:p.category,
      price:prices.length?Math.min(...prices):0,
      color:p.variants?.find((v:any)=>v.color)?.color||"",
      inStock:(p.variants||[]).some((v:any)=>Number(v.stock||0)>0),
    };
  });

  return <StorefrontHomeClient products={products} homepage={homepage} settings={settings} />;
}
