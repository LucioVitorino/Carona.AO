import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { roleGuard } from './guards/role.guard';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/auth/login/login.page';
import { RegisterPage } from './pages/auth/register/register.page';
import { ForgotPasswordPage } from './pages/auth/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './pages/auth/reset-password/reset-password.page';
import { ShellLayout } from './layouts/shell.layout';
import { AdminDashboardPage } from './pages/admin/admin-dashboard.page';
import { PassengerDashboardPage } from './pages/passenger/passenger-dashboard.page';
import { DriverDashboardPage } from './pages/driver/driver-dashboard.page';

export const appRoutes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      { path: '', pathMatch: 'full', component: HomePage },
      { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
      {
        path: 'admin',
        component: AdminDashboardPage,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
      },
      {
        path: 'passageiro',
        component: PassengerDashboardPage,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['passenger'] },
      },
      {
        path: 'motorista',
        component: DriverDashboardPage,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['driver'] },
      },
    ],
  },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPage, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordPage, canActivate: [guestGuard] },
  { path: 'auth/login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'auth/register', redirectTo: 'register', pathMatch: 'full' },
  { path: 'auth/forgot-password', redirectTo: 'forgot-password', pathMatch: 'full' },
  { path: 'auth/reset-password', redirectTo: 'reset-password', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
