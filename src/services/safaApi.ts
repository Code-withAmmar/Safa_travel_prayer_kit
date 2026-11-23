import type {
  AdminStats,
  CollectionCategory,
  InquiryRecord,
  OrderRecord,
  OrderStatus,
  PackageTier,
  Product,
  ReviewRecord,
} from '../types/safa';
import {
  addLocalInquiry,
  addLocalReview,
  computeLocalAdminStats,
  createInitialLocalStore,
  createLocalProduct,
  isJsonContentType,
  isSafeLocalMediaUrl,
  normalizeLocalStore,
  patchLocalInquiryStatus,
  patchLocalOrderStatus,
  patchLocalProduct,
  placeLocalOrder,
  type LocalStoreState,
  type PlaceOrderPayload,
} from '../utils/localStoreFallback';

const LOCAL_STORE_KEY = 'safa_local_store_v1';
const LOCAL_TOKEN_PREFIX = 'local-admin:';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '')
  .trim()
  .replace(/\/+$/, '');

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function readLocalStore(): LocalStoreState {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) return createInitialLocalStore();
    return normalizeLocalStore(JSON.parse(raw) as Partial<LocalStoreState>);
  } catch {
    return createInitialLocalStore();
  }
}

function writeLocalStore(state: LocalStoreState): void {
  try {
    window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues in restricted browsers
  }
}

type JsonFetchResult<T> =
  | { kind: 'ok'; data: T }
  | { kind: 'api_error'; status: number; message: string }
  | { kind: 'unavailable' };

async function tryJsonFetch<T>(
  path: string,
  init?: RequestInit
): Promise<JsonFetchResult<T>> {
  try {
    const res = await fetch(apiUrl(path), init);
    const contentType = res.headers.get('content-type');
    if (!isJsonContentType(contentType)) {
      // Static hosts (e.g., Netlify) return HTML (<!DOCTYPE html>) for unmapped /api/* routes
      return { kind: 'unavailable' };
    }
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      return { kind: 'unavailable' };
    }
    if (!res.ok) {
      const errObj = parsed as { error?: string };
      return {
        kind: 'api_error',
        status: res.status,
        message: errObj?.error || `Request failed (${res.status}).`,
      };
    }
    return { kind: 'ok', data: parsed as T };
  } catch {
    return { kind: 'unavailable' };
  }
}

async function hashLocalPassword(password: string, saltHex?: string): Promise<{ salt: string; hash: string }> {
  let salt = saltHex;
  if (!salt) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    salt = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  return { salt, hash };
}

export async function apiFetchCatalogAndReviews(): Promise<{
  products: Product[];
  reviews: ReviewRecord[];
}> {
  const [prodRes, revRes] = await Promise.all([
    tryJsonFetch<{ products?: Product[] }>('/api/products'),
    tryJsonFetch<{ reviews?: ReviewRecord[] }>('/api/reviews'),
  ]);

  const local = readLocalStore();
  const products =
    prodRes.kind === 'ok' && Array.isArray(prodRes.data.products) && prodRes.data.products.length > 0
      ? prodRes.data.products
      : local.products;
  const reviews =
    revRes.kind === 'ok' && Array.isArray(revRes.data.reviews)
      ? revRes.data.reviews
      : local.reviews;

  return { products, reviews };
}

export async function apiSubmitOrder(payload: PlaceOrderPayload): Promise<OrderRecord> {
  const result = await tryJsonFetch<{ order?: OrderRecord }>('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (result.kind === 'ok') {
    if (!result.data.order) {
      throw new Error('Order submission failed.');
    }
    return result.data.order;
  }
  if (result.kind === 'api_error') {
    throw new Error(result.message);
  }

  // Static-host fallback (e.g., Netlify)
  const current = readLocalStore();
  const { state, order } = placeLocalOrder(current, payload);
  writeLocalStore(state);
  return order;
}

export async function apiSubmitReview(payload: {
  authorName: string;
  city: string;
  category: CollectionCategory;
  packageVersion: PackageTier;
  rating: number;
  comment: string;
}): Promise<ReviewRecord> {
  const result = await tryJsonFetch<{ review?: ReviewRecord }>('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (result.kind === 'ok') {
    if (!result.data.review) {
      throw new Error('Unable to save review.');
    }
    return result.data.review;
  }
  if (result.kind === 'api_error') {
    throw new Error(result.message);
  }

  const current = readLocalStore();
  const { state, review } = addLocalReview(current, payload);
  writeLocalStore(state);
  return review;
}

export async function apiSubmitInquiry(payload: {
  fullName: string;
  contact: string;
  email: string;
  subject: string;
  message: string;
}): Promise<InquiryRecord> {
  const result = await tryJsonFetch<{ inquiry?: InquiryRecord }>('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (result.kind === 'ok') {
    if (!result.data.inquiry) {
      throw new Error('Unable to send inquiry.');
    }
    return result.data.inquiry;
  }
  if (result.kind === 'api_error') {
    throw new Error(result.message);
  }

  const current = readLocalStore();
  const { state, inquiry } = addLocalInquiry(current, payload);
  writeLocalStore(state);
  return inquiry;
}

// ============================================================================
// ADMIN DASHBOARD API (Server-first with Static-Host Local Fallback)
// ============================================================================

export function isLocalAdminToken(token: string | null): boolean {
  return Boolean(token && token.startsWith(LOCAL_TOKEN_PREFIX));
}

