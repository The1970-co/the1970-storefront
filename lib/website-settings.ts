export type PublicWebsiteSettings = {
  cartEnabled: boolean;
  checkoutEnabled: boolean;
  newCustomerDiscountEnabled: boolean;
  newCustomerDiscountPercent: number;
  messengerEnabled: boolean;
  messengerUrl?: string | null;
  zaloEnabled: boolean;
  zaloUrl?: string | null;
};

export const DEFAULT_WEBSITE_SETTINGS: PublicWebsiteSettings = {
  cartEnabled: false,
  checkoutEnabled: false,
  newCustomerDiscountEnabled: false,
  newCustomerDiscountPercent: 0,
  messengerEnabled: false,
  messengerUrl: null,
  zaloEnabled: false,
  zaloUrl: null,
};

export function coreBase() {
  return (
    process.env.CORE_API_URL ||
    process.env.NEXT_PUBLIC_CORE_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

export async function getPublicWebsiteSettings(market = "VN") {
  try {
    const res = await fetch(
      `${coreBase()}/storefront/settings?market=${encodeURIComponent(market)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return DEFAULT_WEBSITE_SETTINGS;
    return { ...DEFAULT_WEBSITE_SETTINGS, ...(await res.json()) };
  } catch {
    return DEFAULT_WEBSITE_SETTINGS;
  }
}
