const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(outDir)) {
  console.log('Out directory does not exist, skipping postbuild.');
  process.exit(0);
}

// 1. Copy public/.htaccess and public/_headers to out/
const htaccessSrc = path.join(publicDir, '.htaccess');
const htaccessDest = path.join(outDir, '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, htaccessDest);
  console.log('✅ Copied public/.htaccess to out/.htaccess');
}
const headersSrc = path.join(publicDir, '_headers');
const headersDest = path.join(outDir, '_headers');
if (fs.existsSync(headersSrc)) {
  fs.copyFileSync(headersSrc, headersDest);
  console.log('✅ Copied public/_headers to out/_headers');
}

// 2. Recursively ensure every page has both a .html file and a matching folder/index.html
// This guarantees that BOTH /path and /path/ ALWAYS return HTTP 200 OK across all servers!
function ensureFolderIndices(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_next') {
        ensureFolderIndices(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html' && entry.name !== '404.html') {
      const baseName = entry.name.replace(/\.html$/, '');
      const folderPath = path.join(dir, baseName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      const targetIndex = path.join(folderPath, 'index.html');
      if (!fs.existsSync(targetIndex)) {
        fs.copyFileSync(fullPath, targetIndex);
      }
      // Also mirror Next.js App Router RSC flight payload (.txt) to index.txt if present
      const txtSource = path.join(dir, `${baseName}.txt`);
      if (fs.existsSync(txtSource)) {
        const targetTxt = path.join(folderPath, 'index.txt');
        if (!fs.existsSync(targetTxt)) {
          fs.copyFileSync(txtSource, targetTxt);
        }
      }
    }
  }
}
ensureFolderIndices(outDir);
console.log('✅ Created dual-route index.html and index.txt mirrors for all tools, articles, and pages!');

// 3. Remove legacy out/en directory if present to prevent duplicate English routes
const enDir = path.join(outDir, 'en');
if (fs.existsSync(enDir)) {
  fs.rmSync(enDir, { recursive: true, force: true });
  console.log('✅ Cleaned legacy out/en directory to prevent duplicate content.');
}

// 4. Ensure downloads directory and standalone desktop executable are in out/
const downloadsSrc = path.join(publicDir, 'downloads');
const downloadsDest = path.join(outDir, 'downloads');
if (fs.existsSync(downloadsSrc)) {
  if (!fs.existsSync(downloadsDest)) {
    fs.mkdirSync(downloadsDest, { recursive: true });
  }
  const files = fs.readdirSync(downloadsSrc);
  for (const file of files) {
    fs.copyFileSync(path.join(downloadsSrc, file), path.join(downloadsDest, file));
  }
  console.log('✅ Synchronized downloads folder to out/downloads');
}

// 5. Ensure ads, monetization & AI catalog files are synchronized in out/
const staticRootFiles = ['ads-config.json', 'desktop-ads.html', 'ads.txt', 'ai-catalog.json'];
for (const file of staticRootFiles) {
  const src = path.join(publicDir, file);
  const dest = path.join(outDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Synchronized ${file} to out/`);
  }
}

// Ensure .well-known directory is synchronized in out/
const wellKnownSrc = path.join(publicDir, '.well-known');
const wellKnownDest = path.join(outDir, '.well-known');
if (fs.existsSync(wellKnownSrc)) {
  fs.cpSync(wellKnownSrc, wellKnownDest, { recursive: true });
  console.log('✅ Synchronized .well-known folder to out/.well-known');
}

// 6. Generate version.json for automatic client-side cache busting on mobile & desktop
const buildVersion = {
  version: Date.now().toString(),
  buildDate: new Date().toISOString(),
  desktopVersion: "1.0.0"
};
const versionJsonStr = JSON.stringify(buildVersion, null, 2);
fs.writeFileSync(path.join(outDir, 'version.json'), versionJsonStr);
fs.writeFileSync(path.join(publicDir, 'version.json'), versionJsonStr);
console.log(`✅ Generated version.json (${buildVersion.version}) for auto-cache purging.`);

console.log('🎉 Postbuild processing complete.');
