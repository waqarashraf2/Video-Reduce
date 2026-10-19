const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,

  // 1. File Dialogs
  selectVideoFile: () => ipcRenderer.invoke("dialog:select-video"),
  selectSavePath: (defaultName) => ipcRenderer.invoke("dialog:select-save-path", defaultName),

  // 2. Video Analysis & Compression
  probeFile: (filePath) => ipcRenderer.invoke("ffmpeg:probe", filePath),
  compressVideo: (jobId, toolId, options) => ipcRenderer.invoke("ffmpeg:compress", { jobId, toolId, options }),
  cancelJob: (jobId) => ipcRenderer.invoke("ffmpeg:cancel", jobId),
  appVersion: "1.0.0",

  // 3. System Actions
  openFolder: (filePath) => ipcRenderer.invoke("shell:open-folder", filePath),
  openExternal: (url) => ipcRenderer.invoke("shell:open-external", url),

  // 4. Real-time Event Subscriptions
  onProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on("ffmpeg:progress", handler);
    return () => ipcRenderer.removeListener("ffmpeg:progress", handler);
  },
});
