import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReservationListComponent } from './components/reservation-list.component';
import { ReservationFormComponent } from './components/reservation-form.component';

/**
 * Main application module
 * Configures all components, services, and imports needed for the app
 */
@NgModule({
  declarations: [
    AppComponent,                    // Main app component
    ReservationListComponent,        // Reservation list component
    ReservationFormComponent         // Add reservation form component
  ],
  imports: [
    BrowserModule,                   // Required for running in browser
    AppRoutingModule,                // Routing configuration
    HttpClientModule,                // For HTTP requests to PHP backend
    FormsModule                      // For two-way data binding (ngModel)
  ],
  providers: [],                     // Services are provided in root via @Injectable
  bootstrap: [AppComponent]          // Component to bootstrap when app starts
})
export class AppModule { }