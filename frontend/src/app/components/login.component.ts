import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../services/auth.service';
import { LockoutService } from '../services/lockout.service';
import { Subscription, interval } from 'rxjs';

/**
 * Enhanced Login Component with Account Lockout Protection
 * Features countdown timer and user-friendly lockout messages
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

        <!-- Account Locked Alert -->
        <div *ngIf="lockoutInfo.is_locked" class="lockout-alert">
          <div class="lockout-icon">🔒</div>
          <div class="lockout-content">
            <h3 class="lockout-title">Account Temporarily Locked</h3>
            <p class="lockout-message">
              Too many failed login attempts. Please wait before trying again.
            </p>
            <div class="lockout-countdown">
              <div class="countdown-timer">
                <span class="countdown-number">{{ formatTime(lockoutInfo.seconds_remaining) }}</span>
                <span class="countdown-label">remaining</span>
              </div>
              <div class="countdown-progress">
                <div class="progress-bar" [style.width.%]="getProgressPercentage()"></div>
              </div>
            </div>
            <p class="lockout-attempts">
              Failed attempts: {{ lockoutInfo.failed_attempts }}/{{ maxAttempts }}
            </p>
          </div>
        </div>

        <!-- Failed Attempts Warning -->
        <div *ngIf="!lockoutInfo.is_locked && lockoutInfo.failed_attempts > 0" class="attempts-warning">
          <div class="warning-icon">⚠️</div>
          <div class="warning-content">
            <p class="warning-message">
              {{ lockoutInfo.attempts_remaining }} attempt(s) remaining before account lockout
            </p>
            <div class="attempts-progress">
              <div class="attempts-bar" [style.width.%]="getAttemptsPercentage()"></div>
            </div>
          </div>
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
              [disabled]="lockoutInfo.is_locked"
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
              [disabled]="lockoutInfo.is_locked"
              #password="ngModel"
              [class.error]="password.invalid && password.touched">
            <div *ngIf="password.invalid && password.touched" class="error-message">
              Password is required
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage && !lockoutInfo.is_locked" class="error-alert">
            <span class="error-icon">⚠️</span>
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="login-btn"
            [disabled]="loginForm.invalid || loading || lockoutInfo.is_locked">
            <span *ngIf="loading" class="loading-spinner"></span>
            <span class="btn-text">
              {{ lockoutInfo.is_locked ? 'Account Locked' : (loading ? 'Signing In...' : 'Sign In') }}
            </span>
          </button>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <p>Don't have an account? 
            <a routerLink="/signup" class="signup-link">Sign up here</a>
          </p>
          
          <!-- Demo Credentials -->
          <div class="demo-credentials" *ngIf="!lockoutInfo.is_locked">
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

          <!-- Lockout Help -->
          <div class="lockout-help" *ngIf="lockoutInfo.is_locked">
            <h4>Need Help?</h4>
            <p>If you believe this is an error, please contact your system administrator.</p>
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

    /* LOCKOUT ALERT STYLES */
    .lockout-alert {
      background: linear-gradient(135deg, rgba(248, 81, 73, 0.1), rgba(220, 38, 38, 0.1));
      border: 2px solid rgba(248, 81, 73, 0.3);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 25px;
      text-align: center;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .lockout-icon {
      font-size: 3rem;
      margin-bottom: 15px;
      animation: lockBounce 2s infinite;
    }

    @keyframes lockBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .lockout-title {
      color: #f85149;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 10px 0;
    }

    .lockout-message {
      color: #e6edf3;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .lockout-countdown {
      margin: 20px 0;
    }

    .countdown-timer {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 15px;
    }

    .countdown-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #f85149;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 10px rgba(248, 81, 73, 0.3);
    }

    .countdown-label {
      color: #8b949e;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .countdown-progress {
      width: 100%;
      height: 6px;
      background: rgba(139, 148, 158, 0.2);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #f85149, #da3633);
      transition: width 1s linear;
      border-radius: 3px;
    }

    .lockout-attempts {
      color: #8b949e;
      font-size: 0.9rem;
      margin: 15px 0 0 0;
    }

    /* ATTEMPTS WARNING STYLES */
    .attempts-warning {
      background: linear-gradient(135deg, rgba(251, 188, 5, 0.1), rgba(217, 119, 6, 0.1));
      border: 2px solid rgba(251, 188, 5, 0.3);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .warning-icon {
      font-size: 1.5rem;
      animation: warningPulse 2s infinite;
    }

    @keyframes warningPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .warning-content {
      flex: 1;
    }

    .warning-message {
      color: #fbbc05;
      font-weight: 600;
      margin: 0 0 10px 0;
      font-size: 0.9rem;
    }

    .attempts-progress {
      width: 100%;
      height: 4px;
      background: rgba(139, 148, 158, 0.2);
      border-radius: 2px;
      overflow: hidden;
    }

    .attempts-bar {
      height: 100%;
      background: linear-gradient(90deg, #fbbc05, #d97706);
      transition: width 0.3s ease;
      border-radius: 2px;
    }

    /* FORM STYLES */
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

    .form-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: rgba(22, 27, 34, 0.4);
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
      background: rgba(139, 148, 158, 0.3);
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

    .lockout-help {
      text-align: left;
      background: rgba(248, 81, 73, 0.1);
      border-radius: 10px;
      padding: 15px;
      margin-top: 20px;
      border: 1px solid rgba(248, 81, 73, 0.2);
    }

    .lockout-help h4 {
      color: #f85149;
      margin: 0 0 10px 0;
      font-size: 0.9rem;
    }

    .lockout-help p {
      color: #8b949e;
      font-size: 0.8rem;
      margin: 0;
      line-height: 1.4;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
      }
      
      .logo-text {
        font-size: 1.5rem;
      }

      .countdown-number {
        font-size: 2rem;
      }

      .lockout-alert {
        padding: 20px;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  credentials: LoginRequest = {
    username: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';
  returnUrl = '';
  maxAttempts = 5;

  // Lockout information
  lockoutInfo = {
    is_locked: false,
    seconds_remaining: 0,
    failed_attempts: 0,
    attempts_remaining: 5
  };

  // Countdown timer
  private countdownSubscription?: Subscription;
  private totalLockoutSeconds = 0;

  constructor(
    private authService: AuthService,
    private lockoutService: LockoutService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnDestroy(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  onLogin(): void {
    if (this.lockoutInfo.is_locked) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('✅ Login successful');
        // Clear any lockout info on successful login
        this.lockoutInfo = {
          is_locked: false,
          seconds_remaining: 0,
          failed_attempts: 0,
          attempts_remaining: this.maxAttempts
        };
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Login error:', error);
        
        // Handle lockout response
        if (error.status === 423 && error.error?.lockout_info) {
          this.handleLockout(error.error.lockout_info);
        } else if (error.error?.lockout_info) {
          this.handleFailedAttempt(error.error.lockout_info);
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }

  /**
   * Handle account lockout
   */
  private handleLockout(lockoutInfo: any): void {
    this.lockoutInfo = {
      is_locked: true,
      seconds_remaining: lockoutInfo.seconds_remaining || 0,
      failed_attempts: lockoutInfo.failed_attempts || 0,
      attempts_remaining: 0
    };

    this.totalLockoutSeconds = this.lockoutInfo.seconds_remaining;
    this.startCountdown();
    this.errorMessage = '';
  }

  /**
   * Handle failed login attempt
   */
  private handleFailedAttempt(lockoutInfo: any): void {
    this.lockoutInfo = {
      is_locked: false,
      seconds_remaining: 0,
      failed_attempts: lockoutInfo.failed_attempts || 0,
      attempts_remaining: lockoutInfo.attempts_remaining || this.maxAttempts
    };

    this.errorMessage = `Invalid credentials. ${this.lockoutInfo.attempts_remaining} attempt(s) remaining.`;
  }

  /**
   * Start countdown timer
   */
  private startCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.lockoutInfo.seconds_remaining > 0) {
        this.lockoutInfo.seconds_remaining--;
      } else {
        // Lockout expired
        this.lockoutInfo.is_locked = false;
        this.lockoutInfo.failed_attempts = 0;
        this.lockoutInfo.attempts_remaining = this.maxAttempts;
        if (this.countdownSubscription) {
          this.countdownSubscription.unsubscribe();
        }
      }
    });
  }

  /**
   * Format seconds to MM:SS
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get progress percentage for countdown bar
   */
  getProgressPercentage(): number {
    if (this.totalLockoutSeconds === 0) {
      return 0;
    }
    return (this.lockoutInfo.seconds_remaining / this.totalLockoutSeconds) * 100;
  }

  /**
   * Get attempts percentage for warning bar
   */
  getAttemptsPercentage(): number {
    return (this.lockoutInfo.failed_attempts / this.maxAttempts) * 100;
  }

  fillDemoCredentials(type: 'admin' | 'manager' | 'demo'): void {
    if (this.lockoutInfo.is_locked) {
      return;
    }
    switch(type) {
      case 'admin':
        ; //already defined so we can either define to avoid errors or just write the variable like below
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