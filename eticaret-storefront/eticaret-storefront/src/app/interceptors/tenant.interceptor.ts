import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
// Yol '../../environments/environment' olarak düzeltildi
import { environment } from '../../environments/environment';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Environment dosyasından companyId değerini alıyoruz
    const companyId = environment.companyId.toString();

    // Orijinal isteği klonlayıp içine X-Company-Id header'ını ekliyoruz
    const tenantReq = request.clone({
      headers: request.headers.set('X-Company-Id', companyId)
    });

    // İsteği bir sonraki adıma (diğer interceptor'lara veya backend'e) iletiyoruz
    return next.handle(tenantReq);
  }
}