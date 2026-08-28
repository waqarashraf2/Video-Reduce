# Hostinger Deployment Guide (Video-Reduce)

## Requirements
- **Node.js Version:** 18.x or 20.x (Recommended: Node 20 LTS)
- **Application Type:** Node.js Web Application (via Hostinger hPanel or VPS)

---

## Method 1: Hostinger Node.js Application (hPanel)

1. **Upload / Clone from GitHub:**
   - Go to **Hostinger hPanel** -> **Websites** -> **Manage**.
   - Navigate to **Git** or **Node.js Application**.
   - Connect Repository: `https://github.com/waqarashraf2/Video-Reduce.git` (or your repo URL), Branch: `main`.

2. **Node.js Configuration in hPanel:**
   - **Node.js Version:** 20.x
   - **Application Root:** `/` (or directory where code is cloned)
   - **Application Startup File:** `node_modules/next/dist/bin/next` or select `npm start`
   - **Application Mode:** `Production`

3. **Install Dependencies & Build:**
   Open the Hostinger SSH/Terminal or use the hPanel buttons:
   ```bash
   npm install
   npm run build
   ```

4. **Start Application:**
   Click **Restart Application** in hPanel or run:
   ```bash
   npm start
   ```

---

## Method 2: Hostinger VPS Deployment (PM2 / Nginx)

1. **Clone repository on VPS:**
   ```bash
   git clone https://github.com/waqarashraf2/Video-Reduce.git
   cd Video-Reduce
   ```

2. **Install & Build:**
   ```bash
   npm install
   npm run build
   ```

3. **Run with PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "video-reduce" -- start
   pm2 save
   pm2 startup
   ```

4. **Nginx Reverse Proxy Configuration (with COOP/COEP Headers):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;

           # Required for FFmpeg WebAssembly:
           add_header Cross-Origin-Opener-Policy "same-origin" always;
           add_header Cross-Origin-Embedder-Policy "require-corp" always;
       }
   }
   ```

---

## Verification
- Open your deployed domain in your browser.
- Check Console (F12): ensure `crossOriginIsolated` is `true` (needed for client-side FFmpeg processing).
