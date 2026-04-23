import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
import { StorageService } from '../services/storage.service';

export const loadingInterceptor: HttpInterceptorFn = (_req, next) => {
  const loading = inject(LoadingService);
  loading.show();
  return next(_req).pipe(finalize(() => loading.hide()));
};

export const httpErrorInterceptor: HttpInterceptorFn = (_req, next) => {
  const toastr = inject(NotificationService);
  const router = inject(Router);
  const storage = inject(StorageService);

  return next(_req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          storage.removeItem('authToken');
          storage.removeItem('LoggedInUser');
          storage.removeItem('UserRole');
          storage.removeItem('TokenExpiry');
          router.navigate(['/login']);
          toastr.warning('Your session has expired. Please sign in again.', 'Unauthorized');
          break;
        case 403:
          toastr.error('You do not have permission to perform this action.', 'Access Denied');
          break;
        case 422:
          toastr.warning(
            err.error?.message || 'Validation failed. Please check your inputs.',
            'Business Rule'
          );
          break;
        case 429:
          toastr.warning('Too many requests. Please wait a moment.', 'Rate Limited');
          break;
        case 0:
          toastr.error('Cannot reach the server. Check your connection or restart the API.', 'Network Error');
          break;
        default:
          if (err.status >= 500) {
            toastr.error(
              'A server error occurred. Please try again later.',
              `Server Error (${err.status})`
            );
          }
      }

      return throwError(() => err);
    })
  );
};
