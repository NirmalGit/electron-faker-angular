"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * Preload script that exposes secure APIs to the renderer process
 * Uses contextBridge to safely expose IPC methods
 */
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // App-level APIs
    getAppVersion: () => electron_1.ipcRenderer.invoke("app:getVersion"),
    getAppConfig: () => electron_1.ipcRenderer.invoke("app:getConfig"),
    quitApp: () => electron_1.ipcRenderer.invoke("app:quit"),
    // Product APIs
    products: {
        /**
         * Get all products from FakeStoreAPI
         */
        getAll: () => electron_1.ipcRenderer.invoke("products:getAll"),
        /**
         * Get a single product by ID
         * @param id Product ID
         */
        getById: (id) => electron_1.ipcRenderer.invoke("products:getById", id),
        /**
         * Get all product categories
         */
        getCategories: () => electron_1.ipcRenderer.invoke("products:getCategories"),
        /**
         * Get products by category
         * @param category Category name
         */
        getByCategory: (category) => electron_1.ipcRenderer.invoke("products:getByCategory", category)
    },
    // Cart APIs  
    cart: {
        /**
         * Save cart data to file system
         * @param cart Cart object to save
         */
        save: (cart) => electron_1.ipcRenderer.invoke("cart:save", cart),
        /**
         * Load cart data from file system
         */
        load: () => electron_1.ipcRenderer.invoke("cart:load"),
        /**
         * Submit order for processing
         * @param orderRequest Order request data
         */
        submitOrder: (orderRequest) => electron_1.ipcRenderer.invoke("cart:submitOrder", orderRequest),
        /**
         * Get order by ID
         * @param orderId Order ID
         */
        getOrder: (orderId) => electron_1.ipcRenderer.invoke("cart:getOrder", orderId),
        /**
         * Get all orders
         */
        getOrders: () => electron_1.ipcRenderer.invoke("cart:getOrders")
    }
});
