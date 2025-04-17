import { app, BrowserWindow, session } from "electron";
import path from "node:path";
import { secureWindowConfig, sessionSecurityConfig, validateSecureUrl } from "./security/electron-security-config";

/**
 * Configuração principal da aplicação Electron
 * 
 * TODO: Serviços serão implementados via issue #123
 */

function createWindow() {
  const mainWindow = new BrowserWindow({
    ...secureWindowConfig,
    width: 1200,
    height: 800,
    show: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 }
  });

  // Configuração adicional de segurança
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!validateSecureUrl(url)) {
      event.preventDefault();
      console.warn(`Blocked navigation to insecure URL: ${url}`);
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../../../../index.html'));
  mainWindow.on('ready-to-show', () => mainWindow.show());
}

// Configura sessão segura
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['clipboard-read', 'clipboard-sanitized-write'];
    callback(allowedPermissions.includes(permission));
  });

  session.defaultSession.setCertificateVerifyProc(sessionSecurityConfig.certificateVerifyProc);
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
