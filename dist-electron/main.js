"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    if (process.env["ELECTRON_DEV"]) {
        // Wait for Angular dev server to be ready
        const loadAngularApp = async () => {
            try {
                await mainWindow.loadURL("http://localhost:4200");
                mainWindow.webContents.openDevTools();
            }
            catch (error) {
                console.log("Angular dev server not ready, retrying in 2 seconds...");
                setTimeout(loadAngularApp, 2000);
            }
        };
        loadAngularApp();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../dist/electron-faker-angular/browser/index.html"));
    }
    mainWindow.on("closed", () => (mainWindow = null));
}
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.ipcMain.handle("app:getVersion", () => electron_1.app.getVersion());
electron_1.ipcMain.handle("app:quit", () => electron_1.app.quit());
