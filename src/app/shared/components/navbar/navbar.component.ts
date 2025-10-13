import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <button mat-icon-button (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">{{ appTitle() }}</span>
      <span class="spacer"></span>
      <span class="version-badge">v{{ version() }}</span>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-title {
      margin-left: 1rem;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .version-badge {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
  `]
})
export class NavbarComponent {
  appTitle = signal('Electron Faker Angular');
  version = signal('1.0.0');
  sidenavOpen = signal(false);

  async ngOnInit() {
    // Try to get version from Electron API if available
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const v = await (window as any).electronAPI.getAppVersion();
        this.version.set(v);
      } catch (err) {
        console.warn('Could not get app version from Electron API');
      }
    }
  }

  toggleSidenav(): void {
    this.sidenavOpen.set(!this.sidenavOpen());
  }
}
