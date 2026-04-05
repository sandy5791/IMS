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

  private readonly apiUrl = '';

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

  public get(url: string, queryParams?: HttpParams): Observable<any> {
    return this.http.get(this.buildUrl(url), { params: queryParams }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public post(url: string, data: any, queryParams?: HttpParams): Observable<any> {
    return this.http.post(this.buildUrl(url), data, { params: queryParams }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public patch(url: string, data: any, queryParams?: HttpParams): Observable<any> {
    return this.http.patch(this.buildUrl(url), data, { params: queryParams }).pipe(catchError((err) => this.errorHandler(err)));
  }

  public put(url: string, data: any): Observable<any> {
    return this.http.put(this.buildUrl(url), data).pipe(catchError((err) => this.errorHandler(err)));
  }

  public delete(url: string, queryParams?: HttpParams): Observable<any> {
    return this.http.delete(this.buildUrl(url), { params: queryParams }).pipe(catchError((err) => this.errorHandler(err)));
  }

  private errorHandler(err: HttpErrorResponse): Observable<never> {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 && err.statusText === 'Unauthorized') {
        this.storage.removeItem('authToken');
        this.storage.removeItem('LoggedInUser');
        this.router.navigate(['/login']);
      }
    }
    return throwError(() => err);
  }
}
