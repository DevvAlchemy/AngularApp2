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
 * ULTRA MINIMAL AuthService - Does NOTHING automatically
 * This will help us identify if AuthService is causing the redirect
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/AngularApp2/backend/api/auth.php';
  
  // Basic state - NO AUTOMATIC INITIALIZATION
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('🔥 ULTRA MINIMAL AuthService constructor');
    console.log('🚫 NO AUTOMATIC ACTIONS WILL BE TAKEN');
    console.log('⚠️ This service will do NOTHING unless explicitly called');
    
    // ABSOLUTELY NO AUTOMATIC SESSION CHECKING
    // ABSOLUTELY NO AUTOMATIC REDIRECTS
    // ABSOLUTELY NO AUTOMATIC STATE CHANGES
  }

  /**
   * User login
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 LOGIN CALLED for:', credentials.username);
    
    return this.http.post<AuthResponse>(`${this.apiUrl}?action=login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ LOGIN SUCCESS:', response);
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('❌ LOGIN ERROR:', error);
          throw error;
        })
      );
  }

  /**
   * User signup
   */
  signup(userData: SignupRequest): Observable<any> {
    console.log('📝 SIGNUP CALLED for:', userData.username);
    
    return this.http.post(`${this.apiUrl}?action=signup`, userData)
      .pipe(
        tap(response => {
          console.log('✅ SIGNUP SUCCESS:', response);
        }),
        catchError(error => {
          console.error('❌ SIGNUP ERROR:', error);
          throw error;
        })
      );
  }

  /**
   * User logout
   */
  logout(): Observable<any> {
    console.log('🚪 LOGOUT CALLED');
    const token = this.getToken();
    
    if (!token) {
      this.clearSession();
      return of({ message: 'Logged out' });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}?action=logout`, {}, { headers })
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of({ message: 'Logged out locally' });
        })
      );
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    console.log('🧹 CLEARING SESSION');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
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
    console.log('🔄 REDIRECT TO LOGIN CALLED');
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to dashboard
   */
  redirectToDashboard(): void {
    console.log('🔄 REDIRECT TO DASHBOARD CALLED');
    this.router.navigate(['/dashboard']);
  }
}