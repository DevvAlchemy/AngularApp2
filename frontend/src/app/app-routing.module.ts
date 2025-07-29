import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { SignupComponent } from './components/signup.component';
import { ReservationListComponent } from './components/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form.component';
import { AuthGuard } from './guards/auth.guard';

/**
 * RESTORED: Proper routing with AuthGuard for protected routes
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
    path: 'reservations', 
    component: ReservationListComponent,
    canActivate: [AuthGuard],
    data: { title: 'Reservations' }
  },
  { 
    path: 'add-reservation', 
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add Reservation' }
  },
  { 
    path: 'edit-reservation', 
    component: ReservationFormComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Reservation' }
  },
  
  // Default redirects
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Disable for production
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }