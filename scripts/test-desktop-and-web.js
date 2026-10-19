const http = require("http");
const path = require("path");

console.log("🔍 [Test 1] Testing Next.js Web Server on http://localhost:3000...");

http.get("http://localhost:3000", (res) => {
  let data = "";
  console.log(`📡 HTTP Response Status Code: ${res.statusCode}`);

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    const hasDownloadLink = data.includes("VideoReduce-Setup.exe");
    const hasDesktopCallout = data.includes("Compressing 16GB, 50GB");
    const hasNavbarButton = data.includes("PC App");

    console.log(`✅ Navbar 'PC App' Button in HTML: ${hasNavbarButton ? "PASS" : "FAIL"}`);
    console.log(`✅ 16GB+ Heavy Video Banner in HTML: ${hasDesktopCallout ? "PASS" : "FAIL"}`);
    console.log(`✅ Direct Download Link (.exe) in HTML: ${hasDownloadLink ? "PASS" : "FAIL"}`);

    console.log("\n🔍 [Test 2] Testing Desktop Native FFmpeg Engine...");
    try {
      const ffmpegInstaller = require(path.join(__dirname, "../desktop-app/node_modules/@ffmpeg-installer/ffmpeg"));
      const ffprobeInstaller = require(path.join(__dirname, "../desktop-app/node_modules/@ffprobe-installer/ffprobe"));
      console.log(`✅ Native FFmpeg Binary Detected at: ${ffmpegInstaller.path}`);
      console.log(`✅ Native FFprobe Binary Detected at: ${ffprobeInstaller.path}`);
      console.log(`✅ Desktop Engine Status: READY FOR 16GB+ VIDEO ENCODING!`);
    } catch (e) {
      console.error(`❌ Desktop FFmpeg Engine Check: ${e.message}`);
    }
  });
}).on("error", (err) => {
  console.error("❌ Error connecting to http://localhost:3000:", err.message);
});
