// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
  processFiles: (path) => ipcRenderer.invoke("processFiles", path),
  handleUpdateMessage: (callback) => ipcRenderer.on("update-message", callback),
  handlePrintLog: (callback) => ipcRenderer.on("print-log", callback),
  updateAccessToken: (token) => ipcRenderer.invoke("updateAccessToken", token),
});
