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

// 2. For any directory in out/ that has a corresponding .html file in out/,
// ensure that directory has an index.html so both /route and /route/ work seamlessly on Apache!
const items = fs.readdirSync(outDir);
for (const item of items) {
  const fullPath = path.join(outDir, item);
  if (fs.statSync(fullPath).isDirectory()) {
    const matchingHtml = path.join(outDir, `${item}.html`);
    const indexInDir = path.join(fullPath, 'index.html');
    
    if (fs.existsSync(matchingHtml) && !fs.existsSync(indexInDir)) {
      fs.copyFileSync(matchingHtml, indexInDir);
      console.log(`✅ Created ${item}/index.html from ${item}.html to prevent Apache 403 Forbidden on trailing slashes!`);
    }
  }
}

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