export async function apiAdminAuthStatus(): Promise<{
  needsSetup: boolean;
  isLocalMode: boolean;
}> {
  const result = await tryJsonFetch<{ needsSetup: boolean }>('/api/admin/auth-status');
  if (result.kind === 'ok') {
    return { needsSetup: Boolean(result.data.needsSetup), isLocalMode: false };
  }
  const local = readLocalStore();
  return { needsSetup: !local.adminCredential, isLocalMode: true };
}

export async function apiAdminAuthenticate(
  needsSetup: boolean,
  password: string
): Promise<string> {
  const endpoint = needsSetup ? '/api/admin/bootstrap' : '/api/admin/login';
  const result = await tryJsonFetch<{ token?: string }>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  if (result.kind === 'ok') {
    if (!result.data.token) {
      throw new Error('Authentication failed.');
    }
    return result.data.token;
  }
  if (result.kind === 'api_error') {
    throw new Error(result.message);
  }

  // Static-host fallback using salted SHA-256 in localStorage
  const local = readLocalStore();
  if (needsSetup) {
    if (local.adminCredential) {
      throw new Error('Administrator password is already configured.');
    }
    if (password.length < 8 || password.length > 128) {
      throw new Error('Choose an admin password with at least 8 characters.');
    }
    const { salt, hash } = await hashLocalPassword(password);
    writeLocalStore({
      ...local,
      adminCredential: { salt, hash, claimedAt: new Date().toISOString() },
    });
    return `${LOCAL_TOKEN_PREFIX}${window.crypto.randomUUID()}`;
  }

  if (!local.adminCredential) {
    throw new Error('Admin password has not been set up yet.');
  }
  const { hash } = await hashLocalPassword(password, local.adminCredential.salt);
  if (hash !== local.adminCredential.hash) {
    throw new Error('Incorrect administrator password.');
  }
  return `${LOCAL_TOKEN_PREFIX}${window.crypto.randomUUID()}`;
}

export async function apiAdminDashboard(token: string): Promise<{
  unauthorized?: boolean;
  stats: AdminStats;
  products: Product[];
  orders: OrderRecord[];
  inquiries: InquiryRecord[];
}> {
  if (isLocalAdminToken(token)) {
    const local = readLocalStore();
    return {
      stats: computeLocalAdminStats(local),
      products: local.products,
      orders: local.orders,
      inquiries: local.inquiries,
    };
  }

  const result = await tryJsonFetch<{
    stats: AdminStats;
    products: Product[];
    orders: OrderRecord[];
    inquiries: InquiryRecord[];
  }>('/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (result.kind === 'ok') {
    return result.data;
  }
  if (result.kind === 'api_error') {
    if (result.status === 401) {
      return {
        unauthorized: true,
        stats: computeLocalAdminStats(createInitialLocalStore()),
        products: [],
        orders: [],
        inquiries: [],
      };
    }
    throw new Error(result.message);
  }

  const local = readLocalStore();
  return {
    stats: computeLocalAdminStats(local),
    products: local.products,
    orders: local.orders,
    inquiries: local.inquiries,
  };
}

export async function apiAdminUploadImage(token: string, dataUrl: string): Promise<string> {
  if (!isLocalAdminToken(token)) {
    const result = await tryJsonFetch<{ imageUrl?: string }>('/api/admin/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dataUrl }),
    });
    if (result.kind === 'ok' && result.data.imageUrl) {
      return result.data.imageUrl;
    }
    if (result.kind === 'api_error') {
      throw new Error(result.message);
    }
  }

  if (!isSafeLocalMediaUrl(dataUrl) || !dataUrl.startsWith('data:image/')) {
    throw new Error('Only JPEG, PNG, and WebP images are supported.');
  }
  if (dataUrl.length > 5_500_000) {
    throw new Error('Image must be 4 MB or smaller.');
  }
  return dataUrl;
}

export async function apiAdminUpdateProduct(
  token: string,
  productId: string,
  patch: Partial<Product>
): Promise<void> {
  if (!isLocalAdminToken(token)) {
    const result = await tryJsonFetch<{ product?: Product }>(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patch),
    });
    if (result.kind === 'ok') return;
    if (result.kind === 'api_error') throw new Error(result.message);
  }

  const current = readLocalStore();
  const { state } = patchLocalProduct(current, productId, patch);
  writeLocalStore(state);
}

export async function apiAdminCreateProduct(
  token: string,
  payload: Partial<Product>
): Promise<void> {
  if (!isLocalAdminToken(token)) {
    const result = await tryJsonFetch<{ product?: Product }>('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (result.kind === 'ok') return;
    if (result.kind === 'api_error') throw new Error(result.message);
  }

  const current = readLocalStore();
  const { state } = createLocalProduct(current, payload);
  writeLocalStore(state);
}

export async function apiAdminUpdateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus
): Promise<void> {
  if (!isLocalAdminToken(token)) {
    const result = await tryJsonFetch<{ order?: OrderRecord }>(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (result.kind === 'ok') return;
    if (result.kind === 'api_error') throw new Error(result.message);
  }

  const current = readLocalStore();
  const { state } = patchLocalOrderStatus(current, orderId, status);
  writeLocalStore(state);
}

export async function apiAdminUpdateInquiryStatus(
  token: string,
  inquiryId: string,
  status: 'New' | 'Replied'
): Promise<void> {
  if (!isLocalAdminToken(token)) {
    const result = await tryJsonFetch<{ inquiry?: InquiryRecord }>(
      `/api/admin/inquiries/${inquiryId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );
    if (result.kind === 'ok') return;
    if (result.kind === 'api_error') throw new Error(result.message);
  }

  const current = readLocalStore();
  const { state } = patchLocalInquiryStatus(current, inquiryId, status);
  writeLocalStore(state);
}
