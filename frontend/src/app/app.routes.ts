import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { HomePage } from './pages/home/home.page';
import { LoginPage } from './pages/login/login.page';
import { ShellLayout } from './layouts/shell.layout';

export const appRoutes: Routes = [
  {
    path: '',
    component: ShellLayout,
    children: [
      { path: '', pathMatch: 'full', component: HomePage },
      { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
    ],
  },
  { path: 'login', component: LoginPage },
  { path: '**', redirectTo: '' },
];
