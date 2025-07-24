import { Routes } from '@angular/router';
import { AuthContainerComponent } from './features/auth/containers/auth-container/auth-container.component';
import { LoginComponent } from './features/auth/containers/login/login.component';
import { RegisterComponent } from './features/auth/containers/register/register.component';
import { DashboardContainerComponent } from './features/dashboard/containers/dashboard-container/dashboard-container.component';
import { SendVerifyCodeComponent } from './features/auth/components/send-verify-code/send-verify-code.component';
import { AddTaskComponent } from './features/tasks/components/add-task/add-task.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { loginGuard } from './features/auth/guards/login.guard';
import { TasksComponent } from './features/tasks/components/tasks/tasks.component';
import { TasksContainerComponent } from './features/tasks/containers/tasks-container/tasks-container.component';

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
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      { path: '', component: TasksContainerComponent },
      { path: 'add-task', component: AddTaskComponent },
    ],
  },
];
