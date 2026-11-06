import type {
  MarketCode,
  StorefrontProduct,
  StorefrontVariant,
} from "@/types/storefront";

type AnyRecord = Record<string, any>;

export type StorefrontProductWithCategories = StorefrontProduct & {
  websiteCategorySlugs: string[];
};

function n(value: unknown) {
  const x = Number(value || 0);
  return Number.isFinite(x) ? x : 0;
}

function publicVariant(
  raw: AnyRecord,
  market: MarketCode,
): StorefrontVariant {
  const price =
    market === "VN"
      ? n(raw.price)
      : n(
          raw.priceUsd ??
            raw.usPrice ??
            raw.internationalPrice ??
            raw.price ??
            0,
        );

  return {
    id: String(raw.id || ""),
    sku: String(raw.sku || ""),
    color: String(raw.color || ""),
    size: String(raw.size || ""),
    price,
    stock: n(raw.stock),
    imageUrl: raw.imageUrl || null,
  };
}

function publicProduct(
  raw: AnyRecord,
  market: MarketCode,
): StorefrontProductWithCategories {
  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || ""),
    name: String(raw.name || ""),
    description: raw.description || null,
    imageUrl: raw.imageUrl || null,
    category: raw.category || null,
    websiteCategorySlugs: Array.isArray(raw.websiteCategorySlugs)
      ? raw.websiteCategorySlugs
          .map((value: unknown) => String(value || "").trim().toLowerCase())
          .filter(Boolean)
      : [],
    variants: Array.isArray(raw.variants)
      ? raw.variants.map((v: AnyRecord) => publicVariant(v, market))
      : [],
  };
}

function coreApiBase() {
  return (
    process.env.CORE_API_URL ||
    process.env.NEXT_PUBLIC_CORE_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

async function request<T>(path: string): Promise<T | null> {
  const url = `${coreApiBase()}${path}`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[storefront] Core API ${response.status}: ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[storefront] Cannot reach Core API: ${url}`, error);
    return null;
  }
}

export async function getProducts(
  market: MarketCode,
): Promise<StorefrontProductWithCategories[]> {
  const rows = await request<AnyRecord[]>("/storefront/products");

  return Array.isArray(rows)
    ? rows.map((row) => publicProduct(row, market))
    : [];
}

export async function getProduct(
  slug: string,
  market: MarketCode,
): Promise<StorefrontProductWithCategories | null> {
  const row = await request<AnyRecord>(
    `/storefront/products/${encodeURIComponent(slug)}`,
  );

  return row ? publicProduct(row, market) : null;
}
