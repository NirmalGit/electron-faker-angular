import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: "./app.html",
  styleUrl: "./app.scss"
})
export class App {
  readonly title = signal("electron-faker-angular");
  version = signal<string>("(unknown)");
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
