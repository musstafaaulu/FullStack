import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="display:flex; justify-content:center; align-items:center; height:100vh; background:#1e1e2f; color:white; font-family:sans-serif;">
      <div style="background:#2b2b40; padding:40px; border-radius:20px; text-align:center; width:350px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        
        <h2 style="color:#6366f1; margin-bottom:5px;">NEXUS CORE</h2>
        <p style="margin-bottom:25px; opacity:0.8;">{{ isLoginMode ? 'Giriş Yap' : 'Yeni Hesap Oluştur' }}</p>
        
        <input *ngIf="!isLoginMode" type="text" [(ngModel)]="fullName" placeholder="Ad Soyad" 
               style="width:100%; padding:14px; margin:10px 0; border-radius:8px; border:2px solid #3f3f5f; background:#fff; color:#333; font-size:16px; outline:none; box-sizing:border-box;">
        
        <input type="email" [(ngModel)]="email" placeholder="E-posta" 
               style="width:100%; padding:14px; margin:10px 0; border-radius:8px; border:2px solid #3f3f5f; background:#fff; color:#333; font-size:16px; outline:none; box-sizing:border-box;">
        
        <input type="password" [(ngModel)]="password" placeholder="Şifre" 
               style="width:100%; padding:14px; margin:10px 0; border-radius:8px; border:2px solid #3f3f5f; background:#fff; color:#333; font-size:16px; outline:none; box-sizing:border-box;">

        <button (click)="submit()" 
                style="width:100%; padding:14px; background:#6366f1; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:15px; font-size:16px; transition:0.3s; text-transform:uppercase; letter-spacing:1px;">
          {{ isLoginMode ? 'GİRİŞ YAP' : 'KAYIT OL' }}
        </button>
        
        <p style="margin-top:25px; font-size:14px;">
          {{ isLoginMode ? 'Hesabın yok mu?' : 'Zaten üye misin?' }}
          <a (click)="toggleMode()" style="color:#6366f1; cursor:pointer; font-weight:bold; text-decoration:none; margin-left:5px; border-bottom:1px solid #6366f1;">
            {{ isLoginMode ? 'Hesap Oluştur' : 'Giriş Yap' }}
          </a>
        </p>

      </div>
    </div>
  `
})
export class LoginComponent {
  isLoginMode: boolean = true;
  fullName: string = '';
  email: string = '';
  password: string = '';

  registeredUsers: any[] = [
    { email: 'mustafa@admin.com', password: '123456', name: 'Mustafa Ulu', role: 'Super Admin' },
    { email: 'sanem@admin.com', password: '12345', name: 'Sanem Ulu', role: 'Operations Admin' },
    { email: 'yilmaz@admin.com', password: '12345', name: 'Yılmaz Ulu', role: 'Sales Admin' },
    { email: 'can@admin.com', password: '12345', name: 'Can Ulu', role: 'Content Admin' }
  ];

  constructor(private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.email = '';
    this.password = '';
    this.fullName = '';
  }

  submit() {
    if (this.isLoginMode) {
      const userFound = this.registeredUsers.find(
        u => u.email === this.email && u.password === this.password
      );

      if (userFound) {
        localStorage.setItem('currentUser', JSON.stringify(userFound));
        alert(`Giriş Başarılı! Hoş geldin ${userFound.name}`);

        if (userFound.role === 'Super Admin' || userFound.role.includes('Admin')) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        alert("Hata: E-posta veya şifre geçersiz!");
      }
    } else {
      if (this.fullName && this.email && this.password) {
        const newUser = {
          name: this.fullName,
          email: this.email,
          password: this.password,
          role: 'user'
        };
        this.registeredUsers.push(newUser);
        alert(`Tebrikler ${this.fullName}! Hesabın oluşturuldu.`);
        this.isLoginMode = true;
      } else {
        alert("Lütfen tüm alanları doldur!");
      }
    }
  }
}