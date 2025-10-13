import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Login Component - Handles user authentication
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form #loginForm="ngForm" (ngSubmit)="onLogin()">
            <!-- Username Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                type="text"
                [(ngModel)]="username"
                name="username"
                required
                [disabled]="loading()"
                placeholder="Enter your username">
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <!-- Password Field -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                [(ngModel)]="password"
                name="password"
                required
                [disabled]="loading()"
                placeholder="Enter your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePasswordVisibility()"
                [disabled]="loading()">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Login Button -->
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-button"
              [disabled]="!loginForm.valid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Logging in...</span>
              } @else {
                <span>Login</span>
              }
            </button>
          </form>

          <!-- Demo Mode Button -->
          <button
            mat-stroked-button
            type="button"
            class="full-width demo-button"
            (click)="onDemoLogin()"
            [disabled]="loading()">
            <mat-icon>science</mat-icon>
            Demo Mode (No Auth Required)
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
    }

    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
    }

    mat-card-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 1rem;
    }

    .login-button {
      height: 48px;
      font-size: 1rem;
      margin-top: 1rem;
    }

    .demo-button {
      margin-top: 1rem;
      border-color: rgba(0, 0, 0, 0.12);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f44336;
      background-color: #ffebee;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 0.5rem;
    }

    button[disabled] {
      opacity: 0.6;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Handle form submission
   */
  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Please enter username and password');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.loading.set(false);
          console.log('Login successful');
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.message || 'Login failed');
          console.error('Login error:', error);
        }
      });
  }

  /**
   * Handle demo login (for testing without backend)
   */
  onDemoLogin(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Use mock login for demo
    this.authService.mockLogin('demo_user');
    
    setTimeout(() => {
      this.loading.set(false);
      console.log('Demo login successful');
      this.router.navigate(['/']);
    }, 1000);
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }
}
