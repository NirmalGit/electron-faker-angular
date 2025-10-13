# 📊 Logging Guide - Distinguishing Web API vs Electron IPC

## 🎯 Overview

This application now includes comprehensive logging to help you distinguish between:
- **🌐 Web API calls** (Browser mode - HTTP/REST)
- **⚡ Electron IPC calls** (Desktop mode - Inter-Process Communication)

---

## 🔍 Log Prefixes & Icons

### Frontend (Angular/Browser Console)

| Prefix | Mode | Description |
|--------|------|-------------|
| `🌐 [WEB API]` | Browser | HTTP calls to FakeStoreAPI |
| `⚡ [ELECTRON IPC]` | Desktop | IPC calls to Electron main process |
| `🖥️ Running in Electron mode` | Desktop | App started in Electron |
| `🌐 Running in Browser mode` | Browser | App started in browser |

### Backend (Electron Main Process - Terminal)

| Prefix | Description |
|--------|-------------|
| `⚡ [ELECTRON MAIN] ◀──` | Incoming IPC request from renderer |
| `⚡ [ELECTRON MAIN] ──▶` | Outgoing IPC response to renderer |
| `⚡ [ELECTRON MAIN] ✗` | IPC error |
| `⚡ [ELECTRON MAIN] ✓` | Success message |

---

## 📱 Example Logs

### 1. **Application Startup**

#### Browser Mode (ng serve):
```
🌐 Running in Browser mode - Using WebApiService
🌐 WebApiService initialized - Using HTTP/REST API mode
```

#### Desktop Mode (npm run electron:serve):
```
🖥️ Running in Electron mode - Using ElectronApiService
⚡ ElectronApiService initialized - Using Electron IPC mode
⚡ [ELECTRON MAIN] Registering product IPC handlers...
⚡ [ELECTRON MAIN] Product IPC handlers registered successfully ✓
```

---

### 2. **Fetching All Products**

#### Browser Mode (HTTP Call):
```javascript
// Frontend Console:
🌐 [WEB API] Fetching all products via HTTP
// ... HTTP request to https://fakestoreapi.com/products
```

#### Desktop Mode (IPC Call):
```javascript
// Frontend Console:
⚡ [ELECTRON IPC] Fetching all products via IPC channel

// Terminal (Electron Main Process):
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 20 products
```

---

### 3. **Fetching Product by ID**

#### Browser Mode (HTTP Call):
```javascript
// Frontend Console:
🌐 [WEB API] Fetching product 5 via HTTP
// ... HTTP GET to https://fakestoreapi.com/products/5
```

#### Desktop Mode (IPC Call):
```javascript
// Frontend Console:
⚡ [ELECTRON IPC] Fetching product 5 via IPC channel

// Terminal (Electron Main Process):
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getById (ID: 5)
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched product 'John Hardy Women's Legends Naga...'
```

---

### 4. **Fetching Categories**

#### Browser Mode (HTTP Call):
```javascript
// Frontend Console:
🌐 [WEB API] Fetching categories via HTTP
```

#### Desktop Mode (IPC Call):
```javascript
// Frontend Console:
⚡ [ELECTRON IPC] Fetching categories via IPC channel

// Terminal (Electron Main Process):
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getCategories
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 4 categories
```

---

### 5. **Fetching Products by Category**

#### Browser Mode (HTTP Call):
```javascript
// Frontend Console:
🌐 [WEB API] Fetching products in category 'electronics' via HTTP
```

#### Desktop Mode (IPC Call):
```javascript
// Frontend Console:
⚡ [ELECTRON IPC] Fetching products in category 'electronics' via IPC channel

// Terminal (Electron Main Process):
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getByCategory (Category: 'electronics')
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 6 products in category 'electronics'
```

---

## 🔧 How to View Logs

### Browser Mode (ng serve)

1. **Start the application:**
   ```bash
   ng serve
   ```

2. **Open browser:** Navigate to `http://localhost:4200`

3. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

4. **Go to Console tab** - You'll see logs like:
   ```
   🌐 Running in Browser mode - Using WebApiService
   🌐 WebApiService initialized - Using HTTP/REST API mode
   🌐 [WEB API] Fetching all products via HTTP
   ```

---

### Desktop Mode (Electron)

#### Frontend Logs (Renderer Process):

1. **Start the application:**
   ```bash
   npm run electron:serve
   ```

2. **Open DevTools in Electron window:**
   - Application automatically opens with DevTools in development mode
   - Or press `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)

3. **Go to Console tab** - You'll see logs like:
   ```
   🖥️ Running in Electron mode - Using ElectronApiService
   ⚡ ElectronApiService initialized - Using Electron IPC mode
   ⚡ [ELECTRON IPC] Fetching all products via IPC channel
   ```

#### Backend Logs (Main Process):

1. **View Terminal/Command Prompt** where you ran `npm run electron:serve`

2. **You'll see logs like:**
   ```
   ⚡ [ELECTRON MAIN] Registering product IPC handlers...
   ⚡ [ELECTRON MAIN] Product IPC handlers registered successfully ✓
   ⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll
   ⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 20 products
   ```

---

## 🎨 Log Flow Visualization

### Browser Mode Flow:
```
┌─────────────────┐
│   Angular App   │ 🌐 [WEB API] Fetching products...
│   (Browser)     │
└────────┬────────┘
         │ HTTP
         │ GET https://fakestoreapi.com/products
         ↓
┌─────────────────┐
│  FakeStoreAPI   │
│   (External)    │
└────────┬────────┘
         │ JSON Response
         ↓
