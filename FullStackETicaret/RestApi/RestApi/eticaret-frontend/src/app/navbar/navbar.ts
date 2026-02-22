import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class NavbarComponent implements OnInit, DoCheck {
  cartCount: number = 0;
  currentUser: any = null;
  dropdownOpen: boolean = false;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.dataService.currentCartCount.subscribe((count: any) => {
      this.cartCount = count;
    });
    this.updateUser();
  }

  ngDoCheck() {
    this.updateUser();
  }

  updateUser() {
    // API'den gelen veriyi 'currentUser' altında saklamıştık
    const userJson = localStorage.getItem('currentUser');
    
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        // Eğer veri değiştiyse güncelle
        if (!this.currentUser || JSON.stringify(this.currentUser) !== JSON.stringify(parsedUser)) {
          this.currentUser = parsedUser;
        }
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.dropdownOpen = false;
    
    // TEMİZLİK OPERASYONU: Bütün anahtarları siliyoruz
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nexus_token'); // Bileti de iptal et
    localStorage.removeItem('user_role');
    
    this.currentUser = null;
    
    this.router.navigate(['/login']).then(() => {
      window.location.reload(); // Sayfayı tazele ki her şey sıfırlansın
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}