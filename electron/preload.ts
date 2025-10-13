import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("app:getVersion"),
  getAppConfig: () => ipcRenderer.invoke("app:getConfig"),
  quitApp: () => ipcRenderer.invoke("app:quit")
});
