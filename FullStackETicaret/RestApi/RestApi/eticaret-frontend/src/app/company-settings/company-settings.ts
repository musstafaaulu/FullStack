import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-settings.html',
  styleUrls: ['./company-settings.css']
})
export class CompanySettingsComponent implements OnInit {

  company: any = { name: '', email: '', phone: '', address: '', logoUrl: '' };

  isLoading   = false;
  isSaving    = false;
  isUploading = false;
  successMsg  = '';
  errorMsg    = '';
  logoPreview = '';

  private readonly API = 'http://localhost:5078/api';

  constructor(private dataService: DataService, private http: HttpClient) {}

  ngOnInit() { this.loadCompany(); }

  loadCompany() {
    this.isLoading = true;
    this.dataService.getCompany().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          this.company     = { ...res.data };
          this.logoPreview = res.data.logoUrl || '';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMsg  = 'Şirket bilgileri yüklenemedi.';
      }
    });
  }

  onLogoUrlChange() {
    this.logoPreview = this.company.logoUrl;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) return;

    // Boyut kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMsg = "Dosya 5MB'dan büyük olamaz.";
      return;
    }

    // Anlık önizleme — yükleme bitmeden göster
    const reader = new FileReader();
    reader.onload = (e: any) => { this.logoPreview = e.target.result; };
    reader.readAsDataURL(file);

    this.isUploading = true;
    this.errorMsg    = '';

    // ✅ FormData — interceptor'dan bağımsız HttpClient ile gönder
    // Interceptor Content-Type set ederse FormData boundary bozulur.
    // Bu yüzden token'ı manuel ekliyoruz.
    const formData = new FormData();
    formData.append('file', file);

    const token     = localStorage.getItem('nexus_token') || '';
    const companyId = this.getCompanyId();

    this.http.post(`${this.API}/Upload/image`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Company-Id': String(companyId)
        // Content-Type YOK — FormData için tarayıcı otomatik boundary ekler
      }
    }).subscribe({
      next: (res: any) => {
        this.isUploading = false;
        console.log('Upload yanıtı:', res);

        const uploadedUrl = res?.url || res?.data?.url || '';
        if (uploadedUrl) {
          this.company.logoUrl = uploadedUrl.startsWith('http')
            ? uploadedUrl
            : `http://localhost:5078${uploadedUrl}`;
          this.logoPreview = this.company.logoUrl;
          this.successMsg  = 'Logo yüklendi! Kaydetmeyi unutmayın.';
          setTimeout(() => this.successMsg = '', 3000);
        } else {
          this.errorMsg = 'Sunucu URL döndürmedi.';
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Upload hatası:', err);
        // Hata mesajını göster — "Logo yüklenemedi." yerine gerçek hata
        this.errorMsg = err?.error?.message
          || `Hata ${err.status}: ${err.statusText || 'Bilinmiyor'}`;
      }
    });
  }

  save() {
    this.successMsg = '';
    this.errorMsg   = '';

    if (!this.company.name?.trim()) {
      this.errorMsg = 'Şirket adı boş olamaz.';
      return;
    }

    this.isSaving = true;

    this.dataService.updateCompany({
      name:    this.company.name,
      email:   this.company.email,
      phone:   this.company.phone,
      address: this.company.address,
      logoUrl: this.company.logoUrl
    }).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res?.success) {
          this.successMsg = 'Şirket bilgileri başarıyla güncellendi!';
          setTimeout(() => this.successMsg = '', 3000);
        } else {
          this.errorMsg = res?.message || 'Güncelleme başarısız.';
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err?.error?.message || 'Bir hata oluştu.';
      }
    });
  }

  private getCompanyId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user?.companyId || user?.CompanyId || 0;
    } catch { return 0; }
  }
}