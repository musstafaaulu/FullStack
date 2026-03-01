import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ana yönlendirme
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // PUBLIC ROUTES — lazy loaded
  {
    path: 'home',
    loadComponent: () => import('./home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register-company',
    loadComponent: () => import('./register-company/register-company').then(m => m.RegisterCompanyComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./product-detail/product-detail').then(m => m.ProductDetailComponent)
  },

  // PROTECTED ROUTES — giriş yapılmış olmalı
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./cart/cart').then(m => m.CartComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./profile/profile').then(m => m.ProfileComponent)
  },

  // ADMIN ROUTES — sadece Admin / Super Admin
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/admin').then(m => m.AdminComponent)
  },
  {
    path: 'admin/company-settings',
    canActivate: [authGuard],
    loadComponent: () => import('./company-settings/company-settings').then(m => m.CompanySettingsComponent)
  },

  // 404 — catch all
  { path: '**', redirectTo: '/home' }
];