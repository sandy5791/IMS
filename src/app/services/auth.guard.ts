import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './authService/auth-service.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authser = inject(AuthService)
  const router = inject(Router);
  const toastmsg = inject(ToastrService)
  console.log('Auth Guard Triggered');
  console.log('Authenticated:');
  if (authser.isAuthenticated())
  {
    return true; // Allow access if the user is authenticated
  } else {
    // Redirect to the login page if the user is not authenticated
    toastmsg.error('Invalid token')
    router.navigate(['/login']);
    return false; // Deny access
  }
};
