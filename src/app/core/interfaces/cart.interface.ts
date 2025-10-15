import { Product } from './product.interface';

/**
 * Cart item representing a product with quantity in the cart
 */
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number; // price * quantity
}

/**
 * Shopping cart containing multiple items
 */
export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customer billing information
 */
export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Shipping information (can be same as billing)
 */
export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingMethod: 'standard' | 'express' | 'overnight';
}

/**
 * Payment information
 */
export interface PaymentInfo {
  method: 'credit' | 'debit' | 'paypal' | 'crypto';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  // For other payment methods
  paypalEmail?: string;
  cryptoWallet?: string;
}

/**
 * Order summary and tracking
 */
export interface Order {
  id: string;
  cart: Cart;
  billing: BillingInfo;
  shipping: ShippingInfo;
  payment: Omit<PaymentInfo, 'cardNumber' | 'cvv'>; // Exclude sensitive data
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
}

/**
 * Order creation request (what gets sent to server)
 */
export interface OrderRequest {
  cart: Cart;
  billing: BillingInfo;
  shipping: ShippingInfo;
  payment: PaymentInfo;
}

/**
 * Cart summary for quick calculations
 */
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}