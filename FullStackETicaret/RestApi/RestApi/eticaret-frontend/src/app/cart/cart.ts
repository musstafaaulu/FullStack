import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
  currentUser: any = null;
  isOrdering: boolean = false;
  orderSuccess: boolean = false;

  couponCode: string = '';
  discount: number = 0;
  discountRate: number = 0;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) this.currentUser = JSON.parse(savedUser);
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    this.cartItems = savedCart ? JSON.parse(savedCart) : [];
    this.cartItems = this.cartItems.map(item => ({
      ...item,
      imageUrl: item.imageUrl || item.img || 'https://picsum.photos/200?random=' + item.id
    }));
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (this.discount > 0) {
      this.discount = (this.totalPrice * this.discountRate) / 100;
    }
  }

  increaseQty(item: any) {
    item.quantity++;
    this.saveCart();
    this.calculateTotal();
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
      this.calculateTotal();
    }
  }

  removeItem(id: any) {
    this.cartItems = this.cartItems.filter(item => (item.id || item.name) !== id);
    this.saveCart();
    this.calculateTotal();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  clearCart() {
    if (confirm('Sepeti tamamen boşaltmak istiyor musunuz?')) {
      this.cartItems = [];
      this.saveCart();
      this.calculateTotal();
      this.removeCoupon();
    }
  }

  applyCoupon() {
    const savedCoupons = localStorage.getItem('activeCoupons');
    const coupons = savedCoupons ? JSON.parse(savedCoupons) : [];
    const foundCoupon = coupons.find((c: any) =>
      c.code.trim().toUpperCase() === this.couponCode.trim().toUpperCase()
    );
    if (foundCoupon) {
      this.discountRate = foundCoupon.discount;
      this.discount = (this.totalPrice * this.discountRate) / 100;
    } else {
      alert('Geçersiz kupon kodu!');
      this.removeCoupon();
    }
  }

  removeCoupon() {
    this.couponCode = '';
    this.discount = 0;
    this.discountRate = 0;
  }

  get finalTotal(): number {
    return this.totalPrice - this.discount;
  }

  completeOrder() {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.cartItems.length === 0) return;

    this.isOrdering = true;

    const newOrder = {
      userName: this.currentUser.fullName || this.currentUser.name || 'Müşteri',
      totalPrice: this.finalTotal,
      status: 'Beklemede'
    };

    this.dataService.addOrder(newOrder).subscribe({
      next: () => {
        this.isOrdering = false;
        this.orderSuccess = true;
        localStorage.removeItem('cart');
        this.cartItems = [];
        this.removeCoupon();
        setTimeout(() => this.router.navigate(['/home']), 2500);
      },
      error: () => {
        this.isOrdering = false;
        alert('Sipariş oluşturulamadı. Lütfen tekrar deneyin.');
      }
    });
  }
}