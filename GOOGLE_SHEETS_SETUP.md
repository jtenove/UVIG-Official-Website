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

## Market Rush + leaderboard
The arcade trading game on `crossword.html` works the same way as the
Surveys leaderboard above:

- **Finishing a round** sends `type: "gameScore"` and lands in a **Game
  Scores** tab (created automatically on first submission), with one row
  per run: name, email, final portfolio value, and return %.
- **The leaderboard** is read live with a `GET` request
  (`?type=gameLeaderboard&seed=2026-10-13`) filtered to that day's price
  path, so everyone on the leaderboard played the exact same market.
  Same "Who has access: Anyone" requirement as the Surveys leaderboard.

If you've already deployed the script from an earlier version of this
file, redeploy it (**New deployment**, per "Updating the script later"
above) so it picks up Market Rush handling.

## Feedback survey (/survey.html)
A separate, untimed feedback form — not the leaderboard quizzes above.
Edit its questions in `survey-feedback-data.js` (comments in that file
explain the question types and fields).

Submitting sends `type: "feedbackSurvey"` and lands in a **Survey** tab
(created automatically on first submission). Columns are built
dynamically from each question's `label`: the first submission creates
a column per label, and later edits to the questions in
`survey-feedback-data.js` just add new columns as needed — no changes
to the Apps Script are required to change the questions. Name and
email are optional and always go in their own columns.

If you've already deployed the script from an earlier version of this
file, redeploy it (**New deployment**, per "Updating the script later"
above) so it picks up feedback survey handling.

## Wealth Management Panel RSVPs (/wealth-management-event.html)
Submissions send `type: "wealthMgmtRSVP"` and land in a **Wealth
Management RSVP** tab (created automatically on first submission):
name, year/degree, whether they're a UVIG member, email (if not a
member), whether they want to join, and what they'd like speakers to
cover.

The page has a small **"Admin access"** link at the bottom. Clicking
it asks for a passcode, which is checked **in the Apps Script itself**
(`WM_ADMIN_PASSCODE` near the top of `apps-script.gs`) — not in the
page's source, so there's nothing to find by viewing the page. Only a
correct passcode gets the response list and totals back. The default
passcode is `managingdirector`; change `WM_ADMIN_PASSCODE` and
redeploy any time you want to rotate it.

**Worth knowing:** this is a convenience gate, not real authentication
— anyone who knows (or guesses) the passcode can read the data, and
there's no rate limiting on guesses. Don't use it for anything more
sensitive than event RSVPs, and treat the passcode like a shared
PIN, not a password.

If you've already deployed the script from an earlier version of this
file, redeploy it (**New deployment**, per "Updating the script later"
above) so it picks up Wealth Management RSVP handling.

## Newsletter signups
These go through your Google Form, which already writes to a Sheet
natively (Responses tab → the green Sheets icon). No extra setup needed there.
