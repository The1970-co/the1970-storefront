export type MarketCode = 'VN' | 'INTL';
export type StorefrontVariant = {
  id: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
};
export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  variants: StorefrontVariant[];
};
