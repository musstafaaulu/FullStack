// src/environments/environment.ts  — Storefront (geliştirme)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5078/api',

  // Bu storefrontu hangi şirkete bağladığını belirtir
  // Interceptor her isteğe X-Company-Id: <companyId> header'ı ekler
  companyId: 1,

  storeInfo: {
    name: 'Ufuk Ayakkabı',
    tagline: 'Her adımda kalite',
    primaryColor: '#1e40af',
    logo: '',
  },

  appName: 'Nexus Store',
  version: '1.0.0'
};