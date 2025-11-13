import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // ✅ PÚBLICAS - Sin protección (Guest puede ver)
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'accessories',
    loadComponent: () => import('./pages/accessories/accessories.page').then(m => m.AccessoriesPage),
  },
  {
    path: 'jackets',
    loadComponent: () => import('./pages/jackets/jackets.page').then(m => m.JacketsPage),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },

  // ✅ USUARIO AUTENTICADO
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'shopcart',
    loadComponent: () => import('./components/Shopcart/shopcart').then(m => m.ShopcartPage),
    canActivate: [authGuard]
  },

  // ✅ SOLO ADMIN
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
    canActivate: [adminGuard]
  },
  /*{    FIXEAR PARA ENTREGA 3 GENERA WARNING PERO EJECUTA IGUAL YA QUE NO ESTA POR AHORA
    path: 'admin/admin-users',
    loadComponent: () => import('./pages/admin/admin-users/admin-users.page').then(m => m.AdminUsersPage),
    canActivate: [adminGuard]
  },
  */
  // ✅ AUTENTICACIÓN (SIN GUARD - ACCESO LIBRE)
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },

  // ✅ RUTA POR DEFECTO - REDIRIGE A LOGIN
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
