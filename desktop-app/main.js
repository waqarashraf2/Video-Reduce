const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const os = require("os");
const { probeVideoFile, processVideoTool, cancelJob } = require("./ffmpeg-engine");

// Ensure proper user cache directory on Windows
try {
  app.setPath("userData", path.join(app.getPath("appData"), "VideoReduceDesktop"));
} catch (_) {}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: "#090d16",
    title: "VideoReduce Desktop - Ultra-Fast Media Suite",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  const indexPath = path.join(__dirname, "index.html");
  mainWindow.loadFile(indexPath);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// ==========================================
// 🔌 IPC Handlers for Native OS & FFmpeg
// ==========================================

// 1. Native File Picker (Supports 100GB+ files instantly without RAM limits)
ipcMain.handle("dialog:select-video", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Video File",
    properties: ["openFile"],
    filters: [
      {
        name: "Video & Media Files",
        extensions: ["mp4", "mkv", "mov", "webm", "avi", "flv", "wmv", "m4v", "ts", "3gp", "mp3", "wav", "aac"],
      },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  try {
    const meta = await probeVideoFile(selectedPath);
    return meta;
  } catch (err) {
    return {
      path: selectedPath,
      name: path.basename(selectedPath),
      error: err.message,
    };
  }
});

// 2. Select Output Save Path
ipcMain.handle("dialog:select-save-path", async (event, defaultName) => {
  const downloadsPath = app.getPath("downloads");
  const ext = (defaultName && defaultName.split(".").pop()) || "mp4";
  const result = await dialog.showSaveDialog(mainWindow, {
    title: "Save Processed File",
    defaultPath: path.join(downloadsPath, defaultName || "output_video.mp4"),
    filters: [{ name: `${ext.toUpperCase()} File`, extensions: [ext, "*"] }],
  });

  if (result.canceled) return null;
  return result.filePath;
});

// 3. Probe file directly
ipcMain.handle("ffmpeg:probe", async (event, filePath) => {
  return await probeVideoFile(filePath);
});

// 4. Start Native Processing Job (All 18 Tools)
ipcMain.handle("ffmpeg:compress", async (event, { jobId, toolId = "video-compressor", options }) => {
  return await processVideoTool(jobId, toolId, options, (progressData) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("ffmpeg:progress", { jobId, ...progressData });
    }
  });
});

// 5. Cancel Compression Job
ipcMain.handle("ffmpeg:cancel", async (event, jobId) => {
  return cancelJob(jobId);
});

// 6. Reveal output video in Windows File Explorer
ipcMain.handle("shell:open-folder", async (event, filePath) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
    return true;
  }
  return false;
});

// 7. Open external links in default browser
ipcMain.handle("shell:open-external", async (event, url) => {
  if (url) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});
