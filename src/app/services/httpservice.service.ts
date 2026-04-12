import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: StorageService
  ) {}

  // ─── API Base URL (update for production) ──────────────────
  private readonly apiUrl = 'https://localhost:7210/api';

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

  /** Build Authorization header using stored JWT token. */
  private getAuthHeaders(): Record<string, string> {
    const token = this.storage.getItem<string>('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public get<T = any>(url: string, queryParams?: HttpParams): Observable<T> {
    return this.http.get<T>(this.buildUrl(url), {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public post<T = any>(url: string, data: any, queryParams?: HttpParams): Observable<T> {
    return this.http.post<T>(this.buildUrl(url), data, {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public patch<T = any>(url: string, data: any, queryParams?: HttpParams): Observable<T> {
    return this.http.patch<T>(this.buildUrl(url), data, {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public put<T = any>(url: string, data: any): Observable<T> {
    return this.http.put<T>(this.buildUrl(url), data, {
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public delete<T = any>(url: string, queryParams?: HttpParams): Observable<T> {
    return this.http.delete<T>(this.buildUrl(url), {
      params: queryParams,
      headers: this.getAuthHeaders()
    }).pipe(catchError((err) => this.errorHandler(err)));
  }

  private errorHandler(err: HttpErrorResponse): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401) {
        this.storage.removeItem('authToken');
        this.storage.removeItem('LoggedInUser');
        this.router.navigate(['/login']);
      }
    }
    return throwError(() => err);
  }
}
