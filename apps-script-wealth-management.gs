/**
 * Wealth Management Panel RSVP — standalone Google Apps Script backend
 * ----------------------------------------------------------------------
 * This is a dedicated script for ONE form: wealth-management-event.html.
 * It has nothing to do with the main site's shared apps-script.gs —
 * separate spreadsheet, separate deployment, separate URL. That's on
 * purpose: fewer moving parts, nothing to get confused with.
 *
 * Setup:
 *  1. Create a new blank Google Sheet.
 *  2. Extensions -> Apps Script, delete the placeholder, paste this
 *     file in whole, save.
 *  3. Deploy -> New deployment -> Web app -> Execute as Me ->
 *     Who has access: Anyone -> Deploy -> authorize.
 *  4. Copy the resulting /exec URL into wealth-management-event.html's
 *     SHEET_ENDPOINT constant.
 *
 * Responses land in a tab called "RSVPs" (created automatically on
 * first submission). The page's "Admin access" link reads this same
 * URL back with a GET request (?action=admin&passcode=...) to show
 * every response plus totals — the passcode is checked here, not in
 * the page's own source.
 */

// Change this any time you want to rotate the admin passcode —
// just re-save and it takes effect immediately (no redeploy needed
// for code changes to an existing deployment to take effect on GET/
// POST — only a NEW deployment URL would need updating on the page).
var ADMIN_PASSCODE = "managingdirector";

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs");

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("RSVPs");
    sheet.appendRow(["Timestamp", "Name", "Year / Degree", "UVIG Member", "Email", "Wants to Join", "Topics"]);
  }

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.yearDegree || "",
    data.isMember ? "Yes" : "No",
    data.email || "",
    data.joinInterest ? "Yes" : "No",
    data.topics || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = (e.parameter.action || "").trim();
  if (action !== "admin") {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Unknown request" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var passcode = e.parameter.passcode || "";
  if (passcode !== ADMIN_PASSCODE) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: "Invalid passcode" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs");
  var rows = [];

  if (sheet) {
    var values = sheet.getDataRange().getValues();
    var headers = values[0] || [];
    for (var i = 1; i < values.length; i++) {
      var row = {};
      for (var c = 0; c < headers.length; c++) {
        var v = values[i][c];
        row[headers[c]] = (v instanceof Date) ? v.toLocaleString() : v;
      }
      rows.push(row);
    }
  }

  var totals = {
    total: rows.length,
    members: rows.filter(function (r) { return r["UVIG Member"] === "Yes"; }).length,
    nonMembers: rows.filter(function (r) { return r["UVIG Member"] === "No"; }).length,
    joinInterest: rows.filter(function (r) { return r["Wants to Join"] === "Yes"; }).length
  };

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", responses: rows, totals: totals }))
    .setMimeType(ContentService.MimeType.JSON);
}
