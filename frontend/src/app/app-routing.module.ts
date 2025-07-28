import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { ReservationListComponent } from './components/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form.component';
import { AuthGuard } from './guards/auth.guard';

/**
 * Application routing configuration with authentication
 */
const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Protected routes (require authentication)
  { 
    path: 'dashboard', 
    component: ReservationListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'add-reservation', 
    component: ReservationFormComponent,
    canActivate: [AuthGuard]
  },
  
  // Redirect routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }