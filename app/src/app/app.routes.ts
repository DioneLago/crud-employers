import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { EmployersListComponent } from './pages/employers-list/employers-list.component';
import { EmployerFormComponent } from './pages/employer-form/employer-form.component';
import { EmployerDetailComponent } from './pages/employer-detail/employer-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'employers', component: EmployersListComponent, canActivate: [authGuard] },
  { path: 'employers/new', component: EmployerFormComponent, canActivate: [authGuard] },
  { path: 'employers/:id/edit', component: EmployerFormComponent, canActivate: [authGuard] },
  { path: 'employers/:id', component: EmployerDetailComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'employers', pathMatch: 'full' },
  { path: '**', redirectTo: 'employers' },
];
