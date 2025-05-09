import { Routes } from '@angular/router';
import { AuthContainerComponent } from './features/auth/containers/auth-container/auth-container.component';
import { LoginComponent } from './features/auth/containers/login/login.component';
import { RegisterComponent } from './features/auth/containers/register/register.component';
import { DashboardContainerComponent } from './features/dashboard/containers/dashboard-container/dashboard-container.component';
import { SendVerifyCodeComponent } from './features/auth/components/send-verify-code/send-verify-code.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { loginGuard } from './features/auth/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
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
        children: [
          {
            path: 'create-user',
            component: RegisterComponent,
            canActivate: [loginGuard],
          },
          {
            path: 'send-verify-code',
            component: SendVerifyCodeComponent,
            canActivate: [loginGuard],
          },
        ],
      },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardContainerComponent,
    canActivate: [authGuard],
  },
];
