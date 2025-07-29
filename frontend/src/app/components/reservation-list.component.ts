import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../services/auth.service';
import { Reservation } from '../models/reservation.model';
import { Router } from '@angular/router';

/**
 * Fixed Reservation List Component - Properly Styled Navigation
 */
@Component({
  selector: 'app-reservation-list',
  template: `
    <div class="reservation-container">
      <!-- Top Navigation Bar -->
      <div class="top-navigation">
        <div class="nav-left">
          <h1 class="app-title">
            <span class="icon">🍽️</span>
            ReserveEase
          </h1>
        </div>
        <div class="nav-right">
          <span class="user-info">Welcome, {{ getCurrentUserName() }}!</span>
          <button (click)="logout()" class="logout-btn">
            <span class="btn-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h2 class="main-title">
            <span class="icon">📊</span>
            Reservation Dashboard
          </h2>
          <p class="subtitle">Manage your restaurant reservations with style</p>
        </div>
        
        <!-- Primary Action Button -->
        <div class="header-actions">
          <button (click)="createNewReservation()" class="create-btn">
            <span class="btn-icon">➕</span>
            Add New Reservation
          </button>
        </div>
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

      <!-- Empty State with Create Button -->
      <div *ngIf="!loading && !error && filteredReservations.length === 0" class="empty-state">
        <div class="empty-card">
          <span class="empty-icon">📅</span>
          <h3>No reservations found</h3>
          <p>{{ searchTerm || statusFilter ? 'Try adjusting your filters' : 'No reservations have been made yet' }}</p>
          <button *ngIf="!searchTerm && !statusFilter" (click)="createNewReservation()" class="create-btn-large">
            <span class="btn-icon">➕</span>
            Create Your First Reservation
          </button>
        </div>
      </div>

      <!-- Reservations Grid -->
      <div *ngIf="!loading && !error && filteredReservations.length > 0" class="reservations-grid">
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
            <div class="header-actions">
              <div class="status-badge" [ngClass]="reservation.status">
                {{ reservation.status | titlecase }}
              </div>
              <!-- Edit/Delete Buttons -->
              <div class="card-actions">
                <button (click)="editReservation(reservation)" class="action-btn edit-btn" title="Edit">
                  ✏️
                </button>
                <button (click)="deleteReservation(reservation)" class="action-btn delete-btn" title="Delete">
                  🗑️
                </button>
              </div>
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

      <!-- Quick Actions Footer -->
      <div class="quick-actions" *ngIf="!loading && !error">
        <button (click)="createNewReservation()" class="quick-action-btn">
          <span class="btn-icon">➕</span>
          New Reservation
        </button>
        <button (click)="loadReservations()" class="quick-action-btn">
          <span class="btn-icon">🔄</span>
          Refresh Data
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* TOP NAVIGATION STYLES */
    .top-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: rgba(33, 38, 45, 0.95);
      border-bottom: 2px solid rgba(88, 166, 255, 0.2);
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }

    .nav-left .app-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e6edf3;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .nav-left .icon {
      font-size: 1.8rem;
      animation: bounce 2s infinite;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-info {
      color: #8b949e;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #f85149, #da3633);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .logout-btn:hover {
      background: linear-gradient(135deg, #da3633, #f85149);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(248, 81, 73, 0.3);
    }

    .logout-btn .btn-icon {
      font-size: 1rem;
    }

    /* HEADER SECTION STYLES */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px;
      background: rgba(33, 38, 45, 0.5);
      border-radius: 15px;
      border: 1px solid rgba(88, 166, 255, 0.2);
    }

    .header-content {
      flex: 1;
    }

    .header-content .main-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #58a6ff, #a5f3fc, #34d399);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-content .subtitle {
      color: #8b949e;
      font-size: 1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .create-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 25px;
      background: linear-gradient(135deg, #238636, #2ea043);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
      box-shadow: 0 4px 15px rgba(46, 160, 67, 0.2);
    }

    .create-btn:hover {
      background: linear-gradient(135deg, #2ea043, #238636);
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(46, 160, 67, 0.4);
    }

    .create-btn .btn-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    .create-btn-large {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 30px;
      background: linear-gradient(135deg, #238636, #2ea043);
      border: none;
      border-radius: 15px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1.1rem;
      margin-top: 20px;
      box-shadow: 0 6px 20px rgba(46, 160, 67, 0.3);
    }

    .create-btn-large:hover {
      background: linear-gradient(135deg, #2ea043, #238636);
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(46, 160, 67, 0.5);
    }

    /* QUICK ACTIONS STYLES */
    .quick-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding: 30px 0;
      border-top: 1px solid rgba(139, 148, 158, 0.2);
      margin-top: 40px;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: rgba(88, 166, 255, 0.1);
      border: 2px solid rgba(88, 166, 255, 0.3);
      border-radius: 10px;
      color: #58a6ff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
    }

    .quick-action-btn:hover {
      background: rgba(88, 166, 255, 0.2);
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(88, 166, 255, 0.2);
    }

    .quick-action-btn .btn-icon {
      font-size: 1.1rem;
    }

    /* RESPONSIVE DESIGN */
    @media (max-width: 768px) {
      .top-navigation {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .nav-right {
        flex-direction: column;
        gap: 10px;
      }

      .header-section {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .header-content .main-title {
        font-size: 1.5rem;
        justify-content: center;
      }

      .quick-actions {
        flex-direction: column;
        align-items: center;
      }
    }

    @media (max-width: 480px) {
      .create-btn,
      .logout-btn {
        padding: 12px 18px;
        font-size: 0.9rem;
      }

      .user-info {
        font-size: 0.8rem;
      }
    }
  `],
  styleUrls: ['./reservation-list.component.css']
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  statusFilter = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) { }

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
   * Navigate to create new reservation
   */
  createNewReservation(): void {
    this.router.navigate(['/add-reservation']);
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
   * Edit reservation - navigate to form with data
   */
  editReservation(reservation: any): void {
    this.router.navigate(['/add-reservation'], { 
      queryParams: { 
        id: reservation.id,
        edit: 'true'
      }
    });
  }

  /**
   * Delete reservation with confirmation
   */
  deleteReservation(reservation: any): void {
    const confirmed = confirm(
      `Are you sure you want to delete the reservation for ${reservation.customer_name}?\n\n` +
      `Date: ${reservation.reservation_date}\n` +
      `Time: ${reservation.reservation_time}\n` +
      `Party: ${reservation.party_size} people\n\n` +
      `This action cannot be undone.`
    );

    if (confirmed) {
      this.reservationService.deleteReservation(reservation.id).subscribe({
        next: () => {
          console.log('Reservation deleted successfully');
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
          alert('Failed to delete reservation. Please try again.');
        }
      });
    }
  }

  /**
   * Get current user name
   */
  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.first_name} ${user.last_name}` : 'User';
  }

  /**
   * Logout user
   */
  logout(): void {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          // Even if logout fails on server, redirect to login
          this.router.navigate(['/login']);
        }
      });
    }
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