import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LockoutInfo {
  is_locked: boolean;
  status: string;
  seconds_remaining: number;
  failed_attempts: number;
  attempts_remaining?: number;
  locked_at?: string;
  locked_until?: string;
  lockout_duration_minutes?: number;
}

export interface LockoutResponse {
  message: string;
  lockout_info: LockoutInfo;
}

/**
 * Angular Lockout Service
 * Manages account lockout status and provides real-time updates
 */
@Injectable({
  providedIn: 'root'
})
export class LockoutService {
  private apiUrl = 'http://localhost/AngularApp2/backend/api/auth.php';
  
  // Lockout state management
  private lockoutStatusSubject = new BehaviorSubject<LockoutInfo>({
    is_locked: false,
    status: 'NONE',
    seconds_remaining: 0,
    failed_attempts: 0,
    attempts_remaining: 5
  });
  
  public lockoutStatus$ = this.lockoutStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🔒 LockoutService initialized');
  }

  /**
   * Check lockout status for a specific user identifier
   * @param identifier Username or email
   * @returns Observable with lockout information
   */
  checkLockoutStatus(identifier: string): Observable<LockoutResponse> {
    console.log('🔍 Checking lockout status for:', identifier);
    
    return this.http.post<LockoutResponse>(`${this.apiUrl}?action=lockout-status`, {
      identifier: identifier
    }).pipe(
      tap(response => {
        console.log('📊 Lockout status response:', response);
        this.updateLockoutStatus(response.lockout_info);
      }),
      catchError(error => {
        console.error('❌ Lockout status check failed:', error);
        // Reset to safe state on error
        this.resetLockoutStatus();
        throw error;
      })
    );
  }

  /**
   * Update the lockout status in the service
   * @param lockoutInfo New lockout information
   */
  updateLockoutStatus(lockoutInfo: LockoutInfo): void {
    this.lockoutStatusSubject.next(lockoutInfo);
    
    if (lockoutInfo.is_locked) {
      console.log(`🔒 Account locked for ${lockoutInfo.seconds_remaining} seconds`);
    } else if (lockoutInfo.failed_attempts > 0) {
      console.log(`⚠️ ${lockoutInfo.failed_attempts} failed attempts recorded`);
    }
  }

  /**
   * Get current lockout status
   * @returns Current lockout information
   */
  getCurrentLockoutStatus(): LockoutInfo {
    return this.lockoutStatusSubject.value;
  }

  /**
   * Check if account is currently locked
   * @returns True if account is locked
   */
  isAccountLocked(): boolean {
    return this.lockoutStatusSubject.value.is_locked;
  }

  /**
   * Get remaining seconds for lockout
   * @returns Number of seconds remaining
   */
  getRemainingSeconds(): number {
    return this.lockoutStatusSubject.value.seconds_remaining;
  }

  /**
   * Get failed attempts count
   * @returns Number of failed attempts
   */
  getFailedAttempts(): number {
    return this.lockoutStatusSubject.value.failed_attempts;
  }

  /**
   * Reset lockout status to initial state
   */
  resetLockoutStatus(): void {
    this.lockoutStatusSubject.next({
      is_locked: false,
      status: 'NONE',
      seconds_remaining: 0,
      failed_attempts: 0,
      attempts_remaining: 5
    });
    console.log('🔄 Lockout status reset');
  }

  /**
   * Start a countdown timer for locked account
   * @param initialSeconds Initial countdown value
   * @returns Observable that emits remaining seconds
   */
  startCountdown(initialSeconds: number): Observable<number> {
    return new Observable(observer => {
      let remainingSeconds = initialSeconds;
      
      const countdown = setInterval(() => {
        remainingSeconds--;
        
        // Update the lockout status with new remaining time
        const currentStatus = this.getCurrentLockoutStatus();
        this.updateLockoutStatus({
          ...currentStatus,
          seconds_remaining: remainingSeconds
        });
        
        observer.next(remainingSeconds);
        
        if (remainingSeconds <= 0) {
          clearInterval(countdown);
          // Automatically unlock when countdown reaches zero
          this.resetLockoutStatus();
          observer.complete();
        }
      }, 1000);
      
      // Cleanup function
      return () => {
        clearInterval(countdown);
      };
    });
  }

  /**
   * Format seconds to human-readable time (MM:SS)
   * @param seconds Number of seconds
   * @returns Formatted time string
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format seconds to human-readable duration
   * @param seconds Number of seconds
   * @returns Formatted duration string
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      
      let result = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      if (remainingSeconds > 0) {
        result += ` and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
      }
      return result;
    }
  }

  /**
   * Get lockout progress percentage (for progress bars)
   * @param totalDuration Total lockout duration in seconds
   * @returns Progress percentage (0-100)
   */
  getProgressPercentage(totalDuration: number): number {
    const remainingSeconds = this.getRemainingSeconds();
    if (totalDuration === 0) {
        return 0;
    }
    return Math.max(0, (remainingSeconds / totalDuration) * 100);
  }

  /**
   * Get attempts progress percentage (for warning bars)
   * @param maxAttempts Maximum allowed attempts
   * @returns Progress percentage (0-100)
   */
  getAttemptsProgressPercentage(maxAttempts: number): number {
    const failedAttempts = this.getFailedAttempts();
    if (maxAttempts === 0) {
        return 0;
    }
    return Math.min(100, (failedAttempts / maxAttempts) * 100);
  }

  /**
   * Check if user is close to lockout (e.g., 80% of max attempts)
   * @param maxAttempts Maximum allowed attempts
   * @param threshold Warning threshold (default 0.6 = 60%)
   * @returns True if close to lockout
   */
  isCloseToLockout(maxAttempts: number, threshold: number = 0.6): boolean {
    const failedAttempts = this.getFailedAttempts();
    return failedAttempts >= (maxAttempts * threshold);
  }

  /**
   * Calculate remaining attempts before lockout
   * @param maxAttempts Maximum allowed attempts
   * @returns Number of attempts remaining
   */
  getRemainingAttempts(maxAttempts: number): number {
    return Math.max(0, maxAttempts - this.getFailedAttempts());
  }

  /**
   * Get user-friendly lockout message
   * @returns Formatted message about lockout status
   */
  getLockoutMessage(): string {
    const status = this.getCurrentLockoutStatus();
    
    if (status.is_locked) {
      const timeRemaining = this.formatDuration(status.seconds_remaining);
      return `Account is locked. Please try again in ${timeRemaining}.`;
    } else if (status.failed_attempts > 0) {
      const remaining = status.attempts_remaining || 0;
      return `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before account lockout.`;
    } else {
      return '';
    }
  }

  /**
   * Log lockout event for debugging/monitoring
   * @param event Event type
   * @param details Additional details
   */
  private logLockoutEvent(event: string, details?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`🔒 [${timestamp}] Lockout Event: ${event}`, details);
    
    // In production, you might want to send this to a monitoring service
    // this.monitoringService.logSecurityEvent('account_lockout', { event, details, timestamp });
  }
}