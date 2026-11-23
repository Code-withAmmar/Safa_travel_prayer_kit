import { useState, type FormEvent } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, Truck } from 'lucide-react';
import { PAKISTAN_CITIES } from '../data/seedCatalog';
import type {
  CartItem,
  CheckoutFormData,
  OrderRecord,
  PaymentMethod,
} from '../types/safa';
import {
  calculateCartTotals,
  formatPKR,
  validateCheckoutForm,
  type CheckoutFieldErrors,
} from '../utils/storeLogic';
import { SafaImage } from './SafaImage';

interface CheckoutViewProps {
  items: CartItem[];
  onSubmitOrder: (form: CheckoutFormData) => Promise<OrderRecord>;
  onContinueShopping: () => void;
  onBackToShop: () => void;
}

const INITIAL_FORM: CheckoutFormData = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  paymentMethod: 'cod',
  notes: '',
};

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  detail: string;
  icon: typeof Truck;
}> = [
  {
    id: 'cod',
    label: 'Cash on Delivery (COD)',
    description: 'Pay in cash when your SAFA kit arrives at your doorstep.',
    detail: 'Available nationwide across Pakistan. Our team confirms dispatch via phone/WhatsApp.',
    icon: Truck,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer (IBFT / Meezan Bank)',
    description: 'Direct bank transfer to SAFA’s official business account.',
    detail: 'Account Title: SAFA Travel Essentials · IBAN shared on your confirmation receipt.',
    icon: Landmark,
  },
  {
    id: 'digital_wallet',
    label: 'Digital Payment (JazzCash / EasyPaisa / Raast)',
    description: 'Fast mobile wallet or Raast transfer from any Pakistani bank.',
    detail: 'Instant payment verification via WhatsApp receipt after placing your order.',
    icon: CreditCard,
  },
];

