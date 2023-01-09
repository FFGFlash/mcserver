import { app, BrowserWindow } from 'electron'
import path from 'path'

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true }
  })
  window.setMenuBarVisibility(false)
  window.loadFile(path.join(__dirname, 'app/index.html'))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  process.platform === 'darwin' && app.quit()
})

app.on('activate', () => {
  BrowserWindow.getAllWindows().length === 0 && createWindow()
})
