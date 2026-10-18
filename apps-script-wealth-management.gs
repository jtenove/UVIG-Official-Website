/**
 * Wealth Management Panel RSVP — standalone Google Apps Script backend
 * ----------------------------------------------------------------------
 * A dedicated script for ONE form: wealth-management-event.html.
 * Separate from the main site's apps-script.gs (Join form etc.).
 *
 * Writes to the "Wealth Management Sign-up" spreadsheet by its ID, so it
 * works whether this script is attached to that sheet or not.
 *
 * Setup / updating:
 *  1. Open the "Wealth Management Sign-up" sheet -> Extensions -> Apps
 *     Script. Select all, delete, paste this whole file, click Save.
 *  2. Pick "testSetup" in the function dropdown at the top -> Run.
 *     Approve the permission prompt (Advanced -> Go to ... -> Allow).
 *     A test row should appear in a new "RSVPs" tab. Delete it after.
 *  3. Deploy -> Manage deployments -> pencil icon -> Version: "New
 *     version" -> Deploy. This keeps the same /exec URL the site uses.
 *     Check "Execute as: Me" and "Who has access: Anyone".
 *     (Saving code alone does NOT update the live URL; it serves the
 *     last deployed version until you deploy a new version.)
 *  4. Open the /exec URL with ?action=ping on the end in a browser.
 *     You should see {"status":"ok",...}. A Google sign-in page means
 *     "Who has access" isn't set to Anyone.
 *
 * Responses land in the "RSVPs" tab. The page's "Admin access" link
 * reads them back with ?action=admin&passcode=... — the passcode is
 * checked here, never in the page's own source.
 */

var SPREADSHEET_ID = "1nwj0dfInQSkCicvh1CTRC5qUyaUzKkRMNrjkQAs3tek";
var SHEET_NAME = "RSVPs";
var HEADERS = ["Timestamp", "Name", "Year / Degree", "UVIG Member", "Email", "Wants to Join", "Topics"];

// Rotate any time: change it, Save, then deploy a new version (step 3).
var ADMIN_PASSCODE = "managingdirector";

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function appendRsvp_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // two people submitting at once both get saved
  try {
    getSheet_().appendRow([
      new Date(),
      String(data.name || "").slice(0, 200),
      String(data.yearDegree || "").slice(0, 200),
      data.isMember ? "Yes" : "No",
      String(data.email || "").slice(0, 200),
      data.joinInterest ? "Yes" : "No",
      String(data.topics || "").slice(0, 2000)
    ]);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (!data.name) return json_({ status: "error", message: "Missing name" });
    appendRsvp_(data);
    return json_({ status: "ok" });
  } catch (err) {
    console.error(err);
    return json_({ status: "error", message: String(err) });
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = String(p.action || "").trim();

  if (action === "ping") {
    try {
      var sheet = getSheet_();
      return json_({ status: "ok", sheet: sheet.getName(), rows: Math.max(sheet.getLastRow() - 1, 0) });
    } catch (err) {
      return json_({ status: "error", message: String(err) });
    }
  }

  if (action !== "admin") return json_({ status: "error", message: "Unknown request" });
  if ((p.passcode || "") !== ADMIN_PASSCODE) return json_({ status: "error", message: "Invalid passcode" });

  var values = getSheet_().getDataRange().getValues();
  var headers = values[0] || [];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var row = {};
    for (var c = 0; c < headers.length; c++) {
      var v = values[i][c];
      row[headers[c]] = (v instanceof Date) ? v.toLocaleString() : v;
    }
    rows.push(row);
  }

  return json_({
    status: "ok",
    responses: rows,
    totals: {
      total: rows.length,
      members: rows.filter(function (r) { return r["UVIG Member"] === "Yes"; }).length,
      nonMembers: rows.filter(function (r) { return r["UVIG Member"] === "No"; }).length,
      joinInterest: rows.filter(function (r) { return r["Wants to Join"] === "Yes"; }).length
    }
  });
}

// Run this once from the editor (step 2): it triggers the permission
// prompt and writes a test row, proving the sheet connection works.
function testSetup() {
  appendRsvp_({ name: "TEST - delete me", yearDegree: "test", isMember: true, email: "", joinInterest: false, topics: "Setup check" });
  Logger.log("Wrote a test row to the '" + SHEET_NAME + "' tab. Now deploy a new version (step 3).");
}
