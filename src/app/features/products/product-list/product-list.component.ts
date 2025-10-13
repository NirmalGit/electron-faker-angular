import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = 'all';
  filteredProducts: Product[] = [];

  constructor(public productService: ProductService) {}

  ngOnInit(): void {
    this.productService.loadProducts();
    this.productService.loadCategories();
    this.updateFilteredProducts();
  }

  /**
   * Update filtered products based on search and category
   */
  updateFilteredProducts(): void {
    let products = this.productService.products();

    // Filter by search term
    if (this.searchTerm.trim()) {
      products = this.productService.filterProducts(this.searchTerm);
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      products = products.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = products;
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.updateFilteredProducts();
  }

  /**
   * Handle category selection
   */
  onCategoryChange(): void {
    if (this.selectedCategory === 'all') {
      this.productService.loadProducts();
    } else {
      this.productService.loadProductsByCategory(this.selectedCategory);
    }
    this.updateFilteredProducts();
  }

  /**
   * Retry loading products
   */
  onRetry(): void {
    this.productService.clearError();
    this.productService.loadProducts();
  }
}
