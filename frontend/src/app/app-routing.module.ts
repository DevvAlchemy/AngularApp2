import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { ReservationListComponent } from './components/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form.component';
import { AuthGuard } from './guards/auth.guard';

/**
 * FIXED: Proper routing with dashboard as main protected route
 */
const routes: Routes = [
  // Public routes - NO AUTH GUARD
  { 
    path: 'login', 
    component: LoginComponent,
    data: { title: 'Login' }
  },
  { 
    path: 'signup', 
    component: SignupComponent,
    data: { title: 'Sign Up' }
  },
  
  // Protected routes - WITH AUTH GUARD
  { 
    path: 'dashboard', 
    component: ReservationListComponent,
    canActivate: [AuthGuard],
    data: { title: 'Dashboard' }
  },
  { 
    path: 'add-reservation', 
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Reservation' }
  },
  
  // IMPORTANT: Redirect authenticated users to dashboard, not login
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }