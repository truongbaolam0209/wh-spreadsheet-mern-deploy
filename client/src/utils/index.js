export const colorTypeStatus = {
    yellow: '#fff200',
    dark: '#1e272e',
    grey0: '#ecf0f1',
    grey1: '#bdc3c7',
    grey2: '#636e72',
    grey3: '#dfe4ea',
    grey4: '#f1f2f6',
    red: '#FA8072',
    green: '#009432',
    blue: '#0984e3',
    orange: '#cc8e35',
    purple: '#303952',
    rose: '#e84118',
    black: 'black',
    orange2: '#f1c40f',
    pp: '#9b59b6',
    pp2: '#10ac84',
};

export const randomColorRangeStatus = {
    'Approved with comments, to Resubmit': colorTypeStatus.purple,
    'Approved with Comment, no submission Required': colorTypeStatus.blue,
    'Approved for Construction': colorTypeStatus.green,
    'Consultant reviewing': colorTypeStatus.grey2,
    'Not Started': colorTypeStatus.orange,
    'Revise In-Progress': colorTypeStatus.yellow,
    '1st cut of drawing in-progress': colorTypeStatus.pp2,
    '1st cut of model in-progress': colorTypeStatus.pp,
    'Pending design': colorTypeStatus.orange2,
    'Reject and resubmit': colorTypeStatus.red,

    'Consultant review and reply': colorTypeStatus.blue,
    'Create update drawing': colorTypeStatus.orange,
    'Create update model': colorTypeStatus.green,
};



export const processRowsFromDB = (sheetHeaders, rows) => {
    let rowsProcessed = [];
    const _formalRowData = (row, sheetHeaders) => {
        let { _id, data, level, parentRow, preRow } = row;
        let rowFormal = {
            id: _id,
            _rowLevel: level,
            _parentRow: parentRow,
            _preRow: preRow
        };
        if (data instanceof Object) {
            for (let header of sheetHeaders) {
                let { key, text } = header;
                if (header.type === 'checkbox') {
                    if (key && text && data[key] !== undefined) rowFormal[text] = data[key];
                } else {
                    if (key && text && data[key]) rowFormal[text] = data[key];
                };
            };
        };
        return rowFormal;
    };
    let firstRowIndex = rows.findIndex((row) => row.preRow === null);
    while (firstRowIndex >= 0) {
        let preRow = rows.splice(firstRowIndex, 1)[0];
        while (preRow) {
            const rowFormal = _formalRowData(preRow, sheetHeaders);
            rowsProcessed.push(rowFormal);
            let nextRowIndex = rows.findIndex(row => String(row.preRow) == String(preRow._id));
            if (nextRowIndex >= 0) {
                preRow = rows.splice(nextRowIndex, 1)[0];
            } else {
                preRow = null;
            };
        };
        firstRowIndex = rows.findIndex((row) => row.preRow === null);
    };
    return rowsProcessed;
};





export const getRandomColor = () => {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    };
    return color;
};


export const randomColorRange = [
    '#FFDEAD',
    '#98FB98',
    '#e74c3c',
    '#9b59b6',
    '#1abc9c',
    '#95a5a6'
];

export const genId = (xxx) => {
    let arr = [];
    for (let i = 0; i < xxx; i++) {
        arr.push(mongoObjectId());
    };
    return arr;
};

export const debounceFnc = (func, delay) => {
    let timeout;
    return function (...args) {
        const context = this;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            func.apply(context, args);
        }, delay);
    };
};




export const mongoObjectId = () => {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};



const getHeaderKey = (headers, headerText) => {
    if (!headers) return;
    return headers.find(hd => hd.text === headerText).key;
};




const _newParent = (level, iddd) => {
    return {
        id: iddd,
        _rowLevel: level,
        count: 0,
        children: []
    };
};
export const groupByHeaders = (data, headers) => {
    let res = [];
    let _map = {};
    // push all rowIds have children in here
    let parentIdsArr = [];
    let _mapParentIds = {};
    for (let item of data) {
        let _prevLevelKey = '';
        let _prevLevelParent = null;
        for (let i = 0, level = headers.length * (-1) + 1; i < headers.length; i++, level++) {
            let arrayParent = i == 0 ? res : _prevLevelParent.children;

            let header = headers[i];
            let value = (item[header] || '').trim();

            let levelKey = `${_prevLevelKey}_._${value}`;
            let levelParentIndex = _map[levelKey];
            let levelParent = arrayParent[levelParentIndex];

            if (!levelParent) {

                let iddd = levelKey + value;
                levelParent = _newParent(level, iddd);

                _map[levelKey] = arrayParent.length;
                arrayParent.push(levelParent);
            };

            levelParent.count++;

            levelParent.title = `${item[header] || 'No Data'}: (${levelParent.count} nos)`;

            if (!_mapParentIds[levelParent.id]) { // levelParent id not yet been push to parentIdsArr
                parentIdsArr.push(levelParent.id);
                _mapParentIds[levelParent.id] = true;
            }

            if (i == headers.length - 1) {
                levelParent.children.push(item);
            } else {
                _prevLevelKey = levelKey;
                _prevLevelParent = levelParent;
            };
        };
    };
    return {
        rows: res,
        expandedRows: parentIdsArr
    };
};



