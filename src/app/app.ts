import { Component, signal } from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatDividerModule } from "@angular/material/divider";

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
    MatDividerModule
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss"
})
export class App {
  readonly title = signal("Electron Faker Angular");
  version = signal<string>("1.0.0");
  config = signal<any>(null);

  async ngOnInit() {
    this.config.set(await window.electronAPI.getAppConfig());
    this.version.set(await window.electronAPI.getAppVersion());
  }

  async getVersion() {
    const v = await window.electronAPI.getAppVersion();
    this.version.set(v);
  }

  quitApp() {
    window.electronAPI.quitApp();
  }
}
