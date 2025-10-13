/**
 * Product interface matching FakeStoreAPI response
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

/**
 * Product rating information
 */
export interface ProductRating {
  rate: number;
  count: number;
}

/**
 * Filter options for products
 */
export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}
