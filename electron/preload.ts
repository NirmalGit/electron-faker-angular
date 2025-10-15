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
  },

  // Cart APIs  
  cart: {
    /**
     * Save cart data to file system
     * @param cart Cart object to save
     */
    save: (cart: any) => ipcRenderer.invoke("cart:save", cart),

    /**
     * Load cart data from file system
     */
    load: () => ipcRenderer.invoke("cart:load"),

    /**
     * Submit order for processing
     * @param orderRequest Order request data
     */
    submitOrder: (orderRequest: any) => ipcRenderer.invoke("cart:submitOrder", orderRequest),

    /**
     * Get order by ID
     * @param orderId Order ID
     */
    getOrder: (orderId: string) => ipcRenderer.invoke("cart:getOrder", orderId),

    /**
     * Get all orders
     */
    getOrders: () => ipcRenderer.invoke("cart:getOrders")
  }
});

