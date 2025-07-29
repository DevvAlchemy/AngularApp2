import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SignupRequest } from '../services/auth.service';

/**
 * Clean Signup component - debug code removed
 */
@Component({
  selector: 'app-signup',
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <!-- Header -->
        <div class="signup-header">
          <div class="logo">
            <span class="logo-icon">🍽️</span>
            <h1 class="logo-text">ReserveEase</h1>
          </div>
          <p class="signup-subtitle">Create your account to get started</p>
        </div>

        <!-- Signup Form -->
        <form class="signup-form" (ngSubmit)="onSignup()" #signupForm="ngForm">
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <input
                type="text"
                id="firstName"
                class="form-input"
                [(ngModel)]="userData.first_name"
                name="firstName"
                placeholder="First name"
                required
                #firstName="ngModel"
                [class.error]="firstName.invalid && firstName.touched">
              <div *ngIf="firstName.invalid && firstName.touched" class="error-message">
                First name is required
              </div>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                type="text"
                id="lastName"
                class="form-input"
                [(ngModel)]="userData.last_name"
                name="lastName"
                placeholder="Last name"
                required
                #lastName="ngModel"
                [class.error]="lastName.invalid && lastName.touched">
              <div *ngIf="lastName.invalid && lastName.touched" class="error-message">
                Last name is required
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              type="text"
              id="username"
              class="form-input"
              [(ngModel)]="userData.username"
              name="username"
              placeholder="Choose a username"
              required
              minlength="3"
              #username="ngModel"
              [class.error]="username.invalid && username.touched">
            <div *ngIf="username.invalid && username.touched" class="error-message">
              <span *ngIf="username.errors?.['required']">Username is required</span>
              <span *ngIf="username.errors?.['minlength']">Username must be at least 3 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              class="form-input"
              [(ngModel)]="userData.email"
              name="email"
              placeholder="Enter your email"
              required
              email
              #email="ngModel"
              [class.error]="email.invalid && email.touched">
            <div *ngIf="email.invalid && email.touched" class="error-message">
              <span *ngIf="email.errors?.['required']">Email is required</span>
              <span *ngIf="email.errors?.['email']">Please enter a valid email</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              class="form-input"
              [(ngModel)]="userData.password"
              name="password"
              placeholder="Create a password"
              required
              minlength="6"
              #password="ngModel"
              [class.error]="password.invalid && password.touched">
            <div *ngIf="password.invalid && password.touched" class="error-message">
              <span *ngIf="password.errors?.['required']">Password is required</span>
              <span *ngIf="password.errors?.['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="role" class="form-label">Role</label>
            <select
              id="role"
              class="form-select"
              [(ngModel)]="userData.role"
              name="role">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="success-alert">
            <span class="success-icon">✅</span>
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-alert">
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="signup-btn"
            [disabled]="signupForm.invalid || loading">
            <span *ngIf="loading" class="loading-spinner"></span>
            <span class="btn-text">{{ loading ? 'Creating Account...' : 'Create Account' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="signup-footer">
          <p>Already have an account? 
            <a routerLink="/login" class="login-link">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .signup-card {
      background: rgba(33, 38, 45, 0.9);
      border: 2px solid rgba(88, 166, 255, 0.2);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .signup-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 15px;
    }

    .logo-icon {
      font-size: 2.5rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .logo-text {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #58a6ff, #a5f3fc);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .signup-subtitle {
      color: #8b949e;
      margin: 0;
      font-size: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      color: #e6edf3;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .form-input,
    .form-select {
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
    .form-select:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .form-input.error,
    .form-select.error {
      border-color: #f85149;
    }

    .form-input::placeholder {
      color: #8b949e;
    }

    .error-message {
      color: #f85149;
      font-size: 0.85rem;
      margin-top: 5px;
    }

    .error-alert {
      background: rgba(248, 81, 73, 0.1);
      border: 1px solid rgba(248, 81, 73, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
      color: #f85149;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .success-alert {
      background: rgba(46, 160, 67, 0.1);
      border: 1px solid rgba(46, 160, 67, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 20px;
      color: #2ea043;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .signup-btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #238636, #2ea043);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .signup-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #2ea043, #238636);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46, 160, 67, 0.3);
    }

    .signup-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .signup-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(139, 148, 158, 0.2);
    }

    .signup-footer p {
      color: #8b949e;
    }

    .login-link {
      color: #58a6ff;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .signup-card {
        padding: 30px 20px;
      }
      
      .logo-text {
        font-size: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SignupComponent {
  userData: SignupRequest = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'staff'
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSignup(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.signup(this.userData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Account created successfully! Please sign in.';
        
        // Clear form
        this.userData = {
          username: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'staff'
        };

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    });
  }
}