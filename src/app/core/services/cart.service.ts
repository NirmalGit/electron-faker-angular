import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../interfaces/product.interface';
import { Cart, CartItem, CartSummary, Order, OrderRequest } from '../interfaces/cart.interface';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Reactive state using Angular signals
  private readonly _cart = signal<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  private readonly _orders = signal<Order[]>([]);

  // Public readonly signals
  public readonly cart = this._cart.asReadonly();
  public readonly orders = this._orders.asReadonly();

  // Computed values
  public readonly isEmpty = computed(() => this._cart().items.length === 0);
  public readonly itemCount = computed(() => 
    this._cart().items.reduce((total, item) => total + item.quantity, 0)
  );
  
  public readonly cartSummary = computed<CartSummary>(() => {
    const cart = this._cart();
    const subtotal = cart.totalAmount;
    const shipping = this.calculateShipping(subtotal);
    const tax = this.calculateTax(subtotal);
    
    return {
      itemCount: cart.totalItems,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax
    };
  });

  constructor(private logger: LoggerService) {
    this.logger.info('🛒 [CART SERVICE]', 'Service initialized');
    this.loadCartFromStorage();
  }

  /**
   * Add a product to the cart
   */
  addToCart(product: Product, quantity: number = 1): void {
    this.logger.info('🛒 [CART SERVICE]', 'Adding to cart:', { 
      productId: product.id, 
      title: product.title, 
      quantity 
    });

    const currentCart = this._cart();
    const existingItemIndex = currentCart.items.findIndex(
      item => item.product.id === product.id
    );

    let updatedItems: CartItem[];

    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = [...currentCart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        subtotal: (updatedItems[existingItemIndex].quantity + quantity) * product.price
      };
      this.logger.info('🛒 [CART SERVICE]', 'Updated existing item quantity');
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        subtotal: product.price * quantity
      };
      updatedItems = [...currentCart.items, newItem];
      this.logger.info('🛒 [CART SERVICE]', 'Added new item to cart');
    }

    this.updateCart(updatedItems);
  }

  /**
   * Remove a product from the cart entirely
   */
  removeFromCart(productId: number): void {
    this.logger.info('🛒 [CART SERVICE]', 'Removing from cart:', { productId });
    
    const currentCart = this._cart();
    const updatedItems = currentCart.items.filter(
      item => item.product.id !== productId
    );

    this.updateCart(updatedItems);
  }

  /**
   * Update the quantity of a specific item
   */
  updateQuantity(productId: number, quantity: number): void {
    this.logger.info('🛒 [CART SERVICE]', 'Updating quantity:', { productId, quantity });

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this._cart();
    const updatedItems = currentCart.items.map(item => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity,
          subtotal: item.product.price * quantity
        };
      }
      return item;
    });

    this.updateCart(updatedItems);
  }

  /**
   * Get the quantity of a specific product in the cart
   */
  getItemQuantity(productId: number): number {
    const item = this._cart().items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Check if a product is in the cart
   */
  isInCart(productId: number): boolean {
    return this._cart().items.some(item => item.product.id === productId);
  }

  /**
   * Clear the entire cart
   */
  clearCart(): void {
    this.logger.info('🛒 [CART SERVICE]', 'Clearing cart');
    
    this._cart.set({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.saveCartToStorage();
  }

  /**
   * Create an order from the current cart
   */
  async createOrder(orderRequest: OrderRequest): Promise<Order> {
    this.logger.info('🛒 [CART SERVICE]', 'Creating order');

    const summary = this.cartSummary();
    const orderId = this.generateOrderId();

    const order: Order = {
      id: orderId,
      cart: orderRequest.cart,
      billing: orderRequest.billing,
      shipping: orderRequest.shipping,
      payment: {
        method: orderRequest.payment.method,
        cardholderName: orderRequest.payment.cardholderName,
        paypalEmail: orderRequest.payment.paypalEmail,
        cryptoWallet: orderRequest.payment.cryptoWallet
      },
      subtotal: summary.subtotal,
      shipping_cost: summary.shipping,
      tax: summary.tax,
      total: summary.total,
      status: 'pending',
      createdAt: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery(orderRequest.shipping.shippingMethod)
    };

    // Add to orders list
    const currentOrders = this._orders();
    this._orders.set([...currentOrders, order]);

    // Clear the cart after successful order
    this.clearCart();

    this.logger.info('🛒 [CART SERVICE]', 'Order created successfully:', { orderId });
    return order;
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): Order | undefined {
    return this._orders().find(order => order.id === orderId);
  }

  /**
   * Private helper methods
   */
  private updateCart(items: CartItem[]): void {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    this._cart.set({
      items,
      totalItems,
      totalAmount,
      createdAt: this._cart().createdAt,
      updatedAt: new Date()
    });

    this.saveCartToStorage();
  }

  private calculateShipping(subtotal: number): number {
    // Free shipping over $50
    if (subtotal >= 50) return 0;
    // Standard shipping rate
    return 9.99;
  }

  private calculateTax(subtotal: number): number {
    // 8.5% tax rate
    return subtotal * 0.085;
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  }

  private calculateEstimatedDelivery(shippingMethod: string): Date {
    const now = new Date();
    const deliveryDate = new Date(now);
    
    switch (shippingMethod) {
      case 'overnight':
        deliveryDate.setDate(now.getDate() + 1);
        break;
      case 'express':
        deliveryDate.setDate(now.getDate() + 3);
        break;
      case 'standard':
      default:
        deliveryDate.setDate(now.getDate() + 7);
        break;
    }
    
    return deliveryDate;
  }

  private saveCartToStorage(): void {
    try {
      const cartData = JSON.stringify(this._cart());
      localStorage.setItem('cart', cartData);
      this.logger.debug('🛒 [CART SERVICE]', 'Cart saved to localStorage');
    } catch (error) {
      this.logger.error('🛒 [CART SERVICE]', 'Failed to save cart to localStorage:', String(error));
    }
  }

  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        // Ensure dates are properly parsed
        parsedCart.createdAt = new Date(parsedCart.createdAt);
        parsedCart.updatedAt = new Date(parsedCart.updatedAt);
        this._cart.set(parsedCart);
        this.logger.info('🛒 [CART SERVICE]', 'Cart loaded from localStorage');
      }
    } catch (error) {
      this.logger.error('🛒 [CART SERVICE]', 'Failed to load cart from localStorage:', String(error));
      // Initialize with empty cart if loading fails
      this._cart.set({
        items: [],
        totalItems: 0,
        totalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
}