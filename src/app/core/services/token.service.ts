import { Injectable, signal } from '@angular/core';

/**
 * TokenService - Manages authentication state
 * 
 * SECURITY NOTE: Tokens are stored in HttpOnly cookies (managed by backend)
 * - HttpOnly cookies cannot be accessed by JavaScript (XSS protection)
 * - Secure flag ensures cookies only sent over HTTPS
 * - SameSite flag prevents CSRF attacks
 * 
 * This service only manages authentication state, not token storage.
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Signal to track authentication state
  // This is set to true after successful login, false after logout
  isAuthenticated = signal<boolean>(false);
  
  // Store user info in memory only (not sensitive token data)
  private userInfo: any = null;

  constructor() {
    // Check if user has valid session on initialization
    // This will be verified by making a request to the backend
    this.checkAuthStatus();
  }

  /**
   * Set authentication state to true
   * Called after successful login
   */
  setAuthenticated(authenticated: boolean): void {
    this.isAuthenticated.set(authenticated);
  }

  /**
   * Store user information in memory (NOT in localStorage)
   * @param user User information from decoded token (done by backend)
   */
  setUserInfo(user: any): void {
    this.userInfo = user;
    this.isAuthenticated.set(true);
  }

  /**
   * Get user information from memory
   * @returns User info object or null
   */
  getUserInfo(): any {
    return this.userInfo;
  }

  /**
   * Check if user has a valid authentication session
   * This should be verified by making a request to the backend
   * @returns true if authenticated
   */
  hasValidToken(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Clear authentication state (logout)
   * HttpOnly cookies will be cleared by backend on logout endpoint
   */
  clearAuthState(): void {
    this.userInfo = null;
    this.isAuthenticated.set(false);
  }

  /**
   * Check authentication status by making a request to backend
   * Backend will verify the HttpOnly cookie
   */
  private checkAuthStatus(): void {
    // This will be implemented by making a request to /auth/me endpoint
    // If the request succeeds, user is authenticated
    // If it fails with 401, user is not authenticated
    // The actual implementation is in AuthService
  }
}
