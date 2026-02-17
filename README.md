# 💸 Expense Tracker

A personal daily expense tracker with auto-categorization, income tracking, and a live dashboard.

---

## 🚀 Deploy to Vercel in 5 minutes

### Step 1 — Create a GitHub account (if you don't have one)
Go to https://github.com and sign up for free.

### Step 2 — Create a new GitHub repository
1. Click the **+** icon in the top-right → **New repository**
2. Name it: `expense-tracker`
3. Keep it **Public** (or Private — both work)
4. Click **Create repository**

### Step 3 — Upload the project files
On the repository page, click **uploading an existing file** (or drag and drop):
- Upload ALL the files from this ZIP, keeping the folder structure:
  ```
  expense-tracker/
  ├── index.html
  ├── package.json
  ├── vite.config.js
  ├── .gitignore
  └── src/
      ├── main.jsx
      ├── App.jsx
      └── index.css
  ```
- Click **Commit changes**

### Step 4 — Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New → Project**
3. Find and select your `expense-tracker` repository
4. Vercel auto-detects it as a Vite/React app — no changes needed
5. Click **Deploy**

✅ In about 60 seconds, Vercel gives you a live URL like:
**https://expense-tracker-yourname.vercel.app**

Bookmark it — your data saves to your browser automatically!

---

## 💾 How data is saved
Your transactions are saved in your browser's **localStorage**. This means:
- ✅ Data persists across browser sessions on the same device
- ✅ Works offline
- ⚠️ Clearing browser data / cookies will reset the app
- ⚠️ Data is per-device (not shared across computers)

---

## 🛠 Run locally (optional)
If you have Node.js installed:
```bash
npm install
npm run dev
```
Then open http://localhost:5173

---

## ✨ Features
- Auto-categorizes expenses from description keywords
- Income vs expense tracking
- Live dashboard with donut chart + 7-day bar chart
- Filter transactions by category
- Montserrat font throughout
- Fully responsive dark UI
