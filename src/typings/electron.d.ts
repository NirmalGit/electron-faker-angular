import { Product } from '../app/core/interfaces/product.interface';

export {};

declare global {
  interface Window {
    electronAPI: {
      // App-level APIs
      getAppVersion: () => Promise<string>;
      getAppConfig: () => Promise<any>;
      quitApp: () => Promise<void>;
      
      // Product APIs
      products: {
        /**
         * Get all products from FakeStoreAPI
         */
        getAll: () => Promise<Product[]>;
        
        /**
         * Get a single product by ID
         * @param id Product ID
         */
        getById: (id: number) => Promise<Product>;
        
        /**
         * Get all product categories
         */
        getCategories: () => Promise<string[]>;
        
        /**
         * Get products by category
         * @param category Category name
         */
        getByCategory: (category: string) => Promise<Product[]>;
      };
    };
  }
}
