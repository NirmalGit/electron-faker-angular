import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productId: number = 0;
  
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get product ID from route parameter
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.productService.loadProductById(this.productId);
      }
    });
  }

  ngOnDestroy(): void {
    // Clear selected product when leaving the component
    this.productService.clearSelectedProduct();
  }

  /**
   * Retry loading the product
   */
  onRetry(): void {
    this.productService.clearError();
    this.productService.loadProductById(this.productId);
  }

  /**
   * Navigate back to products list
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Add product to cart
   */
  addToCart(): void {
    const product = this.productService.selectedProduct();
    if (product) {
      this.cartService.addToCart(product);
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
}
