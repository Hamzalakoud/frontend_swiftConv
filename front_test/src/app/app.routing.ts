import { Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { authGuard } from './services/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { loginGuard } from './services/login.guard';

export const AppRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: localStorage.getItem('authToken') ? 'dashboard' : 'signin'
  },
  {
    path: 'signin',
    component: SigninComponent,
    canActivate: [loginGuard]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'signin',
  }
];
