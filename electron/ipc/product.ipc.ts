import { ipcMain } from 'electron';
import log from 'electron-log';

/**
 * Product IPC Handlers
 * These handlers communicate with FakeStoreAPI and return data to the renderer process
 */

const API_BASE_URL = 'https://fakestoreapi.com';

/**
 * Fetch data from FakeStoreAPI
 */
async function fetchFromAPI(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    log.error(`[IPC] Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Register all product-related IPC handlers
 */
export function registerProductHandlers(): void {
  log.info('[IPC] Registering product IPC handlers...');

  // Get all products
  ipcMain.handle('products:getAll', async () => {
    log.info('[IPC] Handling products:getAll');
    try {
      const products = await fetchFromAPI('/products');
      log.info(`[IPC] Successfully fetched ${products.length} products`);
      return products;
    } catch (error) {
      log.error('[IPC] Error in products:getAll:', error);
      throw error;
    }
  });

  // Get product by ID
  ipcMain.handle('products:getById', async (event, id: number) => {
    log.info(`[IPC] Handling products:getById for ID: ${id}`);
    try {
      const product = await fetchFromAPI(`/products/${id}`);
      log.info(`[IPC] Successfully fetched product: ${product.title}`);
      return product;
    } catch (error) {
      log.error(`[IPC] Error in products:getById for ID ${id}:`, error);
      throw error;
    }
  });

  // Get all categories
  ipcMain.handle('products:getCategories', async () => {
    log.info('[IPC] Handling products:getCategories');
    try {
      const categories = await fetchFromAPI('/products/categories');
      log.info(`[IPC] Successfully fetched ${categories.length} categories`);
      return categories;
    } catch (error) {
      log.error('[IPC] Error in products:getCategories:', error);
      throw error;
    }
  });

  // Get products by category
  ipcMain.handle('products:getByCategory', async (event, category: string) => {
    log.info(`[IPC] Handling products:getByCategory for: ${category}`);
    try {
      const products = await fetchFromAPI(`/products/category/${category}`);
      log.info(`[IPC] Successfully fetched ${products.length} products in category: ${category}`);
      return products;
    } catch (error) {
      log.error(`[IPC] Error in products:getByCategory for ${category}:`, error);
      throw error;
    }
  });

  log.info('[IPC] Product IPC handlers registered successfully');
}

/**
 * Unregister all product-related IPC handlers (for cleanup)
 */
export function unregisterProductHandlers(): void {
  log.info('[IPC] Unregistering product IPC handlers...');
  
  ipcMain.removeHandler('products:getAll');
  ipcMain.removeHandler('products:getById');
  ipcMain.removeHandler('products:getCategories');
  ipcMain.removeHandler('products:getByCategory');
  
  log.info('[IPC] Product IPC handlers unregistered');
}
