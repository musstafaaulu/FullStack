import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token   = localStorage.getItem('nexus_token');
  const userStr = localStorage.getItem('currentUser');

  if (!token || !userStr) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    const role = user?.role;

    // Admin sayfasına sadece Admin veya Super Admin girebilir
    if (state.url.startsWith('/admin')) {
      if (role !== 'Admin' && role !== 'Super Admin') {
        router.navigate(['/home']);
        return false;
      }
    }

    return true;
  } catch {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('currentUser');
    router.navigate(['/login']);
    return false;
  }
};