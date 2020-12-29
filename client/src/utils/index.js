import Axios from 'axios';
import _ from 'lodash';




export const formatStringNameToId = (str) => {
    let mystring = str
        .replace(/ /g, '')
        .replace(/\(|\)/g, '')
        .replace(/\//g, '');

    return mystring.charAt(0).toLowerCase() + mystring.slice(1);
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
        for (let i = 0; i < headers.length; i++) {
            let arrayParent = i == 0 ? res : _prevLevelParent.children;

            let header = headers[i];
            let value = String(item[header]).trim() || '';

            let levelKey = `${_prevLevelKey}_._${value}`;
            let levelParentIndex = _map[levelKey];
            let levelParent = arrayParent[levelParentIndex];

            if (!levelParent) {
                let iddd = mongoObjectId();
                levelParent = _newParent(item, header, i, iddd);

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
        [header]: `${item[header]}: (0 nos)`,
        _src_header: item[header],
        count: 0,
        children: []
    };
};

const returnDate = (num) => {
    let date = new Date();
    date.setDate(date.getDate() + num);
    return date;
};


export const convertCellTempToHistory = (
    cellsModifiedTemp,
    stateProject
) => {
    const { username, publicSettings } = stateProject.allDataOneSheet;

    const cellsHistoryData = Object.keys(cellsModifiedTemp).map(key => {
        const { rowId, headerName, email } = extractCellInfo(key);

        const dataOut = {
            rowId,
            headerKey: getHeaderKey(publicSettings.headers, headerName),
            history: {
                text: cellsModifiedTemp[key],
                user: email,
                username,
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
    const { username, publicSettings } = stateProject.allDataOneSheet;

    const rowsHistoryOutput = rowsHistory.map(rowsH => {
        let obj = {};
        publicSettings.headers.forEach(hd => {
            if (rowsH[hd.text]) obj = { ...obj || {}, [hd.key]: rowsH[hd.text] };
        });
        return {
            row: rowsH.id,
            history: obj,
            username
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













const saveRandomRows = async () => {
    try {
        let arrrows = [];
        for (let i = 0; i < 1; i++) {
            // const data = newObj2(stateProject.allDataOneSheet.publicSettings.headers);
            const row = {
                // data,
                parentRow: '5fe979ed94100ae8c49c4afc',
                preRow: null,
                level: 1
            };
            arrrows.push(row);
        };
        await Axios.post(
            // `${SERVER_URL}/sheet/update-rows/${projectId}`,
            { rows: arrrows }
        );
    } catch (err) {
        console.log(err);
    };
};


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

        const indexDrawingName = columnsIndexArray['Drawing Name'];
        const indexRev = columnsIndexArray['Rev'];

        let allDrawings = [];
        let allDrawingsLatestRevision = [];

        for (let i = 0; i < project.rows.length; i++) {
            const dwg = project.rows[i];
            if (dwg.cells[indexDrawingName].value === undefined) continue; // make sure all drawing name is keyed in
            allDrawings.push([...dwg.cells]);

            if (dwg.cells[indexRev].value === undefined) {
                allDrawingsLatestRevision.push([...dwg.cells]);
                continue;
            };

            let found = false;
            for (let j = 0; j < allDrawingsLatestRevision.length; j++) {

                if (allDrawingsLatestRevision[j][indexDrawingName].value === dwg.cells[indexDrawingName].value) {

                    found = true;
                    if (String(allDrawingsLatestRevision[j][indexRev].value) < String(dwg.cells[indexRev].value)) {
                        allDrawingsLatestRevision.splice(j, 1);
                        allDrawingsLatestRevision.push([...dwg.cells]);
                    };
                    break;
                };
            };
            if (!found) allDrawingsLatestRevision.push([...dwg.cells]);
        };


        dataOutput[project.name.slice(0, project.name.length - 17)] = {
            columnsIndexArray: columnsIndexArray,
            allDrawings,
            allDrawingsLatestRevision,
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




    else if (header === 'Rev') return 50;
    else if (header === 'Status') return 280;
    else if (header === 'Remark') return 120;
    else if (header === 'Drawing Number') return 270;
    else if (header === 'Drawing Name') return 450;
    else return 300;

};


export const getActionName = (type) => {
    if (type === 'filter-ICON') return 'Create New Filter';
    if (type === 'reorderColumn-ICON') return 'Columns Layout';
    if (type === 'group-ICON') return 'Group Data';
    if (type === 'sort-ICON') return 'Sort Data';
    if (type === 'rollback-ICON') return 'Clear Filter/Sort/Group/Search';
    if (type === 'addDrawingType-ICON') return 'Drawing Type Organization';
    if (type === 'color-cell-history-ICON') return 'Check Data Changed';
    if (type === 'View Cell History') return 'Cell History';
    else return '';
};





const createParentRows = (arr) => {
    let newRows = [];
    arr.forEach((title, i) => {
        newRows.push({
            _id: mongoObjectId(),
            _rowLevel: 0,
            _parentRow: null,
            _preRow: i === 0 ? null : newRows[i - 1]._id,
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
export const getCurrentAndHistoryDrawings = (rows, headers) => {

    let obj = {};
    rows.forEach(r => {
        const key = `${r['Drawing Number'] || ''}-${r['Drawing Name'] || ''}`;
        obj[key] = [...obj[key] || [], r];
    });


    let parentRows = getParentRowsHandy();
    let historyOutput = [];
    let objOutput = [];

    Object.keys(obj).forEach((key, i) => {

        const arr = obj[key];
        arr.sort((a, b) => (a['Rev'].toLowerCase() > b['Rev'].toLowerCase()) ? 1 : ((b['Rev'].toLowerCase() > a['Rev'].toLowerCase()) ? -1 : 0));

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
        let rowCurrentOutput = {};

        headers.forEach(hd => {
            if (rowCurrent[hd.text]) rowCurrentOutput.data = { ...rowCurrentOutput.data || {}, [hd.key]: rowCurrent[hd.text] };
        });

        rowCurrentOutput._id = rowId;
        rowCurrentOutput.parentRow = i === 0 ? null : parentRows[getParentId(i)]._id;
        rowCurrentOutput.preRow = returnPreRowNull(i) ? null : objOutput[i - 1]._id;
        rowCurrentOutput.level = 1;

        objOutput.push(rowCurrentOutput);
    });

    objOutput.splice(0, 1);


    const parentRowsOutput = parentRows.map(r => {
        const { _id, _rowLevel, _parentRow, _preRow } = r;

        let rowDTObj = {};
        headers.forEach(hd => {
            if (r[hd.text]) rowDTObj = { ...rowDTObj || {}, [hd.key]: r[hd.text] };
        });
        return {
            _id,
            level: _rowLevel,
            parentRow: _parentRow,
            preRow: _preRow,
            data: rowDTObj
        };
    });



    return {
        rows: [...parentRowsOutput, ...objOutput],
        historyRows: historyOutput
    };
};
const getParentId = (i) => {
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
const returnPreRowNull = (i) => {
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