# MindSathi AI

A gentle, multilingual emotional-support companion. Plain HTML + CSS + JavaScript — no build step.
Palette: Lavender + White (`#F7F4FF`, `#DDD2FA`, `#8970CC`, `#443568`).

## Run locally (VS Code)
1. Open this folder in VS Code (`File > Open Folder`).
2. Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.
   (Opening `index.html` directly also works.)

## Push to GitHub
```bash
git init
git add .
git commit -m "MindSathi AI first version"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mindsathi-ai.git
git push -u origin main
```
Then on GitHub: **Settings → Pages → Deploy from a branch → main / (root)**.
Your site goes live at `https://YOUR-USERNAME.github.io/mindsathi-ai/`.

## What works today
- Home, AI Chat, Voice Assistant, My Mood, AI Insights, Wellness Tools (breathing, 5-4-3-2-1 grounding, journal)
- 7 stress-relief activities, Find Support, How it works, Settings, Privacy & Data (export / delete)
- 10 language options. English is complete; Hindi and Malayalam translate navigation and key headings.
  Add more in `js/i18n.js`.
- Accessibility: larger text, high contrast, reduced animation
- Emergency Help dialog with Tele-MANAS (14416), KIRAN (1800-599-0019) and 112, plus a trusted contact.
  **Verify these numbers are current before launch.**
- All data is stored in the visitor's browser (`localStorage`). Nothing leaves the device.

## Before you call this production-ready
1. **Real AI replies.** Chat currently uses simple keyword rules in `js/emotion.js` (demo mode, English only).
   Build a small backend that calls an AI model and set its URL in `js/config.js`.
   **Never put an API key in front-end files** — GitHub Pages is public.
2. **Real accounts.** There is no login; "Log out" only clears the name on this device.
   For sign-in and cross-device data, add a service such as Supabase or Firebase Auth.
3. **Privacy text.** If you connect a backend, update the wording in Privacy & Data
   (the app already changes it when `apiUrl` is set) and write a proper privacy policy.
4. **Support directory.** Add vetted resources by opening the site with `?admin` at the end of the URL
   (e.g. `index.html?admin#/support`). They are saved only in that browser; a shared list needs a database.
5. **Safety review.** Have a qualified mental-health professional review the replies, crisis wording and resources.
   The emotion labels are estimates, not diagnoses.

## Files
```
index.html        page shell
css/style.css     lavender theme
js/config.js      backend URL
js/store.js       localStorage data
js/i18n.js        languages + strings
js/emotion.js     emotion estimate, crisis keywords, demo replies
js/games.js       breathing + 7 activities
js/app.js         router and all pages
```
