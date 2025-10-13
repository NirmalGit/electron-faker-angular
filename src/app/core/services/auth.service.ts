import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';

/**
 * Authentication request/response interfaces
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: any;  // User information (no tokens in response!)
  message?: string;
}

/**
 * AuthService - Handles authentication operations with HttpOnly cookies
 * 
 * SECURITY: Tokens are stored in HttpOnly cookies by the backend
 * - Cookies are automatically sent with each request by the browser
 * - No manual token management in frontend
 * - Protected from XSS attacks
 * - Backend sets: HttpOnly, Secure, SameSite flags
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Your backend API URL - update this to your actual backend
  private readonly AUTH_API_URL = 'https://your-backend-api.com/auth';

  // Signal for current user state
  currentUser = signal<any>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Check if user is authenticated on initialization
    this.checkAuthStatus();
  }

  /**
   * Login with username and password
   * Backend will set HttpOnly cookie in response
   * @param credentials Login credentials
   * @returns Observable of auth response
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.AUTH_API_URL}/login`, 
      credentials,
      { withCredentials: true }  // Important: Send cookies
    ).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(this.handleAuthError)
    );
  }

  /**
   * Refresh the access token using refresh token cookie
   * Backend will set new HttpOnly cookie in response
   * @returns Observable of auth response
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.AUTH_API_URL}/refresh`,
      {},
      { withCredentials: true }  // Important: Send cookies
    ).pipe(
      tap(response => {
        console.log('Token refreshed successfully');
        if (response.user) {
          this.handleAuthResponse(response);
        }
      }),
      catchError(error => {
        console.error('Token refresh failed');
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user and clear cookies
   * Backend will clear HttpOnly cookies
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.AUTH_API_URL}/logout`,
      {},
      { withCredentials: true }  // Important: Send cookies
    ).pipe(
      tap(() => {
        this.tokenService.clearAuthState();
        this.currentUser.set(null);
        console.log('Logged out successfully');
      }),
      catchError(error => {
        // Even if logout fails, clear local state
        this.tokenService.clearAuthState();
        this.currentUser.set(null);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check authentication status by calling /me endpoint
   * If successful, user is authenticated (cookie is valid)
   */
  checkAuthStatus(): void {
    this.http.get<{ user: any }>(
      `${this.AUTH_API_URL}/me`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        if (response.user) {
          this.tokenService.setUserInfo(response.user);
          this.currentUser.set(response.user);
        }
      },
      error: () => {
        // Not authenticated or session expired
        this.tokenService.setAuthenticated(false);
      }
    });
  }

  /**
   * Check if user is authenticated
   * @returns true if user has valid session
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasValidToken();
  }

  /**
   * Handle successful authentication response
   * @param response Auth response from server
   */
  private handleAuthResponse(response: AuthResponse): void {
    if (response.user) {
      this.tokenService.setUserInfo(response.user);
      this.currentUser.set(response.user);
    }
  }

  /**
   * Handle authentication errors
   * @param error HTTP error response
   * @returns Observable error
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Authentication failed';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid credentials provided';
          break;
        case 401:
          errorMessage = 'Invalid username or password';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }

    console.error('Authentication error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Mock login for development/testing
   * In real implementation, this won't work with HttpOnly cookies
   * You need a real backend that sets the cookies
   */
  mockLogin(username: string): void {
    console.warn('Mock login only sets local state. Real HttpOnly cookies need backend.');
    const mockUser = {
      id: 1,
      username: username,
      email: `${username}@example.com`,
      role: 'user'
    };
    this.tokenService.setUserInfo(mockUser);
    this.currentUser.set(mockUser);
  }
}
