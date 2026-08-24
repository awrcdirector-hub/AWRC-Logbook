const TAB_NAMES = ["Attending", "Signup Log"];

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      app: "AWRC Training Signup",
      sheets: TAB_NAMES,
      formatting: "Nunito, no wrap, auto width plus breathing room"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    (payload.sheets || []).forEach((sheetPayload) => {
      if (!TAB_NAMES.includes(sheetPayload.name)) return;

      const rows = Array.isArray(sheetPayload.rows) && sheetPayload.rows.length > 0
        ? sheetPayload.rows
        : [["No rows sent"]];
      const sheet = spreadsheet.getSheetByName(sheetPayload.name) || spreadsheet.insertSheet(sheetPayload.name);

      sheet.clearContents();
      sheet.clearFormats();
      sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      sheet.setFrozenRows(1);
      const columnCount = rows[0].length;
      const rowCount = rows.length;
      sheet.getRange(1, 1, 1, columnCount)
        .setBackground("#0a4c56")
        .setFontColor("#ffffff")
        .setFontWeight("bold");
      formatTrainingSheet(sheet, columnCount, rowCount);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, updated: TAB_NAMES }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function formatTrainingSheet(sheet, columnCount, rowCount) {
  const usedRows = Math.max(rowCount, 1);
  const usedColumns = Math.min(Math.max(columnCount, 1), 30);
  const range = sheet.getRange(1, 1, usedRows, usedColumns);

  range
    .setFontFamily("Nunito")
    .setVerticalAlignment("middle")
    .setWrap(false);

  sheet.getRange(1, 1, 1, usedColumns)
    .setFontFamily("Nunito")
    .setBackground("#0a4c56")
    .setFontColor("#ffffff")
    .setFontWeight("bold");

  sheet.autoResizeColumns(1, usedColumns);

  for (let column = 1; column <= usedColumns; column += 1) {
    const currentWidth = sheet.getColumnWidth(column);
    sheet.setColumnWidth(column, Math.ceil(currentWidth * 1.08));
  }

  for (let row = 1; row <= usedRows; row += 1) {
    sheet.setRowHeight(row, 24);
  }
}

function formatTrainingSheetsNow() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  TAB_NAMES.forEach((tabName) => {
    const sheet = spreadsheet.getSheetByName(tabName);
    if (!sheet) return;

    const rowCount = Math.max(sheet.getLastRow(), 1);
    const columnCount = Math.max(sheet.getLastColumn(), 1);
    formatTrainingSheet(sheet, columnCount, rowCount);
  });
}
