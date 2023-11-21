// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  //render process -> main process
  openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
  processFiles: (path) => ipcRenderer.invoke("processFiles", path),
  updateAccessToken: (token) => ipcRenderer.invoke("updateAccessToken", token),
  //main process -> render process
  handleUpdateMessage: (callback) => ipcRenderer.on("update-message", callback),
  handlePrintLog: (callback) => ipcRenderer.on("print-log", callback),
  handleSuccess: (callback) => ipcRenderer.on("add-success", callback),
  handleSetProgress: (callback) => ipcRenderer.on("set-progress", callback),
});
