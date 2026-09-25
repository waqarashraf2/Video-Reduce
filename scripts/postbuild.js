const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(outDir)) {
  console.log('Out directory does not exist, skipping postbuild.');
  process.exit(0);
}

// 1. Copy public/.htaccess to out/.htaccess
const htaccessSrc = path.join(publicDir, '.htaccess');
const htaccessDest = path.join(outDir, '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, htaccessDest);
  console.log('✅ Copied public/.htaccess to out/.htaccess');
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
    }
  }
}
ensureFolderIndices(outDir);
console.log('✅ Created dual-route index.html mirrors for all tools, articles, and pages!');

// 3. Remove legacy out/en directory if present to prevent duplicate English routes
const enDir = path.join(outDir, 'en');
if (fs.existsSync(enDir)) {
  fs.rmSync(enDir, { recursive: true, force: true });
  console.log('✅ Cleaned legacy out/en directory to prevent duplicate content.');
}

// 4. Generate version.json for automatic client-side cache busting on mobile & desktop
const buildVersion = {
  version: Date.now().toString(),
  buildDate: new Date().toISOString(),
};
const versionJsonStr = JSON.stringify(buildVersion, null, 2);
fs.writeFileSync(path.join(outDir, 'version.json'), versionJsonStr);
fs.writeFileSync(path.join(publicDir, 'version.json'), versionJsonStr);
console.log(`✅ Generated version.json (${buildVersion.version}) for auto-cache purging.`);

console.log('🎉 Postbuild processing complete.');
