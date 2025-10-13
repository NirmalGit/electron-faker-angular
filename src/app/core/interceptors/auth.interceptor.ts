import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, tap } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

/**
 * AuthInterceptor - Intercepts HTTP requests and responses
 * 
 * Handles:
 * 1. Adding JWT token to outgoing requests
 * 2. 401 errors - Automatic token refresh and retry
 * 3. 400 errors - Bad request handling
 * 4. 403 errors - Forbidden access
 * 5. 500 errors - Server errors
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  // Requests that should not include auth token
  private readonly EXCLUDED_URLS = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    'fakestoreapi.com' // External API that doesn't need our JWT
  ];

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  /**
   * Intercept HTTP requests
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to request if available and not excluded
    if (this.shouldAddToken(request)) {
      request = this.addAuthToken(request);
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      tap(event => {
        // Log successful responses (optional)
        if (event instanceof HttpResponse) {
          this.logResponse(request, event);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(request, next, error);
      })
    );
  }

  /**
   * Add JWT token to request headers
   * @param request HTTP request
   * @returns Cloned request with auth header
   */
  private addAuthToken(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenService.getAccessToken();

    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return request;
  }

  /**
   * Check if request should include auth token
   * @param request HTTP request
   * @returns true if token should be added
   */
  private shouldAddToken(request: HttpRequest<any>): boolean {
    // Don't add token to excluded URLs
    return !this.EXCLUDED_URLS.some(url => request.url.includes(url));
  }

  /**
   * Handle HTTP errors
   * @param request Original HTTP request
   * @param next HTTP handler
   * @param error HTTP error response
   * @returns Observable of error or retry
   */
  private handleError(
    request: HttpRequest<any>,
    next: HttpHandler,
    error: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    console.error(`HTTP Error ${error.status}:`, error.message);

    switch (error.status) {
      case 400:
        return this.handle400Error(error);
      
      case 401:
        return this.handle401Error(request, next, error);
      
      case 403:
        return this.handle403Error(error);
      
      case 404:
        return this.handle404Error(error);
      
      case 500:
      case 502:
      case 503:
        return this.handle5xxError(error);
      
      default:
        return this.handleUnknownError(error);
    }
  }

  /**
   * Handle 400 Bad Request errors
   */
  private handle400Error(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Bad Request: Invalid data provided';

    // Extract detailed error message from response
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.errors) {
        // Handle validation errors
        const validationErrors = this.extractValidationErrors(error.error.errors);
        errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
      }
    }

    console.error('400 Bad Request:', errorMessage);
    this.showErrorNotification('Bad Request', errorMessage);

    return throwError(() => ({
      status: 400,
      message: errorMessage,
      errors: error.error?.errors || []
    }));
  }

  /**
   * Handle 401 Unauthorized errors - Attempt token refresh
   */
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
    error: HttpErrorResponse
  ): Observable<HttpEvent<any>> {
    // Don't retry auth endpoints
    if (request.url.includes('/auth/')) {
      console.error('401 Unauthorized on auth endpoint');
      this.authService.logout();
      return throwError(() => error);
    }

    // If not already refreshing, start refresh process
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      console.log('Token expired, attempting refresh...');

      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.access_token);
          
          console.log('Token refreshed successfully, retrying request');
          
          // Retry the original request with new token
          return next.handle(this.addAuthToken(request));
        }),
        catchError(refreshError => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          
          console.error('Token refresh failed, logging out');
          this.authService.logout();
          
          this.showErrorNotification('Session Expired', 'Please log in again');
          
          return throwError(() => refreshError);
        })
      );
    } else {
      // Wait for token refresh to complete, then retry
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          console.log('Using refreshed token for queued request');
          return next.handle(this.addAuthToken(request));
        })
      );
    }
  }

  /**
   * Handle 403 Forbidden errors
   */
  private handle403Error(error: HttpErrorResponse): Observable<never> {
    const errorMessage = 'Access Forbidden: You do not have permission to access this resource';
    
    console.error('403 Forbidden:', errorMessage);
    this.showErrorNotification('Access Denied', errorMessage);

    return throwError(() => ({
      status: 403,
      message: errorMessage
    }));
  }

  /**
   * Handle 404 Not Found errors
   */
  private handle404Error(error: HttpErrorResponse): Observable<never> {
    const errorMessage = 'Resource not found';
    
    console.error('404 Not Found:', error.url);
    this.showErrorNotification('Not Found', errorMessage);

    return throwError(() => ({
      status: 404,
      message: errorMessage,
      url: error.url
    }));
  }

  /**
   * Handle 5xx Server errors
   */
  private handle5xxError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Server error occurred. Please try again later.';

    if (error.status === 502) {
      errorMessage = 'Bad Gateway: Server is temporarily unavailable';
    } else if (error.status === 503) {
      errorMessage = 'Service Unavailable: Server is under maintenance';
    }

    console.error(`${error.status} Server Error:`, errorMessage);
    this.showErrorNotification('Server Error', errorMessage);

    return throwError(() => ({
      status: error.status,
      message: errorMessage
    }));
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Network Error: ${error.error.message}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Unknown Error:', errorMessage, error);
    this.showErrorNotification('Error', errorMessage);

    return throwError(() => ({
      status: error.status || 0,
      message: errorMessage
    }));
  }

  /**
   * Extract validation errors from error response
   * @param errors Errors object
   * @returns Array of error messages
   */
  private extractValidationErrors(errors: any): string[] {
    const messages: string[] = [];

    if (typeof errors === 'object') {
      Object.keys(errors).forEach(key => {
        const error = errors[key];
        if (Array.isArray(error)) {
          messages.push(...error);
        } else if (typeof error === 'string') {
          messages.push(error);
        }
      });
    }

    return messages;
  }

  /**
   * Show error notification to user
   * You can integrate with your notification service here
   * @param title Error title
   * @param message Error message
   */
  private showErrorNotification(title: string, message: string): void {
    // TODO: Integrate with your notification service
    // For now, just log to console
    console.warn(`[${title}] ${message}`);
    
    // Example: If using Angular Material Snackbar
    // this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  /**
   * Log successful responses (optional, for debugging)
   * @param request HTTP request
   * @param response HTTP response
   */
  private logResponse(request: HttpRequest<any>, response: HttpResponse<any>): void {
    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${request.method} ${request.url} - ${response.status}`);
    }
  }
}