┌─────────────────┐
│   Angular App   │ Data received
│   (Browser)     │
└─────────────────┘
```

### Desktop Mode Flow:
```
┌─────────────────┐
│   Angular App   │ ⚡ [ELECTRON IPC] Fetching products...
│   (Renderer)    │
└────────┬────────┘
         │ IPC: products:getAll
         │ ⚡ [ELECTRON MAIN] ◀── IPC Request
         ↓
┌─────────────────┐
│ Electron Main   │ Fetch from FakeStoreAPI
│    Process      │
└────────┬────────┘
         │ HTTP GET
         ↓
┌─────────────────┐
│  FakeStoreAPI   │
│   (External)    │
└────────┬────────┘
         │ JSON Response
         │ ⚡ [ELECTRON MAIN] ──▶ IPC Response
         ↓
┌─────────────────┐
│   Angular App   │ Data received
│   (Renderer)    │
└─────────────────┘
```

---

## 🐛 Debugging Tips

### 1. **Check Which Mode is Active**

Look for the startup message:
- `🌐 Running in Browser mode` - Web API (HTTP)
- `🖥️ Running in Electron mode` - Electron IPC

### 2. **Filter Logs by Mode**

In browser DevTools console, use filter:
- Filter by `WEB API` - See only HTTP calls
- Filter by `ELECTRON IPC` - See only IPC calls
- Filter by `ELECTRON MAIN` - See only backend IPC handling

### 3. **Track Request Flow**

For Electron mode, correlate logs:
```
Frontend: ⚡ [ELECTRON IPC] Fetching product 5 via IPC channel
Backend:  ⚡ [ELECTRON MAIN] ◀── IPC Request: products:getById (ID: 5)
Backend:  ⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched product...
```

### 4. **Error Tracking**

Errors are clearly marked:
```javascript
// Web API Error:
🌐 [WEB API] Network error: Failed to fetch

// Electron IPC Error:
⚡ [ELECTRON IPC] Error: Electron API not available
⚡ [ELECTRON MAIN] ✗ IPC Error in products:getAll: TypeError...
```

---

## 📝 Log Files (Electron Mode)

Electron logs are saved to disk in development mode:

**Location:**
- **Windows:** `%USERPROFILE%\AppData\Roaming\<app-name>\logs`
- **macOS:** `~/Library/Logs/<app-name>`
- **Linux:** `~/.config/<app-name>/logs`

**Files:**
- `main.log` - Main process logs (IPC handlers, app lifecycle)
- `renderer.log` - Renderer process logs (Angular app)

---

## 🔍 Complete Example Session

### Desktop Mode (Full Flow):

```javascript
// ========== STARTUP ==========
// Terminal:
⚡ [ELECTRON MAIN] Registering product IPC handlers...
⚡ [ELECTRON MAIN] Product IPC handlers registered successfully ✓

// Browser Console:
🖥️ Running in Electron mode - Using ElectronApiService
⚡ ElectronApiService initialized - Using Electron IPC mode

// ========== USER CLICKS "View Products" ==========
// Browser Console:
⚡ [ELECTRON IPC] Fetching all products via IPC channel

// Terminal:
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getAll
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 20 products

// ========== USER CLICKS ON PRODUCT #5 ==========
// Browser Console:
⚡ [ELECTRON IPC] Fetching product 5 via IPC channel

// Terminal:
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getById (ID: 5)
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched product 'John Hardy Women's...'

// ========== USER FILTERS BY CATEGORY ==========
// Browser Console:
⚡ [ELECTRON IPC] Fetching categories via IPC channel

// Terminal:
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getCategories
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 4 categories

// Browser Console:
⚡ [ELECTRON IPC] Fetching products in category 'electronics' via IPC channel

// Terminal:
⚡ [ELECTRON MAIN] ◀── IPC Request: products:getByCategory (Category: 'electronics')
⚡ [ELECTRON MAIN] ──▶ IPC Response: Successfully fetched 6 products in category 'electronics'
```

---

## 🎯 Quick Reference

| Need | Look For | Where |
|------|----------|-------|
| **Which mode am I in?** | `🌐 Running in Browser mode` or `🖥️ Running in Electron mode` | Browser Console |
| **HTTP calls** | `🌐 [WEB API]` | Browser Console |
| **IPC calls (frontend)** | `⚡ [ELECTRON IPC]` | Browser/Electron DevTools |
| **IPC handling (backend)** | `⚡ [ELECTRON MAIN]` | Terminal/Command Prompt |
| **Errors** | `✗` symbol or `Error:` | Both Console & Terminal |
| **Success confirmations** | `✓` symbol or `Successfully` | Both Console & Terminal |

---

## 🚀 Testing the Logging

### Test Script:

1. **Browser Mode:**
   ```bash
   # Terminal 1
   ng serve
   
   # Browser: Open http://localhost:4200
   # DevTools Console: Should see 🌐 [WEB API] logs
   ```

2. **Desktop Mode:**
   ```bash
   # Terminal 1
   npm run electron:serve
   
   # Watch Terminal: Should see ⚡ [ELECTRON MAIN] logs
   # Electron DevTools: Should see ⚡ [ELECTRON IPC] logs
   ```

---

## 📊 Summary

✅ **Easy Mode Identification:** Icons clearly show which mode is active  
✅ **Request Tracking:** Follow requests from frontend to backend  
✅ **Error Debugging:** Quickly identify where errors occur  
✅ **Performance Monitoring:** See response times and data volumes  
✅ **Development Clarity:** Understand data flow in dual-mode architecture  

---

**Last Updated:** October 2025  
**Related Documentation:** 
- [README.md](./README.md) - Main documentation
- [ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md) - System architecture
