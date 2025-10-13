"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProductHandlers = registerProductHandlers;
exports.unregisterProductHandlers = unregisterProductHandlers;
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
/**
 * Product IPC Handlers
 * These handlers communicate with FakeStoreAPI and return data to the renderer process
 */
const API_BASE_URL = 'https://fakestoreapi.com';
/**
 * Fetch data from FakeStoreAPI
 */
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        electron_log_1.default.error(`[IPC] Error fetching ${endpoint}:`, error);
        throw error;
    }
}
/**
 * Register all product-related IPC handlers
 */
function registerProductHandlers() {
    electron_log_1.default.info('⚡ [ELECTRON MAIN] Registering product IPC handlers...');
    // Get all products
    electron_1.ipcMain.handle('products:getAll', async () => {
        electron_log_1.default.info('⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll');
        try {
            const products = await fetchFromAPI('/products');
            electron_log_1.default.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched ${products.length} products`);
            return products;
        }
        catch (error) {
            electron_log_1.default.error('⚡ [ELECTRON MAIN] ✗ IPC Error in products:getAll:', error);
            throw error;
        }
    });
    // Get product by ID
    electron_1.ipcMain.handle('products:getById', async (event, id) => {
        electron_log_1.default.info(`⚡ [ELECTRON MAIN] ◀── IPC Request: products:getById (ID: ${id})`);
        try {
            const product = await fetchFromAPI(`/products/${id}`);
            electron_log_1.default.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched product '${product.title}'`);
            return product;
        }
        catch (error) {
            electron_log_1.default.error(`⚡ [ELECTRON MAIN] ✗ IPC Error in products:getById (ID ${id}):`, error);
            throw error;
        }
    });
    // Get all categories
    electron_1.ipcMain.handle('products:getCategories', async () => {
        electron_log_1.default.info('⚡ [ELECTRON MAIN] ◀── IPC Request: products:getCategories');
        try {
            const categories = await fetchFromAPI('/products/categories');
            electron_log_1.default.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched ${categories.length} categories`);
            return categories;
        }
        catch (error) {
            electron_log_1.default.error('⚡ [ELECTRON MAIN] ✗ IPC Error in products:getCategories:', error);
            throw error;
        }
    });
    // Get products by category
    electron_1.ipcMain.handle('products:getByCategory', async (event, category) => {
        electron_log_1.default.info(`⚡ [ELECTRON MAIN] ◀── IPC Request: products:getByCategory (Category: '${category}')`);
        try {
            const products = await fetchFromAPI(`/products/category/${category}`);
            electron_log_1.default.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched ${products.length} products in category '${category}'`);
            return products;
        }
        catch (error) {
            electron_log_1.default.error(`⚡ [ELECTRON MAIN] ✗ IPC Error in products:getByCategory (Category: '${category}'):`, error);
            throw error;
        }
    });
    electron_log_1.default.info('⚡ [ELECTRON MAIN] Product IPC handlers registered successfully ✓');
}
/**
 * Unregister all product-related IPC handlers (for cleanup)
 */
function unregisterProductHandlers() {
    electron_log_1.default.info('⚡ [ELECTRON MAIN] Unregistering product IPC handlers...');
    electron_1.ipcMain.removeHandler('products:getAll');
    electron_1.ipcMain.removeHandler('products:getById');
    electron_1.ipcMain.removeHandler('products:getCategories');
    electron_1.ipcMain.removeHandler('products:getByCategory');
    electron_log_1.default.info('⚡ [ELECTRON MAIN] Product IPC handlers unregistered');
}
