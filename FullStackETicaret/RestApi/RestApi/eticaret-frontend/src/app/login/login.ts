import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { emailValidator, passwordStrengthValidator } from '../validators/custom.validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  mode: 'login' | 'register-customer' | 'register-company' = 'login';

  isLoading = false;
  errorMsg = '';
  successMsg = '';

  loginObj = { email: '', password: '' };
  customerObj = { name: '', email: '', password: '', confirmPassword: '' };
  registerObj = { companyName: '', name: '', email: '', password: '' };

  // ✅ Validator fonksiyonları
  private emailValidatorFn = emailValidator();
  private passwordValidatorFn = passwordStrengthValidator();

  constructor(private dataService: DataService, private router: Router) {}

  setMode(m: 'login' | 'register-customer' | 'register-company') {
    this.mode = m;
    this.errorMsg = '';
    this.successMsg = '';
  }

  onLogin() {
    this.errorMsg = '';

    // ✅ Email format kontrolü
    const emailError = this.emailValidatorFn({ value: this.loginObj.email } as any);
    if (emailError) { this.errorMsg = emailError['invalidEmail'].message; return; }

    if (!this.loginObj.password) {
      this.errorMsg = 'Şifre zorunludur.'; return;
    }

    this.isLoading = true;
    this.dataService.login(this.loginObj).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          const user = res.data;
          localStorage.setItem('nexus_token', user.token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/home']);
        } else {
          this.errorMsg = res?.message || 'Giriş başarısız.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'E-posta veya şifre hatalı.';
      }
    });
  }

  onCustomerRegister() {
    this.errorMsg = '';

    if (!this.customerObj.name) {
      this.errorMsg = 'Ad Soyad zorunludur.'; return;
    }

    // ✅ Email format kontrolü
    const emailError = this.emailValidatorFn({ value: this.customerObj.email } as any);
    if (emailError) { this.errorMsg = emailError['invalidEmail'].message; return; }

    // ✅ Şifre güç kontrolü
    const passError = this.passwordValidatorFn({ value: this.customerObj.password } as any);
    if (passError) { this.errorMsg = passError['weakPassword'].message; return; }

    if (this.customerObj.password !== this.customerObj.confirmPassword) {
      this.errorMsg = 'Şifreler eşleşmiyor.'; return;
    }

    this.isLoading = true;
    this.dataService.registerCustomer({
      fullName: this.customerObj.name,
      email: this.customerObj.email,
      password: this.customerObj.password
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success) {
          this.successMsg = 'Hesabınız oluşturuldu! Giriş yapabilirsiniz.';
          this.loginObj.email = this.customerObj.email;
          this.mode = 'login';
        } else {
          this.errorMsg = res?.message || 'Kayıt başarısız.';
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMsg = err?.error?.message || 'Kayıt sırasında hata oluştu.';
      }
    });
  }

  onRegister() {
    window.open('http://localhost:4200/register-company', '_blank');
  }
}