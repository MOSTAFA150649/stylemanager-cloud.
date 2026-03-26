const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "StyleManager"
  });

  // En dev, on charge le port de Vite. En prod, le fichier index.html
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  // OUVRE LES DEVTOOLS POUR DEBUGGER
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const userDataPath = app.getPath('userData');
  const isProd = app.isPackaged;
  
  const backendPath = isProd 
    ? path.join(__dirname, 'backend', 'dist', 'server.js')
    : path.join(__dirname, 'backend', 'src', 'server.ts');
  
  const cmd = isProd ? 'node' : 'npx';
  const args = isProd ? [backendPath] : ['ts-node', backendPath];

  backendProcess = spawn(cmd, args, {
    shell: true,
    env: { 
      ...process.env, 
      PORT: 5000,
      USER_DATA_PATH: userDataPath
    }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

app.on('ready', () => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
