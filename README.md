# 💸 Expense Tracker — Multi-User

A personal finance tracker with **login, cloud storage, and per-user data** powered by Supabase + Vercel.

---

## 🚀 Setup Guide (15 minutes, all free)

### PART 1 — Supabase (your database + login)

**Step 1 — Create a free Supabase account**
Go to https://supabase.com → Sign up → Create a new project
- Give it any name (e.g. "expense-tracker")
- Choose a strong database password (save it somewhere)
- Pick the region closest to you
- Wait ~2 minutes for it to set up

**Step 2 — Create the transactions table**
In your Supabase project, click **SQL Editor** in the left sidebar, paste this, and click **Run**:

```sql
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  description text not null,
  amount numeric(10,2) not null,
  type text not null check (type in ('income','expense')),
  category text not null,
  created_at timestamptz default now()
);

-- Each user can only see and edit their own transactions
alter table transactions enable row level security;

create policy "Users can manage their own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Step 3 — Get your API keys**
In Supabase, go to **Settings → API** and copy:
- **Project URL** (looks like https://xxxx.supabase.co)
- **anon public key** (long string starting with "eyJ...")

---

### PART 2 — GitHub

**Step 4 — Upload files to GitHub**
Create a new repo and upload ALL files from this ZIP individually (not the folder):
```
index.html
package.json
vite.config.js
README.md
src/App.jsx
src/main.jsx
src/index.css
```
⚠️ The src/ files must be inside a folder called "src" in GitHub.

---

### PART 3 — Vercel (deploy + connect Supabase)

**Step 5 — Import your repo to Vercel**
Go to https://vercel.com → Add New Project → select your repo
- Framework: **Vite**
- Root Directory: **leave as ./**

**Step 6 — Add your Supabase keys as Environment Variables**
Before clicking Deploy, expand **Environment Variables** and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | your Project URL from Step 3 |
| `VITE_SUPABASE_ANON_KEY` | your anon public key from Step 3 |

**Step 7 — Deploy!**
Click Deploy. In ~60 seconds your app is live at a URL like:
**https://expense-tracker-yourname.vercel.app**

---

## ✅ How it works
- Anyone can go to your URL and **sign up** with email + password
- Each person logs in and **only sees their own data**
- All data is saved in Supabase (real cloud database)
- Works on any device, any browser

## 🔒 Security
- Passwords are handled by Supabase Auth (never stored in plain text)
- Row Level Security ensures users can ONLY access their own transactions
- Your anon key is safe to use in frontend code
