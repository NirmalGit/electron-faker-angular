import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { BillingInfo, ShippingInfo, PaymentInfo, OrderRequest } from '../../core/interfaces/cart.interface';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  // Stepper control
  currentStep = signal(0);
  isProcessing = signal(false);
  
  // Forms
  billingForm!: FormGroup;
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  
  // State
  sameAsShipping = signal(false);
  
  constructor(
    private cartService: CartService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Redirect if cart is empty
    if (this.cartService.isEmpty()) {
      this.router.navigate(['/cart']);
      return;
    }

    this.initializeForms();
  }

  // Getters for cart data
  get cart() { return this.cartService.cart; }
  get cartSummary() { return this.cartService.cartSummary; }
  get isEmpty() { return this.cartService.isEmpty; }

  private initializeForms(): void {
    // Billing Information Form
    this.billingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['United States', Validators.required]
    });

    // Shipping Information Form
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
      country: ['United States', Validators.required],
      shippingMethod: ['standard', Validators.required]
    });

    // Payment Information Form
    this.paymentForm = this.fb.group({
      method: ['credit', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', Validators.required],
      paypalEmail: [''],
      cryptoWallet: ['']
    });

    // Watch payment method changes
    this.paymentForm.get('method')?.valueChanges.subscribe(method => {
      this.updatePaymentValidators(method);
    });
  }

  /**
   * Update payment form validators based on selected method
   */
  private updatePaymentValidators(method: string): void {
    const cardNumber = this.paymentForm.get('cardNumber');
    const expiryDate = this.paymentForm.get('expiryDate');
    const cvv = this.paymentForm.get('cvv');
    const cardholderName = this.paymentForm.get('cardholderName');
    const paypalEmail = this.paymentForm.get('paypalEmail');
    const cryptoWallet = this.paymentForm.get('cryptoWallet');

    // Clear all validators first
    [cardNumber, expiryDate, cvv, cardholderName, paypalEmail, cryptoWallet].forEach(control => {
      control?.clearValidators();
      control?.updateValueAndValidity();
    });

    // Set validators based on payment method
    switch (method) {
      case 'credit':
      case 'debit':
        cardNumber?.setValidators([Validators.required, Validators.pattern(/^\d{16}$/)]);
        expiryDate?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
        cvv?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
        cardholderName?.setValidators([Validators.required]);
        break;
      case 'paypal':
        paypalEmail?.setValidators([Validators.required, Validators.email]);
        break;
      case 'crypto':
        cryptoWallet?.setValidators([Validators.required]);
        break;
    }

    // Update validity
    [cardNumber, expiryDate, cvv, cardholderName, paypalEmail, cryptoWallet].forEach(control => {
      control?.updateValueAndValidity();
    });
  }

  /**
   * Copy billing address to shipping
   */
  copyBillingToShipping(): void {
    if (this.sameAsShipping()) {
      const billingValue = this.billingForm.value;
      this.shippingForm.patchValue({
        firstName: billingValue.firstName,
        lastName: billingValue.lastName,
        street: billingValue.street,
        city: billingValue.city,
        state: billingValue.state,
        zipCode: billingValue.zipCode,
        country: billingValue.country
      });
    } else {
      this.shippingForm.reset({
        shippingMethod: 'standard',
        country: 'United States'
      });
    }
  }

  /**
   * Move to next step
   */
  nextStep(): void {
    const current = this.currentStep();
    if (current < 2) {
      this.currentStep.set(current + 1);
    }
  }

  /**
   * Move to previous step
   */
  previousStep(): void {
    const current = this.currentStep();
    if (current > 0) {
      this.currentStep.set(current - 1);
    }
  }

  /**
   * Check if current step form is valid
   */
  isCurrentStepValid(): boolean {
    const step = this.currentStep();
    switch (step) {
      case 0: return this.billingForm.valid;
      case 1: return this.shippingForm.valid;
      case 2: return this.paymentForm.valid;
      default: return false;
    }
  }

  /**
   * Submit the order
   */
  async submitOrder(): Promise<void> {
    if (!this.billingForm.valid || !this.shippingForm.valid || !this.paymentForm.valid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isProcessing.set(true);

    try {
      // Prepare order data
      const billingValue = this.billingForm.value;
      const shippingValue = this.shippingForm.value;
      const paymentValue = this.paymentForm.value;

      const billing: BillingInfo = {
        firstName: billingValue.firstName,
        lastName: billingValue.lastName,
        email: billingValue.email,
        phone: billingValue.phone,
        address: {
          street: billingValue.street,
          city: billingValue.city,
          state: billingValue.state,
          zipCode: billingValue.zipCode,
          country: billingValue.country
        }
      };

      const shipping: ShippingInfo = {
        firstName: shippingValue.firstName,
        lastName: shippingValue.lastName,
        address: {
          street: shippingValue.street,
          city: shippingValue.city,
          state: shippingValue.state,
          zipCode: shippingValue.zipCode,
          country: shippingValue.country
        },
        shippingMethod: shippingValue.shippingMethod
      };

      const payment: PaymentInfo = {
        method: paymentValue.method,
        cardNumber: paymentValue.cardNumber,
        expiryDate: paymentValue.expiryDate,
        cvv: paymentValue.cvv,
        cardholderName: paymentValue.cardholderName,
        paypalEmail: paymentValue.paypalEmail,
        cryptoWallet: paymentValue.cryptoWallet
      };

      const orderRequest: OrderRequest = {
        cart: this.cart(),
        billing,
        shipping,
        payment
      };

      // Submit order
      const order = await this.cartService.createOrder(orderRequest);
      
      this.snackBar.open('Order placed successfully!', 'Close', {
        duration: 5000,
        panelClass: ['success-snackbar']
      });

      // Navigate to order confirmation (or dashboard)
      this.router.navigate(['/dashboard'], { 
        queryParams: { orderId: order.id, orderSuccess: true }
      });

    } catch (error) {
      console.error('Order submission failed:', error);
      this.snackBar.open('Failed to place order. Please try again.', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Get form control error message
   */
  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.hasError('required')) {
      return `${field} is required`;
    }
    if (control?.hasError('email')) {
      return 'Enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return `${field} must be at least ${control.errors?.['minlength']?.requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      switch (field) {
        case 'zipCode': return 'Enter a valid zip code (12345 or 12345-6789)';
        case 'cardNumber': return 'Enter a valid 16-digit card number';
        case 'expiryDate': return 'Enter date in MM/YY format';
        case 'cvv': return 'Enter a valid CVV (3-4 digits)';
        default: return `${field} format is invalid`;
      }
    }
    return '';
  }

  /**
   * Format card number with spaces
   */
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    if (formattedValue.length > 19) {
      formattedValue = formattedValue.substring(0, 19);
    }
    event.target.value = formattedValue;
    this.paymentForm.get('cardNumber')?.setValue(value.replace(/\s/g, ''));
  }

  /**
   * Format expiry date
   */
  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.paymentForm.get('expiryDate')?.setValue(value);
  }
}