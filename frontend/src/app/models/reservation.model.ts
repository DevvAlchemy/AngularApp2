/**
 * Reservation model interface
 * Defines the structure of reservation objects used throughout the Angular app
 */
/**
 * Reservation model interface
 */
export interface Reservation {
  id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

/**
 * API response interface for multiple reservations
 */
export interface ReservationResponse {
  records: Reservation[];
}

/**
 * Form data interface for creating new reservations
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