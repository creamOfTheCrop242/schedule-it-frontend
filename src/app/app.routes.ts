import { Routes } from '@angular/router';
import { AuthContainerComponent } from './features/auth/containers/auth-container/auth-container.component';
import { LoginComponent } from './features/auth/containers/login/login.component';
import { RegisterComponent } from './features/auth/containers/register/register.component';
import { loginGuard } from './features/auth/guards/login.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthContainerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        title: 'Login',
        component: LoginComponent,
        canActivate: [loginGuard],
      },
      {
        path: 'register',
        title: 'Register',
        component: RegisterComponent,
        canActivate: [loginGuard],
      },
    ],
  },
];
