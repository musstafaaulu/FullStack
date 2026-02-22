import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  isLoginMode: boolean = true; 

  // Giriş için kullanılan nesne
  loginObj: any = { 
    email: '', 
    password: '' 
  };

  // Kayıt için kullanılan nesne
  registerObj: any = { 
    name: '', 
    email: '', 
    password: '', 
    role: 'User' 
  };

  constructor(private router: Router, private dataService: DataService) {} 

  ngOnInit() {
    // Eğer zaten bilet varsa direkt anasayfaya at
    const token = localStorage.getItem('nexus_token');
    if (token) {
      this.router.navigate(['/home']);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onRegister() {
    const apiData = {
      fullName: this.registerObj.name,
      email: this.registerObj.email,
      password: this.registerObj.password,
      role: this.registerObj.role
    };

    this.dataService.register(apiData).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Kayıt başarılı! Şimdi giriş yapabilirsin.');
          this.isLoginMode = true;
        }
      },
      error: (err: any) => {
        console.error("Kayıt Hatası:", err);
        alert('Kayıt sırasında bir sorun oluştu.');
      }
    });
  }

  onLogin() {
  this.dataService.login(this.loginObj).subscribe({
    next: (res: any) => {
      // API'den dönen pakette token varsa:
      if (res.success && res.data && res.data.token) {
        // İSMİ SABİTLEYELİM: 'nexus_token'
        localStorage.setItem('nexus_token', res.data.token);
        localStorage.setItem('currentUser', JSON.stringify(res.data));
        
        console.log("Bilet cebimize girdi!", res.data.token);
        alert(`Hoş geldin ${res.data.fullName}!`);
        this.router.navigate(['/home']).then(() => window.location.reload());
      }
    },
    error: (err) => alert('Giriş başarısız!')
  });
}
}