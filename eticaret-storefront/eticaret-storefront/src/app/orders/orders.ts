import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;
  currentUser: any = null;

  readonly STATUS_ORDER = ['Beklemede', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi'];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) { this.router.navigate(['/login']); return; }
    this.currentUser = JSON.parse(savedUser);
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    // ✅ Sipariş ürünleri localStorage'dan
    const allOrderItems = JSON.parse(localStorage.getItem('nexus_order_items') || '{}');

    this.dataService.getOrders().subscribe({
      next: (res: any) => {
        const all = res?.data || res || [];
        const list = Array.isArray(all) ? all : all.items || [];
        this.orders = list
          .filter((o: any) => o.userName === this.currentUser.fullName || o.userId === this.currentUser.id)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((o: any) => ({
            ...o,
            // ✅ Her siparişe ürün listesini ekle
            items: allOrderItems[String(o.id)] || []
          }));
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  isStepDone(currentStatus: string, step: string): boolean {
    if (currentStatus === 'İptal Edildi') return false;
    const currentIdx = this.STATUS_ORDER.indexOf(currentStatus);
    const stepIdx = this.STATUS_ORDER.indexOf(step);
    return stepIdx <= currentIdx;
  }

  // Toplam ürün adedi
  getTotalItems(order: any): number {
    return (order.items || []).reduce((acc: number, i: any) => acc + i.quantity, 0);
  }
}