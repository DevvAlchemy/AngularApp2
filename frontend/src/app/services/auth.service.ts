import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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
 * Authentication service for managing user login, signup, and session
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/AngularApp2/backend/api/auth.php';
  
  // Current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  /**
   * User login
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}?action=login`, credentials)
      .pipe(
        tap(response => {
          // Store token and user data
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          
          // Update subjects
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          
          console.log('Login successful:', response.user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  /**
   * User signup
   */
  signup(userData: SignupRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=signup`, userData)
      .pipe(
        tap(response => {
          console.log('Signup successful:', response);
        }),
        catchError(error => {
          console.error('Signup error:', error);
          throw error;
        })
      );
  }

  /**
   * User logout
   */
  logout(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}?action=logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearSession();
        }),
        catchError(error => {
          // Even if logout fails on server, clear local session
          this.clearSession();
          throw error;
        })
      );
  }

  /**
   * Verify current session
   */
  verifySession(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.next({ valid: false });
        observer.complete();
      });
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}?action=verify`, { headers })
      .pipe(
        tap(response => {
          if (response && (response as any).valid) {
            this.currentUserSubject.next((response as any).user);
            this.isAuthenticatedSubject.next(true);
          } else {
            this.clearSession();
          }
        }),
        catchError(error => {
          this.clearSession();
          throw error;
        })
      );
  }

  /**
   * Check for existing session on app start
   */
  private checkExistingSession(): void {
    const token = this.getToken();
    const userData = this.getUserData();

    if (token && userData) {
      this.verifySession().subscribe({
        next: (response) => {
          if (response.valid) {
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        },
        error: () => {
          this.clearSession();
        }
      });
    }
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
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
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to dashboard
   */
  redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}