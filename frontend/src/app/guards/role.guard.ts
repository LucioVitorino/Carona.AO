import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthUser } from '../core/models/auth.models';
import { AuthService } from '../core/services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  const roles = (route.data['roles'] ?? []) as AuthUser['role'][];

  if (!auth.isAuthenticated() || !user) {
    return router.createUrlTree(['/login']);
  }

  if (roles.length === 0 || roles.includes(user.role) || user.role === 'admin') {
    return true;
  }

  return router.createUrlTree([auth.getDashboardUrl(user)]);
};
