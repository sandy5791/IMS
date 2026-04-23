import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service/auth-service.service';
import { inject } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * authGuard — functional route guard that prevents unauthenticated access.
 * Redirects to /login and shows an error notification if the token is missing or expired.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  if (authService.isAuthenticated()) {
    return true;
  }

  notification.error('Session expired or invalid token. Please sign in.', 'Unauthorized');
  router.navigate(['/login']);
  return false;
};
