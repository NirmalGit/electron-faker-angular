# 🔧 Environment-Based Logging Configuration

## 🎯 Overview

The application now includes **environment-aware logging** that automatically adjusts based on the build mode:

- **Development Mode** (`ng serve`, `npm run electron:serve`) - **All logs visible**
- **Production Mode** (`ng build`, `npm run electron:dist`) - **Only errors visible**

This ensures:
✅ Detailed debugging information in development  
✅ Clean console in production  
✅ Better performance (no unnecessary logging overhead)  
✅ Security (sensitive information not exposed in production)

---

## 📋 How It Works

### Angular (Frontend)

#### LoggerService
The new `LoggerService` uses Angular's `isDevMode()` to detect the environment:

```typescript
import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private isDevelopment = isDevMode();
  
  log(prefix: string, message: string, ...params: any[]): void {
    if (this.isDevelopment) {
      console.log(`${prefix} ${message}`, ...params);
    }
  }
  
  error(prefix: string, message: string, ...params: any[]): void {
    // Errors are ALWAYS logged (even in production)
    console.error(`${prefix} ${message}`, ...params);
  }
}
```

**Key Points:**
- `isDevMode()` returns `true` for `ng serve` and development builds
- `isDevMode()` returns `false` for `ng build` (production)
- Error logs are **always shown** (even in production) for debugging critical issues

---

### Electron (Backend)

#### IPC Handlers
Electron IPC handlers check `process.env.ELECTRON_DEV`:

```typescript
const IS_DEV = process.env.ELECTRON_DEV === 'true';

// Configure electron-log based on environment
if (IS_DEV) {
  log.transports.console.level = 'debug';  // Show all logs
  log.transports.file.level = 'debug';
} else {
  log.transports.console.level = 'error';  // Only errors
  log.transports.file.level = 'warn';      // Warnings and errors in file
}

export function registerProductHandlers(): void {
  if (IS_DEV) {
    log.info('⚡ [ELECTRON MAIN] Registering handlers...');
  }
  
  ipcMain.handle('products:getAll', async () => {
    if (IS_DEV) {
      log.info('⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll');
    }
    // ... handler logic
  });
}
```

**Key Points:**
- Development: `ELECTRON_DEV=true` (set by `npm run electron:serve`)
- Production: `ELECTRON_DEV` is undefined (production builds)
- File logs always saved for troubleshooting

---

## 🔍 Log Behavior by Environment

### Development Mode

#### Browser Console (ng serve):
```
🔧 [LOGGER] Development mode - Logging enabled
🌐 Running in Browser mode - Using WebApiService
🌐 WebApiService initialized - Using HTTP/REST API mode
🌐 [WEB API] Fetching all products via HTTP
🌐 [WEB API] Fetching product 5 via HTTP
🌐 [WEB API] Fetching categories via HTTP
```

#### Electron DevTools (npm run electron:serve):
```
🔧 [LOGGER] Development mode - Logging enabled
🖥️ Running in Electron mode - Using ElectronApiService
⚡ ElectronApiService initialized - Using Electron IPC mode
⚡ [ELECTRON IPC] Fetching all products via IPC channel
⚡ [ELECTRON IPC] Fetching product 5 via IPC channel
```

#### Terminal (Electron Main Process):
```
⚡ [ELECTRON MAIN] Registering product IPC handlers...
⚡ [ELECTRON MAIN] Product IPC handlers registered successfully ✓
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 20 products
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getById (ID: 5)
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched product...
```

---

### Production Mode

#### Browser Console (ng build):
```
(Clean - No logs shown)
```

**Only errors will appear:**
```
🌐 [WEB API] Network error: Failed to fetch
```

#### Electron Production Build:
```
(Terminal - Clean, only errors shown)
```

**Only critical errors appear:**
```
⚡ [ELECTRON MAIN] ✗ IPC Error in products:getAll: NetworkError
```

---

## 🛠️ Development Commands

### Angular Development (with logs):
```bash
ng serve
# or
npm start
# Logs: ✅ Visible in browser console
```

### Electron Development (with logs):
```bash
npm run electron:serve
# Logs: ✅ Visible in DevTools + Terminal
```

### Run Tests (with logs):
```bash
ng test
# Logs: ✅ Visible during test execution
```

---

## 📦 Production Commands

### Angular Production Build (no logs):
```bash
ng build
# Creates production build in dist/
# Logs: ❌ Suppressed (except errors)
```

### Electron Production Build (no logs):
```bash
npm run electron:build
# Compiles Electron for production
# Logs: ❌ Suppressed (except errors)
```

### Create Distributable (no logs):
```bash
npm run electron:dist
# Creates installable packages
# Logs: ❌ Suppressed (except errors)
```

---

## 🎨 LoggerService API

### Available Methods

```typescript
import { LoggerService } from './core/services/logger.service';

constructor(private logger: LoggerService) {}

// Info/Log messages (dev only)
this.logger.log('🌐 [WEB API]', 'Fetching data');
this.logger.info('⚡ [ELECTRON IPC]', 'Processing request');

// Warnings (dev only)
this.logger.warn('⚠️ [WARNING]', 'Deprecated API used');

// Errors (always shown)
this.logger.error('❌ [ERROR]', 'Request failed:', error);

// Debug messages (dev only)
this.logger.debug('🔍 [DEBUG]', 'Variable value:', value);

// Grouped logs (dev only)
this.logger.group('API Requests', () => {
  this.logger.log('', 'Request 1');
  this.logger.log('', 'Request 2');
});

// Collapsed groups (dev only)
this.logger.groupCollapsed('Details', () => {
  this.logger.log('', 'Detail 1');
  this.logger.log('', 'Detail 2');
});

// Tables (dev only)
this.logger.table(products, ['id', 'title', 'price']);

// Timers (dev only)
this.logger.time('operation');
// ... operation ...
this.logger.timeEnd('operation'); // "operation: 123ms"

// Check environment
if (this.logger.isDev()) {
  // Development-only code
}
```

