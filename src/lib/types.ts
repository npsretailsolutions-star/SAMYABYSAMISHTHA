export type ProductWithCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string; // JSON string array
  stock: number;
  sku: string | null;
  isFeatured: boolean;
  isGiftable: boolean;
  isActive: boolean;
  material: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: {
    id: string;
    attributeName: string;
    label: string;
    images: string;
    stock: number;
    sortOrder: number;
  }[];
};

export function parseImages(images: string): string[] {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr.length > 0 ? arr : ["/images/products/pendants-1.svg"];
  } catch {
    return ["/images/products/pendants-1.svg"];
  }
}

export type ProductVariant = {
  id: string;
  attributeName: string;
  label: string;
  images: string; // JSON string array
  stock: number;
  sku: string | null;
  sortOrder: number;
};

export type GiftWrapSelection = {
  box: boolean;
  card: boolean;
  cardMessage?: string;
  pouch: boolean;
};

export type CartItem = {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  giftWrap?: GiftWrapSelection | null;
  giftCharge?: number;
};
