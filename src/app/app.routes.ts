import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { ContactComponent } from './pages/contact/contact.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'category/:type', component: HomeComponent },
  { path: 'collection', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'suivi', redirectTo: 'contact', pathMatch: 'full' },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  { path: '**', redirectTo: '' }
];
