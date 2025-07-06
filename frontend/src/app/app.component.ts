import { Component } from '@angular/core';

/**
 * Main application component
 * Root component that holds the entire application
 */
@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <!-- Navigation Header -->
      <nav class="nav-header">
        <div class="nav-content">
          <div class="logo-section">
            <span class="logo-icon">🍽️</span>
            <h2 class="logo-text">ReserveEase</h2>
          </div>
          
          <div class="nav-links">
            <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="link-icon">📋</span>
              Reservations
            </a>
            <a routerLink="/add-reservation" class="nav-link" routerLinkActive="active">
              <span class="link-icon">➕</span>
              Add New
            </a>
            <a href="#" class="nav-link">
              <span class="link-icon">📊</span>
              Analytics
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-content">
          <p>&copy; 2025 ReserveEase - Restaurant Reservation System</p>
          <p class="tech-stack">Built with Angular & PHP</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Global App Styles */
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%);
    }

    /* Navigation Header */
    .nav-header {
      background: rgba(13, 17, 23, 0.95);
      border-bottom: 1px solid rgba(88, 166, 255, 0.2);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 2rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .logo-text {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #58a6ff, #a5f3fc);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }

    .nav-links {
      display: flex;
      gap: 30px;
      align-items: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      color: #8b949e;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      color: #58a6ff;
      background: rgba(88, 166, 255, 0.1);
      transform: translateY(-2px);
    }

    .nav-link.active {
      color: #58a6ff;
      background: rgba(88, 166, 255, 0.15);
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 20px;
      right: 20px;
      height: 2px;
      background: linear-gradient(90deg, #58a6ff, #a5f3fc);
      border-radius: 1px;
    }

    .link-icon {
      font-size: 1.1rem;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      padding: 0;
    }

    /* Footer */
    .app-footer {
      background: rgba(13, 17, 23, 0.95);
      border-top: 1px solid rgba(88, 166, 255, 0.2);
      padding: 20px 0;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;
      color: #8b949e;
    }

    .footer-content p {
      margin: 5px 0;
    }

    .tech-stack {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .nav-content {
        padding: 0 15px;
        height: 60px;
      }
      
      .logo-text {
        font-size: 1.5rem;
      }
      
      .nav-links {
        gap: 15px;
      }
      
      .nav-link {
        padding: 8px 12px;
        font-size: 0.9rem;
      }
      
      .link-icon {
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .nav-content {
        flex-direction: column;
        height: auto;
        padding: 15px;
        gap: 15px;
      }
      
      .nav-links {
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .nav-link {
        padding: 6px 10px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'ReserveEase - Restaurant Reservation System';
}