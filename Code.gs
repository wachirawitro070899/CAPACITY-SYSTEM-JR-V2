/**
 * JR Capacity System - Google Apps Script API
 * Data source is fixed to the NEW Google Sheet requested by the user.
 */
const CONFIG = Object.freeze({
  SPREADSHEET_ID: '1sKHUxWULtgUedTBuI_a41FU5WkCASTSuXTis0t12XRI',
  SHEET_GID: 1349772114,
  TIMEZONE: 'Asia/Bangkok'
});

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'capacity').toLowerCase();
    if (action === 'health') return json_({ ok: true, service: 'JR Capacity API', time: new Date().toISOString() });
    if (action === 'capacity') return json_(getCapacityPayload_());
    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: err && err.message ? err.message : String(err) });
  }
}

function getCapacityPayload_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheets().find(s => Number(s.getSheetId()) === Number(CONFIG.SHEET_GID));
  if (!sheet) throw new Error('ไม่พบ Sheet gid ' + CONFIG.SHEET_GID);

  const range = sheet.getDataRange();
  const values = range.getDisplayValues();
  if (!values.length) return { ok: true, rows: [], sheetName: sheet.getName(), updatedAt: new Date().toISOString() };

  const detected = detectHeaderRow_(values);
  const headerIndex = detected.index;
  const headers = detected.headers;
  const rows = [];

  for (let r = headerIndex + 1; r < values.length; r++) {
    const row = values[r];
    if (row.every(v => String(v).trim() === '')) continue;
    const obj = {};
    headers.forEach((h, c) => {
      if (!h) return;
      obj[h] = row[c] == null ? '' : row[c];
    });
    if (isUsefulRow_(obj)) rows.push(obj);
  }

  return {
    ok: true,
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    sheetGid: CONFIG.SHEET_GID,
    sheetName: sheet.getName(),
    headerRow: headerIndex + 1,
    headers,
    rows,
    updatedAt: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX")
  };
}

function detectHeaderRow_(values) {
  // Allows the sheet to have title rows or grouped headers above the real column header.
  const aliases = ['item','part name','part no','process','m/c','machine','step','speed','100%','90%','85%'];
  let best = { index: 0, score: -1, headers: normalizeHeaders_(values[0] || []) };

  const scanLimit = Math.min(values.length, 15);
  for (let r = 0; r < scanLimit; r++) {
    const headers = normalizeHeaders_(values[r] || []);
    const normalized = headers.map(normalizeKey_);
    let score = 0;
    aliases.forEach(a => { if (normalized.some(h => h.includes(normalizeKey_(a)))) score++; });
    if (score > best.score) best = { index: r, score, headers };
  }
  return best;
}

function normalizeHeaders_(row) {
  const seen = {};
  return row.map((cell, i) => {
    let h = String(cell == null ? '' : cell).replace(/\s+/g, ' ').trim();
    if (!h) return '';
    if (!seen[h]) { seen[h] = 1; return h; }
    seen[h]++;
    return h + ' (' + seen[h] + ')';
  });
}

function normalizeKey_(value) {
  return String(value || '').toLowerCase().replace(/[\s._-]+/g, '').replace(/[^a-z0-9%/ก-๙]/g, '');
}

function isUsefulRow_(obj) {
  const keys = Object.keys(obj);
  const usefulAliases = ['partno','partname','process','m/c','machine','step','speed'];
  return usefulAliases.some(alias => {
    const k = keys.find(key => normalizeKey_(key).includes(normalizeKey_(alias)));
    return k && String(obj[k]).trim() !== '';
  });
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
