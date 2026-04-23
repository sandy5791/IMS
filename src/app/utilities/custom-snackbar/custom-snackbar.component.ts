import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface SnackbarData {
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-snackbar" [ngClass]="data.type">
      <div class="snackbar-icon">
        <i class="fas" [ngClass]="{
          'fa-check-circle': data.type === 'success',
          'fa-exclamation-circle': data.type === 'error',
          'fa-exclamation-triangle': data.type === 'warning',
          'fa-info-circle': data.type === 'info'
        }"></i>
      </div>
      <div class="snackbar-content">
        <h4 *ngIf="data.title" class="snackbar-title">{{ data.title }}</h4>
        <span class="snackbar-message">{{ data.message }}</span>
      </div>
      <button class="snackbar-close" (click)="snackBarRef.dismiss()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `,
  styleUrls: ['./custom-snackbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomSnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarData,
    public snackBarRef: MatSnackBarRef<CustomSnackbarComponent>
  ) {}
}
