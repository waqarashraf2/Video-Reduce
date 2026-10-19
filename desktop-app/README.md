# 🚀 VideoReduce Desktop App (Electron.js + Native FFmpeg)

Yeh desktop application aapki Next.js Web App ka native counterpart hai jo **16 GB, 50 GB ya 100 GB** jaisi bari video files ko direct hard drive se stream karke compress karta hai, bina browser RAM limitation ke.

---

## 🌟 Key Advantages

* **No RAM Crash:** Browser me 16GB file 30GB RAM leti thi, jabke desktop app sirf **200MB - 400MB** RAM use karti hai.
* **Native FFmpeg 7 / 6 Engine:** Full multi-threading support on all CPU cores.
* **Hardware GPU Acceleration:** Automatic NVIDIA NVENC, Intel QSV aur AMD AMF support.
* **Output Direct to Disk:** Downloads ya kisi bhi custom folder me output save hota hai.

---

## 📦 How to Install Dependencies & Run

### 1. Install Desktop Dependencies
Terminal me `desktop-app` folder ke andar ja kar:
```bash
cd desktop-app
npm install
```

### 2. Development Mode (Running alongside Next.js)
Ek terminal me Next.js chalayein:
```bash
# In project root:
npm run dev
```

Doosray terminal me Electron app chalayein:
```bash
# In desktop-app directory:
npm run dev
```

---

## 🔨 How to Build Windows Installer (.exe)

Windows Setup Installer (`.exe`) aur Portable version generate karne ke liye:

```bash
cd desktop-app
npm run build:win
```

Iske baad `desktop-app/dist/` folder me aapko installable **`VideoReduce Setup 1.0.0.exe`** mil jayega!
