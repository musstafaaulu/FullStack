import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {
  allProducts: any[] = [];
  products: any[] = []; 
  searchTerm: string = '';
  selectedCategory: string = 'Hepsi';
  categories: string[] = ['Hepsi', 'Ev-yaşam', 'Elektronik', 'Giyim', 'Aksesuar', 'Kitap', 'Spor'];

  // KULLANICI VE SEPET DEĞİŞKENLERİ
  currentUser: any = null;
  cartCount: number = 0;
  
  // DROPDOWN MENÜ KONTROLÜ
  dropdownOpen: boolean = false;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser') || localStorage.getItem('loggedInUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }

    this.updateLocalCartCount();

    this.dataService.currentProducts.subscribe(productsFromAdmin => {
      this.allProducts = productsFromAdmin;
      this.applyFilter();
    });
  }

  // MENÜYÜ AÇIP KAPATMA FONKSİYONU
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  applyFilter() {
    this.products = this.allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory === 'Hepsi' || p.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  addToCart(product: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    this.dataService.updateCartCountFromStorage();
    this.updateLocalCartCount(); 
    alert(`${product.name} sepete eklendi!`);
  }

  updateLocalCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((acc: any, item: any) => acc + item.quantity, 0);
  }

  logout() {
    // Çıkış yaparken menüyü de kapat
    this.dropdownOpen = false;
    
    if (confirm("Hesabınızdan çıkış yapmak istediğinize emin misiniz?")) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('loggedInUser');
      this.currentUser = null;
      this.router.navigate(['/login']);
    }
  }
}