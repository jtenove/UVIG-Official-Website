# Site admin (/admin)

Editors update events, research, the team, page text and photos, puzzles and
the feedback survey at **uvicinvestmentgroup.com/admin**. No code involved.
The page layout stays locked in the HTML. Editors only change what goes into it.

## How it works
- Content lives in a Supabase database (`site_content` table, one JSON
  document per section). Every page loads it on open (`content-loader.js`).
- Anyone can **read** it. Only signed-in editors whose email is in the
  `site_admins` table can **write** it. The database enforces this through Row
  Level Security, not the page.
- Sign-ups from any email not on the editors list are refused by the database.
- Every save is kept in `site_content_history` (the newest 60 per section).
  **History** in the editor restores any earlier version.
- If Supabase is down or not configured, the site falls back to the last copy
  the visitor's browser saw, then to the built-in content in `data.js`,
  `puzzles-data.js` and `survey-feedback-data.js`.

## One-time setup
1. Run `supabase-setup.sql` on the project. You can paste it into the SQL
   Editor, or Claude can apply it through the Supabase connector. This seeds
   the first three editors.
2. Put the project's URL and **publishable (anon) key** into
   `supabase-config.js`. Never use the service_role / secret key.
3. In Supabase, go to **Authentication → URL Configuration**:
   - Site URL: `https://www.uvicinvestmentgroup.com`
   - Redirect URLs: add `https://www.uvicinvestmentgroup.com/admin.html`

   This makes confirmation and password-reset emails land back on the
   editor.

## Signing in for the first time (each editor)
1. Open `/admin` and choose **First time here?**
2. Enter your editor email and choose your own password.
3. Click the confirmation link Supabase emails you. Then sign in.

Never share passwords. To add or remove editors, use **Editors** in the admin
sidebar.

## Demo mode
While `supabase-config.js` is empty, `/admin` opens in demo mode:
- Edits save only in that browser, so visitors never see them.
- **Preview** shows the edits on the real pages.

## Tips
- **Preview** (in the save bar) opens the real page with your unsaved changes.
  The preview is visible only to you.
- **Reset to original** puts a section back to the built-in content. The
  previous version stays in History.
- Ctrl/Cmd + S saves the section you're on.