---

## 🔧 Customization

### Change Log Levels

#### Angular (Frontend):
Modify `logger.service.ts`:

```typescript
log(prefix: string, message: string, ...params: any[]): void {
  // Option 1: Keep all dev logs
  if (this.isDevelopment) {
    console.log(`${prefix} ${message}`, ...params);
  }
  
  // Option 2: Only show specific prefixes in production
  if (this.isDevelopment || prefix.includes('[ERROR]')) {
    console.log(`${prefix} ${message}`, ...params);
  }
}
```

#### Electron (Backend):
Modify `product.ipc.ts`:

```typescript
// Option 1: Current setup (dev only)
if (IS_DEV) {
  log.info('⚡ [ELECTRON MAIN] Request received');
}

// Option 2: Always log specific events
log.info('⚡ [ELECTRON MAIN] Critical operation');

// Option 3: Custom log levels
if (IS_DEV) {
  log.transports.console.level = 'silly'; // Most verbose
} else {
  log.transports.console.level = 'error'; // Only errors
}
```

---

## 📊 Log Levels Reference

### Angular Console Levels:
| Level | Dev | Prod | Use Case |
|-------|-----|------|----------|
| `log()` | ✅ | ❌ | General info |
| `info()` | ✅ | ❌ | Informational |
| `warn()` | ✅ | ❌ | Warnings |
| `error()` | ✅ | ✅ | **Errors (always)** |
| `debug()` | ✅ | ❌ | Debug info |

### Electron Log Levels:
| Level | Dev Console | Dev File | Prod Console | Prod File | Use Case |
|-------|-------------|----------|--------------|-----------|----------|
| `silly` | ✅ | ✅ | ❌ | ❌ | Very verbose |
| `debug` | ✅ | ✅ | ❌ | ❌ | Debug info |
| `verbose` | ✅ | ✅ | ❌ | ❌ | Detailed info |
| `info` | ✅ | ✅ | ❌ | ❌ | General info |
| `warn` | ✅ | ✅ | ❌ | ✅ | Warnings |
| `error` | ✅ | ✅ | ✅ | ✅ | **Errors** |

---

## 🧪 Testing Logging Behavior

### 1. Test Development Mode (Angular):
```bash
ng serve
# Open http://localhost:4200
# Open DevTools (F12) → Console
# Should see: 🔧 [LOGGER] Development mode - Logging enabled
# Should see: All 🌐 [WEB API] logs
```

### 2. Test Production Mode (Angular):
```bash
ng build
# Serve the dist folder (e.g., with http-server)
npx http-server dist/electron-faker-angular/browser -p 8080
# Open http://localhost:8080
# Open DevTools (F12) → Console
# Should see: (Clean console, no dev logs)
# Trigger an error
# Should see: Only error logs
```

### 3. Test Development Mode (Electron):
```bash
npm run electron:serve
# Terminal should show: ⚡ [ELECTRON MAIN] logs
# DevTools should show: ⚡ [ELECTRON IPC] logs
```

### 4. Test Production Mode (Electron):
```bash
npm run electron:build
# Terminal should be clean
# Only errors should appear
```

---

## 🔐 Security Benefits

### Why Suppress Logs in Production?

1. **Performance**: Reduced console operations improve runtime performance
2. **Security**: Prevents exposure of:
   - API endpoints and parameters
   - Internal application structure
   - Debug information that could aid attackers
   - User data in log messages
3. **User Experience**: Clean console for end users
4. **Professionalism**: Production apps shouldn't show debug info

### What's Still Logged in Production?

✅ **Critical Errors** - Essential for troubleshooting  
✅ **File Logs** (Electron) - Saved to disk for support  
❌ **Debug Messages** - Suppressed  
❌ **Info Messages** - Suppressed  
❌ **API Call Details** - Suppressed  

---

## 📁 Files Modified

1. ✅ **`src/app/core/services/logger.service.ts`** (NEW)
   - Environment-aware logging service
   - Uses Angular's `isDevMode()`

2. ✅ **`src/app/core/services/web-api.service.ts`**
   - Replaced `console.log()` with `logger.log()`
   - Replaced `console.error()` with `logger.error()`

3. ✅ **`src/app/core/services/electron-api.service.ts`**
   - Replaced `console.log()` with `logger.log()`
   - Replaced `console.error()` with `logger.error()`

4. ✅ **`src/app/app.config.ts`**
   - Inject LoggerService into factory
   - Use logger for startup messages

5. ✅ **`electron/ipc/product.ipc.ts`**
   - Added `IS_DEV` environment check
   - Conditional logging based on environment
   - Configured electron-log levels

---

## 🎉 Summary

### Development Mode
✅ **Full logging enabled**  
✅ Detailed request/response information  
✅ Performance timers and debug info  
✅ Color-coded console messages  

### Production Mode
✅ **Clean console** (better performance)  
✅ **Security** (no sensitive info exposed)  
✅ **Error tracking** (critical errors still logged)  
✅ **Professional appearance**  

---

**Your application now has production-ready logging! 🚀**

The logging system automatically adapts to the environment, giving you detailed debugging information in development while keeping production builds clean and secure.
