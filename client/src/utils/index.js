import _ from 'lodash';


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
export const randomColorRange = [
    '#FFDEAD',
    '#98FB98',
    '#e74c3c',
    '#9b59b6',
    '#1abc9c',
    '#95a5a6'
];


export const formatStringNameToId = (str) => {
    let mystring = str
        .replace(/ /g, '')
        .replace(/\(|\)/g, '')
        .replace(/\//g, '');

    return mystring.charAt(0).toLowerCase() + mystring.slice(1);
};

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

export const extractCellInfo = (key) => {
    return {
        rowId: key.slice(0, 24),
        headerName: key.slice(25, key.length)
    }
};


export const mongoObjectId = () => {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};


export const getHeadersText = (headers) => {
    if (!headers) return [];
    let arr = [];
    headers.forEach(hd => {
        arr.push(hd.text);
    });
    return arr;
};

export const getHeaderKey = (headers, headerText) => {
    if (!headers) return;
    return headers.find(hd => hd.text === headerText).key;
};



export const groupRowsBy = (array, key) => {

    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
        );

        return result;
    }, {});
};








export const mapSubRows = (rows) => {

    if (!rows) return;

    let rowsArr = rows.filter(r => r._rowLevel === 0);

    if (rowsArr.length < 1) return rows;

    let rowsSubArr = rows.filter(r => r._rowLevel === 1);
    if (rowsSubArr.length < 1) return rows;

    const rowsDataOutput = rowsArr.map(r => {
        let subR = rowsSubArr.filter(rSub => rSub._parentRow === r.id);
        return {
            ...r, children: subR
        }
    });
    return rowsDataOutput;
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
            let value = String(item[header]).trim() || '';

            let levelKey = `${_prevLevelKey}_._${value}`;
            let levelParentIndex = _map[levelKey];
            let levelParent = arrayParent[levelParentIndex];

            if (!levelParent) {
                let iddd = mongoObjectId();
                levelParent = _newParent(item, header, level, iddd);

                _map[levelKey] = arrayParent.length;
                arrayParent.push(levelParent);
            };

            levelParent.count++;
            // levelParent[header] = `${item[header]}: (${levelParent.count} nos)`;
            levelParent['Drawing Number'] = `${String(item[header]).toUpperCase()}: (${levelParent.count} nos)`;

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
function _newParent(item, header, level, iddd) {
    return {
        id: iddd,
        _rowLevel: level,
        _src_header: item[header],
        count: 0,
        children: []
    };
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








export const addZero = (num) => {
    if (num < 10) return '0' + num;
    return num;
};

const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};


const findHeaderId = (headers, headerName) => {
    let header = headers.find(hd => hd.text === headerName);
    return header.key;
};



export const convertHeadersTextToKeyArray = (headersText, headers) => {

    return headersText.map(hdText => {
        let hdObj = headers.find(hd => hd.text === hdText);

        return hdObj.key
    });
};




const _groupSubRowsByParentId = (subRows) => {
    let groups = {};
    for (let subRow of subRows) {
        let parentId = subRow._parentRow;
        let group = groups[parentId] || [];
        groups[parentId] = group;
        group.push(subRow);
    };
    return groups;
};
const _filterRows = (rowsData) => {
    let rows = [];
    let subRowsLv1 = [];
    let subRowsLv2 = [];

    for (let rowData of rowsData) {
        let level = rowData._rowLevel;
        if (level === 0) {
            rows.push(rowData);
        } else if (level == 1) {
            subRowsLv1.push(rowData);
        } else if (level == 2) {
            subRowsLv2.push(rowData);
        };
    };
    return [rows, subRowsLv1, subRowsLv2];
};
export const sortRowsReorder = (rowsData) => {
    let [rows, subRowsLv1, subRowsLv2] = _filterRows(rowsData);
    let rowsProcessed = [];
    let groupSubRowsLv1 = _groupSubRowsByParentId(subRowsLv1);
    let groupSubRowsLv2 = _groupSubRowsByParentId(subRowsLv2);

    let firstRowIndex = rows.findIndex((row) => row._preRow === null);
    if (firstRowIndex >= 0) {
        let preRow = rows.splice(firstRowIndex, 1)[0];
        while (preRow) {
            rowsProcessed.push(preRow);

            // sort & format subRowsLv1
            let subRowsLv1 = groupSubRowsLv1[preRow.id] || [];
            let firstSubRowLv1Index = subRowsLv1.findIndex(
                (sr1) => sr1._preRow == null
            );
            if (firstSubRowLv1Index >= 0) {
                let preSubRowLv1 = subRowsLv1.splice(firstSubRowLv1Index, 1)[0];
                while (preSubRowLv1) {
                    rowsProcessed.push(preSubRowLv1);

                    // sort & format subRowsLv2
                    let subRowsLv2 = groupSubRowsLv2[preSubRowLv1.id] || [];
                    let firstSubRowLv2Index = subRowsLv2.findIndex(
                        (sr2) => sr2._preRow == null
                    );
                    if (firstSubRowLv2Index >= 0) {
                        let preSubRowLv2 = subRowsLv2.splice(firstSubRowLv2Index, 1)[0];
                        while (preSubRowLv2) {
                            rowsProcessed.push(preSubRowLv2);

                            let nextSubRowLv2Index = subRowsLv2.findIndex(
                                (sr2) => String(sr2._preRow) == String(preSubRowLv2.id)
                            );
                            if (nextSubRowLv2Index >= 0) {
                                preSubRowLv2 = subRowsLv2.splice(nextSubRowLv2Index, 1)[0];
                            } else {
                                preSubRowLv2 = null;
                            };
                        };
                    };

                    let nextSubRowLv1Index = subRowsLv1.findIndex(
                        (sr1) => String(sr1._preRow) == String(preSubRowLv1.id)
                    );
                    if (nextSubRowLv1Index >= 0) {
                        preSubRowLv1 = subRowsLv1.splice(nextSubRowLv1Index, 1)[0];
                    } else {
                        preSubRowLv1 = null;
                    };
                };
            };

            let nextRowIndex = rows.findIndex(
                (row) => String(row._preRow) == String(preRow.id)
            );
            if (nextRowIndex >= 0) {
                preRow = rows.splice(nextRowIndex, 1)[0];
            } else {
                preRow = null;
            };
        };
    };

    return rowsProcessed;
}







// WORKING WITH SMARTHSHEET ..................................................................

export const getDataConvertedSmartsheet = (projectArray) => {

    let dataOutput = {};
    for (let i = 0; i < projectArray.length; i++) {

        // get the column header
        const project = projectArray[i];
        const categoryArray = _.map(project.columns, 'title');
        let columnsIndexArray = {};
        categoryArray.forEach(cate => {
            project.columns.forEach(cl => {
                if (cl.title === cate) columnsIndexArray[cate] = cl.index;
            });
        });

        let allDrawings = [];

        for (let i = 0; i < project.rows.length; i++) {
            const dwg = project.rows[i];
            allDrawings.push([...dwg.cells]);
        };

        dataOutput[project.name.slice(0, project.name.length - 17)] = {
            allDrawings,
            allDrawingsSorted: pickDataToTable(allDrawings, columnsIndexArray)
        };
    };

    return dataOutput;
};

const pickDataToTable = (drawings, columnsIndexArray) => {
    let arrayDrw = [];
    drawings.forEach(dwg => {
        let objDwg = {};
        Object.keys(columnsIndexArray).forEach(header => {
            if (header === 'Rev') {
                objDwg[checkSpelling(header)] = dwg[columnsIndexArray[header]].displayValue;
            } else {
                if (dwg[columnsIndexArray[header]].value) {
                    objDwg[checkSpelling(header)] = dwg[columnsIndexArray[header]].value;
                };
            };
        });
        arrayDrw.push(objDwg);
    });
    return arrayDrw;
};


const checkSpelling = (header) => {
    if (header === 'Construction issuance date') return 'Construction Issuance Date';
    if (header === 'Drg to Consultant (T)') return 'Drg To Consultant (T)';
    if (header === 'Drg to Consultant (A)') return 'Drg To Consultant (A)';
    if (header === 'get Approval (A)') return 'Get Approval (A)';
    if (header === 'get Approval (T)') return 'Get Approval (T)';
    return header;
};



export const getHeaderWidth = (header) => {

    if (header === 'RFA Ref') return 170;
    else if (
        header === 'Block/Zone' ||
        header === 'Level' || header === 'Unit/CJ' ||
        header === 'Drg Type' || header === 'Use For' ||
        header === 'Coordinator In Charge' || header === 'Modeller' ||
        header === 'Model Progress' || header === 'Drawing Progress' ||
        header === 'Construction Start'
    ) return 100;
    else if (header === 'Construction Issuance Date') return 120;
    else if (header === 'Drawing') return 100;

    else if (
        header === 'Drg To Consultant (A)' ||
        header === 'Drg To Consultant (T)' ||
        header === 'Get Approval (A)' ||
        header === 'Get Approval (T)'
    ) return 120;

    else if (header.includes('(A)') || header.includes('(T)')) return 90;




    else if (header === 'Rev') return 60;
    else if (header === 'Status') return 280;
    else if (header === 'Remark') return 120;
    else if (header === 'Drawing Number') return 350;
    else if (header === 'Drawing Name') return 450;
    else return 300;

};

export const rowClassNameGetColumnsValue = (rows, headers) => {
    let valueObj = {};
    headers.forEach(hd => {
        let valueArr = rows.map(row => row[hd.text] || '');
        valueArr = [...new Set(valueArr)].filter(e => e);
        valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));
        if (valueArr.length > 0) valueObj[hd.text] = valueArr;
    });
    return valueObj;
};
export const getActionName = (type) => {
    if (type === 'filter-ICON') return 'Create New Filter';
    if (type === 'reorderColumn-ICON') return 'Columns Layout';
    if (type === 'group-ICON') return 'Group Data';
    if (type === 'sort-ICON') return 'Sort Data';
    if (type === 'swap-ICON') return 'Clear Filter/Sort/Group/Search';
    if (type === 'addDrawingType-ICON') return 'Drawing Type Organization';
    if (type === 'color-cell-history-ICON') return 'Check Data Changed';
    if (type === 'View Cell History') return 'Cell History';
    if (type === 'Delete Drawing') return 'Delete Drawing';
    // if (type === 'history-ICON') return 'Activity History';
    if (type === 'colorized-ICON') return 'Drawing Colorization';
    if (type && type.includes('Insert Drawings')) return 'Nos Of Drawings';

    else return '';
};
export const getModalWidth = (type) => {
    if (type === 'history-ICON') return window.innerWidth * 0.8 + 20;
    else return 520;
};




