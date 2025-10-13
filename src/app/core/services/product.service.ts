import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../interfaces/product.interface';
import { IDataApi } from '../interfaces/idata-api.interface';

/**
 * Product Service
 * Manages product state using Angular signals and delegates API calls to IDataApi
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Signals for reactive state management
  private readonly _products = signal<Product[]>([]);
  private readonly _selectedProduct = signal<Product | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _categories = signal<string[]>([]);

  // Public readonly signals
  readonly products = this._products.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly categories = this._categories.asReadonly();

  // Computed signals
  readonly hasProducts = computed(() => this._products().length > 0);
  readonly productsCount = computed(() => this._products().length);

  constructor(private dataApi: IDataApi) {}

  /**
   * Load all products from the API
   */
  loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    this.dataApi.getAllProducts().subscribe({
      next: (products) => {
        this._products.set(products);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load products: ' + err.message);
        this._loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  /**
   * Load a single product by ID
   * @param id Product ID
   */
  loadProductById(id: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.dataApi.getProductById(id).subscribe({
      next: (product) => {
        this._selectedProduct.set(product);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load product: ' + err.message);
        this._loading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  /**
   * Load all categories
   */
  loadCategories(): void {
    this.dataApi.getCategories().subscribe({
      next: (categories) => {
        this._categories.set(categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  /**
   * Load products by category
   * @param category Category name
   */
  loadProductsByCategory(category: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.dataApi.getProductsByCategory(category).subscribe({
      next: (products) => {
        this._products.set(products);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load products: ' + err.message);
        this._loading.set(false);
        console.error('Error loading products by category:', err);
      }
    });
  }

  /**
   * Filter products by search term (client-side)
   * @param searchTerm Search term
   */
  filterProducts(searchTerm: string): Product[] {
    const term = searchTerm.toLowerCase();
    return this._products().filter(product =>
      product.title.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  }

  /**
   * Clear selected product
   */
  clearSelectedProduct(): void {
    this._selectedProduct.set(null);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }
}
