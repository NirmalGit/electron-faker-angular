import { Component, signal, inject, OnInit } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";
import { MatBadgeModule } from "@angular/material/badge";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CartService } from "./core/services/cart.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss"
})
export class App implements OnInit {
  readonly title = signal("Electron Faker Angular");
  version = signal<string>("1.0.0");
  config = signal<any>(null);
  
  private cartService = inject(CartService);
  cartSummary = this.cartService.cartSummary;

  async ngOnInit() {
    this.config.set(await window.electronAPI.getAppConfig());
    this.version.set(await window.electronAPI.getAppVersion());
    
    // Debug cart summary
    console.log('🛒 App component cart summary:', this.cartSummary());
  }

  async getVersion() {
    const v = await window.electronAPI.getAppVersion();
    this.version.set(v);
  }

  quitApp() {
    window.electronAPI.quitApp();
  }
}
