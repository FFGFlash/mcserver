import { app, BrowserWindow, ipcMain, dialog, nativeTheme } from 'electron'
import path from 'path'
import Server from './server'

export let window!: BrowserWindow

export async function confirm(title: string, message: string) {
  const { response } = await dialog.showMessageBox(window, {
    type: 'question',
    title,
    message,
    buttons: ['agree', 'disagree']
  })
  return response === 0
}

export function send(event: string, ...args: any[]) {
  window.webContents.send(event, ...args)
}

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  window.setMenuBarVisibility(false)
  window
    .loadFile(path.join(__dirname, 'app/index.html'))
    .then(() => window.show())
  return window
}

app.on('ready', async () => {
  await Server.load()

  //* Dark Mode
  ipcMain.handle('dark-mode', () => nativeTheme.shouldUseDarkColors)
  ipcMain.handle('dark-mode:toggle', () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
    window.webContents.send(
      'dark-mode:changed',
      nativeTheme.shouldUseDarkColors
    )
    return nativeTheme.shouldUseDarkColors
  })
  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
    window.webContents.send(
      'dark-mode:changed',
      nativeTheme.shouldUseDarkColors
    )
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('get-versions', () => Server.getVersions())
  ipcMain.handle('create-server', () => Server.create().then(s => s.info))
  ipcMain.handle('get-server', (_, id) => Server.get(id).then(s => s.info))
  ipcMain.handle('get-servers', () =>
    Server.get().then(s => s.map(s => s.info))
  )
  ipcMain.handle('get-server-status', (_, id) =>
    Server.get(id).then(s => s.status)
  )
  ipcMain.handle('get-server-logs', (_, id) => Server.get(id).then(s => s.logs))
  ipcMain.handle('get-server-properties', (_, id) =>
    Server.get(id).then(s => s.getProperties())
  )

  ipcMain.on('delete-server', (_, id) => Server.delete(id))
  ipcMain.on(
    'update-server',
    (_, id, name, version, minMemory, softMaxMemory, maxMemory) =>
      Server.update(id, name, version, minMemory, softMaxMemory, maxMemory)
  )
  ipcMain.on('execute-server-command', (_, id, command) =>
    Server.get(id).then(s => s.execute(command))
  )
  ipcMain.on('start-server', (_, id) => Server.get(id).then(s => s.start()))
  ipcMain.on('stop-server', (_, id) => Server.get(id).then(s => s.stop()))
  ipcMain.on('set-server-properties', (_, id, properties) =>
    Server.get(id).then(s => s.setProperties(properties))
  )

  window = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) window = createWindow()
  })
})

app.on('window-all-closed', async () => {
  await Server.quit()
  await Server.save()
  // eslint-disable-next-line no-console
  console.log('Safely shutdown')
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  BrowserWindow.getAllWindows().length === 0 && createWindow()
})
