import { Component, OnInit } from '@angular/core'; // Doğru yer burası
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="card p-4 shadow-sm">
        <h2 class="mb-4">Profilim</h2>
        <div class="mb-4">
          <p><strong>Ad Soyad:</strong> {{ currentUser?.name }}</p>
          <p><strong>E-posta:</strong> {{ currentUser?.email }}</p>
        </div>

        <h3 class="mt-5 mb-3">Siparişlerim</h3>
        <div *ngIf="myOrders.length === 0" class="alert alert-info">
          Henüz bir siparişiniz bulunmuyor.
        </div>
        
        <div *ngIf="myOrders.length > 0" class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Sipariş No</th>
                <th>Tarih</th>
                <th>İçerik</th>
                <th>Toplam</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of myOrders">
                <td><strong>{{ order.no }}</strong></td>
                <td>{{ order.date }}</td>
                <td>{{ order.content }}</td>
                <td>{{ order.total | currency:'TRY':'symbol':'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': order.status === 'Hazırlanıyor', 
                    'bg-success': order.status === 'Kargolandı' || order.status === 'Teslim Edildi'
                  }">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  myOrders: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    const userJson = localStorage.getItem('loggedInUser') || localStorage.getItem('currentUser');
    if (!userJson) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = JSON.parse(userJson);
    this.loadMyOrders();
  }

  loadMyOrders() {
    const allOrdersJson = localStorage.getItem('orders');
    if (allOrdersJson) {
      const allOrders = JSON.parse(allOrdersJson);
      // Sadece giriş yapan kullanıcının siparişlerini getir
      this.myOrders = allOrders.filter((o: any) => 
        (o.customer || '').toLowerCase() === (this.currentUser.name || '').toLowerCase()
      );
    }
  }
}