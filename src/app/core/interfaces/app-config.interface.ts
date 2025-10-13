/**
 * Application configuration interface
 */
export interface AppConfig {
  environment: 'development' | 'production';
  appUrl: string;
  enableDevTools: boolean;
  apiBaseUrl?: string;
  apiTimeout?: number;
}

/**
 * Runtime environment information
 */
export interface RuntimeEnvironment {
  isElectron: boolean;
  isProduction: boolean;
  version: string;
  platform?: string;
}
