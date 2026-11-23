import { useCallback, useEffect, useMemo, useState } from 'react';
import { AboutView } from './components/AboutView';
import { AdminView } from './components/AdminView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { CollectionView } from './components/CollectionView';
import { ContactView } from './components/ContactView';
import { Footer, type PolicyKey } from './components/Footer';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { PolicyModal } from './components/PolicyModal';
import { ProductDetailView } from './components/ProductDetailView';
import { SavedItemsView } from './components/SavedItemsView';
import { ShopView } from './components/ShopView';
import { WhatsAppButton } from './components/WhatsAppButton';
import { SEED_PRODUCTS, SEED_REVIEWS } from './data/seedCatalog';
import type {
  CartItem,
  CheckoutFormData,
  CollectionCategory,
  OrderRecord,
  PackageTier,
  PageView,
  Product,
  ReviewRecord,
} from './types/safa';
import {
  addToCartItems,
  calculateCartTotals,
  removeCartItem,
  resolveThemeMode,
  resolveWishlistedProducts,
  toggleWishlistItem,
  updateCartItemQuantity,
} from './utils/storeLogic';

const CART_STORAGE_KEY = 'safa_cart_v1';
const WISHLIST_STORAGE_KEY = 'safa_wishlist_v1';

function readInitialCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function readInitialWishlist(): string[] {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function parseRouteFromHash(): { page: PageView; productId: string | null } {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash || hash === 'home') return { page: 'home', productId: null };
  if (hash === 'shop') return { page: 'shop', productId: null };
  if (hash === 'men') return { page: 'men', productId: null };
  if (hash === 'women') return { page: 'women', productId: null };
  if (hash === 'wishlist') return { page: 'wishlist', productId: null };
  if (hash === 'checkout') return { page: 'checkout', productId: null };
  if (hash === 'about') return { page: 'about', productId: null };
  if (hash === 'contact') return { page: 'contact', productId: null };
  if (hash === 'admin') return { page: 'admin', productId: null };
  if (hash.startsWith('product/')) {
    return { page: 'product', productId: decodeURIComponent(hash.slice('product/'.length)) };
  }
  return { page: 'home', productId: null };
}

