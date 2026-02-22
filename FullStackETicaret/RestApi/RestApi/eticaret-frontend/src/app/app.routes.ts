import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';
import { LoginComponent } from './login.component';
import { HomeComponent } from './home/home';
import { CartComponent } from './cart/cart'; // Sepet sayfasını buraya ekledik

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cart', component: CartComponent }, // Sepet yolu tanımlandı
  
  // Site ilk açıldığında (localhost:4200) doğrudan HOME'a git
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  
  // Alakasız bir URL yazılırsa yine HOME'a gönder
  { path: '**', redirectTo: 'home' } 
];