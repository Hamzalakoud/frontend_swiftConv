import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (localStorage.getItem('authToken')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/signin']);
    }
    return false;  // Prevents loading the current route
  }
}
