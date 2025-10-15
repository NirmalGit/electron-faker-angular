import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
import { Cart, Order, OrderRequest } from '../interfaces/cart.interface';
import { IDataApi } from '../interfaces/idata-api.interface';
import { LoggerService } from './logger.service';

/**
 * Electron API Service (Desktop Mode)
 * Implements IDataApi interface using Electron IPC communication
 */
@Injectable({
  providedIn: 'root'
})
export class ElectronApiService extends IDataApi {
  constructor(private logger: LoggerService) {
    super();
    
    // Verify Electron API is available
    if (!this.isElectronAvailable()) {
      this.logger.warn('⚡', 'Electron API not available. This service should only be used in Electron environment.');
    } else {
      this.logger.info('⚡', 'ElectronApiService initialized - Using Electron IPC mode');
    }
  }

  /**
   * Check if running in Electron
   */
  private isElectronAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof (window as any).electronAPI !== 'undefined' &&
           (typeof (window as any).electronAPI.products !== 'undefined' ||
            typeof (window as any).electronAPI.cart !== 'undefined');
  }

  /**
   * Get all products via Electron IPC
   */
  getAllProducts(): Observable<Product[]> {
    this.logger.log('⚡ [ELECTRON IPC]', 'Fetching all products via IPC channel');
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.products.getAll() as Promise<Product[]>).pipe(
      catchError(this.handleError<Product[]>)
    );
  }

  /**
   * Get a single product by ID via Electron IPC
   * @param id Product ID
   */
  getProductById(id: number): Observable<Product> {
    this.logger.log('⚡ [ELECTRON IPC]', `Fetching product ${id} via IPC channel`);
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.products.getById(id) as Promise<Product>).pipe(
      catchError(this.handleError<Product>)
    );
  }

  /**
   * Get all product categories via Electron IPC
   */
  getCategories(): Observable<string[]> {
    this.logger.log('⚡ [ELECTRON IPC]', 'Fetching categories via IPC channel');
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.products.getCategories() as Promise<string[]>).pipe(
      catchError(this.handleError<string[]>)
    );
  }

  /**
   * Get products by category via Electron IPC
   * @param category Category name
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    this.logger.log('⚡ [ELECTRON IPC]', `Fetching products in category '${category}' via IPC channel`);
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.products.getByCategory(category) as Promise<Product[]>).pipe(
      catchError(this.handleError<Product[]>)
    );
  }

  /**
   * Save cart data via Electron IPC
   */
  saveCart(cart: Cart): Observable<boolean> {
    this.logger.log('⚡ [ELECTRON IPC]', 'Saving cart via IPC channel');
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.cart.save(cart) as Promise<boolean>).pipe(
      catchError(this.handleError<boolean>)
    );
  }

  /**
   * Load cart data via Electron IPC
   */
  loadCart(): Observable<Cart | null> {
    this.logger.log('⚡ [ELECTRON IPC]', 'Loading cart via IPC channel');
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.cart.load() as Promise<Cart | null>).pipe(
      catchError(this.handleError<Cart | null>)
    );
  }

  /**
   * Submit order via Electron IPC
   */
  submitOrder(orderRequest: OrderRequest): Observable<Order> {
    this.logger.log('⚡ [ELECTRON IPC]', 'Submitting order via IPC channel');
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.cart.submitOrder(orderRequest) as Promise<Order>).pipe(
      catchError(this.handleError<Order>)
    );
  }

  /**
   * Get order by ID via Electron IPC
   */
  getOrder(orderId: string): Observable<Order> {
    this.logger.log('⚡ [ELECTRON IPC]', `Getting order ${orderId} via IPC channel`);
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.cart.getOrder(orderId) as Promise<Order>).pipe(
      catchError(this.handleError<Order>)
    );
  }

  /**
   * Get all orders via Electron IPC
   */
  getOrders(): Observable<Order[]> {
    this.logger.log('⚡ [ELECTRON IPC]', 'Getting all orders via IPC channel');
    if (!this.isElectronAvailable()) {
      return throwError(() => new Error('Electron API not available'));
    }

    return from((window as any).electronAPI.cart.getOrders() as Promise<Order[]>).pipe(
      catchError(this.handleError<Order[]>)
    );
  }

  /**
   * Handle errors from Electron IPC
   */
  private handleError<T>(error: any): Observable<T> {
    const errorMessage = error?.message || 'Electron IPC communication error';
    this.logger.error('⚡ [ELECTRON IPC]', 'Error:', errorMessage, error);
    console.error('ElectronApiService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
