import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_PRODUCTS } from '../data/seedCatalog';
import {
  addToCartItems,
  calculateCartTotals,
  filterAndSortProducts,
  formatPKR,
  isSafeMediaUrl,
  isWishlisted,
  removeCartItem,
  resolveThemeMode,
  resolveWishlistedProducts,
  STANDARD_DELIVERY_FEE,
  toggleWishlistItem,
  updateCartItemQuantity,
  validateCheckoutForm,
} from './storeLogic';

test('formatPKR formats Pakistani Rupees cleanly', () => {
  assert.equal(formatPKR(1570), 'Rs. 1,570');
  assert.equal(formatPKR(21890), 'Rs. 21,890');
  assert.equal(formatPKR(0), 'Rs. 0');
});

test('resolveThemeMode switches smoothly between brand, men, and women themes', () => {
  assert.equal(resolveThemeMode('home'), 'brand');
  assert.equal(resolveThemeMode('men'), 'men');
  assert.equal(resolveThemeMode('women'), 'women');
  assert.equal(resolveThemeMode('product', 'men'), 'men');
  assert.equal(resolveThemeMode('product', 'women'), 'women');
  assert.equal(resolveThemeMode('wishlist'), 'brand');
  assert.equal(resolveThemeMode('checkout'), 'brand');
});

test('wishlist toggle adds, removes, and resolves live catalog products in order', () => {
  let ids = toggleWishlistItem([], 'men-elite');
  assert.deepEqual(ids, ['men-elite']);
  assert.equal(isWishlisted(ids, 'men-elite'), true);
  assert.equal(isWishlisted(ids, 'women-premium'), false);

  ids = toggleWishlistItem(ids, 'women-premium');
  assert.deepEqual(ids, ['women-premium', 'men-elite']);

  const resolved = resolveWishlistedProducts(SEED_PRODUCTS, [...ids, 'non-existent-id']);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].id, 'women-premium');
  assert.equal(resolved[1].id, 'men-elite');

  ids = toggleWishlistItem(ids, 'men-elite');
  assert.deepEqual(ids, ['women-premium']);
});

test('cart keeps separate line items for different variations and merges identical variations', () => {
  const menClassic = SEED_PRODUCTS.find((p) => p.id === 'men-classic')!;
  const womenPremium = SEED_PRODUCTS.find((p) => p.id === 'women-premium')!;

  let cart = addToCartItems([], menClassic, 1);
  cart = addToCartItems(cart, womenPremium, 2);
  assert.equal(cart.length, 2);

  cart = addToCartItems(cart, menClassic, 1);
  assert.equal(cart.length, 2);
  assert.equal(cart[0].quantity, 2);

  const totals = calculateCartTotals(cart);
  assert.equal(totals.itemCount, 4);
  assert.equal(totals.subtotal, 1750 * 2 + 7400 * 2);
  assert.equal(totals.deliveryCharge, 0);
  assert.equal(totals.total, totals.subtotal);
});

test('calculateCartTotals applies standard delivery fee under Rs. 5,000 and waives it at or above Rs. 5,000', () => {
  const menDigital = SEED_PRODUCTS.find((p) => p.id === 'men-digital')!;
  const cartLow = addToCartItems([], menDigital, 1);
  const totalsLow = calculateCartTotals(cartLow);
  assert.equal(totalsLow.subtotal, 1570);
  assert.equal(totalsLow.deliveryCharge, STANDARD_DELIVERY_FEE);
  assert.equal(totalsLow.total, 1570 + STANDARD_DELIVERY_FEE);
  assert.equal(totalsLow.amountToFreeDelivery, 5000 - 1570);

  const cartUpdated = updateCartItemQuantity(cartLow, menDigital.id, 4);
  const totalsHigh = calculateCartTotals(cartUpdated);
  assert.equal(totalsHigh.subtotal, 1570 * 4);
  assert.equal(totalsHigh.deliveryCharge, 0);
  assert.equal(totalsHigh.total, 1570 * 4);

  const empty = removeCartItem(cartUpdated, menDigital.id);
  const totalsEmpty = calculateCartTotals(empty);
  assert.equal(totalsEmpty.total, 0);
  assert.equal(totalsEmpty.deliveryCharge, 0);
});

test('filterAndSortProducts isolates Men and Women collections without mixing assets', () => {
  const menOnly = filterAndSortProducts(SEED_PRODUCTS, {
    category: 'men',
    tier: 'all',
    search: '',
    sortBy: 'featured',
  });
  assert.equal(menOnly.length, 5);
  assert.ok(menOnly.every((p) => p.category === 'men'));
  assert.ok(menOnly.every((p) => p.image.toLowerCase().includes('men')));

  const womenOnly = filterAndSortProducts(SEED_PRODUCTS, {
    category: 'women',
    tier: 'all',
    search: '',
    sortBy: 'price_desc',
  });
  assert.equal(womenOnly.length, 5);
  assert.ok(womenOnly.every((p) => p.category === 'women'));
  assert.equal(womenOnly[0].packageVersion, 'Elite');
  assert.equal(womenOnly[0].price, 21890);
});

test('validateCheckoutForm rejects empty/invalid inputs and passes valid Pakistan delivery info', () => {
  const invalidErrors = validateCheckoutForm({
    fullName: '',
    phone: '123',
    email: 'not-an-email',
    address: 'Short',
    city: '',
    postalCode: '',
    paymentMethod: 'cod',
    notes: '',
  });
  assert.ok(invalidErrors.fullName);
  assert.ok(invalidErrors.phone);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.address);
  assert.ok(invalidErrors.city);

  const validErrors = validateCheckoutForm({
    fullName: 'Bilal Ahmed',
    phone: '0300-4455667',
    email: 'bilal@example.pk',
    address: 'House 14-B, Street 6, DHA Phase 5',
    city: 'Lahore',
    postalCode: '54792',
    paymentMethod: 'cod',
    notes: 'Call before delivery',
  });
  assert.deepEqual(validErrors, {});
});

test('isSafeMediaUrl blocks javascript: and data: URIs while allowing local assets', () => {
  assert.equal(isSafeMediaUrl('/assets/aistudio/Safa_20278988.jpeg'), true);
  assert.equal(isSafeMediaUrl('/uploads/product-1.png'), true);
  assert.equal(isSafeMediaUrl('javascript:alert(1)'), false);
  assert.equal(isSafeMediaUrl('data:text/html,<script>alert(1)</script>'), false);
});