const createParentRows = (arr) => {
    let newRows = [];
    arr.forEach((title, i) => {
        newRows.push({
            id: mongoObjectId(),
            _rowLevel: 0,
            expanded: true,
            'Drawing Number': title
        });
    });
    return newRows;
};
const getParentRowsHandy = () => {
    let arrParentTitle = [
        'COLUMN AND WALL SETTING OUT Keyplan',
        'UNIT TYPE LAYOUT TSO Plan',
        'STAIRCASES and LIFT LOBBIES',
        'ANCILLARY STRUCTURES',
        'No Name 1',
        'No Name 2',
        'PBU Tile layout',
        'Tile layout',
        'Clubhouse',
        'RCP',
        'RCP Unit type',
        'RCP Clubhouse',
        'Swimming Pool',
        'External Sections/ Elevations',
        'Driveway/ Pavement',
        'No Name 3',
        'No Name 4',
        'Carpark Details',
        'M&E Details',
        'FAÇADE Maintenance',
        'No Name 5',
        'TOILETS Details',
    ];
    let rows = createParentRows(arrParentTitle);
    return rows;
};
const getParent_IdHandy = (i) => {
    if (i >= 3 && i <= 47) return 0;
    if (i >= 49 && i <= 94) return 1;
    if (i >= 96 && i <= 147) return 2;
    if (i >= 149 && i <= 162) return 3;
    if (i >= 164 && i <= 168) return 4;

    if (i >= 170 && i <= 175) return 5;
    if (i >= 177 && i <= 191) return 6;
    if (i >= 193 && i <= 202) return 7;
    if (i >= 204 && i <= 209) return 8;
    if (i >= 211 && i <= 224) return 9;

    if (i >= 226 && i <= 246) return 10;
    if (i >= 248 && i <= 250) return 11;
    if (i >= 252 && i <= 259) return 12;
    if (i >= 261 && i <= 264) return 13;
    if (i >= 266 && i <= 269) return 14;

    if (i >= 271 && i <= 274) return 15;
    if (i >= 276 && i <= 279) return 16;
    if (i >= 281 && i <= 283) return 17;
    if (i >= 285 && i <= 289) return 18;
    if (i >= 291 && i <= 292) return 19;

    if (i >= 294 && i <= 296) return 20;
    if (i >= 298 && i <= 306) return 21;
};
const getParentRowsSumang = () => {
    let arrParentTitle = [
        'GRID LINE',
        'PRE-COMPUTATION',
        'SUBSTATION',
        'BASEMENT',
        'EDECK',
        'WSO (WALL SETTING-OUT PLANS) - BLK 42(11)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 44(12)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 22(1)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 24(3)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 26(4)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 32(6)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 34(7)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 28(5)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 46(13)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 36(8)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 30(2)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 38(9)',
        'WSO (WALL SETTING-OUT PLANS) - BLK 40(10)',
        'OVERALL FINISHING LAYOUT',
        'SSS (STAIRCASE STOREY SHELTER)',
        'REFLECTED CEILING PLAN',
        'LIFT LOBBY',
    ];
    let rows = createParentRows(arrParentTitle);
    return rows;
};
const getParent_IdSumang = (i) => {
    if (i >= 3 && i <= 4) return 0;
    if (i >= 6 && i <= 6) return 1;
    if (i >= 8 && i <= 9) return 2;
    if (i >= 11 && i <= 20) return 3;
    if (i >= 22 && i <= 35) return 4;

    if (i >= 38 && i <= 43) return 5;
    if (i >= 45 && i <= 50) return 6;
    if (i >= 52 && i <= 59) return 7;
    if (i >= 61 && i <= 70) return 8;
    if (i >= 72 && i <= 78) return 9;

    if (i >= 80 && i <= 85) return 10;
    if (i >= 87 && i <= 92) return 11;
    if (i >= 94 && i <= 100) return 12;
    if (i >= 102 && i <= 107) return 13;
    if (i >= 109 && i <= 114) return 14;

    if (i >= 116 && i <= 121) return 15;
    if (i >= 123 && i <= 128) return 16;
    if (i >= 130 && i <= 135) return 17;
    if (i >= 137 && i <= 175) return 18;
    if (i >= 177 && i <= 211) return 19;

    if (i >= 213 && i <= 213) return 20;
    if (i >= 216 && i <= 254) return 21;
};

