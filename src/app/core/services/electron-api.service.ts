import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product } from '../interfaces/product.interface';
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
           typeof (window as any).electronAPI.products !== 'undefined';
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
   * Handle errors from Electron IPC
   */
  private handleError<T>(error: any): Observable<T> {
    const errorMessage = error?.message || 'Electron IPC communication error';
    this.logger.error('⚡ [ELECTRON IPC]', 'Error:', errorMessage, error);
    console.error('ElectronApiService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
