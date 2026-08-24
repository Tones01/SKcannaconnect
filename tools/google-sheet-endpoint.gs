/**
 * SK Cannabis Connect — newsletter signups into a Google Sheet.
 *
 * Appends one row per signup from the footer form on skcannaconnect.ca.
 * Nothing here is served by the site; it runs in Google's Apps Script.
 *
 * ---------------------------------------------------------------------------
 * SETUP
 * ---------------------------------------------------------------------------
 * 1. Make a Google Sheet. Name the first tab `Signups`. Leave it empty —
 *    the header row is written on the first signup.
 *
 * 2. In that sheet: Extensions → Apps Script. Delete the placeholder code and
 *    paste this whole file in. Save.
 *
 *    It matters that you open the editor from inside the sheet — that binds
 *    the script to it. If you started at script.google.com instead, there is
 *    no sheet attached; set SHEET_ID below to fix that.
 *
 * 3. Nothing to change — SECRET below is already filled in and already matches
 *    sheetToken in assets/js/site.js. It is not a password: it ends up in the
 *    site's JavaScript where anyone can read it. It only stops drive-by bots
 *    that find the /exec URL from filling your sheet with junk.
 *
 * 4. Deploy → New deployment → type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone            ← must be "Anyone", not
 *                                           "Anyone with a Google account"
 *    Deploy, approve the permissions prompt, and copy the /exec URL.
 *
 *    On a Google Workspace account an admin policy can remove the "Anyone"
 *    option, leaving only the domain. Signups from the public site fail if
 *    so — ask an admin to allow it, or host the endpoint elsewhere.
 *
 * 5. In `assets/js/site.js`, paste the /exec URL from step 4 into `sheetUrl`.
 *    `mode` and `sheetToken` are already set. Commit and push.
 *
 * 6. Open the /exec URL in a browser. It should say the endpoint is live.
 *    Then submit the real form once and check the sheet.
 *
 * ---------------------------------------------------------------------------
 * CHANGING THIS LATER
 * ---------------------------------------------------------------------------
 * Editing the script does NOT update the live endpoint. You have to
 * Deploy → Manage deployments → edit the existing deployment → set Version to
 * "New version" → Deploy. Keeping the same deployment keeps the same /exec
 * URL, so the site needs no change.
 */

var SECRET = 'm0a2bf3axcig9m433jixf0no374ze5i2';
var SHEET_NAME = 'Signups';
var HEADERS = ['Timestamp', 'Email', 'Source', 'Page'];

/**
 * Leave empty if you opened this script from inside the Sheet
 * (Extensions -> Apps Script). It then writes to the sheet it belongs to.
 *
 * Fill it in only if this is a standalone project (script.google.com ->
 * New project), which has no sheet attached. Paste the long id from the
 * sheet's own URL, the part between /d/ and /edit:
 *   docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
 */
var SHEET_ID = '';

/**
 * Run this once from the editor to check the wiring: pick `setup` in the
 * function dropdown, press Run, approve the permissions prompt.
 *
 * It writes the header row and logs which sheet it reached, so you find out
 * now rather than from a signup that silently vanishes.
 */
function setup() {
  var sheet = getSheet();
  var book = sheet.getParent();
  Logger.log('Connected to: ' + book.getName());
  Logger.log('URL: ' + book.getUrl());
  Logger.log('Tab: ' + sheet.getName() + ', rows so far: ' + Math.max(0, sheet.getLastRow() - 1));
  Logger.log('Looks good. Now Deploy -> New deployment -> Web app.');
}

function doPost(e) {
  // One writer at a time, so two signups in the same second cannot land on
  // the same row.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json({ result: 'error', message: 'busy' });
  }

  try {
    var body = JSON.parse(e.postData.contents);

    if (body.token !== SECRET) {
      return json({ result: 'error', message: 'bad token' });
    }

    var email = String(body.email || '').trim();
    if (!isEmail(email)) {
      return json({ result: 'error', message: 'bad email' });
    }

    var sheet = getSheet();
    if (hasEmail(sheet, email)) {
      return json({ result: 'success', duplicate: true });
    }

    sheet.appendRow([
      new Date(),
      email,
      String(body.source || ''),
      String(body.page || '')
    ]);

    return json({ result: 'success' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lets you confirm the deployment is live by opening the /exec URL. */
function doGet() {
  return json({ result: 'success', message: 'SK Cannabis Connect signup endpoint is live.' });
}

function getSheet() {
  var book = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!book) {
    throw new Error(
      'No spreadsheet attached. Either open this script from inside the ' +
      'Sheet (Extensions -> Apps Script), or set SHEET_ID above.');
  }

  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function hasEmail(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var column = sheet.getRange(2, 2, last - 1, 1).getValues();
  var needle = email.toLowerCase();
  for (var i = 0; i < column.length; i++) {
    if (String(column[i][0]).trim().toLowerCase() === needle) return true;
  }
  return false;
}

function isEmail(value) {
  return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(value) && value.length < 254;
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
