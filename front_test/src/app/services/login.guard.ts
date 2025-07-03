import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const loginGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Redirect logged-in users away from sign-in page to dashboard
    return router.parseUrl('/dashboard');
  }
  return true; // Allow unauthenticated users to continue to sign-in
};
