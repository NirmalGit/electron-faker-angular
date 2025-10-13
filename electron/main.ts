import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env["ELECTRON_DEV"]) {
    // Wait for Angular dev server to be ready
    const loadAngularApp = async () => {
      try {
        await mainWindow!.loadURL("http://localhost:4200");
        mainWindow!.webContents.openDevTools();
      } catch (error) {
        console.log("Angular dev server not ready, retrying in 2 seconds...");
        setTimeout(loadAngularApp, 2000);
      }
    };
    loadAngularApp();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, "../dist/electron-faker-angular/browser/index.html")
    );
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle("app:quit", () => app.quit());