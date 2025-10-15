import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/interfaces/product.interface';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Inject services
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    // Load products and categories on component initialization
    this.productService.loadProducts();
    this.productService.loadCategories();
  }

  /**
   * Retry loading products on error
   */
  onRetry(): void {
    this.productService.clearError();
    this.productService.loadProducts();
  }

  /**
   * Filter products by category
   */
  filterByCategory(category: string): void {
    this.productService.loadProductsByCategory(category);
  }

  /**
   * Load all products
   */
  loadAllProducts(): void {
    this.productService.loadProducts();
  }

  /**
   * Truncate text for display
   */
  truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product): void {
    console.log('🛒 Dashboard addToCart called with product:', product);
    this.cartService.addToCart(product);
    console.log('🛒 After adding to cart, cart summary:', this.cartService.cartSummary());
    this.snackBar.open(`${product.title} added to cart!`, 'View Cart', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    }).onAction().subscribe(() => {
      // Navigate to cart when user clicks "View Cart"
      this.router.navigate(['/cart']);
    });
  }
}
