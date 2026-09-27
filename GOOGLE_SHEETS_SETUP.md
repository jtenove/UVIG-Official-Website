# Wiring the Join form to a Google Sheet

This is a one-time, ~2 minute setup. It has to be done from your own
Google account (Claude can't deploy this for you).

## 1. Create the Sheet
1. Go to sheets.google.com and create a new blank spreadsheet.
2. Name it something like **UVIG Signups**.
3. You can leave it empty — the script creates the "Members" tab
   and header row automatically the first time someone submits.

## 2. Add the script
1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete any placeholder code in the editor.
3. Paste in the contents of `apps-script.gs` (included alongside this file).
4. Click the **Save** icon (or Ctrl/Cmd+S).

## 3. Deploy it as a web app
1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**.
5. Google will ask you to authorize the script — click through and allow it
   (it's your own script, this is expected).
6. Copy the **Web app URL** it gives you — it looks like
   `https://script.google.com/macros/s/XXXXXXXX/exec`.

## 4. Connect it to the site
1. Open `join.html`.
2. Find this line near the bottom:
   ```js
   const SHEET_ENDPOINT = "REPLACE_WITH_YOUR_APPS_SCRIPT_WEB_APP_URL";
   ```
3. Replace the placeholder with the URL you copied, in quotes.
4. Save and re-upload the file wherever the site is hosted.

## 5. Test it
1. Go through the Join flow on the live site once, using a test email.
2. Check the Google Sheet — a new row should appear in the "Members" tab
   within a few seconds.

## Updating the script later
If you ever change what fields the Join form collects, update
`apps-script.gs` to match (add the new field to the `sheet.appendRow([...])`
line), then repeat step 3 as **New deployment** (not "Manage deployments" →
edit) so the change goes live — Apps Script web apps don't auto-update
existing deployments.

## Weekly Puzzles score submissions
The same endpoint also handles "Submit your score" on `crossword.html`
(shown only after a relatively good crossword time or trivia score). Those
submissions carry `type: "puzzleScore"` and land in a separate **Puzzle
Scores** tab, created automatically on first submission — no extra setup
needed beyond the steps above. If you've already deployed the script from
an earlier version of this file, redeploy it (**New deployment**, per
"Updating the script later" above) so it picks up the puzzle-score handling.

## Surveys + leaderboard
The same endpoint also handles `surveys.html`. Two things happen there:

- **Submitting a survey** sends `type: "surveyResponse"` and lands in a
  **Survey Responses** tab (created automatically on first submission),
  with one row per response: name, email, which survey, question count,
  total time, and a "weighted" time (total time ÷ question count — this
  is what the leaderboard ranks on, so a 5-question and an 8-question
  survey are compared fairly).
- **The leaderboard itself** is read live by the page with a plain `GET`
  request to the same URL (`?type=leaderboard&survey=Newsletter+Survey`),
  which reads the Survey Responses tab and returns the fastest 10 as
  JSON. This only works if the deployment's "Who has access" is still
  set to **Anyone** (step 3 above) — that's the default this guide uses,
  so nothing extra to do there, but don't lock it down later or the
  leaderboard will stop loading (submissions would still work).

If you've already deployed the script from an earlier version of this
file, redeploy it (**New deployment**, per "Updating the script later"
above) so it picks up survey handling.

## Newsletter signups
These go through your Google Form, which already writes to a Sheet
natively (Responses tab → the green Sheets icon). No extra setup needed there.
