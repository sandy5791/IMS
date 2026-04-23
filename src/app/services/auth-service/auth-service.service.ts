import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { StorageService } from '../storage.service';
import { HttpserviceService } from '../httpservice.service';
import { ApiResponse } from '../ims-api.service';

/** Credentials payload for the login endpoint. */
export interface LoginRequest {
  username: string;
  password: string;
}

/** JWT login response containing token and user metadata. */
export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string;
}

/** Storage key constants to avoid magic strings across the codebase. */
const AUTH_KEYS = {
  TOKEN:   'authToken',
  USER:    'LoggedInUser',
  ROLE:    'UserRole',
  EXPIRY:  'TokenExpiry'
} as const;

/**
 * AuthService — centralized authentication and session management.
 * Handles login, logout, token storage, and authentication state checks.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly http = inject(HttpserviceService);

  /**
   * Authenticates a user with the backend API.
   * On success, stores the JWT token and user metadata in localStorage via StorageService.
   * @param credentials - The login username and password.
   * @returns Observable of the typed API response.
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>('/auth/login', credentials).pipe(
      tap((response: ApiResponse<LoginResponse>) => {
        if (response?.success && response?.data?.token) {
          this.storage.setItem(AUTH_KEYS.TOKEN, response.data.token);
          this.storage.setItem(AUTH_KEYS.USER, response.data.username);
          this.storage.setItem(AUTH_KEYS.ROLE, response.data.role);
          this.storage.setItem(AUTH_KEYS.EXPIRY, response.data.expiresAt);
        }
      }),
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Logs the user out by clearing all auth-related storage keys
   * and navigating to the login page.
   */
  logout(): void {
    this.storage.removeItem(AUTH_KEYS.TOKEN);
    this.storage.removeItem(AUTH_KEYS.USER);
    this.storage.removeItem(AUTH_KEYS.ROLE);
    this.storage.removeItem(AUTH_KEYS.EXPIRY);
    this.router.navigate(['/login']);
  }

  /**
   * Checks whether the current user has a valid, non-expired authentication token.
   * Automatically logs out if the token has expired.
   * @returns True if the user is authenticated with a valid token.
   */
  isAuthenticated(): boolean {
    const token = this.storage.getItem<string>(AUTH_KEYS.TOKEN);
    if (!token) return false;

    // Check token expiry from stored value
    const expiry = this.storage.getItem<string>(AUTH_KEYS.EXPIRY);
    if (expiry && new Date(expiry) < new Date()) {
      this.logout();
      return false;
    }
    return true;
  }

  /** Stores a JWT token. Used for programmatic token refresh scenarios. */
  setAuthToken(token: string): void {
    this.storage.setItem(AUTH_KEYS.TOKEN, token);
  }

  /** Returns the currently logged-in user's display name, or 'Unknown' as fallback. */
  getLoggedInUser(): string {
    return this.storage.getItem<string>(AUTH_KEYS.USER) ?? 'Unknown';
  }

  /** Returns the currently logged-in user's role, or 'User' as fallback. */
  getUserRole(): string {
    return this.storage.getItem<string>(AUTH_KEYS.ROLE) ?? 'User';
  }
}
