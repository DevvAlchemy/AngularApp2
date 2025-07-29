import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Clean AuthGuard - Protects routes that require authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    
    const {url} = state;
    
    // Allow public routes without any checks
    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.some(route => url.startsWith(route));
    
    if (isPublicRoute) {
      return true;
    }
    
    // For protected routes, check authentication
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Store the attempted URL for redirecting after login
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
}