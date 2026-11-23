import { ArrowRight } from 'lucide-react';
import { PACKAGE_TIER_ORDER } from '../data/seedCatalog';
import type { CollectionCategory, PageView, Product } from '../types/safa';
import { formatPKR } from '../utils/storeLogic';
import { ProductCard } from './ProductCard';

interface CollectionViewProps {
  category: CollectionCategory;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: PageView) => void;
}

export function CollectionView({
  category,
  products,
  wishlistIds,
  onToggleWishlist,
  onViewProduct,
  onAddToCart,
  onNavigate,
}: CollectionViewProps) {
  const isMen = category === 'men';

  const collectionProducts = PACKAGE_TIER_ORDER.map((tier) =>
    products.find((p) => p.category === category && p.packageVersion === tier)
  ).filter((p): p is Product => Boolean(p));

  const extraProducts = products.filter(
    (p) => p.category === category && !collectionProducts.some((cp) => cp.id === p.id)
  );
  const allItems = [...collectionProducts, ...extraProducts];

  return (
    <div className="safa-theme-transition">
      {/* Collection Hero Banner */}
      <section
        className="border-b safa-theme-transition"
        style={{
          backgroundColor: 'var(--safa-surface-alt)',
          borderColor: 'var(--safa-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--safa-ink-muted)]">
                {isMen ? 'Warm Beige · Soft Sand · Taupe & Champagne Gold' : 'Soft Mauve · Dusty Rose · Warm Ivory & Champagne Gold'}
              </p>
              <h1 className="font-display text-[36px] sm:text-[46px] font-semibold leading-tight text-[var(--safa-ink)]">
                {isMen ? "Discover the Men's Collection." : "Discover the Women's Collection."}
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[var(--safa-ink-muted)] leading-relaxed">
                {isMen
                  ? 'Thoughtfully selected prayer essentials designed to accompany you on every journey.'
                  : 'Elegant and convenient prayer essentials, thoughtfully designed for your journeys.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(isMen ? 'women' : 'men')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-[7px] border self-start lg:self-auto cursor-pointer hover:bg-white/60 transition-colors min-h-[42px]"
              style={{
                borderColor: 'var(--safa-border)',
                color: 'var(--safa-ink)',
              }}
            >
              Switch to {isMen ? "Women's Mauve Collection" : "Men's Beige Collection"}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {allItems.map((product) => (
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
      </section>

      {/* Package Tier Comparison Table */}
      <section
        className="border-t py-14 safa-theme-transition"
        style={{
          backgroundColor: 'var(--safa-surface)',
          borderColor: 'var(--safa-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--safa-ink-muted)] font-medium mb-1.5">
              Side-By-Side Comparison
            </p>
            <h2 className="font-display text-[28px] sm:text-[34px] font-semibold text-[var(--safa-ink)]">
              Compare {isMen ? "Men's" : "Women's"} Package Tiers
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--safa-border)' }}>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--safa-surface-alt)' }}>
                  <th className="py-3.5 px-4 font-semibold text-[var(--safa-ink)]">Package Tier</th>
                  <th className="py-3.5 px-4 font-semibold text-[var(--safa-ink)]">Price (PKR)</th>
                  <th className="py-3.5 px-4 font-semibold text-[var(--safa-ink)]">Tasbih / Counter Included</th>
                  <th className="py-3.5 px-4 font-semibold text-[var(--safa-ink)]">Prayer Mat &amp; Essentials</th>
                  <th className="py-3.5 px-4 font-semibold text-right text-[var(--safa-ink)]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--safa-border)' }}>
                {collectionProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[var(--safa-surface-alt)]/35 transition-colors"
                    style={{ borderColor: 'var(--safa-border)' }}
                  >
                    <td className="py-4 px-4 font-semibold text-[var(--safa-ink)] whitespace-nowrap">
                      SAFA {product.packageVersion}
                    </td>
                    <td className="py-4 px-4 font-semibold tabular-nums text-[var(--safa-ink)] whitespace-nowrap">
                      {formatPKR(product.price)}
                    </td>
                    <td className="py-4 px-4 text-[var(--safa-ink-muted)] min-w-[220px]">
                      {product.tasbihSummary}
                    </td>
                    <td className="py-4 px-4 text-[var(--safa-ink-muted)] min-w-[220px]">
                      Double-layered non-slip mat · 30 ml Mini Hand Wash · Prayer Cap
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewProduct(product)}
                        className="safa-btn-primary px-3.5 py-2 text-xs cursor-pointer"
                      >
                        Select Tier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
