import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Lock,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Upload,
  MessageSquare,
} from 'lucide-react';
import { PACKAGE_TIER_ORDER, SAFA_ASSETS } from '../data/seedCatalog';
import type {
  AdminStats,
  CollectionCategory,
  InquiryRecord,
  OrderRecord,
  OrderStatus,
  PackageTier,
  Product,
} from '../types/safa';
import { formatPKR } from '../utils/storeLogic';
import { SafaImage } from './SafaImage';

interface AdminViewProps {
  onCatalogUpdated: () => Promise<void>;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export function AdminView({ onCatalogUpdated }: AdminViewProps) {
  // Keep admin token strictly in React memory (never localStorage/sessionStorage)
  const [token, setToken] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inquiries'>('products');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [dashMessage, setDashMessage] = useState('');
  const [dashError, setDashError] = useState('');

  // Product edit/create form
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editImage, setEditImage] = useState('');

  // Add new product form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CollectionCategory>('men');
  const [newTier, setNewTier] = useState<PackageTier>('Classic');
  const [newPrice, setNewPrice] = useState('2500');
  const [newStock, setNewStock] = useState('15');
  const [newTasbih, setNewTasbih] = useState('');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newImage, setNewImage] = useState<string>(SAFA_ASSETS.men.Classic);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch('/api/admin/auth-status')
      .then((res) => res.json())
      .then((data: { needsSetup: boolean }) => {
        setNeedsSetup(data.needsSetup);
      })
      .catch(() => setNeedsSetup(false));
  }, []);

  const loadDashboard = async (authToken: string) => {
    setDashError('');
    const res = await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (res.status === 401) {
      setToken(null);
      return;
    }
    if (!res.ok) {
      throw new Error('Failed to load dashboard data.');
    }
    const data = (await res.json()) as {
      stats: AdminStats;
      products: Product[];
      orders: OrderRecord[];
      inquiries: InquiryRecord[];
    };
    setStats(data.stats);
    setProducts(data.products);
    setOrders(data.orders);
    setInquiries(data.inquiries);
  };

  useEffect(() => {
    if (token) {
      loadDashboard(token).catch((err) =>
        setDashError(err instanceof Error ? err.message : 'Unable to load dashboard.')
      );
    }
  }, [token]);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (needsSetup) {
      if (password.length < 8) {
        setAuthError('Choose a password with at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      const endpoint = needsSetup ? '/api/admin/bootstrap' : '/api/admin/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        throw new Error(data.error ?? 'Authentication failed.');
      }
      setToken(data.token);
      setNeedsSetup(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleImageFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingImage(true);
    setDashError('');
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dataUrl }),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error ?? 'Image upload failed.');
      }
      onUploaded(data.imageUrl);
      setDashMessage('Image uploaded successfully.');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditShortDesc(product.shortDescription);
    setEditImage(product.image);
    setDashMessage('');
  };

  const saveEditProduct = async (productId: string) => {
    if (!token) return;
    setDashError('');
    setDashMessage('');
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          price: Number(editPrice),
          stock: Number(editStock),
          shortDescription: editShortDesc,
          image: editImage,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to update product.');
      setEditingProductId(null);
      await loadDashboard(token);
      await onCatalogUpdated();
      setDashMessage('Product details updated and published to storefront.');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to update product.');
    }
  };

  const toggleProductAvailability = async (product: Product) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !product.available }),
      });
      if (!res.ok) throw new Error('Unable to toggle availability.');
      await loadDashboard(token);
      await onCatalogUpdated();
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setDashError('');
    setDashMessage('');
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          category: newCategory,
          packageVersion: newTier,
          price: Number(newPrice),
          stock: Number(newStock),
          tasbihSummary: newTasbih,
          shortDescription: newShortDesc,
          image: newImage,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Unable to add product.');
      setShowAddForm(false);
      setNewName('');
      setNewTasbih('');
      setNewShortDesc('');
      await loadDashboard(token);
      await onCatalogUpdated();
      setDashMessage('New product variation added to SAFA catalog.');
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Unable to add product.');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    setDashError('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update order status.');
      await loadDashboard(token);
      setDashMessage(`Order status updated to ${status}.`);
    } catch (err) {
      setDashError(err instanceof Error ? err.message : 'Failed to update order.');
    }
  };

  const handleInquiryStatusToggle = async (inq: InquiryRecord) => {
    if (!token) return;
    const nextStatus = inq.status === 'New' ? 'Replied' : 'New';
    const res = await fetch(`/api/admin/inquiries/${inq.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadDashboard(token);
    }
  };

  // SIGN-IN / FIRST-RUN ADMIN CLAIM SCREEN
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="safa-card rounded-2xl p-7 sm:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#173F35] text-[#E5C989] flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-[#173F35]">
              {needsSetup ? 'Set Up SAFA Admin' : 'SAFA Admin Sign In'}
            </h1>
            <p className="text-sm text-[#5A5D5A]">
              {needsSetup
                ? 'Create your administrator password to manage SAFA products, pricing, inventory, and customer orders.'
                : 'Enter your administrator password to access the SAFA management console.'}
            </p>
          </div>

          {authError && (
            <p
              role="alert"
              className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200"
            >
              {authError}
            </p>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold mb-1.5">
                {needsSetup ? 'New Administrator Password' : 'Administrator Password'}
              </label>
              <input
                id="admin-password"
                type="password"
                required
                minLength={needsSetup ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min. 8 characters)"
                className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                style={{ borderColor: 'var(--safa-border)' }}
              />
            </div>

            {needsSetup && (
              <div>
                <label htmlFor="admin-confirm" className="block text-xs font-semibold mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="admin-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter administrator password"
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading || needsSetup === null}
              className="safa-btn-primary w-full py-3 text-sm cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              {authLoading
                ? 'Verifying...'
                : needsSetup
                ? 'Create Password & Open Dashboard'
                : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'var(--safa-border)' }}>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-semibold">
            Store Operations
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#173F35]">
            SAFA Admin Dashboard
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setToken(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-[7px] border cursor-pointer hover:bg-stone-100 self-start sm:self-auto min-h-[42px]"
          style={{ borderColor: 'var(--safa-border)' }}
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign Out
        </button>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="safa-card rounded-xl p-5">
            <p className="text-xs text-[#5A5D5A]">Total Sales</p>
            <p className="font-display text-2xl font-semibold text-[#173F35] tabular-nums mt-1">
              {formatPKR(stats.totalRevenue)}
            </p>
          </div>
          <div className="safa-card rounded-xl p-5">
            <p className="text-xs text-[#5A5D5A]">Total Orders</p>
            <p className="font-display text-2xl font-semibold text-[#173F35] tabular-nums mt-1">
              {stats.totalOrders}
            </p>
          </div>
          <div className="safa-card rounded-xl p-5">
            <p className="text-xs text-[#5A5D5A]">Pending Orders</p>
            <p className="font-display text-2xl font-semibold text-[#173F35] tabular-nums mt-1">
              {stats.pendingOrders}
            </p>
          </div>
          <div className="safa-card rounded-xl p-5">
            <p className="text-xs text-[#5A5D5A]">Active SKUs</p>
            <p className="font-display text-2xl font-semibold text-[#173F35] tabular-nums mt-1">
              {stats.activeProducts}
            </p>
          </div>
          <div className="safa-card rounded-xl p-5">
            <p className="text-xs text-[#5A5D5A]">Low Stock Alerts</p>
            <p className="font-display text-2xl font-semibold text-[#173F35] tabular-nums mt-1">
              {stats.lowStockCount}
            </p>
          </div>
        </div>
      )}

      {dashMessage && (
        <div
          role="status"
          className="rounded-lg px-4 py-3 text-sm bg-[#173F35]/10 text-[#173F35] border border-[#173F35]/20"
        >
          {dashMessage}
        </div>
      )}
      {dashError && (
        <div
          role="alert"
          className="rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200"
        >
          {dashError}
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Admin sections"
          className="inline-flex p-1 rounded-lg border"
          style={{ backgroundColor: '#E9E0D1', borderColor: 'var(--safa-border)' }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer min-h-[40px] ${
              activeTab === 'products' ? 'bg-[#173F35] text-white' : 'text-[#292B29]'
            }`}
          >
            <Package className="w-4 h-4" aria-hidden="true" />
            Products &amp; Inventory ({products.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer min-h-[40px] ${
              activeTab === 'orders' ? 'bg-[#173F35] text-white' : 'text-[#292B29]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Orders ({orders.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inquiries'}
            onClick={() => setActiveTab('inquiries')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer min-h-[40px] ${
              activeTab === 'inquiries' ? 'bg-[#173F35] text-white' : 'text-[#292B29]'
            }`}
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Inquiries ({inquiries.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="safa-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            {showAddForm ? 'Close New Product Form' : 'Add New Product'}
          </button>
        )}
      </div>

      {/* TAB 1: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {showAddForm && (
            <form onSubmit={handleAddProduct} className="safa-card rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-[#173F35]">
                Add New SAFA Product
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="new-prod-name" className="block text-xs font-semibold mb-1">
                    Product Name *
                  </label>
                  <input
                    id="new-prod-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. SAFA Gift Edition – Men"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: 'var(--safa-border)' }}
                  />
                </div>
                <div>
                  <label htmlFor="new-prod-cat" className="block text-xs font-semibold mb-1">
                    Collection *
                  </label>
                  <select
                    id="new-prod-cat"
                    value={newCategory}
                    onChange={(e) => {
                      const next = e.target.value as CollectionCategory;
                      setNewCategory(next);
                      setNewImage(
                        next === 'men' ? SAFA_ASSETS.men.Classic : SAFA_ASSETS.women.Classic
                      );
                    }}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: 'var(--safa-border)' }}
                  >
                    <option value="men">Men&apos;s Beige</option>
                    <option value="women">Women&apos;s Mauve</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-prod-tier" className="block text-xs font-semibold mb-1">
                    Package Version *
                  </label>
                  <select
                    id="new-prod-tier"
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as PackageTier)}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: 'var(--safa-border)' }}
                  >
                    {PACKAGE_TIER_ORDER.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="new-prod-price" className="block text-xs font-semibold mb-1">
                      Price (PKR) *
                    </label>
                    <input
                      id="new-prod-price"
                      type="number"
                      min={100}
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm bg-white tabular-nums"
                      style={{ borderColor: 'var(--safa-border)' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-prod-stock" className="block text-xs font-semibold mb-1">
                      Stock *
                    </label>
                    <input
                      id="new-prod-stock"
                      type="number"
                      min={0}
                      required
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm bg-white tabular-nums"
                      style={{ borderColor: 'var(--safa-border)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-prod-tasbih" className="block text-xs font-semibold mb-1">
                    Tasbih / Counter Included
                  </label>
                  <input
                    id="new-prod-tasbih"
                    type="text"
                    value={newTasbih}
                    onChange={(e) => setNewTasbih(e.target.value)}
                    placeholder="e.g. Pearl Beaded Tasbeeh with Tassel"
                    className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                    style={{ borderColor: 'var(--safa-border)' }}
                  />
                </div>
                <div>
                  <label htmlFor="new-prod-upload" className="block text-xs font-semibold mb-1">
                    Upload Product Photo (JPEG/PNG/WebP)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border bg-white cursor-pointer hover:bg-stone-50">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      {uploadingImage ? 'Uploading...' : 'Choose Image File'}
                      <input
                        id="new-prod-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageFileUpload(e, setNewImage)}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-xs text-[#5A5D5A] truncate">{newImage}</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="new-prod-desc" className="block text-xs font-semibold mb-1">
                  Short Description
                </label>
                <textarea
                  id="new-prod-desc"
                  rows={2}
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="Describe the mat, tasbih, 30 ml hand wash, and prayer cap included."
                  className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>

              <button type="submit" className="safa-btn-primary px-5 py-2.5 text-sm cursor-pointer">
                Save New Product
              </button>
            </form>
          )}

          <div className="safa-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#E9E0D1' }}>
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-4 font-semibold">Collection / Tier</th>
                    <th className="py-3.5 px-4 font-semibold">Price (PKR)</th>
                    <th className="py-3.5 px-4 font-semibold">Inventory</th>
                    <th className="py-3.5 px-4 font-semibold">Availability</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--safa-border)' }}>
                  {products.map((product) => {
                    const isEditing = editingProductId === product.id;
                    return (
                      <tr key={product.id} style={{ borderColor: 'var(--safa-border)' }}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-md overflow-hidden shrink-0 bg-stone-100">
                              <SafaImage
                                src={isEditing ? editImage : product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-[180px]">
                              <p className="font-semibold text-[#173F35]">{product.name}</p>
                              {isEditing ? (
                                <div className="mt-1 space-y-1.5">
                                  <input
                                    type="text"
                                    aria-label={`Short description for ${product.name}`}
                                    value={editShortDesc}
                                    onChange={(e) => setEditShortDesc(e.target.value)}
                                    className="w-full rounded border px-2 py-1 text-xs bg-white"
                                  />
                                  <label className="inline-flex items-center gap-1.5 text-xs underline cursor-pointer">
                                    <Upload className="w-3 h-3" aria-hidden="true" />
                                    Replace photo
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp"
                                      onChange={(e) => handleImageFileUpload(e, setEditImage)}
                                      className="sr-only"
                                    />
                                  </label>
                                </div>
                              ) : (
                                <p className="text-xs text-[#5A5D5A] line-clamp-1 max-w-xs">
                                  {product.tasbihSummary}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#5A5D5A]">
                          {product.category === 'men' ? "Men's Beige" : "Women's Mauve"} ·{' '}
                          {product.packageVersion}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              min={100}
                              aria-label={`Price in PKR for ${product.name}`}
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-28 rounded border px-2 py-1 text-sm bg-white tabular-nums"
                            />
                          ) : (
                            <span className="font-semibold">{formatPKR(product.price)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap tabular-nums">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              aria-label={`Stock quantity for ${product.name}`}
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-20 rounded border px-2 py-1 text-sm bg-white tabular-nums"
                            />
                          ) : (
                            <span>{product.stock} units</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleProductAvailability(product)}
                            className={`text-xs font-medium underline cursor-pointer ${
                              product.available ? 'text-[#173F35]' : 'text-red-700'
                            }`}
                          >
                            {product.available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          {isEditing ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveEditProduct(product.id)}
                                className="safa-btn-primary px-3 py-1.5 text-xs cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProductId(null)}
                                className="px-3 py-1.5 text-xs rounded-md border cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditProduct(product)}
                              className="px-3 py-1.5 text-xs font-medium rounded-md border cursor-pointer hover:bg-stone-100"
                              style={{ borderColor: 'var(--safa-border)' }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="safa-card rounded-2xl p-12 text-center text-sm text-[#5A5D5A]">
              No customer orders have been placed yet. Completed checkout orders will appear here
              with full delivery details and status controls.
            </div>
          ) : (
            orders.map((order) => (
              <article key={order.id} className="safa-card rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--safa-border)' }}>
                  <div>
                    <p className="font-semibold text-base text-[#173F35] tabular-nums">
                      {order.reference}
                    </p>
                    <p className="text-xs text-[#5A5D5A]">
                      {new Date(order.createdAt).toLocaleString()} ·{' '}
                      {order.paymentMethod === 'cod'
                        ? 'Cash on Delivery'
                        : order.paymentMethod === 'bank_transfer'
                        ? 'Bank Transfer'
                        : 'Digital Wallet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums text-base text-[#173F35]">
                      {formatPKR(order.total)}
                    </span>
                    <select
                      aria-label={`Order status for ${order.reference}`}
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="rounded-md border px-3 py-2 text-xs font-semibold bg-white min-h-[38px]"
                      style={{ borderColor: 'var(--safa-border)' }}
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8B735B]">
                      Customer &amp; Delivery
                    </p>
                    <p className="font-semibold text-[#173F35]">{order.customer.fullName}</p>
                    <p className="text-xs text-[#5A5D5A]">
                      {order.customer.phone}
                      {order.customer.email ? ` · ${order.customer.email}` : ''}
                    </p>
                    <p className="text-xs text-[#5A5D5A]">
                      {order.customer.address}, {order.customer.city}
                      {order.customer.postalCode ? ` (${order.customer.postalCode})` : ''}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#8B735B]">
                      Package Items
                    </p>
                    <ul className="space-y-1 text-xs">
                      {order.items.map((item) => (
                        <li key={item.productId} className="flex justify-between gap-2">
                          <span>
                            {item.name} ({item.packageVersion}) × {item.quantity}
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatPKR(item.lineTotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* TAB 3: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="safa-card rounded-2xl p-12 text-center text-sm text-[#5A5D5A]">
              No customer inquiries submitted yet.
            </div>
          ) : (
            inquiries.map((inq) => (
              <article key={inq.id} className="safa-card rounded-2xl p-6 space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#173F35]">
                      {inq.fullName} · <span className="font-normal text-sm">{inq.subject}</span>
                    </p>
                    <p className="text-xs text-[#5A5D5A]">
                      {inq.contact}
                      {inq.email ? ` · ${inq.email}` : ''} ·{' '}
                      {new Date(inq.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInquiryStatusToggle(inq)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border cursor-pointer"
                    style={{ borderColor: 'var(--safa-border)' }}
                  >
                    {inq.status} (Toggle)
                  </button>
                </div>
                <p className="text-sm text-[#292B29] leading-relaxed">{inq.message}</p>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
