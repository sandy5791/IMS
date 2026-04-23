import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from '../utilities/custom-snackbar/custom-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private config: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    panelClass: ['glass-snackbar-panel']
  };

  success(message: string, title?: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      ...this.config,
      data: { message, title, type: 'success' }
    });
  }

  error(message: string, title?: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      ...this.config,
      data: { message, title, type: 'error' }
    });
  }

  warning(message: string, title?: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      ...this.config,
      data: { message, title, type: 'warning' }
    });
  }

  info(message: string, title?: string): void {
    this.snackBar.openFromComponent(CustomSnackbarComponent, {
      ...this.config,
      data: { message, title, type: 'info' }
    });
  }
}
