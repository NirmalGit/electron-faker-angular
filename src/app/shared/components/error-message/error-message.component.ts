import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="error-card">
      <mat-card-content>
        <div class="error-content">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          @if (showRetry) {
            <button mat-raised-button color="primary" (click)="onRetry()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .error-card {
      margin: 1rem;
      background-color: #ffebee;
    }

    .error-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem;
    }

    .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d32f2f;
      margin-bottom: 1rem;
    }

    h3 {
      margin: 0.5rem 0;
      color: #c62828;
    }

    p {
      color: #b71c1c;
      margin-bottom: 1rem;
    }

    button {
      margin-top: 0.5rem;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() title: string = 'Error';
  @Input() message: string = 'An error occurred';
  @Input() showRetry: boolean = true;
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
