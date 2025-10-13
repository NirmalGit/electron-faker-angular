import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
import { IDataApi } from '../interfaces/idata-api.interface';

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

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Get all products from FakeStoreAPI
   */
  getAllProducts(): Observable<Product[]> {
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
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`).pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    );
  }

  /**
   * Get all product categories
   */
  getCategories(): Observable<string[]> {
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
    } else {
      // Backend error
      errorMessage = `Server error: ${error.status} - ${error.message}`;
    }

    console.error('WebApiService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
