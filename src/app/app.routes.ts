import { Routes } from '@angular/router';
import { AuthContainerComponent } from './features/auth/containers/auth-container/auth-container.component';
import { LoginComponent } from './features/auth/containers/login/login.component';
import { RegisterComponent } from './features/auth/containers/register/register.component';
import { DashboardContainerComponent } from './features/dashboard/containers/dashboard-container/dashboard-container.component';
import { SendVerifyCodeComponent } from './features/auth/components/send-verify-code/send-verify-code.component';
import { AddLogComponent } from './features/logs/components/add-log/add-log.component';
import { authGuard } from './features/auth/guards/auth.guard';
import { loginGuard } from './features/auth/guards/login.guard';
import { LogsContainerComponent } from './features/logs/containers/logs-container/logs-container.component';
import { LogDetailComponent } from './features/logs/components/log-detail/log-detail.component';
import { GoalsContainerComponent } from './features/goals/containers/goals-container/goals-container.component';
import { AddGoalComponent } from './features/goals/components/add-goal/add-goal.component';
import { SettingsComponent } from './features/account/components/settings/settings.component';
import { AddTaskComponent } from './features/tasks/components/add-task/add-task.component';
import { TasksContainerComponent } from './features/tasks/containers/tasks-container/tasks-container.component';
import { TaskDetailComponent } from './features/tasks/components/task-detail/task-detail.component';

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
    path: 'logs',
    canActivate: [authGuard],
    children: [
      { path: '', component: LogsContainerComponent },
      { path: 'log/:id', component: LogDetailComponent },
      { path: 'add-log', component: AddLogComponent },
      { path: 'edit-log/:id', component: AddLogComponent },
    ],
  },
  {
    path: 'goals',
    canActivate: [authGuard],
    children: [
      { path: '', component: GoalsContainerComponent },
      { path: 'add-goal', component: AddGoalComponent },
      { path: 'edit-goal/:id', component: AddGoalComponent },
    ],
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      { path: '', component: TasksContainerComponent },
      { path: 'add-task', component: AddTaskComponent },
      { path: ':id', component: TaskDetailComponent },
    ],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
  },
];
