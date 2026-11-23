import { ArrowRight, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import type { PageView, Product } from '../types/safa';
import { formatPKR } from '../utils/storeLogic';
import { ProductCard } from './ProductCard';

interface SavedItemsViewProps {
  savedProducts: Product[];
  wishlistIds: string[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onMoveAllToCart: () => void;
  onClearWishlist: () => void;
  onNavigate: (page: PageView) => void;
}

export function SavedItemsView({
  savedProducts,
  wishlistIds,
  onViewProduct,
  onAddToCart,
  onToggleWishlist,
  onMoveAllToCart,
  onClearWishlist,
  onNavigate,
}: SavedItemsViewProps) {
  const availableSaved = savedProducts.filter((p) => p.available && p.stock > 0);
  const totalSavedValue = savedProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="safa-theme-transition">
      {/* Header Band */}
      <section
        className="border-b"
        style={{
          backgroundColor: 'var(--safa-surface-alt)',
          borderColor: 'var(--safa-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--safa-ink-muted)]">
                Your Personal Wishlist · Saved Locally
              </p>
              <h1 className="font-display text-[36px] sm:text-[46px] font-semibold leading-tight text-[#173F35]">
                Saved Items
              </h1>
              <p className="text-[15px] text-[var(--safa-ink-muted)] leading-relaxed">
                {savedProducts.length === 0
                  ? 'Tap the heart icon on any SAFA Travel Prayer Kit to keep your favourites in one place.'
                  : `You have ${savedProducts.length} saved prayer kit${
                      savedProducts.length === 1 ? '' : 's'
                    } totalling ${formatPKR(totalSavedValue)}.`}
              </p>
            </div>

            {savedProducts.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {availableSaved.length > 0 && (
                  <button
                    type="button"
                    onClick={onMoveAllToCart}
                    className="safa-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer whitespace-nowrap min-h-[44px]"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    Add All to Cart ({availableSaved.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClearWishlist}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-[7px] border cursor-pointer hover:bg-white/70 transition-colors whitespace-nowrap min-h-[44px]"
                  style={{
                    borderColor: 'var(--safa-border)',
                    color: 'var(--safa-ink)',
                  }}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Clear List
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Saved Items Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {savedProducts.length === 0 ? (
          <div className="safa-card rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#E9E0D1] text-[#173F35] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#173F35]">
                No Saved Prayer Kits Yet
              </h2>
              <p className="text-sm sm:text-[15px] text-[#5A5D5A] max-w-md mx-auto leading-relaxed">
                Explore our Men&apos;s Beige and Women&apos;s Mauve collections and click the
                heart icon on any package to bookmark it for later.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('men')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer min-h-[44px]"
                style={{ backgroundColor: '#78614A' }}
              >
                Men&apos;s Collection
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('women')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer min-h-[44px]"
                style={{ backgroundColor: '#8C5E85' }}
              >
                Women&apos;s Collection
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-5 py-3 text-sm font-medium rounded-[7px] border cursor-pointer hover:bg-[#E9E0D1]/60 min-h-[44px]"
                style={{ borderColor: 'var(--safa-border)', color: '#173F35' }}
              >
                Browse All Packages
              </button>
            </div>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            data-testid="saved-items-grid"
          >
            {savedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onViewDetails={onViewProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
