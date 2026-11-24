/**
 * UVIG site forms — Google Apps Script backend
 * ---------------------------------------------
 * Shared endpoint for the site's forms:
 *  - Join UVIG (join.html) appends to the "Members" tab.
 *  - Weekly Puzzles score submissions (crossword.html), sent with
 *    { type: "puzzleScore", ... }, append to the "Puzzle Scores" tab.
 *  - Surveys (surveys.html) submissions, sent with
 *    { type: "surveyResponse", ... }, append to the "Survey Responses"
 *    tab. The Surveys page also reads this same endpoint back with a
 *    GET request (?type=leaderboard&survey=...) to show the fastest
 *    times — see doGet below.
 *  - Feedback survey (survey.html) submissions, sent with
 *    { type: "feedbackSurvey", ... }, append to the "Survey" tab.
 *    Columns are built dynamically from each question's "label" in
 *    survey-feedback-data.js, so editing that file's questions never
 *    requires touching this file.
 *
 * Setup steps are in GOOGLE_SHEETS_SETUP.md — this file only
 * needs to be pasted into the Apps Script editor as-is.
 */

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  if (data.type === "puzzleScore") {
    return handlePuzzleScore(data);
  }
  if (data.type === "surveyResponse") {
    return handleSurveyResponse(data);
  }
  if (data.type === "feedbackSurvey") {
    return handleFeedbackSurvey(data);
  }
  return handleMemberSignup(data);
}

function doGet(e) {
  var type = (e.parameter.type || "").trim();
  if (type === "leaderboard") {
    return handleLeaderboard(e.parameter.survey || "");
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: "error", message: "Unknown request" }))
    .setMimeType(ContentService.MimeType.JSON);
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

function handleSurveyResponse(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Survey Responses");

  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Survey Responses");
    sheet.appendRow(["Timestamp", "Name", "Email", "Survey", "Questions", "Total Time (s)", "Weighted Time (s/q)", "Answers"]);
  }

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.email || "",
    data.survey || "",
    data.questionCount || "",
    data.totalTime || "",
    data.weightedTime || "",
    JSON.stringify(data.answers || [])
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleFeedbackSurvey(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Survey");
  var fixedHeaders = ["Timestamp", "Survey ID", "Name", "Email"];

  if (!sheet) {
    sheet = ss.insertSheet("Survey");
  }

  // Read whatever header row is already there — if the tab was created
  // empty (e.g. by hand, or by an older version of this script), this
  // is [] rather than the fixed headers, so don't assume it's populated.
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  // Make sure the fixed columns exist in the right spot before anything
  // else, whether the tab is brand new or was already sitting there
  // without them.
  fixedHeaders.forEach(function (h, i) {
    if (headers[i] !== h) {
      headers[i] = h;
      sheet.getRange(1, i + 1).setValue(h);
    }
  });

  var answers = data.answers || {};

  // New question labels (from survey-feedback-data.js) get their own
  // column automatically, appended after whatever's already there.
  Object.keys(answers).forEach(function (label) {
    if (headers.indexOf(label) === -1) {
      headers.push(label);
      sheet.getRange(1, headers.length).setValue(label);
    }
  });

  var row = headers.map(function (h) {
    if (h === "Timestamp") return new Date();
    if (h === "Survey ID") return data.surveyId || "";
    if (h === "Name") return data.name || "";
    if (h === "Email") return data.email || "";
    var v = answers[h];
    if (Array.isArray(v)) return v.join(", ");
    return v !== undefined ? v : "";
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Leaderboard: fastest average seconds-per-question, per survey.
// "Weighted" = total time / question count, so a 5-question survey and
// an 8-question survey are ranked on the same footing.
function handleLeaderboard(surveyName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Survey Responses");
  var rows = [];

  if (sheet) {
    var values = sheet.getDataRange().getValues();
    var headers = values[0] || [];
    for (var i = 1; i < values.length; i++) {
      var row = {};
      for (var c = 0; c < headers.length; c++) row[headers[c]] = values[i][c];
      if (!surveyName || row["Survey"] === surveyName) {
        rows.push({
          name: row["Name"],
          survey: row["Survey"],
          weighted: Number(row["Weighted Time (s/q)"]) || 0,
          time: row["Total Time (s)"],
          questions: row["Questions"]
        });
      }
    }
  }

  rows.sort(function (a, b) { return a.weighted - b.weighted; });

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", leaderboard: rows.slice(0, 10) }))
    .setMimeType(ContentService.MimeType.JSON);
}
