import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../core/interfaces/cart.interface';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDividerModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  // Table columns for cart items
  displayedColumns: string[] = ['image', 'product', 'price', 'quantity', 'subtotal', 'actions'];

  constructor(private cartService: CartService) {}

  // Cart state from service (accessed as getters to avoid initialization issues)
  get cart() { return this.cartService.cart; }
  get cartSummary() { return this.cartService.cartSummary; }
  get isEmpty() { return this.cartService.isEmpty; }

  /**
   * Update item quantity
   */
  updateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.cartService.clearCart();
  }

  /**
   * Get quantity control value
   */
  getQuantityControlValue(item: CartItem): number {
    return item.quantity;
  }

  /**
   * Handle quantity input change
   */
  onQuantityChange(event: Event, productId: number): void {
    const input = event.target as HTMLInputElement;
    const quantity = parseInt(input.value, 10);
    
    if (quantity >= 1) {
      this.updateQuantity(productId, quantity);
    } else {
      // Reset to current quantity if invalid
      const currentItem = this.cart().items.find(item => item.product.id === productId);
      if (currentItem) {
        input.value = currentItem.quantity.toString();
      }
    }
  }

  /**
   * Increase quantity by 1
   */
  increaseQuantity(productId: number): void {
    const currentItem = this.cart().items.find(item => item.product.id === productId);
    if (currentItem) {
      this.updateQuantity(productId, currentItem.quantity + 1);
    }
  }

  /**
   * Decrease quantity by 1
   */
  decreaseQuantity(productId: number): void {
    const currentItem = this.cart().items.find(item => item.product.id === productId);
    if (currentItem && currentItem.quantity > 1) {
      this.updateQuantity(productId, currentItem.quantity - 1);
    }
  }

  /**
   * Track by function for cart items
   */
  trackByProductId(index: number, item: CartItem): number {
    return item.product.id;
  }
}