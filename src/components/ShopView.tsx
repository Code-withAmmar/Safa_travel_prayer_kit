import { useMemo, useState } from 'react';
import { Check, Minus, Plus, Search, ShoppingBag } from 'lucide-react';
import { PACKAGE_TIER_ORDER } from '../data/seedCatalog';
import type { CollectionCategory, PackageTier, Product } from '../types/safa';
import { filterAndSortProducts, formatPKR } from '../utils/storeLogic';
import { ProductCard } from './ProductCard';
import { SafaImage } from './SafaImage';

interface ShopViewProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export function ShopView({
  products,
  wishlistIds,
  onToggleWishlist,
  onViewProduct,
  onAddToCart,
}: ShopViewProps) {
  // Interactive Package Selection System (Section 11)
  const [configCategory, setConfigCategory] = useState<CollectionCategory>('men');
  const [configTier, setConfigTier] = useState<PackageTier>('Premium');
  const [configQty, setConfigQty] = useState(1);

  // Full Catalog Filters
  const [filterCategory, setFilterCategory] = useState<'all' | CollectionCategory>('all');
  const [filterTier, setFilterTier] = useState<'all' | PackageTier>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  const selectedConfigProduct = useMemo(() => {
    return (
      products.find(
        (p) => p.category === configCategory && p.packageVersion === configTier
      ) ?? products[0]
    );
  }, [products, configCategory, configTier]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        category: filterCategory,
        tier: filterTier,
        search,
        sortBy,
      }),
    [products, filterCategory, filterTier, search, sortBy]
  );

  const configOutOfStock =
    !selectedConfigProduct || !selectedConfigProduct.available || selectedConfigProduct.stock <= 0;

  return (
    <div>
      {/* SECTION 11: INTERACTIVE PACKAGE SELECTION SYSTEM */}
      <section
        className="border-b py-12 lg:py-16"
        style={{
          backgroundColor: configCategory === 'men' ? '#E9E0D1' : '#E8D8E7',
          borderColor: 'var(--safa-border)',
          transition: 'background-color 400ms ease',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--safa-ink-muted)] mb-1.5">
              Interactive Package Selector
            </p>
            <h1 className="font-display text-[34px] sm:text-[42px] font-semibold text-[#173F35]">
              Configure Your SAFA Prayer Kit
            </h1>
          </div>

          {selectedConfigProduct && (
            <div
              className="rounded-2xl border p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              style={{
                backgroundColor: configCategory === 'men' ? '#F8F5EE' : '#FFF9F5',
                borderColor: 'var(--safa-border)',
                transition: 'background-color 400ms ease',
              }}
            >
              {/* Live Product Image */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-white border" style={{ borderColor: 'var(--safa-border)' }}>
                  <SafaImage
                    src={selectedConfigProduct.image}
                    alt={selectedConfigProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-[var(--safa-ink-muted)] flex items-center justify-between">
                  <span>
                    {configCategory === 'men' ? "Men's Beige Collection" : "Women's Mauve Collection"} ·{' '}
                    SAFA {configTier}
                  </span>
                  <button
                    type="button"
                    onClick={() => onViewProduct(selectedConfigProduct)}
                    className="underline font-medium text-[#173F35] cursor-pointer"
                  >
                    Full specifications
                  </button>
                </div>
              </div>

              {/* Step-by-Step Controls */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  {/* Step 1: Category */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--safa-ink-muted)] mb-2">
                      Step 1 — Select Category
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      <button
                        type="button"
                        onClick={() => setConfigCategory('men')}
                        aria-pressed={configCategory === 'men'}
                        className={`px-4 py-3 rounded-[7px] text-sm font-semibold border cursor-pointer transition-colors min-h-[44px] ${
                          configCategory === 'men'
                            ? 'bg-[#78614A] text-white border-[#78614A]'
                            : 'bg-white text-[#493A2E] border-[#8B735B]/30 hover:bg-[#E9E0D1]/50'
                        }`}
                      >
                        Men&apos;s Beige
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfigCategory('women')}
                        aria-pressed={configCategory === 'women'}
                        className={`px-4 py-3 rounded-[7px] text-sm font-semibold border cursor-pointer transition-colors min-h-[44px] ${
                          configCategory === 'women'
                            ? 'bg-[#8C5E85] text-white border-[#8C5E85]'
                            : 'bg-white text-[#5C4358] border-[#B58AAE]/40 hover:bg-[#E8D8E7]/50'
                        }`}
                      >
                        Women&apos;s Mauve
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Package Version */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--safa-ink-muted)] mb-2">
                      Step 2 — Select Package Version
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PACKAGE_TIER_ORDER.map((tier) => {
                        const match = products.find(
                          (p) => p.category === configCategory && p.packageVersion === tier
                        );
                        const isSelected = configTier === tier;
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setConfigTier(tier)}
                            aria-pressed={isSelected}
                            className={`px-3.5 py-2.5 rounded-[7px] text-sm font-medium border cursor-pointer transition-colors whitespace-nowrap min-h-[42px] ${
                              isSelected
                                ? configCategory === 'men'
                                  ? 'bg-[#78614A] text-white border-[#78614A]'
                                  : 'bg-[#8C5E85] text-white border-[#8C5E85]'
                                : 'bg-white text-[var(--safa-ink)] border-[var(--safa-border)] hover:bg-stone-50'
                            }`}
                          >
                            {tier}
                            {match ? (
                              <span className="ml-1.5 text-xs opacity-85 tabular-nums">
                                · {formatPKR(match.price)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Live Package Summary */}
                  <div className="pt-2 border-t space-y-2.5" style={{ borderColor: 'var(--safa-border)' }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="font-display text-2xl font-semibold text-[var(--safa-ink)]">
                        {selectedConfigProduct.name}
                      </h2>
                      <p className="text-2xl font-semibold tabular-nums text-[var(--safa-ink)]">
                        {formatPKR(selectedConfigProduct.price)}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--safa-ink-muted)] leading-relaxed">
                      {selectedConfigProduct.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-[var(--safa-ink)]">
                      {selectedConfigProduct.accessories.map((acc) => (
                        <li key={acc.name} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 mt-0.5 text-[#C5A15B] shrink-0" aria-hidden="true" />
                          <span>{acc.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Step 4 & 5: Quantity + Add to Cart */}
                <div className="pt-4 border-t flex flex-wrap items-center gap-4" style={{ borderColor: 'var(--safa-border)' }}>
                  <div className="inline-flex items-center rounded-[7px] border bg-white" style={{ borderColor: 'var(--safa-border)' }}>
                    <button
                      type="button"
                      onClick={() => setConfigQty((q) => Math.max(1, q - 1))}
                      aria-label="Decrease selected quantity"
                      className="w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-stone-100 rounded-l-[7px]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold tabular-nums">
                      {configQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfigQty((q) => Math.min(20, q + 1))}
                      aria-label="Increase selected quantity"
                      className="w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-stone-100 rounded-r-[7px]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={configOutOfStock}
                    onClick={() => {
                      onAddToCart(selectedConfigProduct, configQty);
                      setConfigQty(1);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[7px] cursor-pointer flex-1 sm:flex-none min-h-[44px] disabled:opacity-50"
                    style={{
                      backgroundColor: configCategory === 'men' ? '#78614A' : '#8C5E85',
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    {configOutOfStock
                      ? 'Out of Stock'
                      : `Add to Cart — ${formatPKR(selectedConfigProduct.price * configQty)}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPLETE CATALOG WITH SEARCH & FILTERING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-[28px] sm:text-[34px] font-semibold text-[#173F35]">
              All SAFA Travel Prayer Kits
            </h2>
            <p className="text-sm text-[#5A5D5A]">
              Showing <span className="tabular-nums font-medium">{filteredProducts.length}</span>{' '}
              package variation{filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-none sm:w-60">
              <Search
                className="w-4 h-4 text-[#5A5D5A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Search SAFA prayer kits"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search kits or tasbih..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-[7px] border bg-white min-h-[42px]"
                style={{ borderColor: 'var(--safa-border)' }}
              />
            </div>

            <select
              aria-label="Filter by collection"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | CollectionCategory)}
              className="px-3 py-2.5 text-sm rounded-[7px] border bg-white min-h-[42px]"
              style={{ borderColor: 'var(--safa-border)' }}
            >
              <option value="all">All Collections</option>
              <option value="men">Men&apos;s Beige</option>
              <option value="women">Women&apos;s Mauve</option>
            </select>

            <select
              aria-label="Filter by package tier"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as 'all' | PackageTier)}
              className="px-3 py-2.5 text-sm rounded-[7px] border bg-white min-h-[42px]"
              style={{ borderColor: 'var(--safa-border)' }}
            >
              <option value="all">All 5 Tiers</option>
              {PACKAGE_TIER_ORDER.map((tier) => (
                <option key={tier} value={tier}>
                  SAFA {tier}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort products"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc')
              }
              className="px-3 py-2.5 text-sm rounded-[7px] border bg-white min-h-[42px]"
              style={{ borderColor: 'var(--safa-border)' }}
            >
              <option value="featured">Sort: Tier Order</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="safa-card rounded-xl p-12 text-center space-y-3">
            <p className="font-display text-2xl text-[#173F35]">No matching prayer kits found</p>
            <p className="text-sm text-[#5A5D5A]">
              Try clearing your search or selecting another package tier.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilterCategory('all');
                setFilterTier('all');
              }}
              className="safa-btn-primary px-5 py-2.5 text-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
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
