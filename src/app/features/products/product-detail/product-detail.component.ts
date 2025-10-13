import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { ProductService } from '../../../core/services/product.service';
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
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productId: number = 0;

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
   * Add to cart (placeholder for future implementation)
   */
  addToCart(): void {
    console.log('Add to cart:', this.productService.selectedProduct());
    // TODO: Implement cart functionality
  }
}
