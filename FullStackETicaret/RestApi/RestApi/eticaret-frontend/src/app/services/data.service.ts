import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ⚠️  getHeaders() KALDIRILDI — AuthInterceptor her isteğe token + X-Company-Id ekliyor.

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5078/api';

  // ─── AUTH ────────────────────────────────────────────────────────────────────

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, userData);
  }

  registerCustomer(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register-customer`, data);
  }
registerCompany(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/Auth/register-company`, data);
}
  addEmployee(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/Auth/add-employee`, data);
}

  // ─── ÜRÜNLER ─────────────────────────────────────────────────────────────────

  getProducts(params: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/Products${params}`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Products/${id}`);
  }

  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Products`, productData);
  }

  updateProduct(id: number, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Products/${id}`, productData);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Products/${id}`);
  }

  // ─── SİPARİŞLER ──────────────────────────────────────────────────────────────

  getOrders(params: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/Orders${params}`);
  }

  addOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Orders`, orderData);
  }

  updateOrderStatus(id: string | number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/Orders/${id}/status`, { status });
  }

  deleteOrder(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Orders/${id}`);
  }

  // ─── KULLANICILAR ─────────────────────────────────────────────────────────────

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Users`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${id}`);
  }

  // ─── YORUMLAR ─────────────────────────────────────────────────────────────────

  getComments(params: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/Comments${params}`);
  }

  getCommentsByProduct(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Comments/Product/${productId}`);
  }

  addComment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comments`, data);
  }

  updateCommentStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/Comments/${id}/status`, { status });
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Comments/${id}`);
  }

  // ─── KATEGORİLER ──────────────────────────────────────────────────────────────

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Categories`);
  }

  addCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Categories`, data);
  }

  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Categories/${id}`);
  }

  // ─── MARKALAR ─────────────────────────────────────────────────────────────────

  getBrands(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Brands`);
  }

  addBrand(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Brands`, data);
  }

  updateBrand(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Brands/${id}`, data);
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Brands/${id}`);
  }

  // ─── BANNERLAR ────────────────────────────────────────────────────────────────

  getBanners(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Banners`);
  }

  addBanner(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Banners`, data);
  }

  updateBanner(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Banners/${id}`, data);
  }

  deleteBanner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Banners/${id}`);
  }

  // ─── ŞİRKET ───────────────────────────────────────────────────────────────────

  getCompany(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Company`);
  }

  updateCompany(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Company`, data);
  }

  // ─── UPLOAD ───────────────────────────────────────────────────────────────────

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Upload/image`, formData);
  }
}