import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Reservation, ReservationResponse, NewReservation } from '../models/reservation.model';

/**
 * Service for handling reservation API operations
 * Manages all HTTP requests to the PHP backend
 */
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
 private apiUrl = 'http://127.0.0.1/AngularApp2/backend/api/endpoints/reservations.php';


  constructor(private http: HttpClient) { }

  /**
   * Get all reservations from the backend
   * @returns Observable<ReservationResponse> Array of reservations
   */
  getAllReservations(): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(this.apiUrl)
      .pipe(
        retry(2), // Retry failed requests twice
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific reservation by ID
   * @param id Reservation ID
   * @returns Observable<Reservation> Single reservation object
   */
  /**
 * Get single reservation by ID
 */
/**
 * Get single reservation by ID
 */
getReservationById(id: number): Observable<any> {
  const getUrl = 'http://localhost/AngularApp2/backend/get_reservation.php';
  return this.http.get(`${getUrl}?id=${id}`)
    .pipe(
      catchError(this.handleError)
    );
}

/**
 * Update existing reservation
 */
updateReservation(id: number, reservation: NewReservation): Observable<any> {
  const updateUrl = 'http://localhost/AngularApp2/backend/update_reservation.php';
  const headers = { 'Content-Type': 'application/json' };
  
  const data = { ...reservation, id: id };
  
  return this.http.put(updateUrl, data, { headers })
    .pipe(
      catchError(this.handleError)
    );
}

/**
 * Delete a reservation
 */
deleteReservation(id: number): Observable<any> {
  const deleteUrl = 'http://localhost/AngularApp2/backend/delete_reservation.php';
  return this.http.delete(`${deleteUrl}?id=${id}`)
    .pipe(
      catchError(this.handleError)
    );
}
 
 // Create a new reservation (simple version)

createReservation(reservation: NewReservation): Observable<any> {
  const headers = { 'Content-Type': 'application/json' };
  return this.http.post('http://localhost/AngularApp2/backend/create_reservation.php', reservation, { headers })
    .pipe(
      catchError(this.handleError)
    );
}

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   * @returns Observable with error message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      
      // Handle specific error cases
      switch (error.status) {
        case 404:
          errorMessage = 'Reservations not found. The database might be empty.';
          break;
        case 500:
          errorMessage = 'Internal server error. Check your backend configuration.';
          break;
        case 0:
          errorMessage = 'Cannot connect to server. Make sure XAMPP is running.';
          break;
      }
    }
    
    console.error('Reservation Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Format date for display
   * @param dateString Date string from backend
   * @returns Formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format time for display
   * @param timeString Time string from backend
   * @returns Formatted time string
   */
  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

/**
 * Delete a reservation (add to your existing service)
 * @param id Reservation ID to delete
 * @returns Observable<any> Success/error response
 */
// deleteReservation(id: number): Observable<any> {
//   const deleteUrl = 'http://localhost/AngularApp2/backend/delete_reservation.php';
//   return this.http.delete(`${deleteUrl}?id=${id}`)
//     .pipe(
//       catchError(this.handleError)
//     );
// }