import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

/**
 * HttpserviceService — low-level HTTP adapter wrapping Angular HttpClient.
 * Handles base URL construction and Authorization header injection.
 * All domain-level HTTP calls should go through ImsApiService, not this service directly.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  /** API base URL sourced from environment configuration. */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Constructs a full API URL from a relative path.
   * Handles absolute URLs, missing paths, and trailing/leading slash normalization.
   */
  private buildUrl(url: string): string {
    if (!url) {
      return this.apiUrl;
    }
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    const normalizedBase = this.apiUrl.replace(/\/$/, '');
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  /** Builds Authorization header using the stored JWT token via StorageService. */
  private getAuthHeaders(): Record<string, string> {
    const token = this.storage.getItem<string>('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /** Performs an HTTP GET request with optional query parameters. */
  public get<T>(url: string, queryParams?: HttpParams): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err: HttpErrorResponse) => this.errorHandler(err)));
  }

  /** Performs an HTTP POST request with a typed request body. */
  public post<T>(url: string, data: unknown, queryParams?: HttpParams): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), data, {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err: HttpErrorResponse) => this.errorHandler(err)));
  }

  /** Performs an HTTP PATCH request with a typed request body. */
  public patch<T>(url: string, data: unknown, queryParams?: HttpParams): Observable<T> {
    return this.http.patch<T>(this.buildUrl(url), data, {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err: HttpErrorResponse) => this.errorHandler(err)));
  }

  /** Performs an HTTP PUT request with a typed request body. */
  public put<T>(url: string, data: unknown): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err: HttpErrorResponse) => this.errorHandler(err)));
  }

  /** Performs an HTTP DELETE request with optional query parameters. */
  public delete<T>(url: string, queryParams?: HttpParams): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url), {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err: HttpErrorResponse) => this.errorHandler(err)));
  }

  /** Re-throws the HTTP error for upstream interceptors and subscribers to handle. */
  private errorHandler(err: HttpErrorResponse): Observable<never> {
    return throwError(() => err);
  }
}
