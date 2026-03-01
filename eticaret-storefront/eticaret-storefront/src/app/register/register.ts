import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  fullName = '';
  email    = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMsg  = '';
  successMsg = '';

  constructor(private dataService: DataService, private router: Router) {}

  onRegister() {
    if (!this.fullName.trim()) { this.errorMsg = 'Ad Soyad zorunlu!'; return; }
    if (!this.email.trim())    { this.errorMsg = 'E-posta zorunlu!';  return; }
    if (this.password.length < 6) { this.errorMsg = 'Şifre en az 6 karakter olmalı!'; return; }
    if (this.password !== this.confirmPassword) { this.errorMsg = 'Şifreler eşleşmiyor!'; return; }

    this.isLoading = true;
    this.errorMsg  = '';

    // ✅ registerCustomer — storefront müşteri kaydı
    // Interceptor X-Company-Id header'ını otomatik ekler
    this.dataService.registerCustomer({
      fullName: this.fullName,
      email:    this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading  = false;
        this.successMsg = 'Hesabınız oluşturuldu! Giriş yapabilirsiniz.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg  = err?.error?.message || 'Kayıt sırasında hata oluştu.';
      }
    });
  }
}