# 🛍️ NEXUS — Çok Kiracılı E-Ticaret Platformu

> **Geliştirici:** Mustafa Ulu
> **Teknolojiler:** .NET 9 (C#) · Angular 18 (TypeScript) · SQLite · JWT

---

## 📋 İÇİNDEKİLER

1. [Proje Hakkında](#proje-hakkında)
2. [Sistem Mimarisi](#sistem-mimarisi)
3. [Kullanılan Teknolojiler](#kullanılan-teknolojiler)
4. [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
5. [Backend — NexusBackend](#backend--nexusbackend)
6. [Admin Paneli — eticaret-frontend](#admin-paneli--eticaret-frontend)
7. [Müşteri Mağazası — eticaret-storefront](#müşteri-mağazası--eticaret-storefront)
8. [API Endpoint Listesi](#api-endpoint-listesi)
9. [Veritabanı Şeması](#veritabanı-şeması)
10. [Güvenlik Mimarisi](#güvenlik-mimarisi)
11. [Özellikler](#özellikler)
12. [Test Hesapları](#test-hesapları)

---

## 📌 Proje Hakkında

**Nexus**, birden fazla şirketin aynı altyapı üzerinde bağımsız mağaza işletebildiği **çok kiracılı (multi-tenant) bir e-ticaret platformudur.**

Her şirket:
- Kendi ürünlerini, kategorilerini ve markalarını yönetir
- Kendi siparişlerini ve müşterilerini görür
- Kendi admin paneline sahiptir
- Diğer şirketlerin verilerine erişemez

Platform **3 ayrı uygulamadan** oluşur:

| Uygulama | Port | Açıklama |
|----------|------|----------|
| **NexusBackend** | 5078 | REST API sunucusu |
| **eticaret-frontend** (Admin Panel) | 4200 | Şirket yönetim paneli |
| **eticaret-storefront** (Mağaza) | 4300 | Müşteri alışveriş sitesi |

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────┐
│                 NEXUS PLATFORM                  │
│                                                 │
│  ┌────────────────┐   ┌─────────────────┐      │
│  │  Admin Panel   │   │   Storefront    │      │
│  │  Port: 4200    │   │   Port: 4300    │      │
│  └───────┬────────┘   └────────┬────────┘      │
│          │  HTTP + JWT          │  HTTP + Header │
│          └──────────┬───────────┘               │
│                     │                           │
│          ┌──────────▼──────────┐               │
│          │    NexusBackend     │               │
│          │  .NET 9 REST API    │               │
│          │    Port: 5078       │               │
│          └──────────┬──────────┘               │
│                     │                           │
│          ┌──────────▼──────────┐               │
│          │   SQLite Database   │               │
│          │   NexusStore.db     │               │
│          └─────────────────────┘               │
└─────────────────────────────────────────────────┘
```

### Multi-Tenant Mantığı

Her HTTP isteğinde şirket kimliği iki yoldan gelir:

1. **Header:** `X-Company-Id: 3` (storefront'ta environment'tan otomatik)
2. **JWT Token:** `CompanyId` claim'i (admin panelinde giriş sonrası)

Backend, gelen `CompanyId`'ye göre tüm sorguları filtreler. Şirket A hiçbir zaman Şirket B'nin verisini göremez.

---

## 🛠️ Kullanılan Teknolojiler

### Backend
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| .NET 9 | Web API framework |
| Entity Framework Core | ORM — veritabanı işlemleri |
| SQLite | Veritabanı |
| JWT Bearer | Kimlik doğrulama |
| BCrypt.Net | Şifre hashleme |
| Serilog | Loglama (konsol + dosya) |
| AutoMapper | Entity ↔ DTO dönüşümü |
| Swagger / OpenAPI | API dokümantasyonu |

### Frontend
| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| Angular 18 | SPA framework |
| TypeScript 5 | Tip güvenli JavaScript |
| RxJS | Asenkron veri akışı |
| Angular Router | Sayfa yönlendirme (lazy loading) |
| HttpClient | API istekleri |
| Font Awesome 6.4 | İkon kütüphanesi |

---

## ⚙️ Kurulum ve Çalıştırma

### Ön Gereksinimler

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- Angular CLI: `npm install -g @angular/cli`

### 1. Backend

```bash
cd NexusBackend/Nexus.API
dotnet run
```

Backend `http://localhost:5078` adresinde başlar.
İlk çalıştırmada SQLite veritabanı ve seed data otomatik oluşturulur.
Swagger UI: `http://localhost:5078/swagger`

### 2. Admin Paneli

```bash
cd eticaret-frontend
npm install
ng serve --port 4200
```

Admin Panel: `http://localhost:4200`

### 3. Müşteri Mağazası

```bash
cd eticaret-storefront
npm install
ng serve --port 4300
```

Storefront: `http://localhost:4300`

---

## 🔧 Backend — NexusBackend

### Proje Yapısı

```
NexusBackend/
├── Nexus.API/
│   ├── Controllers/        → 9 controller (Auth, Products, Orders, ...)
│   ├── DTOs/               → Request/Response veri transfer objeleri
│   ├── Mapping/            → AutoMapper profilleri
│   ├── Middleware/         → Global exception handler
│   ├── wwwroot/uploads/    → Yüklenen resimler (statik dosyalar)
│   └── Program.cs          → Servis kayıtları, CORS, seed data
├── Nexus.Core/
│   └── Entities/           → 8 entity sınıfı (Product, Order, User...)
└── Nexus.Data/
    ├── Contexts/            → AppDbContext (EF Core)
    └── Migrations/          → Veritabanı migration dosyaları
```

### Controller'lar ve Görevleri

| Controller | Endpoint | Açıklama |
|------------|----------|----------|
| `AuthController` | `/api/Auth` | Kayıt, giriş, şifre değiştirme |
| `ProductsController` | `/api/Products` | Ürün CRUD + JSON döngü koruması |
| `OrdersController` | `/api/Orders` | Sipariş yönetimi + otomatik stok düşürme |
| `CategoriesController` | `/api/Categories` | Kategori yönetimi |
| `BrandsController` | `/api/Brands` | Marka yönetimi |
| `CommentsController` | `/api/Comments` | Yorum yönetimi + onay sistemi |
| `BannersController` | `/api/Banners` | Ana sayfa banner yönetimi |
| `CompanyController` | `/api/Company` | Şirket bilgileri güncelleme |
| `UploadController` | `/api/Upload` | Resim yükleme (max 5MB, uzantı kontrolü) |

### Önemli Teknik Detaylar

**JSON Circular Reference Koruması:**
EF Core navigation property'leri (Product→Brand→Products→...) JSON serializer'ın döngüye girmesine neden olur. Tüm GET endpoint'lerinde direkt entity yerine `.Select()` projection kullanılır:

```csharp
.Select(p => new {
    p.Id, p.Name, p.Price,
    brandName = p.Brand != null ? p.Brand.Name : null
    // Brand objesi yok → döngü yok
})
```

**Otomatik Stok Düşürme:**
Sipariş oluşturulduğunda her ürünün stoğu otomatik düşürülür:

```csharp
foreach (var item in dto.Items)
{
    var product = await _context.Products.FindAsync(item.ProductId);
    product.Stock = Math.Max(0, product.Stock - item.Quantity);
}
```

**Serilog Loglama:**
Her HTTP isteği ve uygulama olayı loglanır:
- Konsol: Anlık renkli çıktı
- Dosya: `Logs/nexus-YYYY-MM-DD.log` (günlük rotasyon)

---

## 🖥️ Admin Paneli — eticaret-frontend

**Port:** `http://localhost:4200`
Tüm sayfalar `adminGuard` ile korunur, JWT token zorunludur.

### Ekran Görüntüleri

#### Dashboard & Giriş
![Admin Giriş](screenshots/admin.png)
![Admin Dashboard](screenshots/admin1.png)

#### Ürün Yönetimi
![Ürün Listesi](screenshots/admin2.png)
![Ürün Ekleme / Düzenleme](screenshots/admin3.png)
![Ürün Detay](screenshots/admin4.png)

#### Sipariş Yönetimi
> Siparişler listelenir, durum güncellenir (Beklemede / Hazırlanıyor / Kargoda / Teslim Edildi / İptal Edildi)

![Sipariş Listesi — Durum Güncelleme](screenshots/admin11.png)

#### Marka Yönetimi
> Marka adı, açıklama ve logo URL ile marka ekleme/silme

![Marka Yönetimi](screenshots/admin5.png)

#### Banner / Slider Yönetimi
> Başlık, görsel URL, link, sıra no ve aktif/pasif durumuyla banner ekleme

![Banner Ekle](screenshots/admin6.png)
![Banner Listesi](screenshots/admin8.png)

#### Yorum Kontrolü
> Onaylama / reddetme, puan ve müşteri bilgisi

![Yorum Kontrolü](screenshots/admin7.png)

#### Kullanıcı & Çalışan Yönetimi
![Kullanıcı Listesi](screenshots/admin9.png)

#### Şirket Ayarları
![Şirket Ayarları](screenshots/admin10.png)
![Şirket Detay](screenshots/company.png)
![Şirket Düzenleme](screenshots/company1.png)

### Sayfalar ve Özellikler

| Sayfa | Özellikler |
|-------|------------|
| **Dashboard** | Sayaçlar, son siparişler özeti |
| **Ürün Yönetimi** | CRUD, resim URL/yükleme, marka+kategori bağlantısı |
| **Sipariş Yönetimi** | Durum güncelleme, arama, filtreleme |
| **Kategori/Marka** | CRUD işlemleri |
| **Yorum Yönetimi** | Onaylama/reddetme, Türkçe durum değerleri |
| **Banner Yönetimi** | Slider yönetimi, sıralama, aktif/pasif |
| **Kullanıcı Yönetimi** | Çalışan ekleme, kullanıcı silme |
| **Şirket Ayarları** | Bilgi güncelleme, logo yükleme (dosya/URL), canlı önizleme |

---

## 🛍️ Müşteri Mağazası — eticaret-storefront

**Port:** `http://localhost:4300`

### Ekran Görüntüleri

#### Giriş & Kayıt & Şirket Kur
> Sol taraf: Platform tanıtımı (500+ Şirket, 12K+ Ürün, %98 Memnuniyet)
> Sağ taraf: Giriş Yap / Üye Ol / Şirket Kur sekmeleri

![Giriş & Kayıt Sayfası](screenshots/login.png)

#### Ana Sayfa
> Banner slider, sol sticky sidebar kategoriler, marka ve fiyat aralığı filtreleri, ürün grid

![Ana Sayfa — Ürün Listesi](screenshots/home1.png)
![Ana Sayfa — Fiyat Filtresi Uygulanmış (100₺–1000₺)](screenshots/home2.png)
![Ana Sayfa Genel](screenshots/home.png)

#### Sepet & Ödeme
> Ücretsiz kargo bildirimi, ürün adedi değiştirme, 3 ödeme seçeneği, sipariş özeti

![Sepet — Kredi Kartı Ödeme](screenshots/cart3.png)
![Sepet — Kapıda Ödeme (+50₺ hizmet bedeli)](screenshots/cart4.png)

#### Sipariş Tamamlama
> Sipariş onaylandığında çıkan başarı ekranı, 3 saniye sonra siparişlere yönlendirir

![Sipariş Oluşturuldu](screenshots/cart.png)

#### Siparişlerim
> Sipariş edilen ürünler resim + isim + fiyat ile listelenir, 4 adımlı kargo takibi

![Siparişlerim](screenshots/order.png)

#### Profil
![Profil](screenshots/profile.png)
![Profil — Sipariş Geçmişi](screenshots/profile 2.png)
![Profil — Şifre Değiştirme](screenshots/profile3.png)

### Sayfalar ve Özellikler

#### Ana Sayfa
- Banner slider (admin panelinden yönetilir, otomatik geçiş)
- Sol sticky sidebar'da kategori listesi
- Gelişmiş filtreleme: kategori, marka, fiyat aralığı, arama
- Sıralama: En Yeni / En Ucuz / En Pahalı / A-Z / Z-A
- Sayfalama: 5 / 10 / 20 / 50 seçeneği

#### Ürün Detay
- Ürün bilgileri (null-safe normalizasyon)
- Müşteri yorumları (sadece onaylananlar)
- Yorum yazma (giriş yapanlar için)

#### Sepet
- LocalStorage tabanlı (giriş gerektirmez)
- Kargo: 500₺ altı 39.99₺, üzeri ücretsiz
- Kupon kodu sistemi
- 3 ödeme yöntemi:
  - Kredi Kartı (otomatik formatlı form, SSL rozeti)
  - Havale/EFT (IBAN + banka bilgileri)
  - Kapıda Ödeme (+50₺ hizmet bedeli)
- Sipariş onayında stok backend'de otomatik düşer

#### Siparişlerim
- Sipariş edilen ürünler resim + isim + fiyatla gösterilir
- 4 adımlı kargo takip göstergesi
- Durum renk kodlaması

#### Profil
- Kişisel bilgi güncelleme
- Şifre değiştirme (mevcut şifre doğrulamalı, BCrypt)
- Adres defteri

---

## 📡 API Endpoint Listesi

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/Auth/login` | Herkese açık |
| POST | `/api/Auth/register` | Herkese açık |
| POST | `/api/Auth/register-customer` | Herkese açık |
| POST | `/api/Auth/register-company` | Herkese açık |
| POST | `/api/Auth/add-employee` | Admin |
| POST | `/api/Auth/change-password` | Giriş yapılmış |

### Ürünler
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/Products?page=1&pageSize=12&category=&search=` | Herkese açık |
| GET | `/api/Products/{id}` | Herkese açık |
| POST | `/api/Products` | Giriş yapılmış |
| PUT | `/api/Products/{id}` | Giriş yapılmış |
| DELETE | `/api/Products/{id}` | Giriş yapılmış |

### Siparişler
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/Orders` | Giriş yapılmış |
| POST | `/api/Orders` | Giriş yapılmış |
| PUT | `/api/Orders/{id}/status` | Giriş yapılmış |
| DELETE | `/api/Orders/{id}` | Giriş yapılmış |

### Diğer Endpoint'ler
| Endpoint | Açıklama |
|----------|----------|
| `/api/Categories` | CRUD |
| `/api/Brands` | CRUD |
| `/api/Comments` | CRUD + onay sistemi |
| `/api/Banners` | CRUD |
| `/api/Company` | GET + PUT |
| `/api/Upload/image` | POST — max 5MB, jpg/png/gif/webp |

---

## 🗄️ Veritabanı Şeması

```
Companies ──┬── Users
            ├── Products ── Brands
            ├── Orders
            ├── Categories
            ├── Banners
            └── Comments
```

**Ana Tablolar:**

| Tablo | Önemli Alanlar |
|-------|----------------|
| Companies | Id, Name, Slug, Email, Phone, Address, LogoUrl |
| Users | Id, FullName, Email, PasswordHash, Role, CompanyId |
| Products | Id, Name, Price, Stock, Category, ImageUrl, BrandId, CompanyId |
| Orders | Id, UserName, TotalPrice, Status, PaymentMethod, CompanyId |
| Categories | Id, Name, CompanyId |
| Brands | Id, Name, CompanyId |
| Comments | Id, ProductId, UserId, Text, Rating, Status, CreatedAt |
| Banners | Id, Title, ImageUrl, Order, IsActive, Link, CompanyId |

---

## 🔐 Güvenlik Mimarisi

### JWT Kimlik Doğrulama
- Token içeriği: UserId, Email, Role, CompanyId
- Geçerlilik: 7 gün
- Algoritma: HmacSha256

### BCrypt Şifre Hashleme
- Şifreler veritabanında hiçbir zaman düz metin saklanmaz
- `BCrypt.Verify()` ile giriş doğrulaması
- Şifre değiştirmede mevcut şifre kontrolü yapılır

### Role-Based Authorization
| Rol | Yetki |
|-----|-------|
| Super Admin | Tüm şirketlerin verilerine erişir |
| Admin | Sadece kendi şirketini yönetir |
| Employee | Sınırlı yönetim |
| Customer | Sadece alışveriş |

### CORS Politikası
Sadece izinli portlardan istek kabul edilir:
- `http://localhost:4200`
- `http://localhost:4300`

---

## ✨ Özellikler Özeti

**Backend:**
- Multi-tenant mimari
- JWT + BCrypt güvenlik
- Şifre değiştirme (mevcut şifre doğrulamalı)
- Resim yükleme (5MB limit)
- Serilog loglama
- Global exception handler
- Swagger dokümantasyonu
- Sipariş oluşturulduğunda otomatik stok düşürme
- JSON circular reference koruması

**Frontend:**
- Lazy loading
- Auth Guard + Admin Guard
- HTTP Interceptor (token + company ID)
- Gelişmiş ürün filtreleme ve arama
- 3 ödeme yöntemi
- Kart numarası otomatik formatlama
- Ücretsiz kargo eşiği (500₺)
- Kupon kodu sistemi
- Sipariş içeriği geçmişi (ürün resim/isim)
- 4 adımlı kargo takip
- Banner slider yönetimi
- Yorum onay sistemi
- Logo yükleme (dosya/URL)

---

## 🔑 Test Hesapları

### Admin
```
E-posta : admin@nexus.com
Şifre   : 123456
URL     : http://localhost:4200
```

### Müşteri Kaydı
```
URL : http://localhost:4300/register
```

### Super Admin (Swagger ile)
```
POST /api/Auth/register-superadmin
Body: {
  "secretKey": "nexus_platform_2025",
  "fullName": "Super Admin",
  "email": "super@nexus.com",
  "password": "123456"
}
```

---

## 🔄 Migration Komutları

Entity değişikliklerinden sonra:

```bash
# NexusBackend klasöründen çalıştır
cd NexusBackend

dotnet ef migrations add <MigrationAdi> \
  --project Nexus.Data \
  --startup-project Nexus.API

dotnet ef database update \
  --project Nexus.Data \
  --startup-project Nexus.API
```

---

*Nexus E-Ticaret Platformu — Mustafa Ulu tarafından geliştirilmiştir.*