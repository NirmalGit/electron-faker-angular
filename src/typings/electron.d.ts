export {};

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getAppConfig: () => Promise<any>;
      quitApp: () => Promise<void>;
    };
  }
}