export const getCurrentAndHistoryDrawings = (allProjects, headers) => {
    let final = {};
    Object.keys(allProjects).forEach(prj => {

        let drawingTypeTree = prj === 'Sumang' ? getParentRowsSumang() : getParentRowsHandy();
        drawingTypeTree.forEach(r => {
            let headerKeyDrawingNumber = headers.find(hd => hd.text === 'Drawing Number').key;
            r[headerKeyDrawingNumber] = r['Drawing Number'];
            delete r['Drawing Number'];
        });

        let rows = prj === 'Sumang' ? allProjects['Sumang'].allDrawingsSorted : allProjects['Handy'].allDrawingsSorted;

        let objChildren = {};
        rows.forEach((r, i) => {
            const parentIndex = prj === 'Sumang' ? getParent_IdSumang(i + 1) : getParent_IdHandy(i + 1);
            objChildren[parentIndex] = [...objChildren[parentIndex] || [], r];
        });

        let historyOutput = [];
        let rowsAllCurrentOutput = [];
        Object.keys(objChildren).forEach(index => {
            if (index !== 'undefined') {
                let allRowsInEachFolder = objChildren[index];
                let obj = {};
                allRowsInEachFolder.forEach(r => {
                    const key = `${r['Drawing Number'] || ''}-${r['Drawing Name'] || ''}`;
                    obj[key] = [...obj[key] || [], r];
                });

                let rowCurrentOutput = [];
                Object.keys(obj).forEach((key, i) => {
                    const arr = obj[key];
                    arr.sort((a, b) => ((a['Rev'] || '').toLowerCase() > (b['Rev'] || '').toLowerCase()) ? 1 : (((b['Rev'] || '').toLowerCase() > (a['Rev'] || '').toLowerCase()) ? -1 : 0));
                    let rowsHistory = arr.filter((r, index) => index < arr.length - 1);
                    let rowId = mongoObjectId();
                    if (rowsHistory.length > 0) {
                        let rowsHistoryOutput = rowsHistory.map(r => {
                            let rowDataObj = { row: rowId };
                            headers.forEach(hd => {
                                if (r[hd.text]) rowDataObj.history = { ...rowDataObj.history || {}, [hd.key]: r[hd.text] };
                            });
                            return rowDataObj;
                        });
                        historyOutput = [...historyOutput, ...rowsHistoryOutput];
                    };

                    let rowCurrent = arr[arr.length - 1];
                    let rowCurrentObj = {};

                    headers.forEach(hd => {
                        if (rowCurrent[hd.text]) rowCurrentObj.data = { ...rowCurrentObj.data || {}, [hd.key]: rowCurrent[hd.text] };
                    });
                    rowCurrentObj._id = rowId;
                    rowCurrentObj.parentRow = drawingTypeTree[parseInt(index)].id;
                    rowCurrentObj.level = 1;
                    rowCurrentOutput.push(rowCurrentObj);
                });
                rowCurrentOutput.forEach((r, i) => {
                    r.preRow = i === 0 ? null : rowCurrentOutput[i - 1]._id;
                });
                rowsAllCurrentOutput = [...rowsAllCurrentOutput, ...rowCurrentOutput];
            };
        });
        final[prj] = {
            rows: rowsAllCurrentOutput,
            historyRows: historyOutput,
            drawingTypeTree
        };
    });

    return final;
};
const getParentIdHandy = (i) => {
    if (i >= 1 && i < 20) return 0;
    if (i >= 20 && i < 42) return 1;
    if (i >= 42 && i < 60) return 2;
    if (i >= 60 && i < 76) return 3;
    if (i >= 76 && i < 81) return 4;
    if (i >= 81 && i < 87) return 5;
    if (i >= 87 && i < 99) return 6;
    if (i >= 99 && i < 109) return 7;
    if (i >= 109 && i < 112) return 8;
    if (i >= 112 && i < 126) return 9;
    if (i >= 126 && i < 147) return 10;
    if (i >= 147 && i < 150) return 11;
    if (i >= 150 && i < 155) return 12;
    if (i >= 155 && i < 159) return 13;
    if (i >= 159 && i < 163) return 14;
    if (i >= 163 && i < 167) return 15;
    if (i >= 167 && i < 171) return 16;
    if (i >= 171 && i < 174) return 17;
    if (i >= 174 && i < 179) return 18;
    if (i >= 179 && i < 181) return 19;
    if (i >= 181 && i < 184) return 20;
    if (i >= 184 && i < 193) return 21;
};

