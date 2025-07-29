import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from './services/auth.service';

/**
 * Clean App Component with optional debug toggle
 */
@Component({
  selector: 'app-root',
  template: `
    <!-- Debug Panel (only show if debug is enabled) -->
    <div *ngIf="debugMode" style="position: fixed; top: 0; left: 0; right: 0; background: rgba(0,0,0,0.9); color: lime; z-index: 99999; padding: 10px; font-family: monospace; font-size: 11px; border-bottom: 2px solid #00ff00;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>🐛 DEBUG MODE</strong><br>
          URL: {{ currentUrl }} | Nav Count: {{ navigationCount }} | Auth: {{ authState }}<br>
          Last: {{ lastNavigation }}
        </div>
        <button (click)="toggleDebug()" style="background: red; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">
          Close Debug
        </button>
      </div>
      <div style="margin-top: 5px; max-height: 60px; overflow-y: auto;">
        <div *ngFor="let event of lastEvents" style="color: yellow; font-size: 10px;">{{ event }}</div>
      </div>
    </div>
    
    <!-- Debug Toggle Button (always visible in bottom right) -->
    <button 
      *ngIf="!debugMode"
      (click)="toggleDebug()" 
      style="position: fixed; bottom: 20px; right: 20px; background: #333; color: #00ff00; border: 1px solid #00ff00; padding: 8px 12px; cursor: pointer; border-radius: 20px; font-size: 11px; z-index: 9999; font-family: monospace;">
      🐛 Debug
    </button>
    
    <!-- Main App Content -->
    <div [style.margin-top]="debugMode ? '120px' : '0px'">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'AngularApp2';
  
  // Debug toggle
  debugMode = false; // Start with debug OFF
  
  // Debug properties
  currentUrl = '';
  navigationCount = 0;
  lastNavigation = '';
  authState = 'unknown';
  lastEvents: string[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Only initialize tracking if debug is enabled
    this.initializeTracking();
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    
    // Check for debug mode in localStorage (persists across page reloads)
    const savedDebugMode = localStorage.getItem('debug-mode');
    if (savedDebugMode === 'true') {
      this.debugMode = true;
    }
  }

  toggleDebug(): void {
    this.debugMode = !this.debugMode;
    
    // Save debug preference
    localStorage.setItem('debug-mode', this.debugMode.toString());
    
    if (this.debugMode) {
      this.addEvent('🐛 Debug mode enabled');
      console.log('🐛 Debug mode enabled');
    } else {
      console.log('🐛 Debug mode disabled');
    }
  }

  private initializeTracking(): void {
    // Track router events
    this.router.events.subscribe(event => {
      if (!this.debugMode) {
        return;
      } // Only track if debug is on
      
      if (event instanceof NavigationStart) {
        this.navigationCount++;
        this.addEvent(`🚀 NAV START: ${event.url}`);
      }
      
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
        this.lastNavigation = `END: ${event.url}`;
        this.addEvent(`✅ NAV END: ${event.url}`);
      }
      
      if (event instanceof NavigationCancel) {
        this.addEvent(`❌ NAV CANCEL: ${event.url} - ${event.reason}`);
      }
      
      if (event instanceof NavigationError) {
        this.addEvent(`💥 NAV ERROR: ${event.url} - ${event.error}`);
      }
    });

    // Track auth state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.authState = isAuth ? 'authenticated' : 'not-authenticated';
      if (this.debugMode) {
        this.addEvent(`🔐 Auth changed: ${isAuth}`);
      }
    });
  }

  private addEvent(message: string): void {
    if (!this.debugMode) {
      return;
    }
    
    const timestamp = new Date().toLocaleTimeString();
    const event = `[${timestamp}] ${message}`;
    this.lastEvents.unshift(event);
    
    // Keep only last 10 events
    if (this.lastEvents.length > 10) {
      this.lastEvents.pop();
    }
    
    console.log('🐛 DEBUG:', event);
  }
}