import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Component for adding new reservations
 * Form is styled but not functional (as per assignment requirements)
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
            <span class="title-icon">➕</span>
            Add New Reservation
          </h1>
          <p class="form-subtitle">Create a new restaurant reservation</p>
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <form class="reservation-form" (ngSubmit)="onSubmit()">
          
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
                  <option value="8">8+ People</option>
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
                  <option value="21:30:00">9:30 PM</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label for="status" class="form-label">Initial Status</label>
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

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" (click)="resetForm()" class="btn btn-secondary">
              <span class="btn-icon">🔄</span>
              Reset Form
            </button>
            
            <button type="submit" class="btn btn-primary">
              <span class="btn-icon">💾</span>
              Create Reservation
            </button>
          </div>

        </form>

        <!-- Preview Card -->
        <div class="preview-section">
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
                <span class="preview-label">📅 Date:</span>
                <span class="preview-value">{{ formatPreviewDate(formData.reservation_date) }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">🕐 Time:</span>
                <span class="preview-value">{{ formatPreviewTime(formData.reservation_time) }}</span>
              </div>
              
              <div class="preview-item">
                <span class="preview-label">👥 Party:</span>
                <span class="preview-value">{{ formData.party_size ? formData.party_size + ' people' : 'Not specified' }}</span>
              </div>
              
              <div *ngIf="formData.special_requests" class="preview-item">
                <span class="preview-label">📝 Notes:</span>
                <span class="preview-value">{{ formData.special_requests }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./reservation-form.component.css']
})
export class ReservationFormComponent {
  
  // Form data model
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

  constructor(private router: Router) {}

  /**
   * Handle form submission
   */
  onSubmit(): void {
    console.log('Form submitted (will add backend later):', this.formData);
    
    // Show alert instead of actually submitting
    alert('Form submission is not implemented yet');
  }

  /**
   * Reset the form to empty state
   */
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
  }

  /**
   * Navigate back to reservation list
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Format date for preview
   */
  formatPreviewDate(dateString: string): string {
    if (!dateString) {
      return 'Not selected';
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format time for preview
   */
  formatPreviewTime(timeString: string): string {
    if (!timeString) {
        return 'Not selected';
    }
    
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