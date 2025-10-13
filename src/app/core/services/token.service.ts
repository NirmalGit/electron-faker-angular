import { Injectable, signal } from '@angular/core';

/**
 * TokenService - Manages JWT tokens and refresh tokens
 * Stores tokens in localStorage for persistence across sessions
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  // Signal to track authentication state
  isAuthenticated = signal<boolean>(this.hasValidToken());

  constructor() {
    // Check token validity on service initialization
    this.checkTokenExpiry();
  }

  /**
   * Store access token and refresh token
   * @param accessToken JWT access token
   * @param refreshToken JWT refresh token
   * @param expiresIn Token expiration time in seconds
   */
  setTokens(accessToken: string, refreshToken: string, expiresIn?: number): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }

    this.isAuthenticated.set(true);
  }

  /**
   * Get the current access token
   * @returns Access token or null if not available
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get the refresh token
   * @returns Refresh token or null if not available
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if token is expired
   * @returns true if token is expired or about to expire
   */
  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) {
      return false; // No expiry set, assume valid
    }

    // Add 30 second buffer before actual expiry
    const bufferTime = 30 * 1000;
    return Date.now() >= (parseInt(expiryTime) - bufferTime);
  }

  /**
   * Check if user has a valid token
   * @returns true if valid token exists
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired();
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.isAuthenticated.set(false);
  }

  /**
   * Check token expiry periodically
   */
  private checkTokenExpiry(): void {
    // Check every minute
    setInterval(() => {
      if (this.isTokenExpired()) {
        this.isAuthenticated.set(false);
      }
    }, 60000);
  }

  /**
   * Decode JWT token to get payload (without verification)
   * @param token JWT token string
   * @returns Decoded payload object
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user information from token
   * @returns User info object or null
   */
  getUserInfo(): any {
    const token = this.getAccessToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    return payload;
  }
}
