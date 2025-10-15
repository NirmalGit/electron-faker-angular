import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import log from "electron-log";
import { registerProductHandlers } from "./ipc/product.ipc";
import { setupCartIPC } from "./ipc/cart.ipc";

let mainWindow: BrowserWindow | null = null;

// --- Load Config ---
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
    const loadAngularApp = async () => {
      try {
        await mainWindow!.loadURL(config.appUrl || "http://localhost:4200");
        if (config.enableDevTools) mainWindow!.webContents.openDevTools();
        log.info("[startup] Angular dev server loaded successfully.");
      } catch {
        log.warn("Angular dev server not ready, retrying in 2s...");
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
    mainWindow = null;
    log.info("[window] Closed");
  });
}

app.whenReady().then(() => {
  log.info(`[app] Electron ready — ${isDev ? "development" : "production"}`);
  
  // Register IPC handlers
  try {
    registerProductHandlers();
    log.info("[IPC] Product handlers registered successfully");
  } catch (err) {
    log.error(`[IPC] Failed to register product handlers: ${err}`);
  }

  try {
    setupCartIPC();
    log.info("[IPC] Cart handlers registered successfully");
  } catch (err) {
    log.error(`[IPC] Failed to register cart handlers: ${err}`);
  }
  
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    log.info("[app] All windows closed — quitting app.");
    app.quit();
  }
});

// --- IPC Channels ---
ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle("app:getConfig", () => config);
ipcMain.handle("app:quit", () => app.quit());
