/**
 * UVIG site forms — Google Apps Script backend
 * ---------------------------------------------
 * Shared endpoint for the site's two forms:
 *  - Join UVIG (join.html) appends to the "Members" tab.
 *  - Weekly Puzzles score submissions (crossword.html), sent with
 *    { type: "puzzleScore", ... }, append to the "Puzzle Scores" tab.
 *
 * Setup steps are in GOOGLE_SHEETS_SETUP.md — this file only
 * needs to be pasted into the Apps Script editor as-is.
 */

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  if (data.type === "puzzleScore") {
    return handlePuzzleScore(data);
  }
  return handleMemberSignup(data);
}

function handleMemberSignup(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Members");

  // Create the sheet with headers on first run, if it doesn't exist yet
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Members");
    sheet.appendRow(["Timestamp", "Name", "UVic Email", "Main Email", "Year", "Faculty", "Interests", "Heard From", "Newsletter Opt-In"]);
  }

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.uvicEmail || "",
    data.email || "",
    data.year || "",
    data.faculty || "",
    (data.interests || []).join(", "),
    data.heardFrom || "",
    data.newsletterOptIn ? "Yes" : "No"
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handlePuzzleScore(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Puzzle Scores");

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Puzzle Scores");
    sheet.appendRow(["Timestamp", "Name", "Email", "Game", "Difficulty", "Quick Mode", "Score / Time"]);
  }

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.email || "",
    data.game || "",
    data.difficulty || "",
    data.quickMode ? "Yes" : "No",
    data.time || data.score || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
