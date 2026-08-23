# IceStock Pro 🍦🥤

Professional offline-first stock, sales, purchase & profit tracker for ice cream + juice shop owners.
Built with React, TypeScript, Tailwind CSS, Dexie (IndexedDB), Zustand, Recharts, jsPDF.
**No Firebase, no Supabase — 100% local device storage.**

---

## 1. Termux Setup (Android)

```bash
cd /storage/emulated/0/1AI-TEMPLATE   # or wherever you keep projects
# Extract icestock-pro.zip here, then:
cd icestock-pro

npm install
npm run dev -- --host
npm run build
```

The dev server will show a URL like `http://192.168.x.x:5173` — open that in your Android browser to preview the app live while developing.

---

## 2. Project Structure

```
src/
├── components/
│   ├── dashboard/     -> Dashboard, low-stock alerts
│   ├── stock/         -> Item list, add/edit item form
│   ├── sales/         -> Machine tabs, quick-tap sale, cart
│   ├── purchase/      -> Purchase entry & history
│   ├── reports/       -> PDF/CSV export, period reports
│   ├── settings/      -> Shop settings, backup/restore
│   └── common/        -> Header, BottomNav, BottomSheet, Toast, etc.
├── db/
│   ├── schema.ts      -> Dexie (IndexedDB) table definitions
│   └── queries.ts     -> All CRUD + business logic functions
├── store/               -> Zustand state (cart, app-wide state)
├── utils/                -> PDF export, CSV export, calculations, photo storage
└── types/                -> All TypeScript interfaces
```

---

## 3. Converting to Android APK (Capacitor)

```bash
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli

npx cap init "IceStock Pro" "com.yourname.icestockpro" --web-dir=dist
npm run build
npx cap add android
npx cap sync android
```

Note: building the actual .apk needs Android Studio / full JDK + Android SDK, which is generally not possible directly inside Termux. Best option: push to GitHub and use GitHub Actions to build the APK in the cloud (free) — ask me and I'll set up the workflow file.

---

## 4. GitHub Hosting (PWA version)

```bash
git init
git add .
git commit -m "Initial commit - IceStock Pro"
git remote add origin https://github.com/rajahaider50/icestock-pro.git
git push -u origin main
```

Enable GitHub Pages pointing to dist/, or use a GitHub Actions workflow to auto-deploy on push.

---

## 5. Data & Storage

- All data (items, sales, purchases, settings, photos) is stored in IndexedDB directly on the device — fully offline.
- Photos stored as compressed base64 strings inside IndexedDB.
- Backup: Settings -> Download Backup -> saves a .json file with everything.
- Restore: Settings -> Restore from Backup -> reloads all data from a .json file.
- When wrapped in Capacitor, can upgrade to @capacitor/filesystem for native file storage using the same function signatures in src/utils/photoStorage.ts.

---

## 6. Default Seed Data

On first launch, common items are auto-created (ice cream cups in 20/30/40/50 Rs variants, cones, sticks, spoons, shoppers, rubber bands, juice cups, flavors, chocolate syrup). Edit or delete any from the Stock tab.
