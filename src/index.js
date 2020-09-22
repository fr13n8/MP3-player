const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    width: 350,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true
    },
    frame: false,
    resizable: false
  });

  mainWindow.loadURL(url.format ({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('openFile', (event, arg) => {
  const { dialog } = require('electron')
  const fs = require('fs')

  ipcMain.on('choos-files', (event, arg) => {
    if (arg == 'true') {
      dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Music', extensions: ['mp3'] }
        ]
      }).then( fileNames => {
        if (fileNames == undefined) {
          console.log("No file selected");
        } else {
          readFiles(fileNames.filePaths, fs);
          // console.log(fileNames);
        }
      }).catch(err => {
        console.log(err)
      })
    }
  })

  async function readFiles(filePaths, fs) {
    const mm = require('music-metadata');
    // const util = require('util');
    let files = new Array;

    for (let index = 0; index < filePaths.length; index++) {
      const filepath = filePaths[index];
      let metaData = await mm.parseFile(filepath, {duration: true});

      var callback = (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
      }
      
      var fileName = 'custom_wallpaper.jpg';
      var songName = path.parse(filepath).name;
      if (metaData.common.picture) {
        var fileExt = metaData.common.picture[0].format.split('/')[1];
        fileName = `${+new Date()}.${fileExt}`;
        var photoPath = `./src/assets/${fileName}`;
        fs.writeFile(photoPath, metaData.common.picture[0].data, callback);
      }

      files.push({
        // metaData: util.inspect(metaData, { showHidden: false, depth: null }),
        metaData,
        fileName,
        songName,
        id: index,
        filepath,
        howl: null,
      });
      console.log(files)
    }

    event.sender.send('fileData', files);
  }

})