import { Routes } from '@angular/router';
import { AuthContainerComponent } from './features/auth/containers/auth-container/auth-container.component';
import { LoginComponent } from './features/auth/containers/login/login.component';
import { RegisterComponent } from './features/auth/containers/register/register.component';
import { DashboardContainerComponent } from './features/dashboard/containers/dashboard-container/dashboard-container.component';
import { DailyMotivationPageComponent } from './features/dashboard/components/daily-motivation-page/daily-motivation-page.component';
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
import { HabitsContainerComponent } from './features/habits/containers/habits-container/habits-container.component';
import { AddHabitComponent } from './features/habits/components/add-habit/add-habit.component';
import { HabitDetailComponent } from './features/habits/components/habit-detail/habit-detail.component';
import { PersonalGoalsContainerComponent } from './features/personal-goals/containers/personal-goals-container/personal-goals-container.component';
import { AddPersonalGoalComponent } from './features/personal-goals/components/add-personal-goal/add-personal-goal.component';
import { HelpPageComponent } from './features/help/help-page/help-page.component';
import { FeedbackFormComponent } from './features/feedback/components/feedback-form/feedback-form.component';
import { FeedbackInboxComponent } from './features/feedback/components/feedback-inbox/feedback-inbox.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'help',
    title: 'Help',
    component: HelpPageComponent,
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
    path: 'daily-motivation',
    title: 'Story of the day',
    component: DailyMotivationPageComponent,
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
    path: 'habits',
    canActivate: [authGuard],
    children: [
      { path: '', component: HabitsContainerComponent },
      { path: 'add-habit', component: AddHabitComponent },
      { path: 'edit-habit/:id', component: AddHabitComponent },
      { path: ':id', component: HabitDetailComponent },
    ],
  },
  {
    path: 'personal-goals',
    canActivate: [authGuard],
    children: [
      { path: '', title: 'Personal goals', component: PersonalGoalsContainerComponent },
      { path: 'add-personal-goal', title: 'Create personal goal', component: AddPersonalGoalComponent },
      {
        path: 'edit-personal-goal/:id',
        title: 'Edit personal goal',
        component: AddPersonalGoalComponent,
      },
    ],
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      { path: '', component: TasksContainerComponent },
      { path: 'add-task', component: AddTaskComponent },
      { path: 'edit-task/:id', component: AddTaskComponent },
      { path: ':id', component: TaskDetailComponent },
    ],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'feedback/inbox',
    title: 'Feedback inbox',
    component: FeedbackInboxComponent,
    canActivate: [authGuard],
  },
  {
    path: 'feedback',
    title: 'Send feedback',
    component: FeedbackFormComponent,
    canActivate: [authGuard],
  },
];
