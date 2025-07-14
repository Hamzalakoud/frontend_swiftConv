import { Routes } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { authGuard } from './services/auth.guard';
import { loginGuard } from './services/login.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { RedirectGuard } from './services/redirect.guard';  // <-- import the new guard
import { UserViewerComponent } from './pages/user-viewer/user-viewer.component';

export const AppRoutes: Routes = [
  {
    path: '',
    canActivate: [RedirectGuard],   // <-- guard decides where to go
    component: SigninComponent       // this component won't actually render because guard redirects
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
        loadChildren: () =>
          import('./layouts/admin-layout/admin-layout.module').then(m => m.AdminLayoutModule),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'signin',
  }

];
