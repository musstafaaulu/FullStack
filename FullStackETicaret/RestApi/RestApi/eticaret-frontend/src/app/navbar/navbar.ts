import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

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

  constructor(public router: Router) {}

  // ✅ Admin sayfasında navbar'ı gizle
  get isAdminPage(): boolean {
    return this.router.url.startsWith('/admin');
  }

  ngOnInit() {
    this.updateState();
  }

  ngDoCheck() {
    this.updateState();
  }

  updateState() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        if (!this.currentUser || JSON.stringify(this.currentUser) !== JSON.stringify(parsedUser)) {
          this.currentUser = parsedUser;
        }
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      this.currentUser = null;
    }

    const cartJson = localStorage.getItem('cart');
    const cart = cartJson ? JSON.parse(cartJson) : [];
    const currentCount = cart.reduce((acc: any, item: any) => acc + item.quantity, 0);
    if (this.cartCount !== currentCount) {
      this.cartCount = currentCount;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.dropdownOpen = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('user_role');
    this.currentUser = null;
    this.cartCount = 0;
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}