const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "dist");
const targetDir = path.join(__dirname, "../public/downloads");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  const exeFile = files.find((f) => f.endsWith(".exe") && !f.includes("blockmap"));

  if (exeFile) {
    const srcPath = path.join(distDir, exeFile);
    const destPath = path.join(targetDir, "VideoReduce-Setup.exe");
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ [Desktop Build] Successfully copied ${exeFile} to public/downloads/VideoReduce-Setup.exe`);

    const outDir = path.join(__dirname, "../out/downloads");
    if (fs.existsSync(outDir)) {
      fs.copyFileSync(srcPath, path.join(outDir, "VideoReduce-Setup.exe"));
      console.log(`✅ [Desktop Build] Successfully copied ${exeFile} to out/downloads/VideoReduce-Setup.exe`);
    }
  } else {
    const unpackedExe = path.join(distDir, "win-unpacked", "VideoReduce.exe");
    if (fs.existsSync(unpackedExe)) {
      const destPath = path.join(targetDir, "VideoReduce-Setup.exe");
      fs.copyFileSync(unpackedExe, destPath);
      console.log(`✅ [Desktop Build] Successfully copied win-unpacked/VideoReduce.exe to public/downloads/VideoReduce-Setup.exe`);
    }
  }
}
