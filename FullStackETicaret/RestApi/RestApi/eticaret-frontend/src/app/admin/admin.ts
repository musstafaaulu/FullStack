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
export class AdminComponent implements OnInit, AfterViewInit 
{ 
  // --- GÖRÜNÜM KONTROLLERİ & STATE ---
  view: string = 'dashboard';
  searchTerm: string = ''; 
  newCategoryName: string = ''; 
  selectedOrder: any = null; 
  editingProduct: any = null; 
  public salesChart: any;
  toasts: any[] = []; 
  isDarkMode: boolean = false;

  // --- KULLANICI VE YETKİ ---
  currentUser: any = { name: '', role: '' };
  
  admins: any[] = [
    { 
      id: 100, 
      name: 'Mustafa Ulu', 
      email: 'mustafa@admin.com', 
      pass: '123456', 
      role: 'Super Admin' 
    },
    { 
      id: 101, 
      name: 'Sanem Ulu', 
      email: 'sanem@admin.com', 
      pass: '12345', 
      role: 'Operations Admin' 
    },
    { 
      id: 102, 
      name: 'Yılmaz Ulu', 
      email: 'yilmaz@admin.com', 
      pass: '12345', 
      role: 'Sales Admin' 
    },
    { 
      id: 103, 
      name: 'Can Ulu', 
      email: 'can@admin.com', 
      pass: '12345', 
      role: 'Content Admin' 
    }
  ];

  users: any[] = [];

  // --- ÜRÜN VE KATEGORİ VERİLERİ ---
  products: any[] = [];
  categories: string[] = ['Ev-yaşam', 'Elektronik', 'Giyim', 'Aksesuar', 'Kitap', 'Spor'];
  
  orders: any[] = [];

  comments: any[] = [
    { 
      id: 201, 
      user: 'Zeynep', 
      text: 'Ürünlerin kalitesi muazzam, kargo çok hızlıydı.', 
      status: 'pending', 
      date: '17.02.2026', 
      product: 'Nexus Watch' 
    },
    { 
      id: 202, 
      user: 'Ahmet', 
      text: 'Klavye tuşları biraz sert geldi ama idare eder.', 
      status: 'pending', 
      date: '16.02.2026', 
      product: 'Nexus Pro Keyboard' 
    }
  ];

  systemLogs: any[] = [
    { time: '16:50', user: 'Mustafa Ulu', action: 'Admin Paneli başlatıldı', type: 'success' },
    { time: '16:48', user: 'System', action: 'Veritabanı senkronizasyonu tamam', type: 'info' },
    { time: '16:45', user: 'Admin', action: 'Stok güncellemesi yapıldı', type: 'warning' }
  ];

  stats = { 
    monthlyRevenue: 0, 
    criticalStock: 0, 
    totalCustomers: 0 
  };

  newProduct: any = { 
    name: '', 
    price: null, 
    category: 'Elektronik', 
    stock: null, 
    img: '' 
  };

  messages: any[] = [
    { 
      id: 1, 
      sender: 'Zeynep Kaya', 
      subject: 'Kargo Takibi', 
      content: 'Merhaba, siparişim nerede?', 
      date: '19.02.2026', 
      status: 'unread' 
    },
    { 
      id: 2, 
      sender: 'Ahmet Demir', 
      subject: 'İade Hakkında', 
      content: 'Klavye beklediğimden büyük geldi, iade edebilir miyim?', 
      date: '18.02.2026', 
      status: 'read' 
    }
  ];

  // --- KUPON SİSTEMİ VERİLERİ ---
  coupons: any[] = [];
  newCoupon = { 
    code: '', 
    discount: null, 
    type: 'percentage' 
  };

  constructor(private dataService: DataService, private router: Router) 
  {
  }

