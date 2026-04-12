
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from '../storage.service';
import { HttpserviceService } from '../httpservice.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private storage: StorageService,
    private http: HttpserviceService
  ) { }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post('/auth/login', credentials).pipe(
      tap((response: any) => {
        if (response?.success && response?.data?.token) {
          this.storage.setItem('authToken', response.data.token);
          this.storage.setItem('LoggedInUser', response.data.username);
          this.storage.setItem('UserRole', response.data.role);
          this.storage.setItem('TokenExpiry', response.data.expiresAt);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    this.storage.removeItem('authToken');
    this.storage.removeItem('LoggedInUser');
    this.storage.removeItem('UserRole');
    this.storage.removeItem('TokenExpiry');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.storage.getItem<string>('authToken');
    if (!token) return false;

    // Check token expiry from stored value
    const expiry = this.storage.getItem<string>('TokenExpiry');
    if (expiry && new Date(expiry) < new Date()) {
      this.logout();
      return false;
    }
    return true;
  }

  setAuthToken(token: string): void {
    this.storage.setItem('authToken', token);
  }

  getLoggedInUser(): string {
    return this.storage.getItem<string>('LoggedInUser') ?? 'Unknown';
  }

  getUserRole(): string {
    return this.storage.getItem<string>('UserRole') ?? 'User';
  }
}
