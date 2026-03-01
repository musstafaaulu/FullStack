import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  allProducts: any[] = [];
  products: any[] = [];
  categories: any[] = [];
  brands: any[] = [];

  searchTerm: string = '';
  selectedCategory: string = 'Hepsi';
  selectedBrand: string = 'Hepsi';
  sortType: string = 'newest';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  showFilters: boolean = false;

  currentPage: number = 1;
  pageSize: number = 12;
  totalCount: number = 0;
  totalPages: number = 0;

  sliderIndex: number = 0;
  sliderImages = [
    { title: 'Yeni Sezon Ürünleri', subtitle: 'En iyi fiyatlarla keşfet', badge: '🔥 Trend', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&fit=crop' },
    { title: 'Elektronik Dünyası', subtitle: 'Teknolojinin zirvesini keşfet', badge: '⚡ Yeni', bg: 'linear-gradient(135deg, #0f0c29, #302b63)', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&fit=crop' },
    { title: 'Moda & Stil', subtitle: 'Trendleri yakala, tarzını bul', badge: '✨ Özel', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&fit=crop' },
  ];

  categoryIcons: any = {
    'Elektronik': '💻', 'Bilgisayar & Tablet': '🖥️', 'Telefon & Aksesuar': '📱',
    'Giyim': '👕', 'Erkek Giyim': '👔', 'Kadın Giyim': '👗',
    'Ayakkabı & Çanta': '👟', 'Spor & Outdoor': '⚽', 'Ev & Yaşam': '🏠',
    'Mutfak & Yemek': '🍳', 'Kitap & Kırtasiye': '📚', 'Oyuncak & Hobi': '🎮',
    'Kozmetik & Bakım': '💄', 'Otomotiv': '🚗', 'Bahçe & Yapı Market': '🌱',
  };

  currentUser: any = null;
  cartCount: number = 0;
  dropdownOpen: boolean = false;
  isLoading: boolean = false;
  addedProducts: Set<number> = new Set();

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) this.currentUser = JSON.parse(savedUser);
    this.updateCartCount();
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
    this.startSlider();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) this.dropdownOpen = false;
  }

  loadProducts() {
    this.isLoading = true;
    let params = `?page=${this.currentPage}&pageSize=${this.pageSize}`;
    if (this.searchTerm) params += `&search=${encodeURIComponent(this.searchTerm)}`;
    if (this.selectedCategory !== 'Hepsi') params += `&category=${encodeURIComponent(this.selectedCategory)}`;
    params += `&sortBy=${this.sortType}`;

    this.dataService.getProducts(params).subscribe({
      next: (res: any) => {
        const data = res?.data;
        let items: any[] = [];
        if (data?.items) {
          items = data.items;
          this.totalCount = data.total || data.totalCount || items.length;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        } else {
          const list = res?.data || res || [];
          items = Array.isArray(list) ? list : [];
          this.totalCount = items.length;
          this.totalPages = 1;
        }

        let filtered = items.map((p: any) => ({
          ...p,
          imageUrl: p.imageUrl || p.img || `https://picsum.photos/seed/${p.id}/400/400`
        }));

        if (this.selectedBrand !== 'Hepsi') filtered = filtered.filter((p: any) => p.brandName === this.selectedBrand);
        if (this.minPrice !== null) filtered = filtered.filter((p: any) => p.price >= this.minPrice!);
        if (this.maxPrice !== null) filtered = filtered.filter((p: any) => p.price <= this.maxPrice!);

        this.products = filtered;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadCategories() {
    this.dataService.getCategories().subscribe({
      next: (res: any) => { this.categories = (res?.data || res || []).slice(0, 15); }
    });
  }

  loadBrands() {
    this.dataService.getBrands().subscribe({
      next: (res: any) => { this.brands = res?.data || res || []; }
    });
  }

  applyFilter() { this.currentPage = 1; this.loadProducts(); }

  clearFilters() {
    this.selectedCategory = 'Hepsi'; this.selectedBrand = 'Hepsi';
    this.sortType = 'newest'; this.searchTerm = '';
    this.minPrice = null; this.maxPrice = null;
    this.applyFilter();
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilter();
    setTimeout(() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 500, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategory !== 'Hepsi' || this.selectedBrand !== 'Hepsi' ||
           !!this.searchTerm || this.minPrice !== null || this.maxPrice !== null;
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartCount();
    this.showAddedFeedback(product.id);
  }

  showAddedFeedback(id: number) {
    this.addedProducts.add(id);
    setTimeout(() => this.addedProducts.delete(id), 1500);
  }

  goToDetail(productId: number) { this.router.navigate(['/product', productId]); }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }

  toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }

  logout() {
    this.dropdownOpen = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nexus_token');
    this.currentUser = null;
    this.router.navigate(['/login']);
  }

  startSlider() {
    setInterval(() => { this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length; }, 5000);
  }

  goToSlide(i: number) { this.sliderIndex = i; }
  getCategoryIcon(name: string): string { return this.categoryIcons[name] || '📦'; }
  get isAdmin(): boolean { return this.currentUser?.role === 'Admin' || this.currentUser?.role === 'Super Admin'; }
}