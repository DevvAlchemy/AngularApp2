import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';

/**
 * Enhanced Login component with proper redirection
 */
@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="logo">
            <span class="logo-icon">🍽️</span>
            <h1 class="logo-text">ReserveEase</h1>
          </div>
          <p class="login-subtitle">Welcome back! Please sign in to continue.</p>
        </div>

        <!-- Login Form -->
        <form class="login-form" (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username" class="form-label">Username or Email</label>
            <input
              type="text"
              id="username"
              class="form-input"
              [(ngModel)]="credentials.username"
              name="username"
              placeholder="Enter your username or email"
              required
              #username="ngModel"
              [class.error]="username.invalid && username.touched">
            <div *ngIf="username.invalid && username.touched" class="error-message">
              Username or email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              class="form-input"
              [(ngModel)]="credentials.password"
              name="password"
              placeholder="Enter your password"
              required
              #password="ngModel"
              [class.error]="password.invalid && password.touched">
            <div *ngIf="password.invalid && password.touched" class="error-message">
              Password is required
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="error-alert">
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="login-btn"
            [disabled]="loginForm.invalid || loading">
            <span *ngIf="loading" class="loading-spinner"></span>
            <span class="btn-text">{{ loading ? 'Signing In...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <p>Don't have an account? 
            <a routerLink="/signup" class="signup-link">Sign up here</a>
          </p>
          
          <!-- Demo Credentials -->
          <div class="demo-credentials">
            <h4>Demo Accounts:</h4>
            <div class="demo-account" (click)="fillDemoCredentials('admin')">
              <strong>Admin:</strong> admin / admin123
            </div>
            <div class="demo-account" (click)="fillDemoCredentials('manager')">
              <strong>Manager:</strong> manager / admin123
            </div>
            <div class="demo-account" (click)="fillDemoCredentials('demo')">
              <strong>Staff:</strong> demo / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .login-card {
      background: rgba(33, 38, 45, 0.9);
      border: 2px solid rgba(88, 166, 255, 0.2);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .login-header {
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

    .login-subtitle {
      color: #8b949e;
      margin: 0;
      font-size: 1rem;
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

    .form-input {
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

    .form-input:focus {
      outline: none;
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.1);
    }

    .form-input.error {
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

    .login-btn {
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

    .login-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #2ea043, #238636);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(46, 160, 67, 0.3);
    }

    .login-btn:disabled {
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

    .login-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(139, 148, 158, 0.2);
    }

    .login-footer p {
      color: #8b949e;
      margin-bottom: 20px;
    }

    .signup-link {
      color: #58a6ff;
      text-decoration: none;
      font-weight: 600;
    }

    .signup-link:hover {
      text-decoration: underline;
    }

    .demo-credentials {
      text-align: left;
      background: rgba(22, 27, 34, 0.5);
      border-radius: 10px;
      padding: 15px;
      margin-top: 20px;
    }

    .demo-credentials h4 {
      color: #e6edf3;
      margin: 0 0 10px 0;
      font-size: 0.9rem;
    }

    .demo-account {
      color: #8b949e;
      font-size: 0.8rem;
      margin: 5px 0;
      cursor: pointer;
      padding: 5px;
      border-radius: 5px;
      transition: all 0.3s ease;
    }

    .demo-account:hover {
      background: rgba(88, 166, 255, 0.1);
      color: #58a6ff;
    }

    .demo-account strong {
      color: #e6edf3;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
      }
      
      .logo-text {
        font-size: 1.5rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onLogin(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('✅ Login successful');
        // Redirect to the intended page or dashboard
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Login error:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    });
  }

  // REMOVED navigateToSignup() method - using routerLink instead

  fillDemoCredentials(type: 'admin' | 'manager' | 'demo'): void {
    console.log('🎭 Filling demo credentials for:', type);
    switch(type) {
      case 'admin':
        this.credentials = { username: 'admin', password: 'admin123' };
        break;
      case 'manager':
        this.credentials = { username: 'manager', password: 'admin123' };
        break;
      case 'demo':
        this.credentials = { username: 'demo', password: 'admin123' };
        break;
    }
  }
}