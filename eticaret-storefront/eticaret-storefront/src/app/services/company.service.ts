// eticaret-storefront/src/app/services/company.service.ts

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CompanyInfo {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  primaryColor?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private api = environment.apiUrl;

  // Şirket bilgisi — tüm component'lar buradan okur
  company = signal<CompanyInfo>({
    id: environment.companyId,
    name: environment.storeInfo.name,
    logoUrl: environment.storeInfo.logo,
    primaryColor: environment.storeInfo.primaryColor,
  });

  constructor(private http: HttpClient) {}

  // Uygulama başladığında çağrılır
  loadCompany() {
    this.http.get<any>(`${this.api}/Companies/current`).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data) {
          this.company.set({
            id: data.id,
            name: data.name || environment.storeInfo.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            website: data.website,
            logoUrl: data.logoUrl || environment.storeInfo.logo,
            primaryColor: data.primaryColor || environment.storeInfo.primaryColor,
            description: data.description,
          });
          // CSS değişkenini güncelle (tema rengi)
          if (data.primaryColor) {
            document.documentElement.style.setProperty('--primary', data.primaryColor);
          }
        }
      },
      error: () => {
        // API çalışmıyorsa environment'taki fallback değerler kalır
      }
    });
  }
}