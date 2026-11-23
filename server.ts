import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_PRODUCTS, SEED_REVIEWS } from './src/data/seedCatalog.ts';
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
} from './src/types/safa.ts';
import {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  isSafeMediaUrl,
} from './src/utils/storeLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'safa-store.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

interface StoredAdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

interface StoreDatabase {
  products: Product[];
  orders: OrderRecord[];
  reviews: ReviewRecord[];
  inquiries: InquiryRecord[];
  adminCredential: StoredAdminCredential | null;
  orderSequence: number;
}

function ensureDirs(): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function createInitialStore(): StoreDatabase {
  return {
    products: structuredClone(SEED_PRODUCTS),
    orders: [],
    reviews: structuredClone(SEED_REVIEWS),
    inquiries: [],
    adminCredential: null,
    orderSequence: 1001,
  };
}

function loadStore(): StoreDatabase {
  ensureDirs();
  if (!fs.existsSync(STORE_FILE)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreDatabase>;
    return {
      products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : structuredClone(SEED_PRODUCTS),
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : structuredClone(SEED_REVIEWS),
      inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
      adminCredential: parsed.adminCredential ?? null,
      orderSequence: typeof parsed.orderSequence === 'number' ? parsed.orderSequence : 1001,
    };
  } catch {
    const fallback = createInitialStore();
    fs.writeFileSync(STORE_FILE, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveStore(db: StoreDatabase): void {
  ensureDirs();
  const tempPath = `${STORE_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempPath, STORE_FILE);
}

let store: StoreDatabase = loadStore();

function hashPassword(password: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex ?? crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derived };
}

function safeCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function signAdminToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      exp: Date.now() + SESSION_TTL_MS,
      nonce: crypto.randomBytes(8).toString('hex'),
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  if (!safeCompareStrings(sig, expectedSig)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };
    return decoded.role === 'admin' && typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

function getEnvAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE ?? '').trim();
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Administrator sign-in required.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }
  next();
}

const VALID_CATEGORIES = new Set<CollectionCategory>(['men', 'women']);
const VALID_TIERS = new Set<PackageTier>(['Elite', 'Premium', 'Digital Plus', 'Digital', 'Classic']);
const VALID_PAYMENTS = new Set<PaymentMethod>(['cod', 'bank_transfer', 'digital_wallet']);
const VALID_ORDER_STATUSES = new Set<OrderStatus>([
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
]);

function computeAdminStats(db: StoreDatabase): AdminStats {
  const nonCancelled = db.orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = db.orders.filter((o) => o.status === 'Pending').length;
  const activeProducts = db.products.filter((p) => p.available).length;
  const lowStockCount = db.products.filter((p) => p.stock <= 5).length;
  return {
    totalRevenue,
    totalOrders: db.orders.length,
    pendingOrders,
    activeProducts,
    lowStockCount,
    totalInquiries: db.inquiries.length,
  };
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '6mb' }));

  // Serve uploaded product images safely from /uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // =========================================================================
  // PUBLIC STOREFRONT API ROUTES
  // =========================================================================

  app.get('/api/products', (_req, res) => {
    res.json({ products: store.products });
  });

  app.get('/api/reviews', (_req, res) => {
    res.json({ reviews: store.reviews });
  });

  app.post('/api/reviews', (req, res) => {
    const body = req.body as Partial<ReviewRecord>;
    const authorName = String(body.authorName ?? '').trim().slice(0, 80);
    const city = String(body.city ?? '').trim().slice(0, 60);
    const comment = String(body.comment ?? '').trim().slice(0, 600);
    const rating = Math.round(Number(body.rating ?? 5));
    const category = body.category as CollectionCategory;
    const packageVersion = body.packageVersion as PackageTier;

    if (authorName.length < 2) {
      res.status(400).json({ error: 'Please enter your name.' });
      return;
    }
    if (city.length < 2) {
      res.status(400).json({ error: 'Please enter your city.' });
      return;
    }
    if (comment.length < 10) {
      res.status(400).json({ error: 'Please write at least 10 characters about your SAFA kit.' });
      return;
    }
    if (!VALID_CATEGORIES.has(category) || !VALID_TIERS.has(packageVersion)) {
      res.status(400).json({ error: 'Invalid collection or package tier selected.' });
      return;
    }
    if (rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5.' });
      return;
    }

    const review: ReviewRecord = {
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      authorName,
      city,
      category,
      packageVersion,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    store.reviews = [review, ...store.reviews];
    saveStore(store);
    res.status(201).json({ review });
  });

  app.post('/api/orders', (req, res) => {
    const body = req.body as {
      customer?: {
        fullName?: string;
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        notes?: string;
      };
      paymentMethod?: PaymentMethod;
      items?: Array<{ productId?: string; quantity?: number }>;
    };

    const customer = body.customer;
    const paymentMethod = body.paymentMethod;
    const requestedItems = Array.isArray(body.items) ? body.items : [];

    if (!customer) {
      res.status(400).json({ error: 'Customer delivery details are required.' });
      return;
    }

    const fullName = String(customer.fullName ?? '').trim().slice(0, 100);
    const phone = String(customer.phone ?? '').trim().slice(0, 30);
    const email = String(customer.email ?? '').trim().slice(0, 120);
    const address = String(customer.address ?? '').trim().slice(0, 300);
    const city = String(customer.city ?? '').trim().slice(0, 80);
    const postalCode = String(customer.postalCode ?? '').trim().slice(0, 20);
    const notes = String(customer.notes ?? '').trim().slice(0, 300);

    if (fullName.length < 2) {
      res.status(400).json({ error: 'Full name is required.' });
      return;
    }
    const phoneDigits = phone.replace(/[^\d+]/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      res.status(400).json({ error: 'A valid contact number is required.' });
      return;
    }
    if (address.length < 8) {
      res.status(400).json({ error: 'Complete delivery address is required.' });
      return;
    }
    if (city.length < 2) {
      res.status(400).json({ error: 'Delivery city is required.' });
      return;
    }
    if (!paymentMethod || !VALID_PAYMENTS.has(paymentMethod)) {
      res.status(400).json({ error: 'Please select a valid payment method.' });
      return;
    }
    if (requestedItems.length === 0) {
      res.status(400).json({ error: 'Your shopping cart is empty.' });
      return;
    }

    // Recompute prices and verify stock strictly from server-side catalog
    const orderItems: OrderRecord['items'] = [];
    for (const line of requestedItems) {
      const product = store.products.find((p) => p.id === line.productId);
      const qty = Math.floor(Number(line.quantity ?? 0));
      if (!product || !product.available) {
        res.status(400).json({ error: 'One of the selected prayer kits is currently unavailable.' });
        return;
      }
      if (qty < 1 || qty > 50) {
        res.status(400).json({ error: `Invalid quantity for ${product.name}.` });
        return;
      }
      if (product.stock < qty) {
        res.status(409).json({
          error: `Only ${product.stock} unit(s) of ${product.name} remaining in stock.`,
        });
        return;
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

    // Deduct stock atomically after validation succeeds
    for (const line of orderItems) {
      const product = store.products.find((p) => p.id === line.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - line.quantity);
      }
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    const total = subtotal + deliveryCharge;

    const seq = store.orderSequence++;
    const reference = `SAFA-2026-${seq}`;
    const order: OrderRecord = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      reference,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      paymentMethod,
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

    store.orders = [order, ...store.orders];
    saveStore(store);
    res.status(201).json({ order });
  });

  app.post('/api/inquiries', (req, res) => {
    const body = req.body as Partial<InquiryRecord>;
    const fullName = String(body.fullName ?? '').trim().slice(0, 100);
    const contact = String(body.contact ?? '').trim().slice(0, 40);
    const email = String(body.email ?? '').trim().slice(0, 120);
    const subject = String(body.subject ?? 'General Inquiry').trim().slice(0, 120);
    const message = String(body.message ?? '').trim().slice(0, 1200);

    if (fullName.length < 2) {
      res.status(400).json({ error: 'Please enter your name.' });
      return;
    }
    if (contact.length < 7 && !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid WhatsApp/phone number or email.' });
      return;
    }
    if (message.length < 8) {
      res.status(400).json({ error: 'Please enter a short message explaining how we can help.' });
      return;
    }

    const inquiry: InquiryRecord = {
      id: `inq-${crypto.randomUUID().slice(0, 8)}`,
      fullName,
      contact,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      status: 'New',
    };
    store.inquiries = [inquiry, ...store.inquiries];
    saveStore(store);
    res.status(201).json({ inquiry });
  });

  // =========================================================================
  // ADMIN AUTHENTICATION (First-Run Claim or Server-Side ADMIN_PASSCODE)
  // =========================================================================

  app.get('/api/admin/auth-status', (_req, res) => {
    const envPass = getEnvAdminPasscode();
    const needsSetup = !envPass && !store.adminCredential;
    res.json({
      needsSetup,
      usingEnvSecret: Boolean(envPass),
    });
  });

  app.post('/api/admin/bootstrap', (req, res) => {
    if (getEnvAdminPasscode() || store.adminCredential) {
      res.status(403).json({ error: 'Administrator password is already configured.' });
      return;
    }
    const password = String((req.body as { password?: string }).password ?? '');
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Choose an admin password with at least 8 characters.' });
      return;
    }
    const { salt, hash } = hashPassword(password);
    store.adminCredential = {
      salt,
      hash,
      claimedAt: new Date().toISOString(),
    };
    saveStore(store);
    const token = signAdminToken();
    res.status(201).json({ token });
  });

  app.post('/api/admin/login', (req, res) => {
    const password = String((req.body as { password?: string }).password ?? '');
    const envPass = getEnvAdminPasscode();

    if (envPass) {
      if (!safeCompareStrings(password, envPass)) {
        res.status(401).json({ error: 'Incorrect administrator password.' });
        return;
      }
      res.json({ token: signAdminToken() });
      return;
    }

    if (!store.adminCredential) {
      res.status(409).json({ error: 'Admin password has not been set up yet.' });
      return;
    }

    const { hash } = hashPassword(password, store.adminCredential.salt);
    if (!safeCompareStrings(hash, store.adminCredential.hash)) {
      res.status(401).json({ error: 'Incorrect administrator password.' });
      return;
    }

    res.json({ token: signAdminToken() });
  });

  // =========================================================================
  // PROTECTED ADMIN DASHBOARD ROUTES
  // =========================================================================

  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    res.json({
      stats: computeAdminStats(store),
      products: store.products,
      orders: store.orders,
      inquiries: store.inquiries,
    });
  });

  app.post('/api/admin/upload', requireAdmin, (req, res) => {
    const { dataUrl } = req.body as { dataUrl?: string };
    if (typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Image payload is required.' });
      return;
    }
    const match = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are supported.' });
      return;
    }
    const ext = match[1] === 'jpg' ? 'jpeg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      res.status(413).json({ error: 'Image must be 4 MB or smaller.' });
      return;
    }

    ensureDirs();
    const filename = `safa-${crypto.randomUUID()}.${ext}`;
    const resolvedPath = path.resolve(UPLOADS_DIR, filename);
    if (!resolvedPath.startsWith(UPLOADS_DIR + path.sep)) {
      res.status(400).json({ error: 'Invalid upload destination.' });
      return;
    }
    fs.writeFileSync(resolvedPath, buffer);
    res.status(201).json({ imageUrl: `/uploads/${filename}` });
  });

  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = req.body as Partial<Product>;
    const name = String(body.name ?? '').trim().slice(0, 120);
    const category = body.category as CollectionCategory;
    const packageVersion = body.packageVersion as PackageTier;
    const price = Math.round(Number(body.price ?? 0));
    const stock = Math.max(0, Math.round(Number(body.stock ?? 0)));
    const shortDescription = String(body.shortDescription ?? '').trim().slice(0, 320);
    const description = String(body.description ?? shortDescription).trim().slice(0, 1200);
    const tasbihSummary = String(body.tasbihSummary ?? '').trim().slice(0, 160);
    const image = String(body.image ?? '').trim();

    if (name.length < 3) {
      res.status(400).json({ error: 'Product name must be at least 3 characters.' });
      return;
    }
    if (!VALID_CATEGORIES.has(category) || !VALID_TIERS.has(packageVersion)) {
      res.status(400).json({ error: 'Invalid category or package tier.' });
      return;
    }
    if (!Number.isFinite(price) || price < 100) {
      res.status(400).json({ error: 'Enter a valid PKR price (at least Rs. 100).' });
      return;
    }
    if (!isSafeMediaUrl(image)) {
      res.status(400).json({ error: 'Provide a valid uploaded image or asset URL.' });
      return;
    }

    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `${category}-${slugBase}-${crypto.randomUUID().slice(0, 4)}`;

    const newProduct: Product = {
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
      accessories:
        Array.isArray(body.accessories) && body.accessories.length > 0
          ? body.accessories
          : [
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
      available: body.available !== false,
      featured: Boolean(body.featured),
    };

    store.products = [...store.products, newProduct];
    saveStore(store);
    res.status(201).json({ product: newProduct, stats: computeAdminStats(store) });
  });

  app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
    const product = store.products.find((p) => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    const body = req.body as Partial<Product>;
    if (typeof body.name === 'string' && body.name.trim().length >= 3) {
      product.name = body.name.trim().slice(0, 120);
    }
    if (typeof body.price === 'number' && Number.isFinite(body.price) && body.price >= 100) {
      product.price = Math.round(body.price);
    }
    if (typeof body.stock === 'number' && Number.isFinite(body.stock) && body.stock >= 0) {
      product.stock = Math.round(body.stock);
    }
    if (typeof body.available === 'boolean') {
      product.available = body.available;
    }
    if (typeof body.shortDescription === 'string' && body.shortDescription.trim().length >= 5) {
      product.shortDescription = body.shortDescription.trim().slice(0, 320);
    }
    if (typeof body.description === 'string' && body.description.trim().length >= 5) {
      product.description = body.description.trim().slice(0, 1200);
    }
    if (typeof body.tasbihSummary === 'string' && body.tasbihSummary.trim().length >= 3) {
      product.tasbihSummary = body.tasbihSummary.trim().slice(0, 160);
    }
    if (typeof body.image === 'string' && isSafeMediaUrl(body.image)) {
      product.image = body.image.trim();
      if (!product.gallery.includes(product.image)) {
        product.gallery = [product.image, ...product.gallery];
      }
    }

    saveStore(store);
    res.json({ product, stats: computeAdminStats(store) });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    const nextStatus = (req.body as { status?: OrderStatus }).status;
    if (!nextStatus || !VALID_ORDER_STATUSES.has(nextStatus)) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }
    order.status = nextStatus;
    saveStore(store);
    res.json({ order, stats: computeAdminStats(store) });
  });

  app.patch('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
    const inquiry = store.inquiries.find((inq) => inq.id === req.params.id);
    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    const status = (req.body as { status?: 'New' | 'Replied' }).status;
    if (status !== 'New' && status !== 'Replied') {
      res.status(400).json({ error: 'Invalid inquiry status.' });
      return;
    }
    inquiry.status = status;
    saveStore(store);
    res.json({ inquiry });
  });

  // =========================================================================
  // VITE DEV MIDDLEWARE OR PRODUCTION STATIC DIST
  // =========================================================================

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT ?? 3000);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SAFA storefront server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SAFA server:', err);
  process.exit(1);
});
