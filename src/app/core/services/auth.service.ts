import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { TokenService } from './token.service';

/**
 * Authentication request/response interfaces
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * AuthService - Handles authentication operations
 * Login, logout, token refresh, and user management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Your backend API URL - update this to your actual backend
  private readonly AUTH_API_URL = 'https://your-backend-api.com/auth';

  // Signal for current user state
  currentUser = signal<any>(null);

  // BehaviorSubject for token refresh in progress
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Load user info on service initialization
    this.loadUserInfo();
  }

  /**
   * Login with username and password
   * @param credentials Login credentials
   * @returns Observable of auth response
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.AUTH_API_URL}/login`, credentials)
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(this.handleAuthError)
      );
  }

  /**
   * Refresh the access token using refresh token
   * @returns Observable of auth response
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenInProgress) {
      // Wait for the ongoing refresh to complete
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return this.createMockAuthResponse(token);
          }
          return throwError(() => new Error('Token refresh failed'));
        })
      );
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    const request: RefreshTokenRequest = { refresh_token: refreshToken };

    return this.http.post<AuthResponse>(`${this.AUTH_API_URL}/refresh`, request)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(response.access_token);
        }),
        catchError(error => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(null);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    // Optional: Call backend logout endpoint
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.AUTH_API_URL}/logout`, { refresh_token: refreshToken })
        .subscribe({
          next: () => console.log('Logged out from server'),
          error: (error) => console.error('Logout error:', error)
        });
    }

    // Clear local tokens and user info
    this.tokenService.clearTokens();
    this.currentUser.set(null);
  }

  /**
   * Check if user is authenticated
   * @returns true if user has valid token
   */
  isAuthenticated(): boolean {
    return this.tokenService.hasValidToken();
  }

  /**
   * Handle successful authentication response
   * @param response Auth response from server
   */
  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );
    this.loadUserInfo();
  }

  /**
   * Load user information from token
   */
  private loadUserInfo(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.currentUser.set(userInfo);
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
   * Create a mock auth response (for testing purposes)
   * @param token Access token
   * @returns Observable of mock auth response
   */
  private createMockAuthResponse(token: string): Observable<AuthResponse> {
    return new Observable(observer => {
      observer.next({
        access_token: token,
        refresh_token: this.tokenService.getRefreshToken()!,
        expires_in: 3600
      });
      observer.complete();
    });
  }

  /**
   * Mock login for development/testing
   * Remove this in production and use real backend
   */
  mockLogin(username: string): void {
    const mockResponse: AuthResponse = {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
      expires_in: 3600
    };
    this.handleAuthResponse(mockResponse);
  }
}
