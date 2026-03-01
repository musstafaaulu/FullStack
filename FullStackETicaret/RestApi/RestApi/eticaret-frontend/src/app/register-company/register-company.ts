import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-register-company',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-company.html',
  styleUrls: ['./register-company.css']
})
export class RegisterCompanyComponent {

  step = 1;

  companyForm = {
    name: '',
    email: '',
    phone: '',
    address: '',
    website: ''
  };

  ownerForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMsg  = '';

  constructor(private dataService: DataService, private router: Router) {}

  nextStep() {
    if (!this.companyForm.name.trim() || !this.companyForm.email.trim()) {
      this.errorMsg = 'Şirket adı ve e-posta zorunludur.';
      return;
    }
    this.errorMsg = '';
    this.step = 2;
  }

  prevStep() {
    this.step = 1;
    this.errorMsg = '';
  }

  register() {
    this.errorMsg = '';

    if (!this.ownerForm.fullName.trim() || !this.ownerForm.email.trim() || !this.ownerForm.password) {
      this.errorMsg = 'Tüm alanlar zorunludur.';
      return;
    }
    if (this.ownerForm.password.length < 6) {
      this.errorMsg = 'Şifre en az 6 karakter olmalıdır.';
      return;
    }
    if (this.ownerForm.password !== this.ownerForm.confirmPassword) {
      this.errorMsg = 'Şifreler eşleşmiyor.';
      return;
    }

    this.isLoading = true;

    const payload = {
      companyName:    this.companyForm.name,
      companyEmail:   this.companyForm.email,
      companyPhone:   this.companyForm.phone,
      companyAddress: this.companyForm.address,
      companyWebsite: this.companyForm.website,
      ownerFullName:  this.ownerForm.fullName,
      ownerEmail:     this.ownerForm.email,
      ownerPassword:  this.ownerForm.password
    };

    // ✅ registerCompany() → /api/Auth/register-company
    this.dataService.registerCompany(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          this.step = 3;
        } else {
          this.errorMsg = res?.message || 'Kayıt başarısız.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'Bir hata oluştu, lütfen tekrar deneyin.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}