export const extractCellInfo = (key) => {
    const idexOfSplitDigit = key.indexOf('~#&&#~');
    return {
       rowId: key.slice(0, idexOfSplitDigit),
       headerName: key.slice(idexOfSplitDigit + 6, key.length)
    }
 };
export const convertCellTempToHistory = (
    cellsModifiedTemp,
    stateProject
) => {
    const { email, publicSettings } = stateProject.allDataOneSheet;
    const cellsHistoryData = Object.keys(cellsModifiedTemp).map(key => {
        const { rowId, headerName } = extractCellInfo(key);
        const dataOut = {
            rowId,
            headerKey: getHeaderKey(publicSettings.headers, headerName),
            history: {
                text: cellsModifiedTemp[key],
                email,
                createdAt: new Date(),
            }
        };
        return dataOut;
    });
    return cellsHistoryData;
};



export const convertHistoryData = (data) => {
    let arr = [];
    data.forEach(ch => {
        const { histories, headerKey, row } = ch;
        histories.forEach(dt => {
            arr.push({
                ...dt,
                headerKey, row
            });
        });
    });
    return arr
};

export const convertDrawingVersionToHistory = (
    rowsHistory,
    stateProject
) => {
    const { publicSettings } = stateProject.allDataOneSheet;

    const rowsHistoryOutput = rowsHistory.map(rowsH => {
        let obj = {};
        publicSettings.headers.forEach(hd => {
            if (rowsH[hd.text]) obj = { ...obj || {}, [hd.key]: rowsH[hd.text] };
        });
        return {
            row: rowsH.id,
            history: obj,
        };
    });
    return rowsHistoryOutput;
};

export const getHeaderWidth = (header) => {

    if (header === 'RFA Ref') return 200;
    else if (
        header === 'Block/Zone' ||
        header === 'Level' || header === 'Unit/CJ' ||
        header === 'Use For' ||
        header === 'Coordinator In Charge' || header === 'Modeller' ||
        header === 'Model Progress' || header === 'Drawing Progress' ||
        header === 'Construction Start'
    ) return 120;
    else if (header === 'Drg Type') return 180;
    else if (header === 'Construction Issuance Date') return 120;
    else if (header === 'Drawing') return 300;

    else if (
        header === 'Drg To Consultant (A)' ||
        header === 'Drg To Consultant (T)' ||
        header === 'Get Approval (A)' ||
        header === 'Get Approval (T)'
    ) return 120;

    else if (header.includes('(A)') || header.includes('(T)')) return 90;

    else if (header === 'Rev') return 60;
    else if (header === 'Status') return 280;
    else if (header === 'Remark') return 700;
    else if (header === 'Drawing Number') return 400;
    else if (header === 'Drawing Name') return 450;

    else return 300;

};

export const addZero = (num) => {
    if (num < 10) return '0' + num;
    return num;
};




export const getActionName = (type) => {
    if (type === 'filter-ICON') return 'Create New Filter';
    if (type === 'reorderColumn-ICON') return 'Columns Layout';
    if (type === 'group-ICON') return 'Group Data';
    if (type === 'sort-ICON') return 'Sort Data';
    if (type === 'swap-ICON-1') return 'Quit Grouping Mode';
    if (type === 'swap-ICON-2') return 'Clear Filter/Sort/Search';
    if (type === 'addDrawingType-ICON') return 'Drawing Type Organization';
    if (type === 'color-cell-history-ICON') return 'Check Data Changed';
    if (type === 'View Cell History') return 'Cell History';
    if (type === 'Delete Drawing') return 'Delete Drawing';
    if (type === 'colorized-ICON') return 'Drawing Colorization';
    if (type === 'viewTemplate-ICON') return 'View Template';
    if (type === 'addNewRFA-ICON') return 'Add New RFA';
    if (type && (type.includes('Insert Drawings') || type === 'Duplicate Drawings')) return 'Nos Of Drawings';

    else return '';
};




export const ExcelDateToJSDate = (serial) => {
    let utc_days = Math.floor(serial - 25569);
    let utc_value = utc_days * 86400;
    let date_info = new Date(utc_value * 1000);

    let fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    let seconds = total_seconds % 60;

    total_seconds -= seconds;

    let hours = Math.floor(total_seconds / (60 * 60));
    let minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
};