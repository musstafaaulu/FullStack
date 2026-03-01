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

  readonly FREE_SHIPPING_THRESHOLD = 500;
  readonly SHIPPING_FEE = 39.99;

  paymentMethod: string = 'card';
  cardNumber: string = '';
  cardName: string = '';
  cardExpiry: string = '';
  cardCvc: string = '';

  readonly DOOR_PAYMENT_FEE = 50;
  readonly IBAN = 'TR12 0006 2000 3400 0006 2000 34';
  readonly BANK_NAME = 'Ziraat Bankası';
  readonly ACCOUNT_NAME = 'Nexus E-Ticaret A.Ş.';

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

  get shippingFee(): number { return this.totalPrice >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.SHIPPING_FEE; }
  get isFreeShipping(): boolean { return this.totalPrice >= this.FREE_SHIPPING_THRESHOLD; }
  get amountToFreeShipping(): number { return Math.max(0, this.FREE_SHIPPING_THRESHOLD - this.totalPrice); }
  get doorFee(): number { return this.paymentMethod === 'door' ? this.DOOR_PAYMENT_FEE : 0; }
  get finalTotal(): number { return this.totalPrice - this.discount + this.shippingFee + this.doorFee; }

  increaseQty(item: any) { item.quantity++; this.saveCart(); this.calculateTotal(); }
  decreaseQty(item: any) { if (item.quantity > 1) { item.quantity--; this.saveCart(); this.calculateTotal(); } }
  removeItem(id: any) { this.cartItems = this.cartItems.filter(item => (item.id || item.name) !== id); this.saveCart(); this.calculateTotal(); }
  saveCart() { localStorage.setItem('cart', JSON.stringify(this.cartItems)); }

  clearCart() {
    if (confirm('Sepeti tamamen boşaltmak istiyor musunuz?')) {
      this.cartItems = []; this.saveCart(); this.calculateTotal(); this.removeCoupon();
    }
  }

  applyCoupon() {
    const coupons = JSON.parse(localStorage.getItem('activeCoupons') || '[]');
    const found = coupons.find((c: any) => c.code.trim().toUpperCase() === this.couponCode.trim().toUpperCase());
    if (found) {
      this.discountRate = found.discount;
      this.discount = (this.totalPrice * this.discountRate) / 100;
    } else {
      alert('Geçersiz kupon kodu!');
      this.removeCoupon();
    }
  }
  removeCoupon() { this.couponCode = ''; this.discount = 0; this.discountRate = 0; }

  formatCardNumber(event: any) {
    let val = event.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = val.replace(/(.{4})/g, '$1 ').trim();
  }
  formatExpiry(event: any) {
    let val = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
    this.cardExpiry = val;
  }

  completeOrder() {
    if (!this.currentUser) { this.router.navigate(['/login']); return; }
    if (this.cartItems.length === 0) return;
    this.isOrdering = true;

    // Sipariş öncesi sepet snapshot'ı (orders sayfasında göstermek için)
    const itemsSnapshot = this.cartItems.map(item => ({
      id:        item.id,
      name:      item.name,
      price:     item.price,
      quantity:  item.quantity,
      imageUrl:  item.imageUrl || item.img || '',
      brandName: item.brandName || '',
      category:  item.category || item.categoryName || ''
    }));

    const newOrder = {
      userName:      this.currentUser.fullName || this.currentUser.name || 'Müşteri',
      totalPrice:    this.finalTotal,
      status:        'Beklemede',
      paymentMethod: this.paymentMethod === 'card'     ? 'Kredi Kartı' :
                     this.paymentMethod === 'transfer' ? 'Havale/EFT'  : 'Kapıda Ödeme',
      // ✅ Backend stok düşsün diye her ürünün ID ve adedi gönderiliyor
      items: this.cartItems.map(item => ({
        productId: item.id,
        quantity:  item.quantity
      }))
    };

    this.dataService.addOrder(newOrder).subscribe({
      next: (res: any) => {
        this.isOrdering   = false;
        this.orderSuccess = true;

        const orderId = res?.data?.id || res?.id || ('temp_' + Date.now());
        const allOrderItems = JSON.parse(localStorage.getItem('nexus_order_items') || '{}');
        allOrderItems[String(orderId)] = itemsSnapshot;
        localStorage.setItem('nexus_order_items', JSON.stringify(allOrderItems));

        localStorage.removeItem('cart');
        this.cartItems = [];
        this.removeCoupon();
        setTimeout(() => this.router.navigate(['/orders']), 3000);
      },
      error: () => {
        this.isOrdering = false;
        alert('Sipariş oluşturulamadı. Lütfen tekrar deneyin.');
      }
    });
  }
}