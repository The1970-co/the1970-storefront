export type PublicWebsiteSettings = {
  market: string;
  cartEnabled: boolean;
  checkoutEnabled: boolean;
  newCustomerDiscountEnabled: boolean;
  newCustomerDiscountPercent: number;
  messengerEnabled: boolean;
  messengerUrl: string | null;
  zaloEnabled: boolean;
  zaloUrl: string | null;
};

const DEFAULTS: PublicWebsiteSettings = {
  market: "VN",
  cartEnabled: false,
  checkoutEnabled: false,
  newCustomerDiscountEnabled: false,
  newCustomerDiscountPercent: 0,
  messengerEnabled: false,
  messengerUrl: null,
  zaloEnabled: false,
  zaloUrl: null,
};

function base() {
  return (
    process.env.CORE_API_URL ||
    process.env.NEXT_PUBLIC_CORE_API_URL ||
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

export async function getPublicWebsiteSettings(
  market = "VN",
): Promise<PublicWebsiteSettings> {
  try {
    const response = await fetch(
      `${base()}/storefront/settings?market=${encodeURIComponent(market)}`,
      { cache: "no-store" },
    );

    if (!response.ok) return { ...DEFAULTS, market };

    const row = await response.json();

    return {
      market: String(row?.market || market),
      cartEnabled: Boolean(row?.cartEnabled),
      checkoutEnabled: Boolean(row?.checkoutEnabled),
      newCustomerDiscountEnabled: Boolean(row?.newCustomerDiscountEnabled),
      newCustomerDiscountPercent: Number(row?.newCustomerDiscountPercent || 0),
      messengerEnabled: Boolean(row?.messengerEnabled),
      messengerUrl: row?.messengerUrl || null,
      zaloEnabled: Boolean(row?.zaloEnabled),
      zaloUrl: row?.zaloUrl || null,
    };
  } catch {
    return { ...DEFAULTS, market };
  }
}
