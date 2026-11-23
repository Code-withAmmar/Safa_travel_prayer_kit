import { SEED_PRODUCTS, SEED_REVIEWS } from '../data/seedCatalog';
import type {
  AdminStats,
  CollectionCategory,
  InquiryRecord,
  OrderRecord,
  OrderStatus,
  PackageTier,
  PaymentMethod,
  Product,
  ReviewRecord,
} from '../types/safa';
import {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  isSafeMediaUrl,
} from './storeLogic';

export interface LocalAdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

export interface LocalStoreState {
  products: Product[];
  orders: OrderRecord[];
  reviews: ReviewRecord[];
  inquiries: InquiryRecord[];
  adminCredential: LocalAdminCredential | null;
  orderSequence: number;
}

export interface PlaceOrderPayload {
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    postalCode?: string;
    notes?: string;
  };
  paymentMethod: PaymentMethod;
  items: Array<{ productId: string; quantity: number }>;
}

const VALID_CATEGORIES = new Set<CollectionCategory>(['men', 'women']);
const VALID_TIERS = new Set<PackageTier>([
  'Elite',
  'Premium',
  'Digital Plus',
  'Digital',
  'Classic',
]);
const VALID_PAYMENTS = new Set<PaymentMethod>(['cod', 'bank_transfer', 'digital_wallet']);
const VALID_ORDER_STATUSES = new Set<OrderStatus>([
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
]);

const SAFE_IMAGE_DATA_URL_RE = /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  return contentType.toLowerCase().includes('application/json');
}

export function isSafeLocalMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (isSafeMediaUrl(trimmed)) return true;
  return SAFE_IMAGE_DATA_URL_RE.test(trimmed);
}

function makeShortId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInitialLocalStore(): LocalStoreState {
  return {
    products: structuredClone(SEED_PRODUCTS),
    orders: [],
    reviews: structuredClone(SEED_REVIEWS),
    inquiries: [],
    adminCredential: null,
    orderSequence: 1001,
  };
}

export function normalizeLocalStore(raw: Partial<LocalStoreState> | null | undefined): LocalStoreState {
  if (!raw || typeof raw !== 'object') {
    return createInitialLocalStore();
  }
  return {
    products:
      Array.isArray(raw.products) && raw.products.length > 0
        ? raw.products
        : structuredClone(SEED_PRODUCTS),
    orders: Array.isArray(raw.orders) ? raw.orders : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : structuredClone(SEED_REVIEWS),
    inquiries: Array.isArray(raw.inquiries) ? raw.inquiries : [],
    adminCredential: raw.adminCredential ?? null,
    orderSequence: typeof raw.orderSequence === 'number' ? raw.orderSequence : 1001,
  };
}

export function computeLocalAdminStats(state: LocalStoreState): AdminStats {
  const nonCancelled = state.orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = state.orders.filter((o) => o.status === 'Pending').length;
  const activeProducts = state.products.filter((p) => p.available).length;
  const lowStockCount = state.products.filter((p) => p.stock <= 5).length;
  return {
    totalRevenue,
    totalOrders: state.orders.length,
    pendingOrders,
    activeProducts,
    lowStockCount,
    totalInquiries: state.inquiries.length,
  };
}