  ngOnInit() 
  {
    // 1. Kullanıcı Kontrolü
    const savedUser = localStorage.getItem('currentUser') || localStorage.getItem('loggedInUser');
    
    if (savedUser) 
    {
      this.currentUser = JSON.parse(savedUser);
      if (this.currentUser.role === 'user') 
      {
        this.router.navigate(['/home']);
        return;
      }
    } 
    else 
    {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Yorum Verilerini Yükle
    const savedComments = localStorage.getItem('productComments');
    if (savedComments) 
    { 
      this.comments = JSON.parse(savedComments); 
    }

    // 3. Kupon Verilerini Yükle
    const savedCoupons = localStorage.getItem('activeCoupons');
    if (savedCoupons) 
    { 
      this.coupons = JSON.parse(savedCoupons); 
    }

    // 4. Tema Tercihini Yükle
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = (savedTheme === 'dark');
    
    if (this.isDarkMode) 
    {
      document.body.classList.add('dark-theme');
    }

    // 5. Ürün Verilerini API'den Dinle (Gerçek Zamanlı Senkronizasyon)
    this.dataService.currentProducts.subscribe(data => {
      this.products = data;
      this.refreshStats(); 
      this.checkCriticalStocks(); 
    });
    this.dataService.refreshProducts(); // API'den ilk çekimi başlat

    // 6. Sipariş Verilerini Yükle
    const savedOrders = localStorage.getItem('orders');
    
    if (savedOrders) 
    {
      this.orders = JSON.parse(savedOrders);
    } 
    else 
    {
      this.orders = [
        { no: '#ORD-9921', customer: 'Mustafa', total: 1250, status: 'Hazırlanıyor', date: '17.02.2026', content: 'Nexus Watch (1)' },
        { no: '#ORD-7721', customer: 'Biraderim', total: 2450.50, status: 'Kargolandı', date: '17.02.2026', content: 'Nexus Pro Keyboard (1)' }
      ];
      localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // 7. Mesaj Verilerini Yükle
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) 
    { 
      this.messages = JSON.parse(savedMessages); 
    }

    // 8. Başlangıç Fonksiyonlarını Çalıştır
    this.generateFakeUsers(); 
    this.refreshStats(); 
    this.checkCriticalStocks(); 
  }

  ngAfterViewInit() 
  {
    setTimeout(() => 
    {
      this.initChart();
    }, 500);
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') 
  {
    const id = Date.now();
    this.toasts.push({ id, message, type });
    
    setTimeout(() => 
    { 
      this.toasts = this.toasts.filter(t => t.id !== id); 
    }, 3000);
  }

  addLog(action: string, type: 'success' | 'info' | 'warning' | 'danger') 
  {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.systemLogs.unshift({ 
      time: timeStr, 
      user: this.currentUser.fullName || this.currentUser.name || 'Admin', 
      action: action, 
      type: type 
    });
    
    if (this.systemLogs.length > 20) 
    {
      this.systemLogs.pop();
    }
  }

  refreshStats() 
  {
    this.stats.monthlyRevenue = this.orders.reduce((sum, order) => sum + Number(order.total), 0);
    this.stats.criticalStock = this.products.filter(p => p.stock < 10).length;
    this.stats.totalCustomers = this.users.length;
    
    if (this.stats.criticalStock > 5) 
    {
      this.showToast('Uyarı: Kritik stok seviyesindeki ürünler artıyor!', 'warning');
    }
  }

  readMessage(msg: any) 
  {
    msg.status = 'read';
    this.showToast('Mesaj okundu', 'success');
    this.addLog(`Mesaj okundu: ${msg.sender}`, 'info');
    localStorage.setItem('messages', JSON.stringify(this.messages)); 
  }

  deleteMessage(id: number) 
  {
    if (confirm("Mesajı silmek istediğinize emin misiniz?")) 
    {
      this.messages = this.messages.filter(m => m.id !== id);
      this.showToast('Mesaj silindi', 'warning');
      localStorage.setItem('messages', JSON.stringify(this.messages));
    }
  }

  checkCriticalStocks() 
  {
    this.products.forEach(p => 
    {
      if (p.stock < 10) 
      {
        const alreadyLogged = this.systemLogs.some(log => log.action.includes(p.name) && log.type === 'danger');
        if (!alreadyLogged) 
        { 
          this.addLog(`KRİTİK STOK: ${p.name}`, 'danger'); 
        }
      }
    });
  }

  generateFakeUsers() 
  {
    this.users = [];
    for (let i = 1; i <= 30; i++) 
    {
      this.users.push({ 
        id: i, 
        email: `user${i}@mail.com`, 
        status: 'Aktif', 
        role: 'user' 
      });
    }
  }

  saveToLocalStorage() 
  {
    // Ürünler artık API'den yönetiliyor ama diğer sayfalar için LocalStorage güncelleniyor
    localStorage.setItem('allProducts', JSON.stringify(this.products));
    this.dataService.updateProducts(this.products); 
    this.refreshStats();
  }

  changeView(target: string) 
  {
    this.view = target;
    if (target === 'dashboard') 
    { 
      setTimeout(() => this.initChart(), 100); 
    }
  }

  selectedCategory: string = 'Hepsi';
  sortType: string = 'newest';

  get filteredProducts() 
  {
    let result = [...this.products];
    
    if (this.searchTerm) 
    { 
      result = result.filter(p => p.name.toLowerCase().includes(this.searchTerm.toLowerCase())); 
    }
    
    if (this.selectedCategory !== 'Hepsi') 
    { 
      result = result.filter(p => p.category === this.selectedCategory); 
    }
    
    return result;
  }

  onFileSelected(event: any) 
  {
    const file = event.target.files[0];
    if (file) 
    {
      const reader = new FileReader();
      reader.onload = (e: any) => 
      { 
        this.newProduct.img = e.target.result; 
      };
      reader.readAsDataURL(file);
    }
  }

  // --- API İLE ÇALIŞAN METOTLAR ---

  saveProduct() {
  if (!this.newProduct.name || !this.newProduct.price) {
    this.showToast('İsim ve Fiyat zorunlu!', 'danger');
    return;
  }

  const productToSend = {
    name: this.newProduct.name,
    price: this.newProduct.price,
    stock: this.newProduct.stock || 0,
    category: this.newProduct.category,
    imageUrl: this.newProduct.img || 'https://picsum.photos/200/200'
  };

  this.dataService.addProduct(productToSend).subscribe({
    next: (res) => {
      this.showToast('Ürün veritabanına eklendi!', 'success');
      this.dataService.refreshProducts(); // Listeyi güncelle
      this.view = 'products'; // Listeye geri dön
    },
    error: (err) => {
      console.error("Hata kodu:", err.status);
      this.showToast('Hata: Yetkiniz olmayabilir veya API kapalı!', 'danger');
    }
  });
}

  editProduct(product: any) 
  {
    this.editingProduct = { ...product };
    this.view = 'edit-product';
  }

  updateProduct() 
  {
    const updatedData = { 
      ...this.editingProduct, 
      imageUrl: this.editingProduct.img || this.editingProduct.imageUrl 
    };
    
    this.dataService.updateProduct(this.editingProduct.id, updatedData).subscribe({
      next: () => {
        this.showToast('Ürün veritabanında güncellendi, biraderim.', 'success');
        this.addLog(`Ürün güncellendi: ${this.editingProduct.name}`, 'info');
        this.dataService.refreshProducts();
        this.view = 'products';
      },
      error: () => this.showToast('Güncelleme sırasında hata oluştu!', 'danger')
    });
  }

  deleteProduct(id: number) 
  {
    if (confirm("Bu ürünü veritabanından kalıcı olarak silmek istediğine emin misiniz?")) 
    {
      this.dataService.deleteProduct(id).subscribe({
        next: () => {
          this.showToast('Ürün silindi', 'warning');
          this.addLog(`Ürün silindi (ID: ${id})`, 'danger');
          this.dataService.refreshProducts();
        },
        error: () => this.showToast('Silme işlemi başarısız!', 'danger')
      });
    }
  }

  // --- DİĞER FONKSİYONLAR ---

  addCategory() 
  {
    if (this.newCategoryName.trim()) 
    {
      this.categories.push(this.newCategoryName.trim());
      this.showToast('Kategori başarıyla eklendi', 'success');
      this.newCategoryName = '';
    }
  }

  deleteCategory(cat: string) 
  {
    this.categories = this.categories.filter(c => c !== cat);
    this.showToast('Kategori kaldırıldı', 'warning');
  }

  updateOrderStatus(orderNo: string, newStatus: string) 
  {
    const order = this.orders.find(o => (o.no === orderNo || o.id === orderNo));
    
    if (order) 
    {
      order.status = newStatus;
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.showToast(`Durum: ${newStatus}`, 'success');
      this.addLog(`Sipariş güncellendi: ${orderNo}`, 'info');
      this.refreshStats();
    }
  }

  deleteOrder(id: string) 
  {
    if (confirm("Siparişi silmek istiyor musunuz?")) 
    {
      this.orders = this.orders.filter(o => (o.id !== id && o.no !== id));
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.showToast('Sipariş kaydı silindi', 'danger');
      this.refreshStats();
    }
  }

  openOrderDetails(order: any) 
  { 
    this.selectedOrder = order; 
  }

  approveComment(id: number) 
  {
    const c = this.comments.find(x => x.id === id);
    if (c) 
    { 
      c.status = 'approved'; 
      localStorage.setItem('productComments', JSON.stringify(this.comments));
      this.showToast('Yorum onaylandı', 'success');
    }
  }

  rejectComment(id: number) 
  {
    this.comments = this.comments.filter(x => x.id !== id);
    localStorage.setItem('productComments', JSON.stringify(this.comments));
    this.showToast('Yorum reddedildi', 'warning');
  }

  makeAdmin(user: any) 
  {
    this.admins.push({ 
      id: user.id, 
      name: user.email.split('@')[0], 
      email: user.email, 
      role: 'Editor' 
    });
    this.users = this.users.filter(u => u.id !== user.id);
    this.showToast('Yetki tanımlandı', 'success');
  }

  deleteAdmin(id: number) 
  {
    this.admins = this.admins.filter(a => a.id !== id);
    this.showToast('Yetki geri alındı', 'danger');
  }

  removeUser(id: number) 
  {
    this.users = this.users.filter(u => u.id !== id);
    this.showToast('Kullanıcı hesabı silindi', 'warning');
    this.refreshStats();
  }

  printReport() 
  { 
    window.print(); 
  }

  toggleDarkMode() 
  {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    
    if (this.isDarkMode) 
    { 
      document.body.classList.add('dark-theme'); 
    } 
    else 
    { 
      document.body.classList.remove('dark-theme'); 
    }
  }

  approveAllOrders() 
  {
    if (confirm("Bekleyen tüm siparişler kargolansın mı?")) 
    {
      this.orders.forEach(o => 
      { 
        if (o.status === 'Hazırlanıyor') o.status = 'Kargolandı'; 
      });
      localStorage.setItem('orders', JSON.stringify(this.orders));
      this.showToast('Toplu onay başarılı!', 'success');
      this.refreshStats();
    }
  }

  getUserTotalSpend(userEmail: string): number 
  {
    const userName = userEmail.split('@')[0].toLowerCase();
    
    return this.orders
      .filter(o => (o.user || o.customer || '').toLowerCase() === userName)
      .reduce((sum, o) => sum + Number(o.total), 0);
  }

  quickAddStock(product: any) 
  {
    product.stock += 10;
    this.showToast('Stok hızlıca artırıldı', 'success');
  }

  addCoupon() 
  {
    if (this.newCoupon.code && this.newCoupon.discount) 
    {
      this.coupons.push({ ...this.newCoupon });
      localStorage.setItem('activeCoupons', JSON.stringify(this.coupons));
      this.showToast('Yeni kupon tanımlandı', 'success');
      
      this.newCoupon = { 
        code: '', 
        discount: null, 
        type: 'percentage' 
      };
    }
  }

  deleteCoupon(index: any) 
  { 
    this.coupons.splice(index, 1);
    localStorage.setItem('activeCoupons', JSON.stringify(this.coupons));
    this.showToast('Kupon silindi', 'success'); 
  }

  logout() 
  {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nexus_token');
    this.router.navigate(['/login']);
  }

  initChart() 
  {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    
    if (ctx) 
    {
      if (this.salesChart) 
      { 
        this.salesChart.destroy(); 
      }
      
      this.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
          datasets: [{
            label: 'Satış (₺)',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            borderColor: '#6366f1',
            tension: 0.4
          }]
        }
      });
    }
  }
}