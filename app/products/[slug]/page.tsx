import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import "./product-detail.css";

type AnyRecord = Record<string, any>;

function coreBase() {
  return (
    process.env.CORE_API_URL ||
    process.env.NEXT_PUBLIC_CORE_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

function num(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeProduct(raw: AnyRecord) {
  const images = Array.isArray(raw?.images)
    ? raw.images
        .map((x: AnyRecord) => ({
          url: String(x?.url || ""),
          alt: String(x?.altVi || x?.altEn || x?.alt || raw?.name || ""),
        }))
        .filter((x: { url: string }) => x.url)
    : [];

  const imageUrl = String(raw?.imageUrl || images[0]?.url || "");

  return {
    id: String(raw?.id || ""),
    slug: String(raw?.slug || ""),
    name: String(raw?.name || ""),
    shortDescription: String(
      raw?.shortDescription ||
        raw?.shortDescriptionVi ||
        raw?.descriptionShort ||
        "",
    ),
    description: String(raw?.description || raw?.descriptionVi || ""),
    imageUrl,
    images: images.length
      ? images
      : imageUrl
        ? [{ url: imageUrl, alt: raw?.name || "" }]
        : [],
    category: String(raw?.category || ""),
    featured: raw?.featured === true,
    variants: Array.isArray(raw?.variants)
      ? raw.variants.map((v: AnyRecord) => ({
          id: String(v?.id || ""),
          sku: String(v?.sku || ""),
          color: String(v?.color || ""),
          size: String(v?.size || ""),
          price: num(v?.price),
          compareAtPrice: num(v?.compareAtPrice),
          stock: num(v?.stock),
        }))
      : [],
  };
}

async function request(path: string) {
  const url = `${coreBase()}${path}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`[storefront] cannot fetch ${url}`, error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [rawProduct, rawProducts] = await Promise.all([
    request(`/storefront/products/${encodeURIComponent(slug)}`),
    request("/storefront/products"),
  ]);

  if (!rawProduct) notFound();

  const product = normalizeProduct(rawProduct);

  const allOtherProducts = Array.isArray(rawProducts)
    ? rawProducts
        .map(normalizeProduct)
        .filter((item) => item.id !== product.id && item.slug)
    : [];

  const related = [
    ...allOtherProducts.filter(
      (item) =>
        (product.category && item.category === product.category) ||
        item.featured,
    ),
    ...allOtherProducts.filter(
      (item) =>
        !(
          (product.category && item.category === product.category) ||
          item.featured
        ),
    ),
  ]
    .filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.id === item.id) === index,
    )
    .slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}
