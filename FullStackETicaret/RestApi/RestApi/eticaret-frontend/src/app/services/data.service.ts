import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = 'http://localhost:5078/api'; 

  private productsSource = new BehaviorSubject<any[]>([]);
  currentProducts = this.productsSource.asObservable();

  private cartCountSource = new BehaviorSubject<number>(0);
  currentCartCount = this.cartCountSource.asObservable();

  constructor(private http: HttpClient) {
    this.updateCartCountFromStorage();
  }

  // --- AUTH ---
  register(userObj: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Auth/register`, userObj);
  }

  login(credentials: any): Observable<any> {
  // Sadece isteği gönder, kaydetme işini component yapsın
  return this.http.post<any>(`${this.apiUrl}/Auth/login`, credentials);
}

  // --- ÜRÜN CRUD (API) ---
  refreshProducts() {
    this.http.get<any>(`${this.apiUrl}/Products`).subscribe(res => {
      if (res.success) this.productsSource.next(res.data.data);
    });
  }

  addProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Products`, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Products/${id}`);
  }

  updateProducts(newProducts: any[]) {
    this.productsSource.next([...newProducts]);
  }

  updateCartCountFromStorage() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    this.cartCountSource.next(total);
  }
}