import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addLocalInquiry,
  addLocalReview,
  computeLocalAdminStats,
  createInitialLocalStore,
  isJsonContentType,
  isSafeLocalMediaUrl,
  patchLocalOrderStatus,
  placeLocalOrder,
} from './localStoreFallback';

test('isJsonContentType distinguishes JSON APIs from Netlify HTML fallback pages', () => {
  assert.equal(isJsonContentType('application/json'), true);
  assert.equal(isJsonContentType('application/json; charset=utf-8'), true);
  assert.equal(isJsonContentType('text/html; charset=UTF-8'), false);
  assert.equal(isJsonContentType(null), false);
});

test('placeLocalOrder validates inputs, deducts stock, and issues sequential SAFA order reference', () => {
  const initial = createInitialLocalStore();
  const eliteBefore = initial.products.find((p) => p.id === 'men-elite')!;

  assert.throws(
    () =>
      placeLocalOrder(initial, {
        customer: {
          fullName: 'A',
          phone: '03009697647',
          address: '161B rafigarden',
          city: 'sahiwal',
        },
        paymentMethod: 'cod',
        items: [{ productId: 'men-elite', quantity: 1 }],
      }),
    /Full name is required/
  );

  const { state, order } = placeLocalOrder(initial, {
    customer: {
      fullName: 'Meerab Saleem',
      phone: '03009697647',
      email: 'meerab@example.pk',
      address: '161B rafigarden',
      city: 'sahiwal',
      postalCode: '57000',
    },
    paymentMethod: 'cod',
    items: [{ productId: 'men-elite', quantity: 1 }],
  });

  assert.equal(order.reference, 'SAFA-2026-1001');
  assert.equal(order.subtotal, 19979);
  assert.equal(order.deliveryCharge, 0);
  assert.equal(order.total, 19979);
  assert.equal(state.orders.length, 1);
  assert.equal(state.orderSequence, 1002);

  const eliteAfter = state.products.find((p) => p.id === 'men-elite')!;
  assert.equal(eliteAfter.stock, eliteBefore.stock - 1);
});

test('addLocalReview, addLocalInquiry, and order status updates maintain accurate admin stats', () => {
  const initial = createInitialLocalStore();
  const { state: s1, order } = placeLocalOrder(initial, {
    customer: {
      fullName: 'Bilal Ahmed',
      phone: '03001234567',
      address: 'House 14-B, Street 6, DHA Phase 5',
      city: 'Lahore',
    },
    paymentMethod: 'bank_transfer',
    items: [{ productId: 'men-classic', quantity: 1 }],
  });

  const { state: s2, review } = addLocalReview(s1, {
    authorName: 'Bilal Ahmed',
    city: 'Lahore',
    category: 'men',
    packageVersion: 'Classic',
    rating: 5,
    comment: 'Super compact canister and great non-slip prayer mat.',
  });
  assert.equal(s2.reviews[0].id, review.id);

  const { state: s3, inquiry } = addLocalInquiry(s2, {
    fullName: 'Bilal Ahmed',
    contact: '03001234567',
    email: '',
    subject: 'Corporate Gifting',
    message: 'Looking for 30 kits for a Ramadan corporate event.',
  });
  assert.equal(s3.inquiries[0].id, inquiry.id);

  const statsPending = computeLocalAdminStats(s3);
  assert.equal(statsPending.totalOrders, 1);
  assert.equal(statsPending.pendingOrders, 1);
  assert.equal(statsPending.totalRevenue, 1750 + 250);
  assert.equal(statsPending.totalInquiries, 1);

  const { state: s4 } = patchLocalOrderStatus(s3, order.id, 'Cancelled');
  const statsCancelled = computeLocalAdminStats(s4);
  assert.equal(statsCancelled.totalRevenue, 0);
  assert.equal(statsCancelled.pendingOrders, 0);
});

test('isSafeLocalMediaUrl allows safe raster data URLs and blocks script payloads', () => {
  assert.equal(isSafeLocalMediaUrl('/assets/aistudio/Safa_20278988.jpeg'), true);
  assert.equal(isSafeLocalMediaUrl('data:image/png;base64,iVBORw0KGgo='), true);
  assert.equal(isSafeLocalMediaUrl('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isSafeLocalMediaUrl('javascript:alert(1)'), false);
});
