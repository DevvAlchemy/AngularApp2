/**
 * Reservation model interface
 * Defines the structure of reservation objects used throughout the Angular app
 */

export interface Reservation {
  id?: number;                    // Optional for new reservations
  customer_name: string;          // Required customer name
  customer_email: string;         // Required customer email
  customer_phone?: string;        // Optional phone number
  reservation_date: string;       // Date in YYYY-MM-DD format
  reservation_time: string;       // Time in HH:MM:SS format
  party_size: number;            // Number of people in party
  special_requests?: string;      // Optional special requests
  status: 'pending' | 'confirmed' | 'cancelled';  // Reservation status
  created_at?: string;           // Timestamp of creation
  updated_at?: string;           // Timestamp of last update
}

/**
 * API response interface for multiple reservations
 */
export interface ReservationResponse {
  records: Reservation[];
}

/**
 * Form data interface for creating new reservations
 * Excludes auto-generated fields like id, timestamps
 */
export interface NewReservation {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}