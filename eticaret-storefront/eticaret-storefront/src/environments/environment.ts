// src/environments/environment.ts  (Storefront — Ufuk Ayakkabı)
// Her storefront için sadece companyId ve storeInfo değişir

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5078/api',

  // ✅ Bu storefrontu hangi şirkete ait olduğunu belirtir
  // API'ye her istekte X-Company-Id: 1 header'ı gönderilir
  companyId: 13,

  // Mağaza bilgileri (API'den de çekilebilir, fallback olarak burada durur)
  storeInfo: {
    name: 'Ufuk Ayakkabı',
    tagline: 'Her adımda kalite',
    primaryColor: '#1e40af',   // Mağazanın ana rengi
    logo: '',                   // API'den gelecek, boş bırak
  },

  appName: 'Nexus Store',
  version: '1.0.0'
};