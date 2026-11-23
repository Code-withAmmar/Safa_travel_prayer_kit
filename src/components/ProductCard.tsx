import { Heart, ShoppingBag } from 'lucide-react';
import type { Product } from '../types/safa';
import { formatPKR } from '../utils/storeLogic';
import { SafaImage } from './SafaImage';

interface ProductCardProps {
  product: Product;
  wishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  wishlisted = false,
  onToggleWishlist,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
  const isOutOfStock = !product.available || product.stock <= 0;

  return (
    <article className="safa-card safa-card-interactive rounded-xl overflow-hidden flex flex-col h-full">
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[var(--safa-surface-alt)]">
        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="block w-full h-full text-left cursor-pointer group"
          aria-label={`View details for ${product.name}`}
        >
          <SafaImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
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
            className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm cursor-pointer transition-transform hover:scale-105"
            style={{
              backgroundColor: 'rgba(255, 252, 247, 0.92)',
              borderColor: wishlisted ? 'rgba(180, 62, 85, 0.35)' : 'var(--safa-border)',
              color: wishlisted ? '#B43E55' : 'var(--safa-ink)',
            }}
          >
            <Heart
              className={`w-[18px] h-[18px] transition-colors ${
                wishlisted ? 'fill-[#B43E55] text-[#B43E55]' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--safa-ink-muted)] mb-1.5">
          <span>
            {product.category === 'men' ? "Men's Collection" : "Women's Collection"} ·{' '}
            {product.packageVersion}
          </span>
          {isOutOfStock ? (
            <span className="font-medium text-red-700">Out of stock</span>
          ) : product.stock <= 5 ? (
            <span className="font-medium">Only {product.stock} left</span>
          ) : null}
        </div>

        <h3 className="font-sans text-[18px] font-semibold text-[var(--safa-ink)] leading-snug mb-1.5">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className="text-left hover:underline cursor-pointer"
          >
            {product.name}
          </button>
        </h3>

        <p className="text-[14px] text-[var(--safa-ink-muted)] leading-relaxed line-clamp-2 mb-4 flex-1">
          {product.shortDescription}
        </p>

        <div className="pt-3 border-t flex items-center justify-between gap-3" style={{ borderColor: 'var(--safa-border)' }}>
          <p className="text-[17px] font-semibold tabular-nums text-[var(--safa-ink)]">
            {formatPKR(product.price)}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="px-3 py-2 text-xs font-medium rounded-[7px] border cursor-pointer whitespace-nowrap min-h-[40px] hover:bg-[var(--safa-surface-alt)]/70 transition-colors"
              style={{
                borderColor: 'var(--safa-border)',
                color: 'var(--safa-ink)',
              }}
            >
              View Details
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              aria-label={`Add ${product.name} to cart`}
              className="safa-btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs whitespace-nowrap cursor-pointer min-h-[40px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
