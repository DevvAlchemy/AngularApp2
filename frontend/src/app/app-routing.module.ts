import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationListComponent } from './components/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form.component';

/**
 * Application routing configuration
 * Defines which component loads for each URL path
 */
const routes: Routes = [
  { 
    path: '', 
    component: ReservationListComponent
  },
  { 
    path: 'add-reservation', 
    component: ReservationFormComponent
  },
  { 
    path: '**', 
    redirectTo: '' 
  } // Wildcard route - redirect any unknown paths to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
