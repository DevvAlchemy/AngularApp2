import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { NewReservation } from '../models/reservation.model';

/**
 * Fixed Reservation Form Component - Proper Dashboard Navigation
 */
@Component({
  selector: 'app-reservation-form',
  template: `
    <div class="form-container">
      <!-- Header Section -->
      <div class="form-header">
        <button (click)="goBack()" class="back-btn">
          <span class="back-icon">←</span>
          Back to Dashboard
        </button>
        
        <div class="form-title-section">
          <h1 class="form-title">
            <span class="title-icon">{{ isEditMode ? '✏️' : '➕' }}</span>
            {{ isEditMode ? 'Edit Reservation' : 'Add New Reservation' }}
          </h1>
          <p class="form-subtitle">{{ isEditMode ? 'Update reservation details' : 'Create a new restaurant reservation' }}</p>
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <form class="reservation-form" (ngSubmit)="onSubmit()" #reservationForm="ngForm">
          
          <!-- Loading State -->
          <div *ngIf="loading" class="form-loading">
            <div class="spinner"></div>
            <p>{{ isEditMode ? 'Updating reservation...' : 'Creating reservation...' }}</p>
          </div>

          <!-- Form Fields -->
          <div *ngIf="!loading">
            <!-- Customer Information Section -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="section-icon">👤</span>
                Customer Information
              </h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="customerName" class="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    id="customerName" 
                    class="form-input"
                    [(ngModel)]="formData.customer_name"
                    name="customerName"
                    placeholder="Enter customer's full name"
                    required>
                </div>

                <div class="form-group">
                  <label for="customerEmail" class="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    id="customerEmail" 
                    class="form-input"
                    [(ngModel)]="formData.customer_email"
                    name="customerEmail"
                    placeholder="customer@example.com"
                    required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="customerPhone" class="form-label">Phone Number</label>
                  <input 
                    type="tel" 
                    id="customerPhone" 
                    class="form-input"
                    [(ngModel)]="formData.customer_phone"
                    name="customerPhone"
                    placeholder="(555) 123-4567">
                </div>

                <div class="form-group">
                  <label for="partySize" class="form-label">Party Size *</label>
                  <select 
                    id="partySize" 
                    class="form-select"
                    [(ngModel)]="formData.party_size"
                    name="partySize"
                    required>
                    <option value="">Select party size</option>
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4">4 People</option>
                    <option value="5">5 People</option>
                    <option value="6">6 People</option>
                    <option value="7">7 People</option>
                    <option value="8">8 People</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Reservation Details Section -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="section-icon">📅</span>
                Reservation Details
              </h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="reservationDate" class="form-label">Reservation Date *</label>
                  <input 
                    type="date" 
                    id="reservationDate" 
                    class="form-input"
                    [(ngModel)]="formData.reservation_date"
                    name="reservationDate"
                    required>
                </div>

                <div class="form-group">
                  <label for="reservationTime" class="form-label">Reservation Time *</label>
                  <select 
                    id="reservationTime" 
                    class="form-select"
                    [(ngModel)]="formData.reservation_time"
                    name="reservationTime"
                    required>
                    <option value="">Select time</option>
                    <option value="17:00:00">5:00 PM</option>
                    <option value="17:30:00">5:30 PM</option>
                    <option value="18:00:00">6:00 PM</option>
                    <option value="18:30:00">6:30 PM</option>
                    <option value="19:00:00">7:00 PM</option>
                    <option value="19:30:00">7:30 PM</option>
                    <option value="20:00:00">8:00 PM</option>
                    <option value="20:30:00">8:30 PM</option>
                    <option value="21:00:00">9:00 PM</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label for="status" class="form-label">Status</label>
                  <select 
                    id="status" 
                    class="form-select"
                    [(ngModel)]="formData.status"
                    name="status">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Special Requests Section -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="section-icon">📝</span>
                Special Requests
              </h3>
              
              <div class="form-group">
                <label for="specialRequests" class="form-label">Additional Notes</label>
                <textarea 
                  id="specialRequests" 
                  class="form-textarea"
                  [(ngModel)]="formData.special_requests"
                  name="specialRequests"
                  rows="4"
                  placeholder="Any special requests, dietary restrictions, or seating preferences..."></textarea>
              </div>
            </div>

            <!-- Error Messages -->
            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>

            <!-- Success Messages -->
            <div *ngIf="successMessage" class="success-message">
              {{ successMessage }}
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" (click)="resetForm()" class="btn btn-secondary">
                <span class="btn-icon">🔄</span>
                Reset Form
              </button>
              
              <button type="submit" 
                      class="btn btn-primary" 
                      [disabled]="reservationForm.invalid || loading">
                <span class="btn-icon">{{ isEditMode ? '💾' : '➕' }}</span>
                {{ isEditMode ? 'Update Reservation' : 'Create Reservation' }}
              </button>
            </div>
          </div>
        </form>

        <!-- Preview Card -->
        <div class="preview-section" *ngIf="!loading">
          <h3 class="preview-title">
            <span class="preview-icon">👁️</span>
            Live Preview
          </h3>
          
          <div class="preview-card">
            <div class="preview-header">
              <h4 class="preview-customer">{{ formData.customer_name || 'Customer Name' }}</h4>
              <span class="preview-status" [ngClass]="formData.status || 'pending'">
                {{ (formData.status || 'pending') | titlecase }}
              </span>
            </div>
            
            <div class="preview-details">
              <div class="preview-item">
                <span class="preview-label">📧 Email:</span>
                <span class="preview-value">{{ formData.customer_email || 'Not provided' }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">📞 Phone:</span>
                <span class="preview-value">{{ formData.customer_phone || 'Not provided' }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">👥 Party:</span>
                <span class="preview-value">{{ formData.party_size ? formData.party_size + ' people' : 'Not specified' }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">📅 Date:</span>
                <span class="preview-value">{{ formData.reservation_date || 'Not selected' }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">🕐 Time:</span>
                <span class="preview-value">{{ formatTimeForPreview(formData.reservation_time) || 'Not selected' }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">📝 Notes:</span>
                <span class="preview-value">{{ formData.special_requests || 'None' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* FORM CONTAINER */
    .form-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
      color: #e6edf3;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* HEADER STYLES */
    .form-header {
      margin-bottom: 30px;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      background: rgba(88, 166, 255, 0.1);
      border: 2px solid rgba(88, 166, 255, 0.3);
      border-radius: 10px;
      color: #58a6ff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
      font-size: 0.95rem;
    }

    .back-btn:hover {
      background: rgba(88, 166, 255, 0.2);
      border-color: #58a6ff;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(88, 166, 255, 0.2);
    }

    .back-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }

    .form-title-section {
      text-align: center;
      padding: 30px 20px;
      background: rgba(33, 38, 45, 0.5);
      border-radius: 15px;
      border: 1px solid rgba(88, 166, 255, 0.2);
    }

    .form-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #58a6ff, #a5f3fc);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .title-icon {
      font-size: 2.5rem;
    }

    .form-subtitle {
      color: #8b949e;
      font-size: 1.1rem;
      margin: 0;
    }

    /* FORM CONTENT */
    .form-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* FORM SECTIONS */
    .form-section {
      background: rgba(33, 38, 45, 0.8);
      border: 1px solid rgba(88, 166, 255, 0.2);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 25px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.3rem;
      font-weight: 600;
      color: #e6edf3;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(139, 148, 158, 0.2);
    }

    .section-icon {
      font-size: 1.4rem;
    }

    /* FORM ROWS AND GROUPS */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-label {
      display: block;
      color: #e6edf3;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 15px 18px;
      background: rgba(22, 27, 34, 0.8);
      border: 2px solid rgba(88, 166, 255, 0.2);
      border-radius: 12px;
      color: #e6edf3;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
      background: rgba(22, 27, 34, 0.95);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: #8b949e;
    }

    /* FORM ACTIONS */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-end;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(139, 148, 158, 0.2);
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 25px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #238636, #2ea043);
      color: white;
      box-shadow: 0 4px 15px rgba(46, 160, 67, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #2ea043, #238636);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46, 160, 67, 0.4);
    }

    .btn-secondary {
      background: rgba(139, 148, 158, 0.1);
      color: #8b949e;
      border: 2px solid rgba(139, 148, 158, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(139, 148, 158, 0.2);
      color: #e6edf3;
      border-color: #8b949e;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    /* LOADING STATE */
    .form-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(88, 166, 255, 0.3);
      border-top: 4px solid #58a6ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* MESSAGES */
    .error-message {
      background: rgba(248, 81, 73, 0.1);
      border: 1px solid rgba(248, 81, 73, 0.3);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      color: #f85149;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .success-message {
      background: rgba(46, 160, 67, 0.1);
      border: 1px solid rgba(46, 160, 67, 0.3);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      color: #2ea043;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* PREVIEW SECTION */
    .preview-section {
      position: sticky;
      top: 20px;
      height: fit-content;
    }

    .preview-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      font-weight: 600;
      color: #e6edf3;
      margin-bottom: 15px;
    }

    .preview-icon {
      font-size: 1.3rem;
    }

    .preview-card {
      background: rgba(33, 38, 45, 0.9);
      border: 2px solid rgba(88, 166, 255, 0.2);
      border-radius: 15px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(139, 148, 158, 0.2);
    }

    .preview-customer {
      font-size: 1.2rem;
      font-weight: 700;
      color: #e6edf3;
      margin: 0;
    }

    .preview-status {
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .preview-status.pending {
      background: rgba(251, 188, 5, 0.2);
      color: #fbbc05;
      border: 1px solid rgba(251, 188, 5, 0.3);
    }

    .preview-status.confirmed {
      background: rgba(46, 160, 67, 0.2);
      color: #2ea043;
      border: 1px solid rgba(46, 160, 67, 0.3);
    }

    .preview-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: rgba(22, 27, 34, 0.5);
      border-radius: 8px;
    }

    .preview-label {
      font-size: 0.9rem;
      color: #8b949e;
      font-weight: 500;
    }

    .preview-value {
      font-size: 0.9rem;
      color: #e6edf3;
      font-weight: 600;
    }

    /* RESPONSIVE DESIGN */
    @media (max-width: 1024px) {
      .form-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .preview-section {
        position: static;
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 15px;
      }

      .form-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 10px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .form-title {
        font-size: 1.5rem;
      }

      .section-title {
        font-size: 1.1rem;
      }

      .btn {
        padding: 12px 20px;
        font-size: 0.9rem;
      }
    }
  `],
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent implements OnInit {
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  reservationId: number | null = null;
   
  // Simple form data
  formData = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    party_size: '',
    special_requests: '',
    status: 'pending'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.queryParams.subscribe((params: { [x: string]: string | number; }) => {
      if (params['edit'] === 'true' && params['id']) {
        this.isEditMode = true;
        this.reservationId = +params['id'];
        this.loadReservationForEdit(this.reservationId);
      }
    });
  }

  // Load reservation data for editing
  loadReservationForEdit(id: number): void {
    this.loading = true;
    
    this.reservationService.getReservationById(id).subscribe({
      next: (reservation) => {
        // Populate form with existing data
        this.formData = {
          customer_name: reservation.customer_name,
          customer_email: reservation.customer_email,
          customer_phone: reservation.customer_phone || '',
          reservation_date: reservation.reservation_date,
          reservation_time: reservation.reservation_time,
          party_size: reservation.party_size.toString(),
          special_requests: reservation.special_requests || '',
          status: reservation.status
        };
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to load reservation';
        console.error('Error loading reservation:', error);
      }
    });
  }

  // Handle form submission
  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create properly typed reservation data
    const reservationData: NewReservation = {
      customer_name: this.formData.customer_name,
      customer_email: this.formData.customer_email,
      customer_phone: this.formData.customer_phone || '',
      reservation_date: this.formData.reservation_date,
      reservation_time: this.formData.reservation_time,
      party_size: Number(this.formData.party_size),
      special_requests: this.formData.special_requests || '',
      status: this.formData.status as 'pending' | 'confirmed' | 'cancelled'
    };

    if (this.isEditMode && this.reservationId) {
      // Update existing reservation
      this.reservationService.updateReservation(this.reservationId, reservationData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Reservation updated successfully!';
          console.log('Reservation updated successfully:', response);
          
          // Navigate back to dashboard after short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to update reservation';
          console.error('Error updating reservation:', error);
        }
      });
    } else {
      // Create new reservation
      this.reservationService.createReservation(reservationData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Reservation created successfully!';
          console.log('Reservation created successfully:', response);
          
          // Navigate back to dashboard after short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to create reservation';
          console.error('Error creating reservation:', error);
        }
      });
    }
  }

  // Reset form
  resetForm(): void {
    this.formData = {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      reservation_date: '',
      reservation_time: '',
      party_size: '',
      special_requests: '',
      status: 'pending'
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Format time for preview
  formatTimeForPreview(time: string): string {
    if (!time) return '';
    
    const timeMap: { [key: string]: string } = {
      '17:00:00': '5:00 PM',
      '17:30:00': '5:30 PM',
      '18:00:00': '6:00 PM',
      '18:30:00': '6:30 PM',
      '19:00:00': '7:00 PM',
      '19:30:00': '7:30 PM',
      '20:00:00': '8:00 PM',
      '20:30:00': '8:30 PM',
      '21:00:00': '9:00 PM'
    };
    
    return timeMap[time] || time;
  }

  // Navigate back to dashboard
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}