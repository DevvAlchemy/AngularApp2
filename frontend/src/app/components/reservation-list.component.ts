import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation.service';
import { Reservation } from '../models/reservation.model';

/**
 * Component for displaying list of reservations
 * Features filtering, sorting, and responsive design
 */
@Component({
  selector: 'app-reservation-list',
  template: `
    <div class="reservation-container">
      <!-- Header Section -->
      <div class="header-section">
        <h1 class="main-title">
          <span class="icon">🍽️</span>
          Reservation Dashboard
        </h1>
        <p class="subtitle">Manage your restaurant reservations with style</p>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search by customer name or email..."
            [(ngModel)]="searchTerm"
            (input)="filterReservations()"
            class="search-input">
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-controls">
          <select [(ngModel)]="statusFilter" (change)="filterReservations()" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button (click)="loadReservations()" class="refresh-btn">
            <span class="btn-icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading reservations...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-card">
          <span class="error-icon">⚠️</span>
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button (click)="loadReservations()" class="retry-btn">Try Again</button>
        </div>
      </div>

      <!-- Reservations Grid -->
      <div *ngIf="!loading && !error" class="reservations-grid">
        <div *ngIf="filteredReservations.length === 0" class="empty-state">
          <div class="empty-card">
            <span class="empty-icon">📅</span>
            <h3>No reservations found</h3>
            <p>{{ searchTerm || statusFilter ? 'Try adjusting your filters' : 'No reservations have been made yet' }}</p>
          </div>
        </div>

        <div *ngFor="let reservation of filteredReservations; trackBy: trackByReservation" 
             class="reservation-card"
             [class.confirmed]="reservation.status === 'confirmed'"
             [class.pending]="reservation.status === 'pending'"
             [class.cancelled]="reservation.status === 'cancelled'">
          
          <!-- Card Header -->
          <div class="card-header">
            <div class="customer-info">
              <h3 class="customer-name">{{ reservation.customer_name }}</h3>
              <p class="customer-email">{{ reservation.customer_email }}</p>
            </div>
            <div class="status-badge" [ngClass]="reservation.status">
              {{ reservation.status | titlecase }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="reservation-details">
              <div class="detail-item">
                <span class="detail-icon">📅</span>
                <div class="detail-content">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">{{ formatDate(reservation.reservation_date) }}</span>
                </div>
              </div>

              <div class="detail-item">
                <span class="detail-icon">🕐</span>
                <div class="detail-content">
                  <span class="detail-label">Time</span>
                  <span class="detail-value">{{ formatTime(reservation.reservation_time) }}</span>
                </div>
              </div>

              <div class="detail-item">
                <span class="detail-icon">👥</span>
                <div class="detail-content">
                  <span class="detail-label">Party Size</span>
                  <span class="detail-value">{{ reservation.party_size }} {{ reservation.party_size === 1 ? 'person' : 'people' }}</span>
                </div>
              </div>

              <div *ngIf="reservation.customer_phone" class="detail-item">
                <span class="detail-icon">📞</span>
                <div class="detail-content">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{ reservation.customer_phone }}</span>
                </div>
              </div>
            </div>

            <div *ngIf="reservation.special_requests" class="special-requests">
              <span class="detail-icon">📝</span>
              <div class="detail-content">
                <span class="detail-label">Special Requests</span>
                <span class="detail-value">{{ reservation.special_requests }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <span class="created-date">
              Created: {{ formatDateTime(reservation.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div *ngIf="!loading && !error && reservations.length > 0" class="stats-section">
        <div class="stat-card">
          <span class="stat-number">{{ reservations.length }}</span>
          <span class="stat-label">Total Reservations</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ getStatusCount('confirmed') }}</span>
          <span class="stat-label">Confirmed</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ getStatusCount('pending') }}</span>
          <span class="stat-label">Pending</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ getStatusCount('cancelled') }}</span>
          <span class="stat-label">Cancelled</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = '';

  constructor(private reservationService: ReservationService) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  /**
   * Load reservations from the backend
   */
  loadReservations(): void {
    this.loading = true;
    this.error = null;

    this.reservationService.getAllReservations().subscribe({
      next: (response) => {
        this.reservations = response.records || [];
        this.filteredReservations = [...this.reservations];
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        this.reservations = [];
        this.filteredReservations = [];
      }
    });
  }

  /**
   * Filter reservations based on search term and status
   */
  filterReservations(): void {
    this.filteredReservations = this.reservations.filter(reservation => {
      const matchesSearch = !this.searchTerm || 
        reservation.customer_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reservation.customer_email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || reservation.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Format date using service
   */
  formatDate(dateString: string): string {
    return this.reservationService.formatDate(dateString);
  }

  /**
   * Format time using service
   */
  formatTime(timeString: string): string {
    return this.reservationService.formatTime(timeString);
  }

  /**
   * Format full date and time
   */
  formatDateTime(dateTimeString: string | undefined): string {
    if (!dateTimeString) {
      return 'Unknown';
    }
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  }

  /**
   * Get count of reservations by status
   */
  getStatusCount(status: string): number {
    return this.reservations.filter(r => r.status === status).length;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByReservation(index: number, reservation: Reservation): any {
    return reservation.id;
  }
}