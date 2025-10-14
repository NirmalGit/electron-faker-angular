import { ipcMain } from 'electron';
import log from 'electron-log';

/**
 * Product IPC Handlers
 * These handlers communicate with FakeStoreAPI and return data to the renderer process
 */

const API_BASE_URL = 'https://fakestoreapi.com';
const IS_DEV = process.env.ELECTRON_DEV === 'true';

// Configure logging based on environment
if (IS_DEV) {
  log.transports.console.level = 'debug';
  log.transports.file.level = 'debug';
} else {
  // Production: Only log errors
  log.transports.console.level = 'error';
  log.transports.file.level = 'warn';
}

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
  if (IS_DEV) {
    log.info('⚡ [ELECTRON MAIN] Registering product IPC handlers...');
  }

  // Get all products
  ipcMain.handle('products:getAll', async () => {
    if (IS_DEV) {
      log.info('⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll');
    }
    try {
      const products = await fetchFromAPI('/products');
      if (IS_DEV) {
        log.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched ${products.length} products`);
      }
      return products;
    } catch (error) {
      log.error('⚡ [ELECTRON MAIN] ✗ IPC Error in products:getAll:', error);
      throw error;
    }
  });

  // Get product by ID
  ipcMain.handle('products:getById', async (event, id: number) => {
    if (IS_DEV) {
      log.info(`⚡ [ELECTRON MAIN] ◀── IPC Request: products:getById (ID: ${id})`);
    }
    try {
      const product = await fetchFromAPI(`/products/${id}`);
      if (IS_DEV) {
        log.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched product '${product.title}'`);
      }
      return product;
    } catch (error) {
      log.error(`⚡ [ELECTRON MAIN] ✗ IPC Error in products:getById (ID ${id}):`, error);
      throw error;
    }
  });

  // Get all categories
  ipcMain.handle('products:getCategories', async () => {
    if (IS_DEV) {
      log.info('⚡ [ELECTRON MAIN] ◀── IPC Request: products:getCategories');
    }
    try {
      const categories = await fetchFromAPI('/products/categories');
      if (IS_DEV) {
        log.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched ${categories.length} categories`);
      }
      return categories;
    } catch (error) {
      log.error('⚡ [ELECTRON MAIN] ✗ IPC Error in products:getCategories:', error);
      throw error;
    }
  });

  // Get products by category
  ipcMain.handle('products:getByCategory', async (event, category: string) => {
    if (IS_DEV) {
      log.info(`⚡ [ELECTRON MAIN] ◀── IPC Request: products:getByCategory (Category: '${category}')`);
    }
    try {
      const products = await fetchFromAPI(`/products/category/${category}`);
      if (IS_DEV) {
        log.info(`⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched ${products.length} products in category '${category}'`);
      }
      return products;
    } catch (error) {
      log.error(`⚡ [ELECTRON MAIN] ✗ IPC Error in products:getByCategory (Category: '${category}'):`, error);
      throw error;
    }
  });

  if (IS_DEV) {
    log.info('⚡ [ELECTRON MAIN] Product IPC handlers registered successfully ✓');
  }
}

/**
 * Unregister all product-related IPC handlers (for cleanup)
 */
export function unregisterProductHandlers(): void {
  if (IS_DEV) {
    log.info('⚡ [ELECTRON MAIN] Unregistering product IPC handlers...');
  }
  
  ipcMain.removeHandler('products:getAll');
  ipcMain.removeHandler('products:getById');
  ipcMain.removeHandler('products:getCategories');
  ipcMain.removeHandler('products:getByCategory');
  
  if (IS_DEV) {
    log.info('⚡ [ELECTRON MAIN] Product IPC handlers unregistered');
  }
}
