import { contextBridge, ipcRenderer } from "electron";

/**
 * Preload script that exposes secure APIs to the renderer process
 * Uses contextBridge to safely expose IPC methods
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // App-level APIs
  getAppVersion: () => ipcRenderer.invoke("app:getVersion"),
  getAppConfig: () => ipcRenderer.invoke("app:getConfig"),
  quitApp: () => ipcRenderer.invoke("app:quit"),

  // Product APIs
  products: {
    /**
     * Get all products from FakeStoreAPI
     */
    getAll: () => ipcRenderer.invoke("products:getAll"),

    /**
     * Get a single product by ID
     * @param id Product ID
     */
    getById: (id: number) => ipcRenderer.invoke("products:getById", id),

    /**
     * Get all product categories
     */
    getCategories: () => ipcRenderer.invoke("products:getCategories"),

    /**
     * Get products by category
     * @param category Category name
     */
    getByCategory: (category: string) => ipcRenderer.invoke("products:getByCategory", category)
  }
});

