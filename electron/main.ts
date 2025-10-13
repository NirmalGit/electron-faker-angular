import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import log from "electron-log";

let mainWindow: BrowserWindow | null = null;

// --- Environment + Config ---
const isDev = !!process.env["ELECTRON_DEV"];
const configFile = isDev ? "config.dev.json" : "config.prod.json";
const configPath = path.join(__dirname, `../config/${configFile}`);

let config: any = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  log.info(`[startup] Loaded config: ${configPath}`);
} catch (err) {
  log.error(`[startup] Failed to load config: ${err}`);
}

function createWindow() {
  log.info("[startup] Creating main window...");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    // Wait for Angular dev server to be ready
    const loadAngularApp = async () => {
      try {
        await mainWindow!.loadURL(config.appUrl || "http://localhost:4200");
        if (config.enableDevTools) mainWindow!.webContents.openDevTools();
        log.info("[startup] Loaded Angular dev server successfully");
      } catch (error) {
        log.warn("Angular dev server not ready, retrying in 2 seconds...");
        setTimeout(loadAngularApp, 2000);
      }
    };
    loadAngularApp();
  } else {
    const filePath = path.join(__dirname, "../dist/electron-faker-angular/browser/index.html");
    mainWindow.loadFile(filePath);
    log.info(`[startup] Loaded production build: ${filePath}`);
  }

  mainWindow.on("closed", () => {
    log.info("[window] Closed");
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  log.info(`[app] Electron ready - Mode: ${isDev ? "Development" : "Production"}`);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    log.info("[app] All windows closed, quitting...");
    app.quit();
  }
});

// --- IPC Channels ---
ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle("app:getConfig", () => config);
ipcMain.handle("app:quit", () => app.quit());
