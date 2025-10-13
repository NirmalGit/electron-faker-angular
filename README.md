# Electron + Angular Desktop Application

This project combines Angular 20 with Electron 38 to create a cross-platform desktop application. It was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.4.

## 🚀 Quick Start

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development Mode
To run the application in development mode:

```bash
npm run electron:serve
```

This command will:
1. Start the Angular dev server on `http://localhost:4200/`
2. Compile the Electron TypeScript files
3. Launch the Electron app with DevTools enabled

### Angular Only Development
To start only the Angular development server:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

## 📁 Project Structure

```
electron-faker-angular/
├── dist-electron/          # Compiled Electron files
│   ├── main.js             # Main Electron process
│   └── preload.js          # Preload script
├── electron/               # Electron TypeScript source
│   ├── main.ts             # Main process source
│   ├── preload.ts          # Preload script source
│   └── tsconfig.json       # Electron TypeScript config
├── src/                    # Angular application source
│   ├── app/                # Angular app components
│   ├── typings/            # TypeScript definitions
│   ├── index.html          # Main HTML file
│   ├── main.ts             # Angular bootstrap
│   └── styles.scss         # Global styles
├── public/                 # Static assets
└── package.json            # Project dependencies and scripts
```

## 🛠️ Available Scripts

- `npm run electron:serve` - Run in development mode (Angular + Electron)
- `npm run electron:build` - Compile Electron TypeScript files
- `npm run electron:dist` - Build for production and create distributables
- `ng serve` - Run only Angular development server
- `ng build` - Build Angular application for production
- `ng test` - Run unit tests

## 🔧 Building for Production

### Angular Build
```bash
ng build
```

### Electron Build
```bash
npm run electron:build
```

### Complete Production Build
```bash
npm run electron:dist
```

This will compile your project and create distributable packages in the `dist/` directory.

## 🧪 Testing

### Unit Tests
To execute unit tests with the [Karma](https://karma-runner.github.io) test runner:

```bash
ng test
```

## 🐛 Troubleshooting & Issue Resolution Log

### Issue #1: PowerShell Script Syntax Errors (Fixed)
**Problem**: `test.ps1` had syntax errors with missing closing braces and special character encoding issues.

**Error Messages**:
```
Missing closing '}' in statement block or type definition.
Unexpected token ')' in expression or statement.
```

**Solution**: 
- Fixed missing curly braces in the PowerShell function
- Replaced problematic Unicode characters (├──, │) with proper character codes
- Used string concatenation instead of format operators

**Files Modified**: `test.ps1`

### Issue #2: Electron Main Process Import Error (Fixed)
**Problem**: `app` was undefined when running TypeScript directly with ts-node.

**Error Message**:
```
TypeError: Cannot read properties of undefined (reading 'whenReady')
```

**Root Cause**: `ts-node electron/main.ts` couldn't properly import Electron modules in Node.js context.

**Solution**: 
- Modified `package.json` scripts to compile TypeScript first, then run with Electron
- Changed from: `ts-node electron/main.ts`
- Changed to: `tsc -p electron/tsconfig.json && electron dist-electron/main.js`

**Files Modified**: `package.json`

### Issue #3: Angular App Not Loading in Electron (Fixed)
**Problem**: Electron window opened but Angular application failed to load due to timing issues.

**Error Message**:
```
Failed to load URL: http://localhost:4200/ with error: ERR_CONNECTION_REFUSED
```

**Root Cause**: Electron tried to load Angular before the dev server was ready.

**Solution**: 
- Added retry logic with async/await in `electron/main.ts`
- Implemented 2-second delay retry mechanism
- Added proper error handling for connection failures

**Files Modified**: `electron/main.ts`

**Code Changes**:
```typescript
// Before: Direct URL loading
mainWindow.loadURL("http://localhost:4200");

// After: Retry logic with error handling
const loadAngularApp = async () => {
  try {
    await mainWindow!.loadURL("http://localhost:4200");
    mainWindow!.webContents.openDevTools();
  } catch (error) {
    console.log("Angular dev server not ready, retrying in 2 seconds...");
    setTimeout(loadAngularApp, 2000);
  }
};
loadAngularApp();
```

## 📝 Development Notes

### Key Dependencies
- **Angular**: ^20.3.0 (Latest Angular framework)
- **Electron**: ^38.2.2 (Desktop app framework)
- **TypeScript**: Latest (Type safety)
- **Bootstrap**: ^5.3.3 (UI framework)
- **Angular Material**: ^20.2.8 (Material Design components)

### Development Workflow
1. Run `npm run electron:serve` for full development
2. Both Angular and Electron will auto-reload on changes
3. Angular dev server starts first, Electron follows
4. DevTools are automatically opened in development mode

### Common Issues Prevention
- Always wait for Angular dev server to be ready before accessing the app
- Use the provided npm scripts instead of running commands manually
- Check that ports 4200 is available for Angular dev server
- Ensure all dependencies are installed with `npm install`

## 🔍 Debugging Tips

1. **Check Terminal Output**: Always monitor both Angular and Electron process outputs
2. **DevTools**: Use Electron DevTools (F12) for frontend debugging
3. **Console Logs**: Check both main process and renderer process logs
4. **Port Conflicts**: Ensure port 4200 is available for Angular dev server
5. **Clean Build**: If issues persist, delete `node_modules` and `dist-electron`, then reinstall

## 📄 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Angular CLI Reference](https://angular.io/cli)
- [Electron Builder](https://www.electron.build/)

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
