"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    getAppVersion: () => electron_1.ipcRenderer.invoke("app:getVersion"),
    getAppConfig: () => electron_1.ipcRenderer.invoke("app:getConfig"),
    quitApp: () => electron_1.ipcRenderer.invoke("app:quit")
});
