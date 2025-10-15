import { Observable } from 'rxjs';
import { Product } from './product.interface';
import { Cart, Order, OrderRequest } from './cart.interface';

/**
 * Data API abstraction interface
 * This interface is implemented by both WebApiService (cloud) and ElectronApiService (desktop)
 * to provide a consistent API regardless of the environment.
 */
export abstract class IDataApi {
  /**
   * Get all products from the API
   */
  abstract getAllProducts(): Observable<Product[]>;

  /**
   * Get a single product by ID
   * @param id Product ID
   */
  abstract getProductById(id: number): Observable<Product>;

  /**
   * Get all product categories
   */
  abstract getCategories(): Observable<string[]>;

  /**
   * Get products by category
   * @param category Category name
   */
  abstract getProductsByCategory(category: string): Observable<Product[]>;

  /**
   * Save cart data (for persistence)
   * @param cart Cart to save
   */
  abstract saveCart(cart: Cart): Observable<boolean>;

  /**
   * Load cart data from storage
   */
  abstract loadCart(): Observable<Cart | null>;

  /**
   * Submit an order for processing
   * @param orderRequest Order request data
   */
  abstract submitOrder(orderRequest: OrderRequest): Observable<Order>;

  /**
   * Get order by ID
   * @param orderId Order ID
   */
  abstract getOrder(orderId: string): Observable<Order>;

  /**
   * Get all orders for the current user
   */
  abstract getOrders(): Observable<Order[]>;
}
