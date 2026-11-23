import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { PACKAGE_TIER_ORDER } from '../data/seedCatalog';
import type { CollectionCategory, PackageTier, Product } from '../types/safa';
import { formatPKR } from '../utils/storeLogic';
import { SafaImage } from './SafaImage';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  wishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
}

export function ProductDetailView({
  product,
  allProducts,
  wishlisted = false,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart,
  onBack,
}: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedImage(product.image);
    setQuantity(1);
  }, [product.id, product.image]);

  const isOutOfStock = !product.available || product.stock <= 0;

  const switchVariant = (category: CollectionCategory, tier: PackageTier) => {
    const match = allProducts.find(
      (p) => p.category === category && p.packageVersion === tier
    );
    if (match) {
      onSelectProduct(match);
    }
  };

  const handleCopyShareLink = async () => {
    const url = `${window.location.origin}/#product/${product.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Explore ${product.name} (${formatPKR(product.price)}) from SAFA Travel Prayer Kits — ${window.location.origin}/#product/${product.id}`
  )}`;

  const galleryImages =
    product.gallery.length > 0 ? product.gallery : [product.image];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 safa-theme-transition">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--safa-ink-muted)] hover:text-[var(--safa-ink)] mb-7 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to {product.category === 'men' ? "Men's Collection" : "Women's Collection"}
      </button>

      {/* Contiguous Purchase Module: Sticky Gallery Left, Purchase Controls Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Product Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
          <div
            className="aspect-[4/3] w-full rounded-2xl overflow-hidden border bg-white"
            style={{ borderColor: 'var(--safa-border)' }}
          >
            <SafaImage
              src={selectedImage}
              alt={product.name}
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3">
              {galleryImages.map((imgUrl, idx) => {
                const isActive = selectedImage === imgUrl;
                return (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`View product photograph ${idx + 1}`}
                    className={`w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 cursor-pointer transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isActive ? 'var(--safa-accent)' : 'var(--safa-border)',
                    }}
                  >
                    <SafaImage
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchase & Variant Module */}
        <div className="lg:col-span-6 space-y-7">
          <div className="space-y-2.5">
            <p className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--safa-ink-muted)]">
              {product.category === 'men' ? "Men's Beige Collection" : "Women's Mauve Collection"} ·
              SAFA {product.packageVersion}
            </p>
            <h1 className="font-display text-[34px] sm:text-[42px] font-semibold leading-tight text-[var(--safa-ink)]">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-4 pt-1">
              <p className="text-[28px] font-semibold tabular-nums text-[var(--safa-ink)]">
                {formatPKR(product.price)}
              </p>
              <span className="text-xs text-[var(--safa-ink-muted)]">
                {isOutOfStock
                  ? 'Currently out of stock'
                  : `In Stock (${product.stock} ready to ship)`}
              </span>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed text-[var(--safa-ink-muted)]">
            {product.description}
          </p>

          {/* Interactive Variant Switchers */}
          <div
            className="p-5 rounded-xl border space-y-4"
            style={{
              backgroundColor: 'var(--safa-surface)',
              borderColor: 'var(--safa-border)',
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--safa-ink-muted)] mb-2">
                Collection Category
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => switchVariant('men', product.packageVersion)}
                  aria-pressed={product.category === 'men'}
                  className={`py-2.5 px-3 text-sm font-semibold rounded-[7px] border cursor-pointer min-h-[42px] ${
                    product.category === 'men'
                      ? 'bg-[#78614A] text-white border-[#78614A]'
                      : 'bg-transparent text-[var(--safa-ink)] border-[var(--safa-border)] hover:bg-[var(--safa-surface-alt)]/60'
                  }`}
                >
                  Men&apos;s Beige
                </button>
                <button
                  type="button"
                  onClick={() => switchVariant('women', product.packageVersion)}
                  aria-pressed={product.category === 'women'}
                  className={`py-2.5 px-3 text-sm font-semibold rounded-[7px] border cursor-pointer min-h-[42px] ${
                    product.category === 'women'
                      ? 'bg-[#8C5E85] text-white border-[#8C5E85]'
                      : 'bg-transparent text-[var(--safa-ink)] border-[var(--safa-border)] hover:bg-[var(--safa-surface-alt)]/60'
                  }`}
                >
                  Women&apos;s Mauve
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--safa-ink-muted)] mb-2">
                Package Version
              </p>
              <div className="flex flex-wrap gap-2">
                {PACKAGE_TIER_ORDER.map((tier) => {
                  const active = product.packageVersion === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => switchVariant(product.category, tier)}
                      aria-pressed={active}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-[7px] border cursor-pointer whitespace-nowrap min-h-[40px] ${
                        active
                          ? 'safa-btn-primary border-transparent'
                          : 'bg-transparent text-[var(--safa-ink)] border-[var(--safa-border)] hover:bg-[var(--safa-surface-alt)]/60'
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="pt-3 border-t flex flex-wrap items-center gap-3" style={{ borderColor: 'var(--safa-border)' }}>
              <div
                className="inline-flex items-center rounded-[7px] border bg-white"
                style={{ borderColor: 'var(--safa-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-stone-100 rounded-l-[7px]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className="w-10 text-center text-sm font-semibold tabular-nums"
                  data-testid="pdp-quantity"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-11 flex items-center justify-center cursor-pointer hover:bg-stone-100 rounded-r-[7px]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product, quantity)}
                className="safa-btn-primary flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] cursor-pointer min-h-[46px] disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                {isOutOfStock
                  ? 'Out of Stock'
                  : `Add to Cart · ${formatPKR(product.price * quantity)}`}
              </button>

              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-pressed={wishlisted}
                  aria-label={
                    wishlisted
                      ? `Remove ${product.name} from Saved Items`
                      : `Save ${product.name} to Saved Items`
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-[7px] border cursor-pointer min-h-[46px] transition-colors hover:bg-[var(--safa-surface-alt)]/60"
                  style={{
                    borderColor: wishlisted ? 'rgba(180, 62, 85, 0.45)' : 'var(--safa-border)',
                    color: wishlisted ? '#B43E55' : 'var(--safa-ink)',
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${wishlisted ? 'fill-[#B43E55] text-[#B43E55]' : ''}`}
                    aria-hidden="true"
                  />
                  <span>{wishlisted ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[var(--safa-ink-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C5A15B]" aria-hidden="true" />
                Free delivery on orders Rs. 5,000+ · COD available nationwide
              </span>

              <div className="flex items-center gap-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Share on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  {copiedLink ? 'Link Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* Included Accessories */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[var(--safa-ink)]">
              What&apos;s Included in This Kit
            </h2>
            <ul className="space-y-3">
              {product.accessories.map((item) => (
                <li
                  key={item.name}
                  className="p-4 rounded-xl border flex items-start gap-3"
                  style={{
                    backgroundColor: 'var(--safa-surface)',
                    borderColor: 'var(--safa-border)',
                  }}
                >
                  <Check className="w-4 h-4 mt-1 text-[#C5A15B] shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sm text-[var(--safa-ink)]">{item.name}</p>
                    <p className="text-xs sm:text-sm text-[var(--safa-ink-muted)] leading-relaxed mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications Table */}
          <div className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[var(--safa-ink)]">
              Product Specifications
            </h2>
            <dl
              className="rounded-xl border divide-y overflow-hidden"
              style={{
                backgroundColor: 'var(--safa-surface)',
                borderColor: 'var(--safa-border)',
              }}
            >
              {product.specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm"
                  style={{ borderColor: 'var(--safa-border)' }}
                >
                  <dt className="font-medium text-[var(--safa-ink-muted)]">{spec.label}</dt>
                  <dd className="sm:col-span-2 font-medium text-[var(--safa-ink)]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
