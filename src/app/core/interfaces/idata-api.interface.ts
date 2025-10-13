import { Observable } from 'rxjs';
import { Product } from './product.interface';

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
}
