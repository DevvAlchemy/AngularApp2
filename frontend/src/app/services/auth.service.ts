import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  expires_at: string;
}

/**
 * Final Auth Service - Proper session management without auto-logout
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/AngularApp2/backend/api/auth.php';
  
  // Auth state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔧 AuthService initialized');
    // Check for existing session without redirecting
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const userData = this.getUserData();

    if (token && userData) {
      console.log('🔍 Found existing session, verifying...');
      // Set initial state based on stored data
      this.currentUserSubject.next(userData);
      this.isAuthenticatedSubject.next(true);
      
      // Verify in background without affecting navigation
      this.verifySessionQuietly();
    } else {
      console.log('ℹ️ No existing session found');
    }
  }

  /**
   * Verify session quietly without redirects
   */
  private verifySessionQuietly(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`${this.apiUrl}?action=verify`, { headers })
      .pipe(
        catchError(() => {
          // If verification fails, clear session quietly
          console.log('🔄 Session verification failed, clearing session');
          this.clearSession();
          return of({ valid: false });
        })
      )
      .subscribe(response => {
        if (response && (response as any).valid) {
          console.log('✅ Session verified successfully');
          this.currentUserSubject.next((response as any).user);
          this.isAuthenticatedSubject.next(true);
        } else {
          console.log('❌ Session invalid, clearing');
          this.clearSession();
        }
      });
  }

  /**
   * User login
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Attempting login for:', credentials.username);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}?action=login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login successful:', response);
          
          // Store token and user data
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          
          // Update subjects
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('❌ Login error:', error);
          this.clearSession();
          throw error;
        })
      );
  }

  /**
   * User signup
   */
  signup(userData: SignupRequest): Observable<any> {
    console.log('📝 Attempting signup for:', userData.username);
    
    return this.http.post(`${this.apiUrl}?action=signup`, userData)
      .pipe(
        tap(response => {
          console.log('✅ Signup successful:', response);
        }),
        catchError(error => {
          console.error('❌ Signup error:', error);
          throw error;
        })
      );
  }

  /**
   * User logout
   */
  logout(): Observable<any> {
    console.log('🚪 Logging out...');
    
    const token = this.getToken();
    
    if (!token) {
      this.clearSession();
      return of({ message: 'Logged out' });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}?action=logout`, {}, { headers })
      .pipe(
        tap(() => {
          console.log('✅ Logout successful');
        }),
        catchError(error => {
          console.log('⚠️ Logout error, clearing local session anyway');
          return of({ message: 'Logged out locally' });
        }),
        tap(() => {
          this.clearSession();
        })
      );
  }

  /**
   * Verify current session (manual call)
   */
  verifySession(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return of({ valid: false, message: 'No token' });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}?action=verify`, { headers })
      .pipe(
        tap(response => {
          if (response && (response as any).valid) {
            this.currentUserSubject.next((response as any).user);
            this.isAuthenticatedSubject.next(true);
            console.log('✅ Session verified');
          } else {
            console.log('❌ Session invalid');
            this.clearSession();
          }
        }),
        catchError(error => {
          console.log('❌ Session verification failed:', error);
          this.clearSession();
          return of({ valid: false, message: 'Verification failed' });
        })
      );
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('🧹 Session cleared');
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Get stored user data
   */
  getUserData(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Get current user value
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Navigate to login page
   */
  redirectToLogin(): void {
    console.log('🔄 Redirecting to login');
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to dashboard
   */
  redirectToDashboard(): void {
    console.log('🔄 Redirecting to dashboard');
    this.router.navigate(['/dashboard']);
  }
}