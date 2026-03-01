// ⚠️  Bu servis DataService ile BİRLEŞTİRİLDİ.
//     Eğer product-detail gibi componentler bu servisi import ediyorsa
//     DataService'e geçin: import { DataService } from './data.service';
//
//     Eski kodlarla uyumluluk için delegate pattern ile bırakılmıştır.

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private dataService = inject(DataService);

  getProducts(params: string = ''): Observable<any> {
    return this.dataService.getProducts(params);
  }

  getProductById(id: number): Observable<any> {
    return this.dataService.getProductById(id);
  }

  addProduct(productData: any): Observable<any> {
    return this.dataService.addProduct(productData);
  }

  updateProduct(productId: number, productData: any): Observable<any> {
    return this.dataService.updateProduct(productId, productData);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.dataService.deleteProduct(productId);
  }
}