
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private storage: StorageService) { }

  login(credentials: any): Observable<any> {
    // Standardizing credential keys to lowercase for SonarQube/consistency
    const username = credentials.username || credentials.User;
    const password = credentials.password;

    if (username !== 'sandeep') {
      return throwError(() => ('Invalid username'));
    }
    if (password !== '12345678') {
      return throwError(() => ('Invalid password'));
    }
    return of({ token: username + password });
  }

  logout(): void {
    this.storage.removeItem('authToken');
    this.storage.removeItem('LoggedInUser');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem('authToken');
  }

  setAuthToken(token: string): void {
    this.storage.setItem('authToken', token);
  }
}
