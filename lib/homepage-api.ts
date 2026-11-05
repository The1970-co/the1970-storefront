export type HomepageImage = {
  id: string;
  url: string;
  altVi?: string;
  altEn?: string;
  link?: string;
};

export type HomepageItem = {
  id: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  bodyVi: string;
  bodyEn: string;
  ctaVi: string;
  ctaEn: string;
  link: string;
  mediaMode: "single" | "slider";
  autoplayMs: number;
  images: HomepageImage[];
  mediaType?: "image" | "video";
  videoUrl?: string;
  style?: Record<string, any>;
};

export type HomepageBlock = {
  id: string;
  type:
    | "FULL_BLEED_HERO"
    | "HERO_SPLIT"
    | "CARD_ROW"
    | "STORY_WIDE"
    | "STORY_SPLIT"
    | "PRODUCT_GRID";
  enabled: boolean;
  titleVi: string;
  titleEn: string;
  layout: string;
  settings: Record<string, any>;
  items: HomepageItem[];
};

export type HomepageConfig = {
  version: number;
  blocks: HomepageBlock[];
};

const PROD_CORE =
  "https://the1970-core-api-production.up.railway.app";

function base() {
  if (process.env.NODE_ENV !== "production") {
    return (
      process.env.NEXT_PUBLIC_CORE_API_URL ||
      process.env.CORE_API_URL ||
      "http://localhost:3001"
    ).replace(/\/$/, "");
  }

  // Homepage production luôn đọc đúng Core production.
  // Không để env cũ / service cũ làm Operations và Storefront lệch DB.
  return PROD_CORE;
}

export async function getHomepageConfig(
  market = "VN",
): Promise<HomepageConfig | null> {
  try {
    const res = await fetch(
      `${base()}/storefront/homepage?market=${encodeURIComponent(
        market,
      )}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    return (await res.json()) as HomepageConfig;
  } catch {
    return null;
  }
}
