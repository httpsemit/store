/**
 * Amit Store Inventory Backend - Google Apps Script
 * Deploy as a Web App with 'Execute as: Me' and 'Who has access: Anyone'
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
    const action = e.parameter.action;
    const sheetName = e.parameter.sheet;

    if (!action || !sheetName) {
        return createResponse({ error: 'Missing action or sheet parameter' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        return createResponse({ error: 'Sheet not found' });
    }

    if (action === 'read') {
        const data = getSheetData(sheet);
        return createResponse(data);
    }

    return createResponse({ error: 'Invalid GET action' });
}

function doPost(e) {
    let params;
    try {
        params = JSON.parse(e.postData.contents);
    } catch (err) {
        return createResponse({ error: 'Invalid JSON' });
    }

    const action = params.action;
    const sheetName = params.sheet;
    const data = params.data;

    if (!action || !sheetName) {
        return createResponse({ error: 'Missing action or sheet parameter' });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
    }

    if (action === 'create') {
        return handleCreate(sheet, data);
    } else if (action === 'update') {
        return handleUpdate(sheet, data);
    } else if (action === 'delete') {
        return handleDelete(sheet, data.id);
    } else if (action === 'sync_all') {
        return handleSyncAll(ss, data);
    }

    return createResponse({ error: 'Invalid POST action' });
}

function getSheetData(sheet) {
    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];

    const headers = rows[0];
    const data = [];

    for (let i = 1; i < rows.length; i++) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = rows[i][j];
        }
        data.push(obj);
    }
    return data;
}

function handleCreate(sheet, data) {
    const headers = sheet.getDataRange().getValues()[0] || Object.keys(data);
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(Object.keys(data));
    }

    const row = headers.map(h => data[h] || '');
    sheet.appendRow(row);
    return createResponse({ success: true, id: data.id });
}

function handleUpdate(sheet, data) {
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const idIndex = headers.indexOf('id');

    if (idIndex === -1) return createResponse({ error: 'No id column found' });

    for (let i = 1; i < rows.length; i++) {
        if (rows[i][idIndex] === data.id) {
            const newRow = headers.map(h => data[h] !== undefined ? data[h] : rows[i][headers.indexOf(h)]);
            sheet.getRange(i + 1, 1, 1, headers.length).setValues([newRow]);
            return createResponse({ success: true });
        }
    }
    return createResponse({ error: 'Item not found' });
}

function handleDelete(sheet, id) {
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const idIndex = headers.indexOf('id');

    for (let i = 1; i < rows.length; i++) {
        if (rows[i][idIndex] === id) {
            sheet.deleteRow(i + 1);
            return createResponse({ success: true });
        }
    }
    return createResponse({ error: 'Item not found' });
}

function handleSyncAll(ss, allData) {
    // allData is { products: [...], categories: [...], ... }
    for (const [sheetName, items] of Object.entries(allData)) {
        let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
        sheet.clear();
        if (items.length > 0) {
            const headers = Object.keys(items[0]);
            sheet.appendRow(headers);
            const values = items.map(item => headers.map(h => item[h] || ''));
            sheet.getRange(2, 1, values.length, headers.length).setValues(values);
        }
    }
    return createResponse({ success: true });
}

function createResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup function - run this once to prepare sheets
 */
function initialSetup() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ['Products', 'Categories', 'Sales', 'StockIntakes', 'Users'];
    sheets.forEach(name => {
        if (!ss.getSheetByName(name)) ss.insertSheet(name);
    });
}
