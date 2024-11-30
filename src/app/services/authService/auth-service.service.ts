import { Injectable } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { of, throwError } from 'rxjs';
import { errorContext } from 'rxjs/internal/util/errorContext';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  login(credentials: any) {
    // Mock login request (replace with actual HTTP request)
    if (credentials.User != 'sandeep') {
      return throwError(() => ('Invalid user'));
    }
    if (credentials.password != '12345678') {
      return throwError(() => ('Invalid password'));
    }
    return of({ token: credentials.User + credentials.password }); // Replace with actual API call
  }
  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login'])
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken'); // Check if the token exists in localStorage
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }
}
