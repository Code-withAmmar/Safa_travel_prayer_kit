export type CollectionCategory = 'men' | 'women';

export type PackageTier = 'Elite' | 'Premium' | 'Digital Plus' | 'Digital' | 'Classic';

export type ThemeMode = 'brand' | 'men' | 'women';

export type PageView =
  | 'home'
  | 'shop'
  | 'men'
  | 'women'
  | 'product'
  | 'wishlist'
  | 'checkout'
  | 'about'
  | 'contact'
  | 'admin';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'digital_wallet';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface ProductAccessory {
  name: string;
  detail: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CollectionCategory;
  packageVersion: PackageTier;
  price: number;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  tasbihSummary: string;
  accessories: ProductAccessory[];
  specifications: ProductSpec[];
  stock: number;
  available: boolean;
  featured: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  category: CollectionCategory;
  packageVersion: PackageTier;
  price: number;
  image: string;
  quantity: number;
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface OrderItemRecord {
  productId: string;
  name: string;
  category: CollectionCategory;
  packageVersion: PackageTier;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string;
}

export interface OrderRecord {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    postalCode?: string;
    notes?: string;
  };
  items: OrderItemRecord[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export interface ReviewRecord {
  id: string;
  authorName: string;
  city: string;
  category: CollectionCategory;
  packageVersion: PackageTier;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface InquiryRecord {
  id: string;
  fullName: string;
  contact: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'New' | 'Replied';
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockCount: number;
  totalInquiries: number;
}