export function CheckoutView({
  items,
  onSubmitOrder,
  onContinueShopping,
  onBackToShop,
}: CheckoutViewProps) {
  const [form, setForm] = useState<CheckoutFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<CheckoutFieldErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const totals = calculateCartTotals(items);

  const updateField = <K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validateCheckoutForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const order = await onSubmitOrder(form);
      setConfirmedOrder(order);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to place order right now.');
    } finally {
      setSubmitting(false);
    }
  };

  // ORDER CONFIRMATION RECEIPT SCREEN
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="safa-card rounded-2xl p-7 sm:p-10 space-y-7">
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#173F35] mx-auto" aria-hidden="true" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#8B735B] font-semibold">
              Order Confirmed
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#173F35]">
              Thank You for Your Order, {confirmedOrder.customer.fullName}
            </h1>
            <p className="text-sm text-[#5A5D5A] max-w-lg mx-auto">
              Your SAFA Travel Prayer Kit order has been received and is being prepared for
              dispatch to {confirmedOrder.customer.city}.
            </p>
          </div>

          <div
            className="rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border"
            style={{
              backgroundColor: '#F8F5EE',
              borderColor: 'var(--safa-border)',
            }}
          >
            <div>
              <p className="text-xs text-[#5A5D5A]">Order Reference</p>
              <p
                className="font-semibold text-[#173F35] tabular-nums mt-0.5"
                data-testid="order-confirmation-ref"
              >
                {confirmedOrder.reference}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5A5D5A]">Payment Method</p>
              <p className="font-semibold text-[#173F35] mt-0.5">
                {confirmedOrder.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : confirmedOrder.paymentMethod === 'bank_transfer'
                  ? 'Bank Transfer'
                  : 'Digital Payment (Raast / Wallet)'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#5A5D5A]">Total Payable</p>
              <p className="font-semibold text-[#173F35] tabular-nums mt-0.5">
                {formatPKR(confirmedOrder.total)}
              </p>
            </div>
          </div>

          {confirmedOrder.paymentMethod !== 'cod' && (
            <div
              className="rounded-xl p-4 text-sm border"
              style={{
                backgroundColor: '#E9E0D1',
                borderColor: 'rgba(139, 115, 91, 0.3)',
              }}
            >
              <p className="font-semibold text-[#173F35] mb-1">Transfer Instructions</p>
              <p className="text-xs text-[#493A2E] leading-relaxed">
                Please transfer{' '}
                <strong className="tabular-nums">{formatPKR(confirmedOrder.total)}</strong> using
                your reference <strong>{confirmedOrder.reference}</strong> and share the transfer
                receipt via WhatsApp (+92 300 1234567) for immediate dispatch.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-[#173F35]">Items Ordered</h2>
            <ul className="divide-y border rounded-xl overflow-hidden" style={{ borderColor: 'var(--safa-border)' }}>
              {confirmedOrder.items.map((item) => (
                <li
                  key={item.productId}
                  className="p-4 flex items-center justify-between gap-4 bg-white text-sm"
                  style={{ borderColor: 'var(--safa-border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-stone-100">
                      <SafaImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#173F35] truncate">{item.name}</p>
                      <p className="text-xs text-[#5A5D5A]">
                        {item.category === 'men' ? "Men's Collection" : "Women's Collection"} ·{' '}
                        {item.packageVersion} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold tabular-nums shrink-0">
                    {formatPKR(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onContinueShopping}
              className="safa-btn-primary px-6 py-3 text-sm cursor-pointer min-h-[44px]"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-semibold text-[#173F35]">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-sm text-[#5A5D5A]">
          Select a Men&apos;s Beige or Women&apos;s Mauve SAFA Travel Prayer Kit before proceeding
          to checkout.
        </p>
        <button
          type="button"
          onClick={onBackToShop}
          className="safa-btn-primary px-6 py-3 text-sm cursor-pointer"
        >
          Browse SAFA Packages
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <button
        type="button"
        onClick={onBackToShop}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#5A5D5A] hover:text-[#173F35] mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Continue Shopping
      </button>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-[#8B735B] font-medium mb-1">
          Secure Checkout · Pakistan
        </p>
        <h1 className="font-display text-[34px] sm:text-[42px] font-semibold text-[#173F35]">
          Complete Your SAFA Order
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Info & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {submitError && (
            <div
              role="alert"
              className="rounded-xl p-4 text-sm bg-red-50 text-red-800 border border-red-200"
            >
              {submitError}
            </div>
          )}

          <section className="safa-card rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              1. Customer Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-fullName" className="block text-xs font-semibold mb-1.5">
                  Full Name *
                </label>
                <input
                  id="checkout-fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Usman Khalid"
                  aria-invalid={Boolean(errors.fullName)}
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: errors.fullName ? '#B91C1C' : 'var(--safa-border)' }}
                />
                {errors.fullName && (
                  <p role="alert" className="text-xs text-red-700 mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-phone" className="block text-xs font-semibold mb-1.5">
                  Contact Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="0300-1234567"
                  aria-invalid={Boolean(errors.phone)}
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: errors.phone ? '#B91C1C' : 'var(--safa-border)' }}
                />
                {errors.phone && (
                  <p role="alert" className="text-xs text-red-700 mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="checkout-email" className="block text-xs font-semibold mb-1.5">
                Email Address (Optional)
              </label>
              <input
                id="checkout-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                style={{ borderColor: errors.email ? '#B91C1C' : 'var(--safa-border)' }}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-red-700 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="checkout-address" className="block text-xs font-semibold mb-1.5">
                Complete Delivery Address *
              </label>
              <textarea
                id="checkout-address"
                rows={2}
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="House / Flat number, street, sector or block"
                aria-invalid={Boolean(errors.address)}
                className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white"
                style={{ borderColor: errors.address ? '#B91C1C' : 'var(--safa-border)' }}
              />
              {errors.address && (
                <p role="alert" className="text-xs text-red-700 mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-city" className="block text-xs font-semibold mb-1.5">
                  City *
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  list="pakistan-cities"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  aria-invalid={Boolean(errors.city)}
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: errors.city ? '#B91C1C' : 'var(--safa-border)' }}
                />
                <datalist id="pakistan-cities">
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.city && (
                  <p role="alert" className="text-xs text-red-700 mt-1">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-postalCode" className="block text-xs font-semibold mb-1.5">
                  Postal Code (Optional)
                </label>
                <input
                  id="checkout-postalCode"
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                  style={{ borderColor: 'var(--safa-border)' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="checkout-notes" className="block text-xs font-semibold mb-1.5">
                Delivery or Gift Notes (Optional)
              </label>
              <input
                id="checkout-notes"
                type="text"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any courier instructions or gift note"
                className="w-full rounded-[7px] border px-3.5 py-2.5 text-sm bg-white min-h-[44px]"
                style={{ borderColor: 'var(--safa-border)' }}
              />
            </div>
          </section>

          <section className="safa-card rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#173F35]">
              2. Payment Method
            </h2>

            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {PAYMENT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = form.paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`block p-4 rounded-xl border cursor-pointer transition-colors ${
                      selected ? 'bg-[#F8F5EE]' : 'bg-white hover:bg-stone-50'
                    }`}
                    style={{
                      borderColor: selected ? '#173F35' : 'var(--safa-border)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={selected}
                        onChange={() => updateField('paymentMethod', opt.id)}
                        className="mt-1 accent-[#173F35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold text-sm text-[#173F35]">
                          <Icon className="w-4 h-4 text-[#C5A15B]" aria-hidden="true" />
                          <span>{opt.label}</span>
                        </div>
                        <p className="text-xs text-[#5A5D5A] mt-0.5">{opt.description}</p>
                        {selected && (
                          <p className="text-xs text-[#173F35] mt-2 pt-2 border-t" style={{ borderColor: 'var(--safa-border)' }}>
                            {opt.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Sticky Order Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 safa-card rounded-2xl p-6 sm:p-7 space-y-5">
          <h2 className="font-display text-2xl font-semibold text-[#173F35]">Order Summary</h2>

          <ul className="divide-y" style={{ borderColor: 'var(--safa-border)' }}>
            {items.map((item) => (
              <li
                key={item.productId}
                className="py-3.5 flex items-center justify-between gap-3 text-sm"
                style={{ borderColor: 'var(--safa-border)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    <SafaImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#173F35] truncate">{item.name}</p>
                    <p className="text-xs text-[#5A5D5A]">
                      {item.category === 'men' ? "Men's" : "Women's"} · {item.packageVersion} · Qty{' '}
                      <span className="tabular-nums">{item.quantity}</span>
                    </p>
                  </div>
                </div>
                <p className="font-semibold tabular-nums shrink-0">
                  {formatPKR(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div
            className="pt-4 border-t space-y-2 text-sm"
            style={{ borderColor: 'var(--safa-border)' }}
          >
            <div className="flex justify-between">
              <span className="text-[#5A5D5A]">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPKR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A5D5A]">Delivery Charges</span>
              <span className="font-medium tabular-nums">
                {totals.deliveryCharge === 0 ? 'Free' : formatPKR(totals.deliveryCharge)}
              </span>
            </div>
            <div
              className="flex justify-between pt-3 border-t text-lg font-semibold text-[#173F35]"
              style={{ borderColor: 'var(--safa-border)' }}
            >
              <span>Final Amount</span>
              <span className="tabular-nums">{formatPKR(totals.total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="safa-btn-primary w-full py-3.5 px-6 text-[15px] cursor-pointer min-h-[48px] disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : `Place Order · ${formatPKR(totals.total)}`}
          </button>

          <p className="text-xs text-center text-[#5A5D5A]">
            Orders are verified and dispatched across Pakistan within 2–4 working days.
          </p>
        </aside>
      </form>
    </div>
  );
}
