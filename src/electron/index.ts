import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeTheme,
  Menu
} from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import Server from './server'

const { NODE_ENV = 'production' } = process.env

export let window!: BrowserWindow

const MenuTemplate: (
  | Electron.MenuItemConstructorOptions
  | Electron.MenuItem
)[] = []
if (process.platform === 'darwin') {
  const name = app.getName()
  MenuTemplate.unshift({
    label: name,
    submenu: [
      { label: `About ${name}`, role: 'about' },
      { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
    ]
  })
}

export async function confirm(title: string, message: string) {
  const { response } = await dialog.showMessageBox(window, {
    type: 'question',
    title,
    message,
    buttons: ['Agree', 'Disagree']
  })
  return response === 0
}

export function send(event: string, ...args: any[]) {
  window.webContents.send(event, ...args)
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: NODE_ENV === 'development',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      devTools: NODE_ENV === 'development',
      preload: path.join(__dirname, 'preload.js')
    }
  })
  await window.loadFile(path.join(__dirname, 'app/index.html'))
  window.show()
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
  ipcMain.on('ready', () => {
    if (NODE_ENV === 'development') send('update-ignored')
    else autoUpdater.checkForUpdates()
  })

  autoUpdater.on('checking-for-update', () => send('checking-for-update'))
  autoUpdater.on('update-available', () => {
    send('update-checked', true)
    confirm(
      'Update Available',
      'Would you like to download the latest version?'
    ).then(agreed => {
      if (!agreed) return send('update-ignored')
      autoUpdater.downloadUpdate()
      send('update-started')
    })
  })
  autoUpdater.on('update-not-available', () => send('update-checked', false))
  autoUpdater.on('error', error => send('update-error', error))
  autoUpdater.on('download-progress', progress =>
    send('download-progress', progress)
  )
  autoUpdater.on('update-downloaded', info => {
    send('update-downloaded', info)
    confirm('Update Downloaded', 'Would you like to quit and install?').then(
      agreed => {
        if (!agreed) return send('update-ignored')
        autoUpdater.quitAndInstall()
      }
    )
  })

  if (NODE_ENV === 'production') {
    const menu = Menu.buildFromTemplate(MenuTemplate)
    Menu.setApplicationMenu(menu)
  }

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  window = await createWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0)
      window = await createWindow()
  })
})

app.on('window-all-closed', async () => {
  await Server.quit()
  await Server.save()
  // eslint-disable-next-line no-console
  console.log('Safely shutdown')
  if (process.platform !== 'darwin') app.quit()
})
