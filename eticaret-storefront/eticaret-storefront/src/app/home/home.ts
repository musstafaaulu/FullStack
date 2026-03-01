import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
  pageSize: number = 10;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  totalCount: number = 0;
  totalPages: number = 0;

  sliderIndex: number = 0;
  sliderImages: any[] = [];
  fallbackSlides = [
    { title: 'Yeni Sezon Ürünleri', subtitle: 'En iyi fiyatlarla keşfet', badge: '🔥 Trend', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&fit=crop' },
    { title: 'Elektronik Dünyası', subtitle: 'Teknolojinin zirvesini keşfet', badge: '⚡ Yeni', bg: 'linear-gradient(135deg, #0f0c29, #302b63)', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&fit=crop' },
    { title: 'Moda & Stil', subtitle: 'Trendleri yakala, tarzını bul', badge: '✨ Özel', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&fit=crop' },
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

  private sliderTimer: any;

  constructor(private dataService: DataService, public router: Router) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) this.currentUser = JSON.parse(savedUser);
    this.updateCartCount();
    this.loadCategories();
    this.loadBrands();
    this.loadProducts();
    this.loadBanners();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) this.dropdownOpen = false;
  }

  loadBanners() {
    this.dataService.getBanners().subscribe({
      next: (res: any) => {
        const banners = res?.data || res || [];
        if (Array.isArray(banners) && banners.length > 0) {
          this.sliderImages = banners.filter((b: any) => b.isActive);
        }
        if (this.sliderImages.length === 0) {
          this.sliderImages = this.fallbackSlides;
        }
        this.startSlider();
      },
      error: () => {
        this.sliderImages = this.fallbackSlides;
        this.startSlider();
      }
    });
  }

  loadProducts() {
    this.isLoading = true;

    // ✅ Tüm ürünleri çekip frontend'de filtrele & sırala
    let params = `?page=1&pageSize=9999`;
    if (this.searchTerm) params += `&search=${encodeURIComponent(this.searchTerm)}`;
    if (this.selectedCategory !== 'Hepsi') params += `&category=${encodeURIComponent(this.selectedCategory)}`;

    this.dataService.getProducts(params).subscribe({
      next: (res: any) => {
        const data = res?.data;
        let items: any[] = [];

        if (data?.items) {
          items = data.items;
        } else {
          const list = res?.data || res || [];
          items = Array.isArray(list) ? list : [];
        }

        let filtered = items.map((p: any) => ({
          ...p,
          imageUrl: p.imageUrl || p.img || `https://picsum.photos/seed/${p.id}/400/400`
        }));

        // ✅ Marka filtresi
        if (this.selectedBrand !== 'Hepsi') {
          filtered = filtered.filter((p: any) => p.brandName === this.selectedBrand);
        }
        // ✅ Fiyat filtresi
        if (this.minPrice !== null) filtered = filtered.filter((p: any) => p.price >= this.minPrice!);
        if (this.maxPrice !== null) filtered = filtered.filter((p: any) => p.price <= this.maxPrice!);

        // ✅ Sıralama
        filtered = this.sortProducts(filtered);

        this.totalCount = filtered.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);

        // ✅ Sayfalama — frontend'de dilim al
        const start = (this.currentPage - 1) * this.pageSize;
        this.products = filtered.slice(start, start + this.pageSize);

        // Tüm ürünleri sıralama için sakla
        this.allProducts = filtered;

        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  // ✅ Sıralama fonksiyonu
  sortProducts(products: any[]): any[] {
    const sorted = [...products];
    switch (this.sortType) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
      case 'newest':
      default:
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
  }

  loadCategories() {
    this.dataService.getCategories().subscribe({
      next: (res: any) => { this.categories = res?.data || res || []; }
    });
  }

  loadBrands() {
    this.dataService.getBrands().subscribe({
      next: (res: any) => { this.brands = res?.data || res || []; }
    });
  }

  applyFilter() {
    this.currentPage = 1;
    this.loadProducts();
  }

  // ✅ Sayfa başına ürün sayısı değişince sıfırla
  onPageSizeChange() {
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.products = this.allProducts.slice(start, start + this.pageSize);
  }

  // ✅ Sıralama değişince yeniden filtrele
  onSortChange() {
    this.currentPage = 1;
    this.allProducts = this.sortProducts(this.allProducts);
    this.totalPages = Math.ceil(this.allProducts.length / this.pageSize);
    this.products = this.allProducts.slice(0, this.pageSize);
  }

  clearFilters() {
    this.selectedCategory = 'Hepsi';
    this.selectedBrand = 'Hepsi';
    this.sortType = 'newest';
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
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
    const start = (this.currentPage - 1) * this.pageSize;
    this.products = this.allProducts.slice(start, start + this.pageSize);
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
    if (this.sliderTimer) clearInterval(this.sliderTimer);
    this.sliderTimer = setInterval(() => {
      if (this.sliderImages.length > 0) {
        this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
      }
    }, 5000);
  }

  goToSlide(i: number) { this.sliderIndex = i; }
  getCategoryIcon(name: string): string { return this.categoryIcons[name] || '📦'; }
  get isAdmin(): boolean { return this.currentUser?.role === 'Admin' || this.currentUser?.role === 'Super Admin'; }
}