// src/app/core/interceptors/api.interceptor.ts
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const apiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    if (!request.headers.has('Content-Type')) {
      request = request.clone({
        headers: request.headers.set('Content-Type', 'application/json')
      });
    }
  }

  // Handle errors
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            errorMessage = 'Bad Request: Please check your input';
            break;
          case 401:
            errorMessage = 'Unauthorized: Please log in again';
            break;
          case 403:
            errorMessage = 'Forbidden: You do not have permission to access this resource';
            break;
          case 404:
            errorMessage = 'Not Found: The requested resource was not found';
            break;
          case 500:
            errorMessage = 'Server Error: Something went wrong on the server';
            break;
          default:
            errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
            break;
        }
      }

      // Log error for debugging
      console.error('API Error:', errorMessage);
      console.error('Error Details:', error);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};