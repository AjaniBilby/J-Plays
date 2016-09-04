const electron = require('electron');
const client = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const globalShortcut = electron.globalShortcut;
const ipcMain = electron.ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

var settings = {};

let template = [{
  label: 'View',
  submenu: []
}];

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, frame: true});

  // and load the index.html of the client.
  mainWindow.loadURL(`file://${__dirname}/app/library.html`);

  mainWindow.setMenu(null);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.setFullScreen(false);
}

client.on('ready', function(){
  createWindow();
  globalShortcut.register('CommandOrControl+Shift+R', function() {
    mainWindow.reload();
  });
  globalShortcut.register('`', function(){
    mainWindow.webContents.openDevTools();
  });
  globalShortcut.register("F11", function(){
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });
});

// Quit when all windows are closed.
client.on('window-all-closed', function () {
  // On OS X it is common for clientlications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    client.quit();
  }
});

client.on('activate', function () {
  // On OS X it's common to re-create a window in the client when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  } // hello
});