const returnPreRowNullSumang = (i) => {
    if (
        i === 0 ||
        i === 1 ||
        i === 20 ||
        i === 42 ||
        i === 60 ||
        i === 76 ||
        i === 81 ||
        i === 87 ||
        i === 99 ||
        i === 109 ||
        i === 112 ||
        i === 126 ||
        i === 147 ||
        i === 150 ||
        i === 155 ||
        i === 159 ||
        i === 163 ||
        i === 167 ||
        i === 171 ||
        i === 174 ||
        i === 179 ||

        i === 181 ||
        i === 184
    ) {
        return true;
    } else return false;
};
const returnPreRowNullHandy = (i) => {
    if (
        i === 0 ||
        i === 1 ||
        i === 20 ||
        i === 42 ||
        i === 60 ||
        i === 76 ||
        i === 81 ||
        i === 87 ||
        i === 99 ||
        i === 109 ||
        i === 112 ||
        i === 126 ||
        i === 147 ||
        i === 150 ||
        i === 155 ||
        i === 159 ||
        i === 163 ||
        i === 167 ||
        i === 171 ||
        i === 174 ||
        i === 179 ||

        i === 181 ||
        i === 184
    ) {
        return true;
    } else return false;
};



export const reorderRowsFnc = (data) => {
    let rows = [...data];
    let rowsProcessed = [];
    let firstRowIndex = rows.findIndex(row => row._preRow === null);
    while (firstRowIndex >= 0) {
        let preRow = rows.splice(firstRowIndex, 1)[0];
        while (preRow) {
            rowsProcessed.push(preRow);
            let nextRowIndex = rows.findIndex(row => String(row._preRow) == String(preRow.id));
            if (nextRowIndex >= 0) {
                preRow = rows.splice(nextRowIndex, 1)[0];
            } else {
                preRow = null;
            };
        };
        firstRowIndex = rows.findIndex((row) => row._preRow === null);
    };
    return rowsProcessed;
};