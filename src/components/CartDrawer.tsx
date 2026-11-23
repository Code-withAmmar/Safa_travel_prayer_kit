import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem } from '../types/safa';
import {
  FREE_DELIVERY_THRESHOLD,
  calculateCartTotals,
  formatPKR,
} from '../utils/storeLogic';
import { SafaImage } from './SafaImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, nextQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartDrawer({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
}: CartDrawerProps) {
  if (!open) return null;

  const totals = calculateCartTotals(items);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--safa-surface)',
          color: 'var(--safa-ink)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--safa-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C5A15B]" aria-hidden="true" />
            <h2 id="cart-drawer-title" className="font-display text-2xl font-semibold">
              Shopping Cart
            </h2>
            <span className="text-xs text-[var(--safa-ink-muted)] tabular-nums">
              ({totals.itemCount})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping cart"
            className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-[var(--safa-surface-alt)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Progress Notice */}
        {items.length > 0 && (
          <div
            className="px-6 py-3 text-xs border-b"
            style={{
              backgroundColor: 'var(--safa-surface-alt)',
              borderColor: 'var(--safa-border)',
            }}
          >
            {totals.deliveryCharge === 0 ? (
              <p className="font-medium text-[var(--safa-ink)]">
                Your order qualifies for complimentary nationwide delivery across Pakistan.
              </p>
            ) : (
              <p className="text-[var(--safa-ink)]">
                Add{' '}
                <span className="font-semibold tabular-nums">
                  {formatPKR(totals.amountToFreeDelivery)}
                </span>{' '}
                more for free delivery (orders {formatPKR(FREE_DELIVERY_THRESHOLD)}+).
              </p>
            )}
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-14 space-y-4">
              <p className="font-arabic text-3xl text-[#C5A15B]" dir="rtl">
                صفا
              </p>
              <div className="space-y-1">
                <p className="font-display text-2xl font-semibold">Your cart is empty</p>
                <p className="text-sm text-[var(--safa-ink-muted)] max-w-xs">
                  Explore our Men&apos;s Beige and Women&apos;s Mauve travel prayer kits to begin.
                </p>
              </div>
              <button
                type="button"
                onClick={onContinueShopping}
                className="safa-btn-primary px-6 py-2.5 text-sm cursor-pointer min-h-[42px]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 pb-4 border-b"
                style={{ borderColor: 'var(--safa-border)' }}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--safa-surface-alt)] shrink-0">
                  <SafaImage
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold leading-snug text-[var(--safa-ink)]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[var(--safa-ink-muted)]">
                        {item.category === 'men' ? "Men's Collection" : "Women's Collection"} ·{' '}
                        {item.packageVersion}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="p-1.5 text-[var(--safa-ink-muted)] hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div
                      className="inline-flex items-center rounded-md border bg-white"
                      style={{ borderColor: 'var(--safa-border)' }}
                    >
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity for ${item.name}`}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        aria-label={`Increase quantity for ${item.name}`}
                        className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-[var(--safa-ink)]">
                        {formatPKR(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-[var(--safa-ink-muted)] tabular-nums">
                          {formatPKR(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Actions */}
        {items.length > 0 && (
          <div
            className="px-6 py-5 border-t space-y-4"
            style={{
              backgroundColor: 'var(--safa-canvas)',
              borderColor: 'var(--safa-border)',
            }}
          >
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--safa-ink-muted)]">Subtotal</span>
                <span className="font-medium tabular-nums">{formatPKR(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--safa-ink-muted)]">Delivery Charges</span>
                <span className="font-medium tabular-nums">
                  {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
                </span>
              </div>
              <div
                className="flex justify-between pt-2.5 border-t text-base font-semibold"
                style={{ borderColor: 'var(--safa-border)' }}
              >
                <span>Total Order Amount</span>
                <span className="tabular-nums" data-testid="cart-total-amount">
                  {formatPKR(totals.total)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="safa-btn-primary w-full py-3 px-4 text-sm inline-flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="w-full py-2.5 px-4 text-sm font-medium rounded-[7px] border cursor-pointer hover:bg-[var(--safa-surface-alt)]/70 min-h-[42px]"
                style={{ borderColor: 'var(--safa-border)' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
