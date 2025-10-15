import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
import { Cart, Order, OrderRequest } from '../interfaces/cart.interface';
import { IDataApi } from '../interfaces/idata-api.interface';
import { LoggerService } from './logger.service';

/**
 * Web API Service (Cloud Mode)
 * Implements IDataApi interface using HttpClient to call FakeStoreAPI
 */
@Injectable({
  providedIn: 'root'
})
export class WebApiService extends IDataApi {
  private readonly baseUrl = 'https://fakestoreapi.com';
  private readonly requestTimeout = 10000; // 10 seconds

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    super();
    this.logger.info('🌐', 'WebApiService initialized - Using HTTP/REST API mode');
  }

  /**
   * Get all products from FakeStoreAPI
   */
  getAllProducts(): Observable<Product[]> {
    this.logger.log('🌐 [WEB API]', 'Fetching all products via HTTP');
    return this.http.get<Product[]>(`${this.baseUrl}/products`).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Get a single product by ID
   * @param id Product ID
   */
  getProductById(id: number): Observable<Product> {
    this.logger.log('🌐 [WEB API]', `Fetching product ${id} via HTTP`);
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Get all product categories
   */
  getCategories(): Observable<string[]> {
    this.logger.log('🌐 [WEB API]', 'Fetching categories via HTTP');
    return this.http.get<string[]>(`${this.baseUrl}/products/categories`).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Get products by category
   * @param category Category name
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    this.logger.log('🌐 [WEB API]', `Fetching products in category '${category}' via HTTP`);
    return this.http.get<Product[]>(`${this.baseUrl}/products/category/${category}`).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
      this.logger.error('🌐 [WEB API]', 'Network error:', errorMessage);
    } else {
      // Backend error
      errorMessage = `Server error: ${error.status} - ${error.message}`;
      this.logger.error('🌐 [WEB API]', 'Server error:', errorMessage);
    }

    console.error('WebApiService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Save cart data to localStorage (web implementation)
   */
  saveCart(cart: Cart): Observable<boolean> {
    this.logger.log('🌐 [WEB API]', 'Saving cart to localStorage');
    
    return new Observable(subscriber => {
      try {
        localStorage.setItem('cart', JSON.stringify(cart));
        subscriber.next(true);
        subscriber.complete();
      } catch (error) {
        this.logger.error('🌐 [WEB API]', 'Failed to save cart:', String(error));
        subscriber.error(error);
      }
    });
  }

  /**
   * Load cart data from localStorage (web implementation)
   */
  loadCart(): Observable<Cart | null> {
    this.logger.log('🌐 [WEB API]', 'Loading cart from localStorage');
    
    return new Observable(subscriber => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const cart = JSON.parse(cartData);
          // Ensure dates are properly parsed
          cart.createdAt = new Date(cart.createdAt);
          cart.updatedAt = new Date(cart.updatedAt);
          subscriber.next(cart);
        } else {
          subscriber.next(null);
        }
        subscriber.complete();
      } catch (error) {
        this.logger.error('🌐 [WEB API]', 'Failed to load cart:', String(error));
        subscriber.error(error);
      }
    });
  }

  /**
   * Submit order (mock implementation for demo)
   */
  submitOrder(orderRequest: OrderRequest): Observable<Order> {
    this.logger.log('🌐 [WEB API]', 'Submitting order');
    
    return new Observable(subscriber => {
      // Simulate API call delay
      setTimeout(() => {
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
        
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
          subtotal: orderRequest.cart.totalAmount,
          shipping_cost: orderRequest.cart.totalAmount >= 50 ? 0 : 9.99,
          tax: orderRequest.cart.totalAmount * 0.085,
          total: orderRequest.cart.totalAmount + (orderRequest.cart.totalAmount >= 50 ? 0 : 9.99) + (orderRequest.cart.totalAmount * 0.085),
          status: 'pending',
          createdAt: new Date(),
          estimatedDelivery: this.calculateEstimatedDelivery(orderRequest.shipping.shippingMethod)
        };

        // Save order to localStorage (in real app, would be sent to server)
        this.saveOrderToStorage(order);
        
        subscriber.next(order);
        subscriber.complete();
      }, 1000); // Simulate 1 second API call
    });
  }

  /**
   * Get order by ID (mock implementation)
   */
  getOrder(orderId: string): Observable<Order> {
    this.logger.log('🌐 [WEB API]', 'Getting order:', orderId);
    
    return new Observable(subscriber => {
      try {
        const orders = this.getOrdersFromStorage();
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
          subscriber.next(order);
        } else {
          subscriber.error(new Error(`Order ${orderId} not found`));
        }
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  /**
   * Get all orders (mock implementation)
   */
  getOrders(): Observable<Order[]> {
    this.logger.log('🌐 [WEB API]', 'Getting all orders');
    
    return new Observable(subscriber => {
      try {
        const orders = this.getOrdersFromStorage();
        subscriber.next(orders);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  /**
   * Private helper methods
   */
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

  private saveOrderToStorage(order: Order): void {
    try {
      const orders = this.getOrdersFromStorage();
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
      this.logger.error('🌐 [WEB API]', 'Failed to save order to storage:', String(error));
    }
  }

  private getOrdersFromStorage(): Order[] {
    try {
      const ordersData = localStorage.getItem('orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        // Ensure dates are properly parsed
        return orders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery) : undefined,
          cart: {
            ...order.cart,
            createdAt: new Date(order.cart.createdAt),
            updatedAt: new Date(order.cart.updatedAt)
          }
        }));
      }
      return [];
    } catch (error) {
      this.logger.error('🌐 [WEB API]', 'Failed to load orders from storage:', String(error));
      return [];
    }
  }
}
