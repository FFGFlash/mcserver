import { ipcRenderer, IpcRendererEvent } from 'electron'
import { ProgressInfo, UpdateDownloadedEvent } from 'electron-updater'

window.serverAPI = {
  create() {
    return ipcRenderer.invoke('create-server')
  },

  get(id) {
    return ipcRenderer.invoke('get-server', id)
  },

  getAll() {
    return ipcRenderer.invoke('get-servers')
  },

  update(id, name, version, minMemory, softMaxMemory, maxMemory) {
    ipcRenderer.send(
      'update-server',
      id,
      name,
      version,
      minMemory,
      softMaxMemory,
      maxMemory
    )
  },

  start(id) {
    ipcRenderer.send('start-server', id)
  },

  stop(id) {
    ipcRenderer.send('stop-server', id)
  },

  delete(id) {
    ipcRenderer.send('delete-server', id)
  },

  getVersions() {
    return ipcRenderer.invoke('get-versions')
  },

  getLogs(id) {
    return ipcRenderer.invoke('get-server-logs', id)
  },

  execute(id, command) {
    ipcRenderer.send('execute-server-command', id, command)
  },

  getStatus(id) {
    return ipcRenderer.invoke('get-server-status', id)
  },

  onStatusChange(id, callback) {
    const handleCallback = (
      _: IpcRendererEvent,
      oid: string,
      status: IServerStatus
    ) => id === oid && callback(status)
    ipcRenderer.on('server-status-changed', handleCallback)
    return () => {
      ipcRenderer.off('server-status-changed', handleCallback)
    }
  },

  onLog(id, callback) {
    const handleCallback = (
      _: IpcRendererEvent,
      oid: string,
      log: IServerLog
    ) => id === oid && callback(log)

    ipcRenderer.on('server-log', handleCallback)
    return () => {
      ipcRenderer.off('server-log', handleCallback)
    }
  },

  setProperties(id, properties) {
    ipcRenderer.send('set-server-properties', id, properties)
  },

  getProperties(id) {
    return ipcRenderer.invoke('get-server-properties', id)
  }
}

window.darkModeAPI = {
  isDarkMode() {
    return ipcRenderer.invoke('dark-mode')
  },

  useDefault() {
    return ipcRenderer.invoke('dark-mode:system')
  },

  toggle() {
    return ipcRenderer.invoke('dark-mode:toggle')
  },

  changed(callback) {
    const handleCallback = (_: IpcRendererEvent, darkMode: boolean) =>
      callback(darkMode)
    ipcRenderer.on('dark-mode:changed', handleCallback)
    return () => ipcRenderer.off('dark-mode:changed', handleCallback)
  }
}

window.updateAPI = {
  onChecking(callback) {
    const handleCallback = () => callback()
    ipcRenderer.on('checking-for-update', handleCallback)
    return () => ipcRenderer.off('checking-for-update', handleCallback)
  },

  onChecked(callback) {
    const handleCallback = (_: IpcRendererEvent, available: boolean) =>
      callback(available)
    ipcRenderer.on('update-checked', handleCallback)
    return () => ipcRenderer.off('update-checked', handleCallback)
  },

  onError(callback) {
    const handleCallback = (_: IpcRendererEvent, error: Error) =>
      callback(error)
    ipcRenderer.on('update-error', handleCallback)
    return () => ipcRenderer.off('update-error', handleCallback)
  },

  onProgress(callback) {
    const handleCallback = (_: IpcRendererEvent, progress: ProgressInfo) =>
      callback(progress)
    ipcRenderer.on('update-error', handleCallback)
    return () => ipcRenderer.off('update-error', handleCallback)
  },

  onDownloaded(callback) {
    const handleCallback = (_: IpcRendererEvent, info: UpdateDownloadedEvent) =>
      callback(info)
    ipcRenderer.on('update-downloaded', handleCallback)
    return () => ipcRenderer.off('update-downloaded', handleCallback)
  },

  onIgnored(callback) {
    const handleCallback = () => callback()
    ipcRenderer.on('update-ignored', handleCallback)
    return () => ipcRenderer.off('update-ignored', handleCallback)
  }
}

window.appAPI = {
  ready() {
    ipcRenderer.send('ready')
  }
}
