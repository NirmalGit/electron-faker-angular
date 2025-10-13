import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { routes } from './app.routes';
import { IDataApi } from './core/interfaces/idata-api.interface';
import { WebApiService } from './core/services/web-api.service';
import { ElectronApiService } from './core/services/electron-api.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: IDataApi,
      useFactory: () => {
        const isElectron = typeof window !== 'undefined' && 
                           typeof (window as any).electronAPI !== 'undefined';
        
        if (isElectron) {
          console.log('🖥️ Running in Electron mode - Using ElectronApiService');
          return new ElectronApiService();
        } else {
          console.log('🌐 Running in Browser mode - Using WebApiService');
          const http = inject(HttpClient);
          return new WebApiService(http);
        }
      }
    }
  ]
};

