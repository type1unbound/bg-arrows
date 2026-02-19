# BG Protocol App

A mobile-friendly blood glucose treatment protocol guide using Dexcom CGM arrows.
Settings and contacts are saved locally on the device via localStorage — no login, no server.

---

## Deploy in 4 steps

### 1. Push to GitHub

```bash
# In this folder:
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com (call it bg-protocol, make it public or private)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/bg-protocol.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find and select your `bg-protocol` repo
4. Leave all settings as-is — Vercel auto-detects Vite
5. Click **Deploy**

That's it. Your app will be live at `https://bg-protocol.vercel.app` (or similar).

Every time you push a change to GitHub, Vercel rebuilds automatically.

---

### 3. Embed in Squarespace

On any Squarespace page, add a **Code Block** and paste:

```html
<iframe
  src="https://your-app-name.vercel.app"
  style="width:100%; height:100vh; border:none; display:block;"
  title="BG Protocol"
></iframe>
```

Replace the URL with your actual Vercel URL.

**Tip:** Set the Squarespace page padding to zero so the iframe fills the screen edge-to-edge on mobile.

---

### 4. (Optional) Add to Home Screen as a PWA

Because the app includes a Web App Manifest, users can install it directly to their phone's home screen:

- **iPhone (Safari):** tap the Share icon → "Add to Home Screen"
- **Android (Chrome):** tap the three-dot menu → "Add to Home Screen" (or Chrome may show an automatic install banner)

Once installed it opens full-screen with no browser chrome, just like a native app.

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
```

Output goes to the `dist/` folder.
