# INDEX Platform

> Where Problems Meet Solutions — connecting Industry, Academia, Research, and Students.

This version is **fully functional**: real sign-ups, real login, and real submitted
ideas — all saved permanently in a real database. Any number of people can create
accounts and use it at the same time, the same way twe.co or any other live site works.

---

## ⚠️ One-time setup required (10 minutes, free)

Before anything works, you need to connect a free database. Nothing will save
without this step — the app will show a setup screen reminding you until it's done.

**If you've set this up before and are just re-running things:** you only need
to redo **Step 2** below (the SQL file was rebuilt from scratch and thoroughly
tested — it safely repairs an existing project too, it won't duplicate or break anything).

### Step 1 — Create your Supabase project

1. Go to **[supabase.com](https://supabase.com)** → click **Start your project** → sign up (GitHub login is fastest)
2. Click **New Project**
3. Fill in:
   - **Name**: `index-platform` (or anything)
   - **Database Password**: click "Generate a password" and **save it somewhere** (you won't need it again for this guide, but keep it safe)
   - **Region**: pick the one closest to you
4. Click **Create new project** and wait ~2 minutes while it sets up

### Step 2 — Create the database tables

1. In your new Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file **`supabase-schema.sql`** (included in this project folder), copy **all** of it
4. Paste it into the SQL Editor box
5. Click **Run** (bottom right)
6. You should see success messages with no red errors — click **Table Editor** in the sidebar and confirm you now see four tables: `profiles`, `ideas`, `applications`, `waitlist`

### Step 3 — Turn off email confirmation (recommended for testing)

By default, Supabase makes new users click a confirmation link in their email
before they can log in — annoying when you just want 2–3 friends to try the app quickly.

1. Click **Authentication** in the left sidebar → **Providers** → **Email**
2. Turn **OFF** the toggle labeled "Confirm email"
3. Click **Save**

(You can turn this back on later if you launch publicly.)

### Step 4 — Get your API keys

1. Click **Settings** (gear icon, bottom left) → **API**
2. You'll see two things you need:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

### Step 5 — Add the keys to your project

1. In your project folder, find the file called **`.env.example`**
2. Make a **copy** of it and rename the copy to **`.env`** (just `.env`, nothing else)
3. Open `.env` and paste in your real values:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=your-long-anon-key-here
   ```
4. Save the file

### Step 6 — Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173` — sign up with a real email, submit an idea, and check
**Table Editor → ideas** in Supabase. Your submission will be sitting right there as a real row,
and it'll show up in **Browse Challenges** for anyone who visits.

---

## 🔴 Already have a project and just got a red error?

Re-run **Step 2 above** — open `supabase-schema.sql`, copy all of it, paste into
a **New query** in SQL Editor, click **Run**. This one file was rebuilt to safely
repair a partially-set-up project (missing tables, missing permissions, or a
previous broken column) without touching or duplicating any real data you
already have. It has been tested against a real Postgres database in every
one of these starting states before being included here.

---

## ✨ New in this version

- **Structured Skills** — sign-up and My Profile now group skills under Domains (Engineering & Technology, Science & Health, Business & Social Sciences, Design & Creative), with a "+ Add" option to type in any custom domain or skill not listed
- **CV / Portfolio / LinkedIn** — a new step at the end of sign-up (and editable any time from My Profile) to add these links
- **Real Apply form** — "Apply to Join Team" is now a proper multi-question form (why you want to join, how you'd contribute, certificate/credential link, portfolio link, contact email) instead of one optional message. Idea owners see all of it when reviewing applicants, plus which of the applicant's skills actually match what's needed.
- **Profile page makeover** — My Profile now has a proper view mode (banner, avatar, bio, stats, clickable links, skill tags) inspired by LinkedIn/Instagram-style profiles, with an Edit Profile button to go into the form

**Setup:** just re-run `supabase-schema.sql` again (Supabase → SQL Editor → paste → Run) — it only *adds* the new columns needed, doesn't touch any data you already have. Same one file as before.

---

## ✨ Major update: full redesign + new features

**Visual redesign** — new typography (Fraunces + Plus Jakarta Sans), refined color palette, real icons (lucide-react) instead of emoji, redesigned Dashboard/Browse/Detail/Submit/Profile/Junior to match the quality of the homepage.

**New features:**
- **Verification badges** — university (.ac.ae/.edu) and company emails get an automatic verified badge
- **Notifications** — a bell icon in the sidebar; get notified when someone applies to your idea or your application is accepted/declined
- **Real-time chat** — once an application is accepted, both people get a live chat thread on that idea's page
- **Outcome tracking** — idea owners can mark a challenge Open → In Progress → Completed, with an outcome report that displays publicly (this is your case-study material)
- **Admin dashboard** — a moderation view (only visible to admins) to remove any idea or grant verification badges
- **Spam/placeholder filtering** — blocks obvious junk text (like repeated characters) on Submit Idea and profile bios
- **Installable web app** — the site can now be added to a phone's home screen like a native app
- **Terms of Service & Privacy Policy** — starter pages linked from the homepage footer (fill in the placeholders before real launch)

**Setup:** re-run `supabase-schema.sql` (Supabase → SQL Editor → paste → Run) — it only adds what's missing, your existing data is untouched.

**To make yourself an admin**, run this once in Supabase SQL Editor (replace with your real email):
```sql
update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
```

---

## 🔧 Fixes: chat, profile photos, and file uploads

- **Fixed: live chat now actually works both ways.** The real bug — applicant-side data was never being loaded, so only the challenge owner could ever see the chat unlock. Fixed, plus added a 4-second background refresh as a safety net so messages sync reliably even if real-time replication has any hiccups.
- **Fixed: avatar initials no longer clipped.**
- **New: real profile photos.** Click the small camera icon on your avatar (My Profile) to upload a real photo — shows everywhere your initials used to (sidebar, applicant lists, "posted by").
- **New: real file uploads.** CV, Portfolio (in My Profile), and Related Research Paper / Related Current Work (in Submit Idea) now support uploading an actual PDF or Word doc directly, not just pasting a link — both options are still there, use whichever fits.

**Setup:** re-run `supabase-schema.sql` (Supabase → SQL Editor → paste → Run) — this adds a storage bucket for uploads plus the columns needed. Nothing existing is touched.

---

## ✨ Major update: group chat, practice library, and reliability

- **Real group chat** — was 1:1 only (a real bug), now everyone accepted onto a challenge shares one thread, WhatsApp-style with each sender's avatar and name shown
- **Click anyone's name/avatar to view their profile** — from chat, applicant lists, or "Posted By"
- **Practice Library** — a Forage-style section where organizations offer self-paced practice projects seeded with the real problems people typically hit, separate from the live challenge marketplace. Admins add organizations/projects from the Admin dashboard; anyone can browse and mark projects complete.
- **Error boundary** — an unexpected error now shows a recovery screen instead of a blank white page
- **Empty states** — Dashboard now shows a real "no matches yet" state instead of just going blank
- **Draft auto-save** — Submit Idea now saves your progress locally as you type; navigate away by accident and it's still there when you come back

**Setup:** re-run `supabase-schema.sql` (Supabase → SQL Editor → paste → Run) — adds the practice library tables and fixes chat to be group-based. Nothing existing is touched. It includes 3 starter practice projects so the library isn't empty on day one.

**Still next in line** (told you nothing's getting dropped): cohort tagging, referral loop, admin analytics, CSV export, bookmarks/follow, and a real mobile responsiveness audit.

---

## 🚀 Deploying live (so 100s of people can use it)

### Push to GitHub
```bash
git init
git add .
git commit -m "Add real backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/index-platform.git
git push -u origin main
```
(If you already have this repo pushed, just run `git add .`, `git commit -m "Add real backend"`, `git push` instead.)

### Deploy on Vercel
1. Go to **vercel.com** → sign in with GitHub → **Add New Project** → import `index-platform`
2. **Before clicking Deploy**, open **Environment Variables** and add both:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | (your Project URL from Step 4) |
   | `VITE_SUPABASE_ANON_KEY` | (your anon key from Step 4) |
3. Click **Deploy**

Your live URL now has a real, working backend. This is exactly what makes it safe
for 100 or 1,000 real people to sign up — Supabase's free tier supports up to
50,000 monthly users, far beyond what a pilot needs.

**If you already deployed before:** go to your existing Vercel project → **Settings → Environment Variables** → add the two variables above → then go to **Deployments** → click **⋯** on the latest one → **Redeploy**.

---

## How the data works

- **Seed challenges** (`src/data.js`) — a handful of example challenges so Browse never looks empty on day one. These are static and don't need the database.
- **Real challenges** — anything submitted through "Submit Idea" is saved to the `ideas` table in Supabase and shown to everyone, immediately, forever (until deleted).
- **Skill matching** — the "% match" on every card is a real calculation comparing the logged-in user's saved skills against what each challenge needs — not a random number.

---

## 📁 Project Structure

```
index-platform/
├── supabase-schema.sql      ← run this in Supabase SQL Editor (Step 2)
├── .env.example             ← copy to .env and fill in your keys (Step 5)
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx               ← session handling, routing, data loading
    ├── supabaseClient.js     ← connects to your Supabase project
    ├── data.js               ← seed challenges + skill-matching logic
    ├── components/
    │   ├── HeroCanvas.jsx
    │   ├── IdeaCard.jsx
    │   ├── Sidebar.jsx
    │   └── SetupNotice.jsx   ← shown until .env is configured
    └── pages/
        ├── Home.jsx
        ├── Auth.jsx          ← real Supabase sign up / login
        ├── Dashboard.jsx
        ├── Browse.jsx
        ├── Detail.jsx
        ├── Submit.jsx        ← writes real rows to the ideas table
        └── Junior.jsx
```

## 🛠️ Tech Stack

- **React 18** + **Vite** — frontend
- **Supabase** — database, authentication, hosting-agnostic backend (free tier)
- **Canvas API** — animated hero network
- **Google Fonts** — Syne + DM Sans

## Troubleshooting

- **"One setup step left" screen won't go away** → your `.env` values are missing or wrong. Double check there's no extra space, then stop (`Ctrl+C`) and re-run `npm run dev`.
- **Signup says "Invalid API key"** → you copied the wrong key. Use the **anon public** key, not the `service_role` key.
- **Can't log in right after signing up** → check Step 3 — email confirmation is probably still on.
- **Works locally but not on Vercel** → you likely forgot to add the two environment variables in Vercel's project settings (see Deploying section above), or forgot to Redeploy after adding them.
