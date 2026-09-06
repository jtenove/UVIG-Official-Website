/**
 * UVIG Join Form — Google Apps Script backend
 * ---------------------------------------------
 * Appends every Join UVIG form submission as a new row in the
 * "Members" tab of the Google Sheet this script is bound to.
 *
 * Setup steps are in GOOGLE_SHEETS_SETUP.md — this file only
 * needs to be pasted into the Apps Script editor as-is.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Members");

  // Create the sheet with headers on first run, if it doesn't exist yet
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Members");
    sheet.appendRow(["Timestamp", "Name", "Email", "Year", "Faculty", "Interests", "Heard From", "Newsletter Opt-In"]);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.name || "",
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
