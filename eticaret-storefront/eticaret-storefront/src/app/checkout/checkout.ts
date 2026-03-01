import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  address  = '';
  note     = '';
  isLoading = false;
  errorMsg  = '';
  cartItems: any[] = [];
  total = 0;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    const cart = localStorage.getItem('cart'); // ✅ key 'cart'
    if (cart) {
      this.cartItems = JSON.parse(cart);
      this.total = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  onOrder() {
    if (!this.address.trim()) {
      this.errorMsg = 'Lütfen teslimat adresinizi giriniz.';
      return;
    }

    this.isLoading = true;
    this.errorMsg  = '';

    const userStr  = localStorage.getItem('currentUser');
    const user     = userStr ? JSON.parse(userStr) : null;

    const orderData = {
      userId:     user?.id       || 0,
      userName:   user?.fullName || 'Misafir',
      totalPrice: this.total,
      status:     'Beklemede',
      address:    this.address,
      note:       this.note
    };

    // ✅ addOrder — DataService'deki doğru metod
    this.dataService.addOrder(orderData).subscribe({
      next: () => {
        this.isLoading = false;
        localStorage.removeItem('cart'); // ✅ key 'cart'
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'Sipariş oluşturulurken hata oluştu.';
      }
    });
  }
}