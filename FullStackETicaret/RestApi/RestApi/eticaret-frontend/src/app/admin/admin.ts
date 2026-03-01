import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminComponent implements OnInit, AfterViewInit {

  view: string = 'dashboard';
  searchTerm: string = '';
  newCategoryName: string = '';
  newCategoryDescription: string = '';
  selectedOrder: any = null;
  editingProduct: any = null;
  public salesChart: any;
  toasts: any[] = [];
  isDarkMode: boolean = false;
  selectedCategory: string = 'Hepsi';
  sortType: string = 'newest';
  today = new Date();

  currentUser: any = { name: '', role: '' };

  admins: any[] = [];
  users: any[] = [];
  products: any[] = [];
  categories: any[] = [];
  brands: any[] = [];
  orders: any[] = [];
  comments: any[] = [];
  systemLogs: any[] = [];
  employees: any[] = [];
  banners: any[] = [];

  newEmployee: any = { fullName: '', email: '', password: '', role: 'Employee' };
  employeeSaving: boolean = false;
  uploadingImage: boolean = false;

  // ✅ Banner form
  newBanner: any = { title: '', imageUrl: '', link: '', isActive: true, order: 0 };
  bannerSaving: boolean = false;

  stats = { monthlyRevenue: 0, criticalStock: 0, totalCustomers: 0 };

  newProduct: any = {
    name: '', price: null, category: '', stock: null, img: '', description: '', brandId: null
  };

  newBrand: any = { name: '', description: '', logoUrl: '' };

  constructor(public dataService: DataService, public router: Router) {}

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === 'Super Admin';
  }

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.currentUser.name = this.currentUser.fullName || this.currentUser.name || 'Admin';
      const role = this.currentUser.role?.toLowerCase();
      if (!role || role === 'user' || role === 'customer') {
        this.router.navigate(['/home']); return;
      }
    } else {
      this.router.navigate(['/login']); return;
    }

    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = (savedTheme === 'dark');
    if (this.isDarkMode) document.body.classList.add('dark-theme');

    this.loadAllData();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initChart(), 500);
  }

  loadAllData() {
    this.loadProducts();
    this.loadOrders();
    this.loadUsers();
    this.loadComments();
    this.loadCategories();
    this.loadBrands();
    this.loadEmployees();
    this.loadBanners();
  }

  loadProducts() {
    this.dataService.getProducts().subscribe({
      next: (data: any) => {
        const list = data?.data?.items || data?.data?.data || data?.data || data || [];
        this.products = list.map((p: any) => ({ ...p, img: p.img || p.imageUrl || '' }));
        this.refreshStats();
        this.checkCriticalStocks();
      },
      error: (err) => console.error('Ürünler yüklenirken hata', err)
    });
  }

  loadOrders() {
    this.dataService.getOrders().subscribe({
      next: (data: any) => {
        this.orders = data?.data?.items || data?.data || data || [];
        this.refreshStats();
      },
      error: () => {}
    });
  }

  loadUsers() {
    this.dataService.getUsers().subscribe({
      next: (data: any) => { this.users = data?.data || data || []; this.refreshStats(); },
      error: () => {}
    });
  }

  loadComments() {
    this.dataService.getComments().subscribe({
      next: (data: any) => this.comments = data?.data?.items || data?.data || data || [],
      error: () => {}
    });
  }

  loadCategories() {
    this.dataService.getCategories().subscribe({
      next: (data: any) => { this.categories = data?.data || data || []; },
      error: () => { this.categories = []; }
    });
  }

  loadBrands() {
    this.dataService.getBrands().subscribe({
      next: (data: any) => this.brands = data?.data || data || [],
      error: () => {}
    });
  }

  loadEmployees() {
    this.dataService.getUsers().subscribe({
      next: (data: any) => {
        const all = data?.data || data || [];
        this.employees = all.filter((u: any) => u.role === 'Employee' || u.role === 'Admin');
      },
      error: () => {}
    });
  }

  // ✅ BANNER
  loadBanners() {
    this.dataService.getBanners().subscribe({
      next: (data: any) => this.banners = data?.data || data || [],
      error: () => {}
    });
  }

  saveBanner() {
    if (!this.newBanner.title.trim() || !this.newBanner.imageUrl.trim()) {
      this.showToast('Başlık ve Görsel URL zorunlu!', 'danger'); return;
    }
    this.bannerSaving = true;
    this.dataService.addBanner(this.newBanner).subscribe({
      next: () => {
        this.showToast('Banner eklendi!', 'success');
        this.addLog(`Banner eklendi: ${this.newBanner.title}`, 'success');
        this.newBanner = { title: '', imageUrl: '', link: '', isActive: true, order: 0 };
        this.bannerSaving = false;
        this.loadBanners();
      },
      error: () => {
        this.bannerSaving = false;
        this.showToast('Banner eklenemedi!', 'danger');
      }
    });
  }

  deleteBanner(id: number) {
    if (confirm('Bu banneri silmek istiyor musunuz?')) {
      this.dataService.deleteBanner(id).subscribe({
        next: () => {
          this.showToast('Banner silindi', 'warning');
          this.addLog(`Banner silindi (ID: ${id})`, 'danger');
          this.loadBanners();
        },
        error: () => this.showToast('Silme başarısız!', 'danger')
      });
    }
  }

  toggleBannerActive(banner: any) {
    const updated = { ...banner, isActive: !banner.isActive };
    this.dataService.updateBanner(banner.id, updated).subscribe({
      next: () => {
        banner.isActive = !banner.isActive;
        this.showToast(banner.isActive ? 'Banner aktif edildi' : 'Banner pasif edildi', 'info');
      },
      error: () => this.showToast('Güncelleme başarısız!', 'danger')
    });
  }

  // ─── ÜRÜN ────────────────────────────────────────────────────────────────────

  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.price) {
      this.showToast('İsim ve Fiyat zorunlu!', 'danger'); return;
    }
    const productToSend = {
      name:        this.newProduct.name,
      price:       this.newProduct.price,
      stock:       this.newProduct.stock || 0,
      category:    this.newProduct.category,
      imageUrl:    this.newProduct.img || 'https://picsum.photos/400/400',
      description: this.newProduct.description || '',
      brandId:     this.newProduct.brandId || null
    };
    this.dataService.addProduct(productToSend).subscribe({
      next: () => {
        this.showToast('Ürün eklendi!', 'success');
        this.addLog(`Yeni ürün eklendi: ${productToSend.name}`, 'success');
        this.newProduct = { name: '', price: null, category: '', stock: null, img: '', description: '', brandId: null };
        this.loadProducts();
        this.view = 'products';
      },
      error: () => this.showToast('Hata: Yetkiniz yok veya API kapalı!', 'danger')
    });
  }

  editProduct(product: any) {
    this.editingProduct = { ...product };
    this.view = 'edit-product';
  }

  updateProduct() {
    const updatedData = { ...this.editingProduct, imageUrl: this.editingProduct.img || this.editingProduct.imageUrl };
    this.dataService.updateProduct(this.editingProduct.id, updatedData).subscribe({
      next: () => {
        this.showToast('Ürün güncellendi.', 'success');
        this.addLog(`Ürün güncellendi: ${this.editingProduct.name}`, 'info');
        this.loadProducts();
        this.view = 'products';
      },
      error: () => this.showToast('Güncelleme başarısız!', 'danger')
    });
  }

  deleteProduct(id: number) {
    if (confirm('Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?')) {
      this.dataService.deleteProduct(id).subscribe({
        next: () => {
          this.showToast('Ürün silindi', 'warning');
          this.addLog(`Ürün silindi (ID: ${id})`, 'danger');
          this.loadProducts();
        },
        error: () => this.showToast('Silme başarısız!', 'danger')
      });
    }
  }

  // ─── KATEGORİ ────────────────────────────────────────────────────────────────

  saveCategory() {
    if (!this.newCategoryName.trim()) { this.showToast('Kategori adı zorunlu!', 'danger'); return; }
    const data = { name: this.newCategoryName.trim(), description: this.newCategoryDescription.trim() };
    this.dataService.addCategory(data).subscribe({
      next: () => {
        this.showToast('Kategori eklendi!', 'success');
        this.addLog(`Kategori eklendi: ${data.name}`, 'success');
        this.newCategoryName = ''; this.newCategoryDescription = '';
        this.loadCategories();
      },
      error: (err: any) => this.showToast(err.error?.message || 'Kategori eklenemedi!', 'danger')
    });
  }

  deleteCategory(id: number) {
    if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      this.dataService.deleteCategory(id).subscribe({
        next: () => {
          this.showToast('Kategori silindi', 'warning');
          this.addLog(`Kategori silindi (ID: ${id})`, 'danger');
          this.loadCategories();
        },
        error: () => this.showToast('Silme başarısız!', 'danger')
      });
    }
  }

  // ─── MARKA ────────────────────────────────────────────────────────────────────

  saveBrand() {
    if (!this.newBrand.name.trim()) { this.showToast('Marka adı zorunlu!', 'danger'); return; }
    this.dataService.addBrand(this.newBrand).subscribe({
      next: () => {
        this.showToast('Marka eklendi!', 'success');
        this.addLog(`Marka eklendi: ${this.newBrand.name}`, 'success');
        this.newBrand = { name: '', description: '', logoUrl: '' };
        this.loadBrands();
      },
      error: () => this.showToast('Marka eklenemedi!', 'danger')
    });
  }

  deleteBrand(id: number) {
    if (confirm('Bu markayı silmek istediğinize emin misiniz?')) {
      this.dataService.deleteBrand(id).subscribe({
        next: () => {
          this.showToast('Marka silindi', 'warning');
          this.addLog(`Marka silindi (ID: ${id})`, 'danger');
          this.loadBrands();
        },
        error: () => this.showToast('Silme başarısız!', 'danger')
      });
    }
  }

  // ─── SİPARİŞ ─────────────────────────────────────────────────────────────────

  updateOrderStatus(orderId: number, newStatus: string) {
    this.dataService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => { this.showToast(`Sipariş durumu: ${newStatus}`, 'success'); this.loadOrders(); },
      error: () => this.showToast('Sipariş durumu güncellenemedi.', 'danger')
    });
  }

  deleteOrder(id: number) {
    if (confirm('Siparişi silmek istiyor musunuz?')) {
      this.dataService.deleteOrder(id).subscribe({
        next: () => { this.showToast('Sipariş silindi', 'danger'); this.loadOrders(); },
        error: () => this.showToast('Hata oluştu', 'danger')
      });
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'Teslim Edildi': return 'status-done';
      case 'Kargoda':       return 'status-shipping';
      case 'Hazırlanıyor':  return 'status-preparing';
      case 'İptal Edildi':  return 'status-cancelled';
      default:              return 'status-pending';
    }
  }

  getOrderCount(status: string): number {
    return this.orders.filter(o => o.status === status).length;
  }

  openOrderDetails(order: any) { this.selectedOrder = order; }

  // ─── YORUM ───────────────────────────────────────────────────────────────────

  approveComment(id: number) {
    this.dataService.updateCommentStatus(id, 'Onaylandı').subscribe({
      next: () => { this.showToast('Yorum onaylandı', 'success'); this.loadComments(); },
      error: () => this.showToast('İşlem başarısız', 'danger')
    });
  }

  rejectComment(id: number) {
    this.dataService.updateCommentStatus(id, 'Reddedildi').subscribe({
      next: () => { this.showToast('Yorum reddedildi', 'warning'); this.loadComments(); },
      error: () => this.showToast('İşlem başarısız', 'danger')
    });
  }

  deleteComment(id: number) {
    if (confirm('Bu yorumu silmek istiyor musunuz?')) {
      this.dataService.deleteComment(id).subscribe({
        next: () => { this.showToast('Yorum silindi', 'warning'); this.loadComments(); },
        error: () => this.showToast('Silme başarısız', 'danger')
      });
    }
  }

  // ─── ÇALIŞAN ─────────────────────────────────────────────────────────────────

  saveEmployee() {
    if (!this.newEmployee.fullName.trim() || !this.newEmployee.email.trim() || !this.newEmployee.password) {
      this.showToast('Tüm alanlar zorunlu!', 'danger'); return;
    }
    this.employeeSaving = true;
    this.dataService.addEmployee(this.newEmployee).subscribe({
      next: () => {
        this.showToast('Çalışan eklendi!', 'success');
        this.addLog(`Yeni çalışan eklendi: ${this.newEmployee.fullName}`, 'success');
        this.newEmployee = { fullName: '', email: '', password: '', role: 'Employee' };
        this.employeeSaving = false;
        this.loadEmployees();
      },
      error: (err: any) => {
        this.employeeSaving = false;
        this.showToast(err.error?.message || 'Çalışan eklenemedi!', 'danger');
      }
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Bu çalışanı silmek istiyor musunuz?')) {
      this.dataService.deleteUser(id).subscribe({
        next: () => {
          this.showToast('Çalışan silindi', 'warning');
          this.addLog(`Çalışan silindi (ID: ${id})`, 'danger');
          this.loadEmployees();
        },
        error: () => this.showToast('Silme başarısız!', 'danger')
      });
    }
  }

  // ─── GÖRSEL UPLOAD ────────────────────────────────────────────────────────────

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => { this.newProduct.img = e.target.result; };
    reader.readAsDataURL(file);

    this.uploadingImage = true;
    this.dataService.uploadImage(file).subscribe({
      next: (data: any) => {
        if (data?.url) {
          this.newProduct.img = `http://localhost:5078${data.url}`;
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.uploadingImage = false;
        this.showToast('Resim yüklenemedi!', 'danger');
      }
    });
  }

  // ─── ŞİRKET AYARLARI ──────────────────────────────────────────────────────────

  goToCompanySettings() {
    this.router.navigate(['/admin/company-settings']);
  }

  // ─── YARDIMCI ────────────────────────────────────────────────────────────────

  get filteredProducts() {
    let result = [...this.products];
    if (this.searchTerm)
      result = result.filter(p => p.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    if (this.selectedCategory !== 'Hepsi')
      result = result.filter(p => p.category === this.selectedCategory);
    return result;
  }

  changeView(target: string) {
    this.view = target;
    if (target === 'dashboard') setTimeout(() => this.initChart(), 100);
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); }, 3000);
  }

  addLog(action: string, type: 'success' | 'info' | 'warning' | 'danger') {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    this.systemLogs.unshift({ time: timeStr, user: this.currentUser.name || 'Admin', action, type });
    if (this.systemLogs.length > 20) this.systemLogs.pop();
  }

  refreshStats() {
    this.stats.monthlyRevenue = this.orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    this.stats.criticalStock  = this.products.filter(p => p.stock < 10).length;
    this.stats.totalCustomers = this.users.length;
  }

  checkCriticalStocks() {
    this.products.forEach(p => {
      if (p.stock < 10) {
        const alreadyLogged = this.systemLogs.some(l => l.action.includes(p.name) && l.type === 'danger');
        if (!alreadyLogged) this.addLog(`KRİTİK STOK: ${p.name}`, 'danger');
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', this.isDarkMode);
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nexus_token');
    this.router.navigate(['/login']);
  }

  printReport() { window.print(); }

  initChart() {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.salesChart) this.salesChart.destroy();
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
          datasets: [{
            label: 'Satış (₺)',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Super Admin': return '#a855f7';
      case 'Admin':       return '#6366f1';
      case 'Employee':    return '#0ea5e9';
      case 'Customer':    return '#22c55e';
      default:            return '#94a3b8';
    }
  }
}