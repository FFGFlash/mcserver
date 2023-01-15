import { ipcRenderer, IpcRendererEvent } from 'electron'

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
