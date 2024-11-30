import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {

  constructor(private http: HttpClient) { }
  private apiUrl: string = '';

  public get(url: string, queryParams?: HttpParams) {
    return this.http.get(this.apiUrl, { params: queryParams }).pipe(catchError(this.errorHandler));

  }
  public post(url: string, data: any, queryParams?: HttpParams) {
    return this.http.post(this.apiUrl, data, { params: queryParams }).pipe(catchError(this.errorHandler));
  }
  public patch(url: string, data: any, queryParams?: HttpParams) {
    this.apiUrl = this.apiUrl + url;
    return this.http.patch(this.apiUrl, data, { params: queryParams }).pipe(catchError(this.errorHandler));
  }
  public put(url: string, data: any) {
    return this.http.put(url, data);
  }

  public delete(url: string, queryParams?: HttpParams) {
    this.apiUrl = this.apiUrl + url;
    return this.http.delete(this.apiUrl, { params: queryParams });
  }

  errorHandler(err: HttpErrorResponse) {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 && err.statusText == "Unauthorized") {
      }
    }
    return throwError(() => err);
  }
}
