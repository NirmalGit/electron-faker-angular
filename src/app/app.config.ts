import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { inject } from '@angular/core';
import { routes } from './app.routes';
import { IDataApi } from './core/interfaces/idata-api.interface';
import { WebApiService } from './core/services/web-api.service';
import { ElectronApiService } from './core/services/electron-api.service';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LoggerService } from './core/services/logger.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Register HTTP Interceptor for authentication and error handling
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    
    {
      provide: IDataApi,
      useFactory: () => {
        const logger = inject(LoggerService);
        const isElectron = typeof window !== 'undefined' && 
                           typeof (window as any).electronAPI !== 'undefined';
        
        if (isElectron) {
          logger.info('🖥️', 'Running in Electron mode - Using ElectronApiService');
          return new ElectronApiService(logger);
        } else {
          logger.info('🌐', 'Running in Browser mode - Using WebApiService');
          const http = inject(HttpClient);
          return new WebApiService(http, logger);
        }
      }
    }
  ]
};

