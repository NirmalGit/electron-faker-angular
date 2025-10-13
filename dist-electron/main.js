"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const electron_log_1 = __importDefault(require("electron-log"));
const product_ipc_1 = require("./ipc/product.ipc");
let mainWindow = null;
// --- Load Config ---
const isDev = !!process.env["ELECTRON_DEV"];
const configFile = isDev ? "config.dev.json" : "config.prod.json";
const configPath = path_1.default.join(__dirname, `../config/${configFile}`);
let config = {};
try {
    config = JSON.parse(fs_1.default.readFileSync(configPath, "utf-8"));
    electron_log_1.default.info(`[startup] Loaded config: ${configPath}`);
}
catch (err) {
    electron_log_1.default.error(`[startup] Failed to load config: ${err}`);
}
function createWindow() {
    electron_log_1.default.info("[startup] Creating main window...");
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    if (isDev) {
        const loadAngularApp = async () => {
            try {
                await mainWindow.loadURL(config.appUrl || "http://localhost:4200");
                if (config.enableDevTools)
                    mainWindow.webContents.openDevTools();
                electron_log_1.default.info("[startup] Angular dev server loaded successfully.");
            }
            catch {
                electron_log_1.default.warn("Angular dev server not ready, retrying in 2s...");
                setTimeout(loadAngularApp, 2000);
            }
        };
        loadAngularApp();
    }
    else {
        const filePath = path_1.default.join(__dirname, "../dist/electron-faker-angular/browser/index.html");
        mainWindow.loadFile(filePath);
        electron_log_1.default.info(`[startup] Loaded production build: ${filePath}`);
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
        electron_log_1.default.info("[window] Closed");
    });
}
electron_1.app.whenReady().then(() => {
    electron_log_1.default.info(`[app] Electron ready — ${isDev ? "development" : "production"}`);
    // Register IPC handlers
    try {
        (0, product_ipc_1.registerProductHandlers)();
        electron_log_1.default.info("[IPC] Product handlers registered successfully");
    }
    catch (err) {
        electron_log_1.default.error(`[IPC] Failed to register product handlers: ${err}`);
    }
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_log_1.default.info("[app] All windows closed — quitting app.");
        electron_1.app.quit();
    }
});
// --- IPC Channels ---
electron_1.ipcMain.handle("app:getVersion", () => electron_1.app.getVersion());
electron_1.ipcMain.handle("app:getConfig", () => config);
electron_1.ipcMain.handle("app:quit", () => electron_1.app.quit());
