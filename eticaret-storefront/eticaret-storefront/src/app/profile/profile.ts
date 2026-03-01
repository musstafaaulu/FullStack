import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  activeTab: string = 'info';

  infoForm: any = { fullName: '', email: '' };
  infoSaving: boolean = false;
  infoSuccess: boolean = false;

  passwordForm: any = { current: '', newPass: '', confirm: '' };
  passwordSaving: boolean = false;
  passwordSuccess: boolean = false;
  passwordError: string = '';

  addresses: any[] = [];
  newAddress: any = { title: '', fullAddress: '', city: '', phone: '' };
  showAddressForm: boolean = false;

  orders: any[] = [];
  ordersLoading: boolean = false;
  selectedOrder: any = null;

  readonly statusSteps = ['Beklemede', 'Hazırlanıyor', 'Kargoda', 'Teslim Edildi'];

  constructor(private router: Router, private dataService: DataService) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) { this.router.navigate(['/login']); return; }
    this.currentUser = JSON.parse(savedUser);
    this.infoForm.fullName = this.currentUser.fullName || this.currentUser.name || '';
    this.infoForm.email = this.currentUser.email || '';
    this.loadAddresses();
    this.loadOrders();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.selectedOrder = null;
  }

  saveInfo() {
    if (!this.infoForm.fullName.trim()) return;
    this.infoSaving = true;
    setTimeout(() => {
      this.currentUser.fullName = this.infoForm.fullName;
      this.currentUser.email = this.infoForm.email;
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.infoSaving = false;
      this.infoSuccess = true;
      setTimeout(() => this.infoSuccess = false, 3000);
    }, 600);
  }

  changePassword() {
    this.passwordError   = '';
    this.passwordSuccess = false;

    // ── Validasyon ────────────────────────────────────────────────
    if (!this.passwordForm.current) {
      this.passwordError = 'Mevcut şifreyi gir.'; return;
    }
    if (this.passwordForm.newPass.length < 6) {
      this.passwordError = 'Yeni şifre en az 6 karakter olmalı.'; return;
    }
    if (this.passwordForm.newPass !== this.passwordForm.confirm) {
      this.passwordError = 'Şifreler eşleşmiyor.'; return;
    }

    this.passwordSaving = true;

    // ✅ Backend'e gerçek istek at
    this.dataService.changePassword(
  this.passwordForm.current,
  this.passwordForm.newPass
).subscribe({
      next: (res: any) => {
        this.passwordSaving = false;
        if (res?.success) {
          this.passwordSuccess = true;
          this.passwordForm = { current: '', newPass: '', confirm: '' };
          setTimeout(() => this.passwordSuccess = false, 3000);
        } else {
          this.passwordError = res?.message || 'Şifre güncellenemedi.';
        }
      },
      error: (err) => {
        this.passwordSaving = false;
        // Backend'den gelen hata mesajını göster (örn: "Mevcut şifre yanlış.")
        this.passwordError = err?.error?.message || 'Bir hata oluştu.';
      }
    });
  }

  loadAddresses() {
    const saved = localStorage.getItem('userAddresses_' + this.currentUser.email);
    this.addresses = saved ? JSON.parse(saved) : [];
  }

  saveAddress() {
    if (!this.newAddress.title || !this.newAddress.fullAddress || !this.newAddress.city) return;
    this.addresses.push({ ...this.newAddress, id: Date.now() });
    localStorage.setItem('userAddresses_' + this.currentUser.email, JSON.stringify(this.addresses));
    this.newAddress = { title: '', fullAddress: '', city: '', phone: '' };
    this.showAddressForm = false;
  }

  deleteAddress(id: number) {
    this.addresses = this.addresses.filter(a => a.id !== id);
    localStorage.setItem('userAddresses_' + this.currentUser.email, JSON.stringify(this.addresses));
  }

  loadOrders() {
    this.ordersLoading = true;
    this.dataService.getOrders().subscribe({
      next: (res: any) => {
        const raw = res?.data?.items ?? res?.data ?? res ?? [];
        const all: any[] = Array.isArray(raw) ? raw : [];
        this.orders = all.filter((o: any) =>
          o.userName === this.currentUser.fullName ||
          o.userName === this.currentUser.name ||
          o.userId === this.currentUser.id
        );
        this.ordersLoading = false;
      },
      error: () => { this.ordersLoading = false; }
    });
  }

  openOrder(order: any)  { this.selectedOrder = order; }
  closeOrder()           { this.selectedOrder = null;  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Teslim Edildi': return 'status-done';
      case 'Kargoda':       return 'status-shipping';
      case 'Hazırlanıyor':  return 'status-preparing';
      case 'İptal Edildi':  return 'status-cancel';
      default:              return 'status-pending';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'Teslim Edildi': return 'fa-check-circle';
      case 'Kargoda':       return 'fa-truck';
      case 'Hazırlanıyor':  return 'fa-box';
      case 'İptal Edildi':  return 'fa-times-circle';
      default:              return 'fa-clock';
    }
  }

  getStepIndex(status: string): number  { return this.statusSteps.indexOf(status); }

  isStepDone(stepIndex: number, currentStatus: string): boolean {
    if (currentStatus === 'İptal Edildi') return false;
    return stepIndex <= this.getStepIndex(currentStatus);
  }

  isStepActive(stepIndex: number, currentStatus: string): boolean {
    return stepIndex === this.getStepIndex(currentStatus);
  }

  getStepIcon(step: string): string {
    switch(step) {
      case 'Beklemede':     return 'fa-clock';
      case 'Hazırlanıyor':  return 'fa-box';
      case 'Kargoda':       return 'fa-truck';
      case 'Teslim Edildi': return 'fa-check';
      default:              return 'fa-circle';
    }
  }

  logout() {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  get initials(): string {
    const name = this.currentUser?.fullName || this.currentUser?.name || 'K';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get orderStats() {
    return {
      total:    this.orders.length,
      pending:  this.orders.filter(o => o.status === 'Beklemede' || o.status === 'Hazırlanıyor').length,
      shipping: this.orders.filter(o => o.status === 'Kargoda').length,
      done:     this.orders.filter(o => o.status === 'Teslim Edildi').length,
    };
  }
}