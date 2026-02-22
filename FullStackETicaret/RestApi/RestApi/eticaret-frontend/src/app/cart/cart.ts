import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './cart.html'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  totalPrice: number = 0;

  // KUPON DEĞİŞKENLERİ
  couponCode: string = '';
  discount: number = 0;
  discountRate: number = 0;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    this.cartItems = savedCart ? JSON.parse(savedCart) : [];
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  applyCoupon() {
    // ADMIN İLE AYNI İSİM: 'activeCoupons'
    const savedCoupons = localStorage.getItem('activeCoupons');
    const coupons = savedCoupons ? JSON.parse(savedCoupons) : [];
    
    console.log("LocalStorage'dan gelen kuponlar:", coupons);
    console.log("Aranan kod:", this.couponCode);

    const foundCoupon = coupons.find((c: any) => 
      c.code.trim().toUpperCase() === this.couponCode.trim().toUpperCase()
    );

    if (foundCoupon) {
      this.discountRate = foundCoupon.discount;
      this.discount = (this.totalPrice * this.discountRate) / 100;
      alert(`%${this.discountRate} indirim uygulandı biraderim!`);
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

  removeItem(id: any) {
    this.cartItems = this.cartItems.filter(item => (item.id || item.name) !== id);
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.calculateTotal();
    
    // Ürün silinince indirim tutarını güncelle
    if (this.discount > 0) {
      this.discount = (this.totalPrice * this.discountRate) / 100;
    }
    
    this.dataService.updateCartCountFromStorage();
  }

  completeOrder() {
    if (this.cartItems.length === 0) return;

    const productsJson = localStorage.getItem('allProducts');
    const ordersJson = localStorage.getItem('orders');
    
    let allProducts = productsJson ? JSON.parse(productsJson) : [];
    let orders = ordersJson ? JSON.parse(ordersJson) : [];

    // Stok güncelleme
    this.cartItems.forEach(cartItem => {
      const productIndex = allProducts.findIndex((p: any) => p.id === cartItem.id || p.name === cartItem.name);
      if (productIndex !== -1) {
        allProducts[productIndex].stock -= cartItem.quantity;
        if (allProducts[productIndex].stock < 0) allProducts[productIndex].stock = 0;
      }
    });

    const finalTotal = this.totalPrice - this.discount;

    const newOrder = {
      no: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: 'Biraderim',
      content: this.cartItems.map(item => `${item.name} (${item.quantity})`).join(', '),
      total: finalTotal, 
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'Hazırlanıyor'
    };

    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('allProducts', JSON.stringify(allProducts));
    
    this.dataService.updateProducts(allProducts);

    alert(`Sipariş başarıyla oluşturuldu! ${this.discount > 0 ? 'İndirim uygulandı.' : ''}`);
    localStorage.removeItem('cart');
    this.cartItems = [];
    this.removeCoupon();
    this.dataService.updateCartCountFromStorage();
    this.router.navigate(['/home']);
  }
}