export function placeLocalOrder(
  state: LocalStoreState,
  payload: PlaceOrderPayload
): { state: LocalStoreState; order: OrderRecord } {
  const customer = payload.customer;
  if (!customer) {
    throw new Error('Customer delivery details are required.');
  }

  const fullName = String(customer.fullName ?? '').trim().slice(0, 100);
  const phone = String(customer.phone ?? '').trim().slice(0, 30);
  const email = String(customer.email ?? '').trim().slice(0, 120);
  const address = String(customer.address ?? '').trim().slice(0, 300);
  const city = String(customer.city ?? '').trim().slice(0, 80);
  const postalCode = String(customer.postalCode ?? '').trim().slice(0, 20);
  const notes = String(customer.notes ?? '').trim().slice(0, 300);

  if (fullName.length < 2) {
    throw new Error('Full name is required.');
  }
  const phoneDigits = phone.replace(/[^\d+]/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    throw new Error('A valid contact number is required.');
  }
  if (address.length < 8) {
    throw new Error('Complete delivery address is required.');
  }
  if (city.length < 2) {
    throw new Error('Delivery city is required.');
  }
  if (!VALID_PAYMENTS.has(payload.paymentMethod)) {
    throw new Error('Please select a valid payment method.');
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Your shopping cart is empty.');
  }

  const orderItems: OrderRecord['items'] = [];
  for (const line of payload.items) {
    const product = state.products.find((p) => p.id === line.productId);
    const qty = Math.floor(Number(line.quantity ?? 0));
    if (!product || !product.available) {
      throw new Error('One of the selected prayer kits is currently unavailable.');
    }
    if (qty < 1 || qty > 50) {
      throw new Error(`Invalid quantity for ${product.name}.`);
    }
    if (product.stock < qty) {
      throw new Error(`Only ${product.stock} unit(s) of ${product.name} remaining in stock.`);
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      packageVersion: product.packageVersion,
      unitPrice: product.price,
      quantity: qty,
      lineTotal: product.price * qty,
      image: product.image,
    });
  }

  const qtyByProduct = new Map<string, number>();
  for (const item of orderItems) {
    qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const nextProducts = state.products.map((product) => {
    const deducted = qtyByProduct.get(product.id);
    if (!deducted) return product;
    return { ...product, stock: Math.max(0, product.stock - deducted) };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const total = subtotal + deliveryCharge;
  const seq = state.orderSequence;

  const order: OrderRecord = {
    id: makeShortId('ord'),
    reference: `SAFA-2026-${seq}`,
    createdAt: new Date().toISOString(),
    status: 'Pending',
    paymentMethod: payload.paymentMethod,
    customer: {
      fullName,
      phone,
      email: email || undefined,
      address,
      city,
      postalCode: postalCode || undefined,
      notes: notes || undefined,
    },
    items: orderItems,
    subtotal,
    deliveryCharge,
    total,
  };

  return {
    order,
    state: {
      ...state,
      products: nextProducts,
      orders: [order, ...state.orders],
      orderSequence: seq + 1,
    },
  };
}

export function addLocalReview(
  state: LocalStoreState,
  payload: {
    authorName: string;
    city: string;
    category: CollectionCategory;
    packageVersion: PackageTier;
    rating: number;
    comment: string;
  }
): { state: LocalStoreState; review: ReviewRecord } {
  const authorName = String(payload.authorName ?? '').trim().slice(0, 80);
  const city = String(payload.city ?? '').trim().slice(0, 60);
  const comment = String(payload.comment ?? '').trim().slice(0, 600);
  const rating = Math.round(Number(payload.rating ?? 5));

  if (authorName.length < 2) {
    throw new Error('Please enter your name.');
  }
  if (city.length < 2) {
    throw new Error('Please enter your city.');
  }
  if (comment.length < 10) {
    throw new Error('Please write at least 10 characters about your SAFA kit.');
  }
  if (!VALID_CATEGORIES.has(payload.category) || !VALID_TIERS.has(payload.packageVersion)) {
    throw new Error('Invalid collection or package tier selected.');
  }
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }

  const review: ReviewRecord = {
    id: makeShortId('rev'),
    authorName,
    city,
    category: payload.category,
    packageVersion: payload.packageVersion,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  return {
    review,
    state: {
      ...state,
      reviews: [review, ...state.reviews],
    },
  };
}

export function addLocalInquiry(
  state: LocalStoreState,
  payload: {
    fullName: string;
    contact: string;
    email: string;
    subject: string;
    message: string;
  }
): { state: LocalStoreState; inquiry: InquiryRecord } {
  const fullName = String(payload.fullName ?? '').trim().slice(0, 100);
  const contact = String(payload.contact ?? '').trim().slice(0, 40);
  const email = String(payload.email ?? '').trim().slice(0, 120);
  const subject = String(payload.subject ?? 'General Inquiry').trim().slice(0, 120);
  const message = String(payload.message ?? '').trim().slice(0, 1200);

  if (fullName.length < 2) {
    throw new Error('Please enter your name.');
  }
  if (contact.length < 7 && !email.includes('@')) {
    throw new Error('Please provide a valid WhatsApp/phone number or email.');
  }
  if (message.length < 8) {
    throw new Error('Please enter a short message explaining how we can help.');
  }

  const inquiry: InquiryRecord = {
    id: makeShortId('inq'),
    fullName,
    contact,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
    status: 'New',
  };

  return {
    inquiry,
    state: {
      ...state,
      inquiries: [inquiry, ...state.inquiries],
    },
  };
}

export function createLocalProduct(
  state: LocalStoreState,
  payload: Partial<Product>
): { state: LocalStoreState; product: Product } {
  const name = String(payload.name ?? '').trim().slice(0, 120);
  const category = payload.category as CollectionCategory;
  const packageVersion = payload.packageVersion as PackageTier;
  const price = Math.round(Number(payload.price ?? 0));
  const stock = Math.max(0, Math.round(Number(payload.stock ?? 0)));
  const shortDescription = String(payload.shortDescription ?? '').trim().slice(0, 320);
  const description = String(payload.description ?? shortDescription).trim().slice(0, 1200);
  const tasbihSummary = String(payload.tasbihSummary ?? '').trim().slice(0, 160);
  const image = String(payload.image ?? '').trim();

  if (name.length < 3) {
    throw new Error('Product name must be at least 3 characters.');
  }
  if (!VALID_CATEGORIES.has(category) || !VALID_TIERS.has(packageVersion)) {
    throw new Error('Invalid category or package tier.');
  }
  if (!Number.isFinite(price) || price < 100) {
    throw new Error('Enter a valid PKR price (at least Rs. 100).');
  }
  if (!isSafeLocalMediaUrl(image)) {
    throw new Error('Provide a valid uploaded image or asset URL.');
  }

  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = `${category}-${slugBase}-${makeShortId('p').slice(-4)}`;

  const product: Product = {
    id,
    slug: id,
    name,
    category,
    packageVersion,
    price,
    shortDescription:
      shortDescription ||
      'Double-layered non-slip travel prayer mat, tier-specific tasbih, 30 ml mini hand wash & prayer cap.',
    description:
      description ||
      'Packaged in SAFA’s signature clear cylindrical travel canister with colour-matched metallic lid.',
    image,
    gallery: [image],
    tasbihSummary: tasbihSummary || 'Tier-specific Tasbih Counter',
    accessories: [
      {
        name: 'Double-Layered Non-Slip Prayer Mat',
        detail: 'Stitched double-layered polyester fabric with underside silicone grip dots.',
      },
      {
        name: tasbihSummary || 'Tasbih Counter',
        detail: 'Included tier-specific dhikr companion.',
      },
      {
        name: 'Mini Hand Wash (30 ml)',
        detail: 'Compact 30 ml travel hand wash bottle.',
      },
      {
        name: 'Prayer Cap',
        detail: 'Comfortable matching travel prayer cap.',
      },
    ],
    specifications: [
      {
        label: 'Collection',
        value: category === 'men' ? "Men's Beige Collection" : "Women's Mauve Collection",
      },
      { label: 'Package Tier', value: `SAFA ${packageVersion}` },
      { label: 'Mat Material', value: 'Double-layered polyester with silicone grip dots' },
      { label: 'Hand Wash Volume', value: '30 ml leak-resistant travel bottle' },
    ],
    stock,
    available: payload.available !== false,
    featured: Boolean(payload.featured),
  };

  return {
    product,
    state: {
      ...state,
      products: [...state.products, product],
    },
  };
}

export function patchLocalProduct(
  state: LocalStoreState,
  productId: string,
  patch: Partial<Product>
): { state: LocalStoreState; product: Product } {
  const existing = state.products.find((p) => p.id === productId);
  if (!existing) {
    throw new Error('Product not found.');
  }

  const updated: Product = { ...existing, gallery: [...existing.gallery] };
  if (typeof patch.name === 'string' && patch.name.trim().length >= 3) {
    updated.name = patch.name.trim().slice(0, 120);
  }
  if (typeof patch.price === 'number' && Number.isFinite(patch.price) && patch.price >= 100) {
    updated.price = Math.round(patch.price);
  }
  if (typeof patch.stock === 'number' && Number.isFinite(patch.stock) && patch.stock >= 0) {
    updated.stock = Math.round(patch.stock);
  }
  if (typeof patch.available === 'boolean') {
    updated.available = patch.available;
  }
  if (typeof patch.shortDescription === 'string' && patch.shortDescription.trim().length >= 5) {
    updated.shortDescription = patch.shortDescription.trim().slice(0, 320);
  }
  if (typeof patch.description === 'string' && patch.description.trim().length >= 5) {
    updated.description = patch.description.trim().slice(0, 1200);
  }
  if (typeof patch.tasbihSummary === 'string' && patch.tasbihSummary.trim().length >= 3) {
    updated.tasbihSummary = patch.tasbihSummary.trim().slice(0, 160);
  }
  if (typeof patch.image === 'string' && isSafeLocalMediaUrl(patch.image)) {
    updated.image = patch.image.trim();
    if (!updated.gallery.includes(updated.image)) {
      updated.gallery = [updated.image, ...updated.gallery];
    }
  }

  return {
    product: updated,
    state: {
      ...state,
      products: state.products.map((p) => (p.id === productId ? updated : p)),
    },
  };
}

export function patchLocalOrderStatus(
  state: LocalStoreState,
  orderId: string,
  status: OrderStatus
): { state: LocalStoreState; order: OrderRecord } {
  if (!VALID_ORDER_STATUSES.has(status)) {
    throw new Error('Invalid order status.');
  }
  const existing = state.orders.find((o) => o.id === orderId);
  if (!existing) {
    throw new Error('Order not found.');
  }
  const updated: OrderRecord = { ...existing, status };
  return {
    order: updated,
    state: {
      ...state,
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    },
  };
}

export function patchLocalInquiryStatus(
  state: LocalStoreState,
  inquiryId: string,
  status: 'New' | 'Replied'
): { state: LocalStoreState; inquiry: InquiryRecord } {
  if (status !== 'New' && status !== 'Replied') {
    throw new Error('Invalid inquiry status.');
  }
  const existing = state.inquiries.find((i) => i.id === inquiryId);
  if (!existing) {
    throw new Error('Inquiry not found.');
  }
  const updated: InquiryRecord = { ...existing, status };
  return {
    inquiry: updated,
    state: {
      ...state,
      inquiries: state.inquiries.map((i) => (i.id === inquiryId ? updated : i)),
    },
  };
}
