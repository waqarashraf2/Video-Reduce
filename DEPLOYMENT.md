# Hostinger Fullstack Deployment Guide (Next.js + Laravel API)

This project consists of two components:
1. **Frontend (Next.js 14)**: Deployed to `videoreduce.com` (`domains/videoreduce.com/public_html/`).
2. **Backend API (Laravel 12)**: Deployed to `api.videoreduce.com` (`domains/api.videoreduce.com/public_html/`).

---

## ⚡ Automated CI/CD (GitHub Actions)

Every time you run `git push origin main`, GitHub Actions automatically:
1. Builds the Next.js static production bundle with `NEXT_PUBLIC_API_URL=https://api.videoreduce.com`.
2. Syncs frontend files to `domains/videoreduce.com/public_html/`.
3. Syncs the Laravel `api/` directory to `domains/api.videoreduce.com/public_html/`.
4. Runs remote `composer install` & `php artisan migrate` on Hostinger.

### GitHub Secrets Required:
In your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**, ensure you have:
- `SSH_HOST`: Your Hostinger SSH Host / Server IP (e.g. `145.223.x.x` or domain)
- `SSH_USER`: Your Hostinger SSH Username (e.g. `u123456789`)
- `SSH_PORT`: `65002` (Hostinger standard SSH port)
- `SSH_PRIVATE_KEY`: Your SSH Private Key matching the public key added in Hostinger hPanel -> **SSH Access**.
- `REMOTE_TARGET`: `domains/videoreduce.com/public_html/`
- `REMOTE_API_TARGET`: `domains/api.videoreduce.com/public_html/`

---

## 🛠️ One-Time Setup in Hostinger hPanel (What you need to do)

### Step 1: Create Database for the Backend API
1. In Hostinger hPanel for **api.videoreduce.com** (or main account), go to **Databases** -> **Management**.
2. Click **Create New MySQL Database & User**:
   - **Database Name**: e.g., `u123456_videoreduce_db`
   - **Username**: e.g., `u123456_dbuser`
   - **Password**: Generate a strong password.
3. Note these credentials down.

---

### Step 2: Create `.env` file for the API Subdomain
1. In hPanel for **api.videoreduce.com**, open **File Manager**.
2. Go into `domains/api.videoreduce.com/public_html/`.
3. Create a new file named `.env` and paste:

```env
APP_NAME="VideoReduce API"
APP_ENV=production
APP_KEY=base64:QbAE+PV33+bh4fX0zjHMETLI7/80a2CixAh1hbxr+0g=
APP_DEBUG=false
APP_URL=https://api.videoreduce.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

FRONTEND_URL=https://videoreduce.com
ADMIN_NOTIFICATION_EMAIL=your-real-email@gmail.com

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

# MySQL Database settings created in Step 1
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u123456_videoreduce_db
DB_USERNAME=u123456_dbuser
DB_PASSWORD=your_db_password

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

# Email SMTP Settings (Hostinger Email or Gmail SMTP)
# For Hostinger Email:
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=noreply@videoreduce.com
MAIL_PASSWORD=your_hostinger_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="noreply@videoreduce.com"
MAIL_FROM_NAME="VideoReduce Support"
```

---

### Step 3: Run Initial Migrations & Install Vendor (SSH / Terminal)
In Hostinger hPanel -> **Advanced** -> **SSH Access** (or using terminal):
```bash
cd domains/api.videoreduce.com/public_html
composer install --no-dev --optimize-autoloader
php artisan migrate --force
```

---

## 🔍 Verification
1. Test Health endpoint in browser: `https://api.videoreduce.com/api/health` (should return `{"status":"ok","service":"VideoReduce API"}`).
2. Go to `https://videoreduce.com/contact`, fill out the form and click Send.
3. Check your database `contacts` table and check your admin email for the notification.
