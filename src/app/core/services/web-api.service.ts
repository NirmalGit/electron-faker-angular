import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
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
}
