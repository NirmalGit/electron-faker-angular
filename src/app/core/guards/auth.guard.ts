import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Auth Guard - Protects routes that require authentication
 * 
 * Usage in routes:
 * {
 *   path: 'dashboard',
 *   component: DashboardComponent,
 *   canActivate: [authGuard]
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.hasValidToken()) {
    return true;
  }

  // Redirect to login with return URL
  console.warn('Access denied - redirecting to login');
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

/**
 * Guest Guard - Prevents authenticated users from accessing auth pages
 * 
 * Usage in routes:
 * {
 *   path: 'login',
 *   component: LoginComponent,
 *   canActivate: [guestGuard]
 * }
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (!tokenService.hasValidToken()) {
    return true;
  }

  // Already authenticated, redirect to dashboard
  console.log('Already authenticated - redirecting to dashboard');
  return router.createUrlTree(['/']);
};
