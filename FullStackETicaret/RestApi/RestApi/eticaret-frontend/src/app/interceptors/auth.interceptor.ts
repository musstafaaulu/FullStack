import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token   = localStorage.getItem('nexus_token');
    const userStr = localStorage.getItem('currentUser');

    // CompanyId öncelik sırası:
    // 1. Giriş yapmış kullanıcının companyId'si (JWT'den)
    // 2. environment.companyId (anonim kullanıcılar için — ürün listesi, home sayfası)
    let companyId: number = environment.companyId;
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed?.companyId && parsed.companyId > 0) {
          companyId = parsed.companyId;
        }
      } catch {}
    }

    const headersToSet: { [key: string]: string } = {};

    if (token) {
      headersToSet['Authorization'] = `Bearer ${token}`;
    }

    if (companyId > 0) {
      headersToSet['X-Company-Id'] = companyId.toString();
    }

    const cloned = Object.keys(headersToSet).length > 0
      ? req.clone({ setHeaders: headersToSet })
      : req;

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login']);
        }
        if (error.status === 403) {
          this.router.navigate(['/home']);
        }
        return throwError(() => error);
      })
    );
  }
}