import type {
  CartItem,
  CheckoutFormData,
  CollectionCategory,
  PackageTier,
  PageView,
  Product,
  ThemeMode,
} from '../types/safa';

export const FREE_DELIVERY_THRESHOLD = 5000;
export const STANDARD_DELIVERY_FEE = 250;

export function formatPKR(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `Rs. ${safe.toLocaleString('en-PK')}`;
}

export function resolveThemeMode(
  page: PageView,
  activeProductCategory?: CollectionCategory
): ThemeMode {
  if (page === 'men') return 'men';
  if (page === 'women') return 'women';
  if (page === 'product' && activeProductCategory) {
    return activeProductCategory;
  }
  return 'brand';
}

export function addToCartItems(
  items: CartItem[],
  product: Pick<Product, 'id' | 'name' | 'category' | 'packageVersion' | 'price' | 'image'>,
  quantity = 1
): CartItem[] {
  const qty = Math.max(1, Math.min(99, Math.floor(quantity)));
  const idx = items.findIndex(
    (item) =>
      item.productId === product.id &&
      item.category === product.category &&
      item.packageVersion === product.packageVersion
  );

  if (idx >= 0) {
    return items.map((item, i) =>
      i === idx ? { ...item, quantity: Math.min(99, item.quantity + qty) } : item
    );
  }

  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      category: product.category,
      packageVersion: product.packageVersion,
      price: product.price,
      image: product.image,
      quantity: qty,
    },
  ];
}

export function updateCartItemQuantity(
  items: CartItem[],
  productId: string,
  nextQuantity: number
): CartItem[] {
  if (nextQuantity <= 0) {
    return items.filter((item) => item.productId !== productId);
  }
  const bounded = Math.min(99, Math.floor(nextQuantity));
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: bounded } : item
  );
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function calculateCartTotals(items: CartItem[]): {
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  amountToFreeDelivery: number;
} {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (subtotal === 0) {
    return {
      itemCount: 0,
      subtotal: 0,
      deliveryCharge: 0,
      total: 0,
      amountToFreeDelivery: FREE_DELIVERY_THRESHOLD,
    };
  }
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  return {
    itemCount,
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
    amountToFreeDelivery,
  };
}

export interface ProductFilterOptions {
  category: 'all' | CollectionCategory;
  tier: 'all' | PackageTier;
  search: string;
  sortBy: 'featured' | 'price_asc' | 'price_desc';
}

const TIER_RANK: Record<PackageTier, number> = {
  Elite: 1,
  Premium: 2,
  'Digital Plus': 3,
  Digital: 4,
  Classic: 5,
};

export function filterAndSortProducts(
  products: Product[],
  options: ProductFilterOptions
): Product[] {
  const q = options.search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (options.category !== 'all' && p.category !== options.category) return false;
    if (options.tier !== 'all' && p.packageVersion !== options.tier) return false;
    if (q) {
      const hay = `${p.name} ${p.packageVersion} ${p.shortDescription} ${p.tasbihSummary} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (options.sortBy === 'price_asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (options.sortBy === 'price_desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else {
    sorted.sort((a, b) => {
      if (a.category !== b.category) return a.category === 'men' ? -1 : 1;
      return TIER_RANK[a.packageVersion] - TIER_RANK[b.packageVersion];
    });
  }
  return sorted;
}

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutFormData, string>>;

export function validateCheckoutForm(data: CheckoutFormData): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};

  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }

  const digits = data.phone.replace(/[^\d+]/g, '');
  if (!digits || digits.length < 10 || digits.length > 15) {
    errors.phone = 'Please enter a valid contact number (e.g. 0300-1234567).';
  }

  if (data.email.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address or leave blank.';
    }
  }

  if (!data.address.trim() || data.address.trim().length < 8) {
    errors.address = 'Please enter your complete street and house delivery address.';
  }

  if (!data.city.trim() || data.city.trim().length < 2) {
    errors.city = 'Please enter your delivery city.';
  }

  return errors;
}

export function isSafeMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/uploads/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isWishlisted(wishlistIds: string[], productId: string): boolean {
  return wishlistIds.includes(productId);
}

export function toggleWishlistItem(wishlistIds: string[], productId: string): string[] {
  if (!productId) return wishlistIds;
  if (wishlistIds.includes(productId)) {
    return wishlistIds.filter((id) => id !== productId);
  }
  return [productId, ...wishlistIds];
}

export function resolveWishlistedProducts(
  products: Product[],
  wishlistIds: string[]
): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const result: Product[] = [];
  for (const id of wishlistIds) {
    const match = byId.get(id);
    if (match) {
      result.push(match);
    }
  }
  return result;
}