export default function App() {
  const initialRoute = useMemo(() => parseRouteFromHash(), []);
  const [page, setPage] = useState<PageView>(initialRoute.page);
  const [activeProductId, setActiveProductId] = useState<string | null>(initialRoute.productId);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [reviews, setReviews] = useState<ReviewRecord[]>(SEED_REVIEWS);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readInitialCart());
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => readInitialWishlist());
  const [cartOpen, setCartOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);
  const [cartNotice, setCartNotice] = useState('');

  const fetchCatalogAndReviews = useCallback(async () => {
    try {
      const [prodRes, revRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/reviews'),
      ]);
      if (prodRes.ok) {
        const data = (await prodRes.json()) as { products?: Product[] };
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      }
      if (revRes.ok) {
        const data = (await revRes.json()) as { reviews?: ReviewRecord[] };
        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      }
    } catch {
      // Retain deterministic seed catalog if offline
    }
  }, []);

  useEffect(() => {
    fetchCatalogAndReviews();
  }, [fetchCatalogAndReviews]);

  useEffect(() => {
    const onHashChange = () => {
      const next = parseRouteFromHash();
      setPage(next.page);
      setActiveProductId(next.productId);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  const activeProduct = useMemo(() => {
    if (!activeProductId) return products[0];
    return products.find((p) => p.id === activeProductId) ?? products[0];
  }, [products, activeProductId]);

  const themeMode = resolveThemeMode(
    page,
    page === 'product' ? activeProduct?.category : undefined
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const navigate = (nextPage: PageView, productId?: string) => {
    setPage(nextPage);
    if (nextPage === 'product' && productId) {
      setActiveProductId(productId);
      window.location.hash = `#product/${encodeURIComponent(productId)}`;
    } else {
      setActiveProductId(null);
      window.location.hash = nextPage === 'home' ? '#home' : `#${nextPage}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (product: Product) => {
    navigate('product', product.id);
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => addToCartItems(prev, product, quantity));
    setCartNotice(`Added ${product.name} to your cart`);
    setCartOpen(true);
    window.setTimeout(() => setCartNotice(''), 2800);
  };

  const handleUpdateQuantity = (productId: string, nextQuantity: number) => {
    setCartItems((prev) => updateCartItemQuantity(prev, productId, nextQuantity));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => removeCartItem(prev, productId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => toggleWishlistItem(prev, productId));
  };

  const savedProducts = useMemo(
    () => resolveWishlistedProducts(products, wishlistIds),
    [products, wishlistIds]
  );

  const handleMoveAllSavedToCart = () => {
    const available = savedProducts.filter((p) => p.available && p.stock > 0);
    if (available.length === 0) return;
    setCartItems((prev) =>
      available.reduce((acc, product) => addToCartItems(acc, product, 1), prev)
    );
    setCartOpen(true);
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
  };

  const handleSubmitOrder = async (form: CheckoutFormData): Promise<OrderRecord> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          notes: form.notes,
        },
        paymentMethod: form.paymentMethod,
        items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    const data = (await res.json()) as { order?: OrderRecord; error?: string };
    if (!res.ok || !data.order) {
      throw new Error(data.error ?? 'Order submission failed.');
    }
    setCartItems([]);
    await fetchCatalogAndReviews();
    return data.order;
  };

  const handleSubmitReview = async (payload: {
    authorName: string;
    city: string;
    category: CollectionCategory;
    packageVersion: PackageTier;
    rating: number;
    comment: string;
  }) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { review?: ReviewRecord; error?: string };
    if (!res.ok || !data.review) {
      throw new Error(data.error ?? 'Unable to save review.');
    }
    setReviews((prev) => [data.review!, ...prev]);
  };

  const handleSubmitInquiry = async (payload: {
    fullName: string;
    contact: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? 'Unable to send inquiry.');
    }
  };

  const cartTotals = calculateCartTotals(cartItems);

  return (
    <div
      data-theme={themeMode}
      className="min-h-screen flex flex-col safa-theme-transition"
      style={{
        backgroundColor: 'var(--safa-canvas)',
        color: 'var(--safa-ink)',
      }}
    >
      <Header
        activePage={page}
        cartCount={cartTotals.itemCount}
        wishlistCount={savedProducts.length}
        onNavigate={(p) => navigate(p)}
        onOpenCart={() => setCartOpen(true)}
      />

      {cartNotice && (
        <div className="sr-only" role="status" aria-live="polite">
          {cartNotice}
        </div>
      )}

      <main className="flex-1">
        {page === 'home' && (
          <HomeView
            products={products}
            reviews={reviews}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onNavigate={(p) => navigate(p)}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSubmitReview={handleSubmitReview}
          />
        )}

        {page === 'men' && (
          <CollectionView
            category="men"
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onNavigate={(p) => navigate(p)}
          />
        )}

        {page === 'women' && (
          <CollectionView
            category="women"
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onNavigate={(p) => navigate(p)}
          />
        )}

        {page === 'shop' && (
          <ShopView
            products={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onViewProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
          />
        )}

        {page === 'wishlist' && (
          <SavedItemsView
            savedProducts={savedProducts}
            wishlistIds={wishlistIds}
            onViewProduct={handleViewProduct}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleWishlist={handleToggleWishlist}
            onMoveAllToCart={handleMoveAllSavedToCart}
            onClearWishlist={handleClearWishlist}
            onNavigate={(p) => navigate(p)}
          />
        )}

        {page === 'product' && activeProduct && (
          <ProductDetailView
            product={activeProduct}
            allProducts={products}
            wishlisted={wishlistIds.includes(activeProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
            onBack={() => navigate(activeProduct.category)}
          />
        )}

        {page === 'checkout' && (
          <CheckoutView
            items={cartItems}
            onSubmitOrder={handleSubmitOrder}
            onContinueShopping={() => navigate('home')}
            onBackToShop={() => navigate('shop')}
          />
        )}

        {page === 'about' && <AboutView onNavigate={(p) => navigate(p)} />}

        {page === 'contact' && <ContactView onSubmitInquiry={handleSubmitInquiry} />}

        {page === 'admin' && <AdminView onCatalogUpdated={fetchCatalogAndReviews} />}
      </main>

      <Footer
        onNavigate={(p) => navigate(p)}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
      />

      {page !== 'admin' && <WhatsAppButton />}

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          navigate('checkout');
        }}
        onContinueShopping={() => {
          setCartOpen(false);
          if (page === 'checkout') navigate('shop');
        }}
      />

      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
    </div>
  );
}
