import _ from 'lodash';
import namor from 'namor';




export const formatStringNameToId = (str) => {
    let mystring = str
        .replace(/ /g, '')
        .replace(/\(|\)/g, '')
        .replace(/\//g, '');

    return mystring.charAt(0).toLowerCase() + mystring.slice(1);
};



export const extractCellInfo = (key) => {
    // return {
    //     rowId: key.slice(0, 24),
    //     rowLevel: parseInt(key.slice(key.search('rowLevel:') + 9, key.length)),
    //     headerName: key.slice(25, key.search('rowLevel:') - 1)
    // }
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

    rowsArr.forEach(r => {
        let subR = rowsSubArr.filter(rSub => rSub._parentRow === r.id);
        r['children'] = subR;
    });
    return rowsArr;
};




export const groupByHeaders = (data, headers) => {
    let res = []
    let _map = {}

    for (let item of data) {
        let _prevLevelKey = ''
        let _prevLevelParent = null
        for (let i = 0; i < headers.length; i++) {
            let arrayParent = i == 0 ? res : _prevLevelParent.children

            let header = headers[i]
            let value = String(item[header]).trim() || ''
            let levelKey = `${_prevLevelKey}_._${value}`
            let levelParentIndex = _map[levelKey]
            let levelParent = arrayParent[levelParentIndex]

            if (!levelParent) {
                levelParent = _newParent(item, header, i)
                _map[levelKey] = arrayParent.length
                arrayParent.push(levelParent)
            }

            levelParent.count++
            levelParent[header] = `${item[header]}: (${levelParent.count} nos)`

            if (i == headers.length - 1) {
                levelParent.children.push(item)
            } else {
                _prevLevelKey = levelKey
                _prevLevelParent = levelParent
            }
        }
    }
    return res
}

function _newParent(item, header, level) {
    return {
        id: _genId(),
        _rowLevel: level,
        [header]: `${item[header]}: (0 nos)`,
        _src_header: item[header],
        count: 0,
        children: []
    }
}

function _genId() {
    return String(Math.random()).substr(2)
}

const returnDate = (num) => {
    let date = new Date();
    date.setDate(date.getDate() + num);
    return date;
};


export const convertCellTempToHistory = (
    cellsModifiedTemp,
    projectId,
    userId,
    headers
) => {

    const cellsHistoryData = Object.keys(cellsModifiedTemp).map(key => {
        const { rowId, headerName } = extractCellInfo(key);



        const dataOut = {
            sheetId: projectId,
            rowId,
            headerKey: getHeaderKey(headers, headerName),
            history: {
                text: cellsModifiedTemp[key],
                user: userId,
                username: 'Bao Quy Lan',
                createdAt: new Date(),
            }
            // data: [
            // {
            //     user: '5fd9b53350d46f91fc93776f',
            //     username: 'Truong Bao Lam',
            //     text: 'For Ref',
            //     createdAt: returnDate(-5)
            // },
            // {
            //     user: '5fd9d3ad11af6af79c7a05fc',
            //     username: 'Bao Quy Lan',
            //     text: 'For Coor',
            //     createdAt: returnDate(3)
            // },
            // {
            //     user: '5fd9d3ad11af6af79c7a05fc',
            //     username: 'Bao Quy Lan',
            //     text: '21/08/21',
            //     createdAt: returnDate(-5)
            // },
            // ]
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



const getSubData = (data) => {
    for (let i = 0; i < 15; i++) {
        data.push({
            ...data[0],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[0].id,
        })
        data.push({
            ...data[1],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[1].id,
        })
        data.push({
            ...data[2],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[2].id,
        })
        data.push({
            ...data[3],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[3].id,
        })
        data.push({
            ...data[4],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[4].id,
        })
        data.push({
            ...data[5],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[5].id,

        })
        data.push({
            ...data[6],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[6].id,

        })
        data.push({
            ...data[7],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[7].id,
        })
        data.push({
            ...data[8],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[8].id,
        })
        data.push({
            ...data[9],
            ...newObj(),
            id: mongoObjectId(),
            _rowLevel: 1,
            parentId: data[9].id,

        })
        // data.push({
        //     ...data[2],
        //     id: `${data[2].id}-sub-sub-${i}`,
        //     parentId: `${data[2].id}-sub-${i}`,
        //     [expandColumnKey]: `Sub-Sub ${i}`,
        // })

    }
    return data;
};
const getSubData2 = (data, headers) => {
    for (let i = 0; i < 15; i++) {
        data.push({
            ...newObj2(headers),
            // _id: mongoObjectId(),
            // level: 1,
            // parentId: '5fd8c7c9257fd9a1f4b7f68a',

        })
        // data.push({
        //     ...data[1],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[1]._id,

        // })
        // data.push({
        //     ...data[2],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[2]._id,

        // })
        // data.push({
        //     ...data[3],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[3]._id,

        // })
        // data.push({
        //     ...data[4],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[4]._id,

        // })
        // data.push({
        //     ...data[5],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[5]._id,

        // })
        // data.push({
        //     ...data[6],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[6]._id,

        // })
        // data.push({
        //     ...data[7],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[7]._id,

        // })
        // data.push({
        //     ...data[8],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[8]._id,

        // })
        // data.push({
        //     ...data[9],
        //     ...newObj(),
        //     _id: mongoObjectId(),
        //     _rowLevel: 1,
        //     _parentId: data[9]._id,

        // });
    }
    return data;
};

const newObj = () => {
    let xxx = getRndInteger(0, 4);
    let yyy = getRndInteger(0, 4);
    let modeller = getRndInteger(0, 4);
    let coord = getRndInteger(0, 2);

    let used = getRndInteger(0, 3);

    let drgType = getRndInteger(0, 2);


    let d1 = addZero(getRndInteger(3, 25));
    let d2 = addZero(getRndInteger(7, 20));
    let d3 = addZero(getRndInteger(1, 16));
    let d4 = addZero(getRndInteger(3, 25));
    let d5 = addZero(getRndInteger(4, 28));


    let m1 = addZero(getRndInteger(1, 11));
    let m2 = addZero(getRndInteger(1, 11));
    let m3 = addZero(getRndInteger(1, 12));
    let m4 = addZero(getRndInteger(1, 12));
    let m5 = addZero(getRndInteger(1, 12));


    return {
        'Level': '',
        'RFA Ref': `RFA/SUM/ARC/00${addZero(getRndInteger(1, 6))}`,
        'Drawing Number': `HAN_WH_A_CS_KP_${namor.generate({ words: 0, numbers: 0 })}`,

        'Use For': used === 0 ? 'For RFA'
            : used === 1 ? 'For Coor' : 'For Ref',


        'Unit/CJ': '',
        'Drawing Name': `Column and Wall Setting_${namor.generate({ words: 0, numbers: 0 })}`,
        'Block/Zone': addZero(getRndInteger(1, 4)),
        'Drg Type': drgType === 0 ? 'Floor Plan' : 'Section',

        'Coordinator In Charge': coord === 0 ? 'Juan' : 'Hannah',

        'Modeller': modeller === 0 ? 'Anne'
            : modeller === 1 ? 'Judy'
                : modeller === 2 ? 'Thomas' : 'Chris',


        'Model Start (T)': `${d1}/${m1}/20`,
        'Model Start (A)': `${d2}/${m2}/20`,
        'Model Finish (T)': `${d3}/${m3}/20`,
        'Model Finish (A)': `${d4}/${m4}/20`,
        'Model Progress': '',
        'Drawing Start (T)': `${d1}/${m5}/20`,
        'Drawing Start (A)': `${d2}/${m1}/20`,
        'Drawing Finish (T)': `${d3}/${m1}/20`,
        'Drawing Finish (A)': `${d1}/${m4}/20`,
        'Drawing Progress': '',
        'Drg To Consultant (T)': `${d4}/${m1}/20`,
        'Drg To Consultant (A)': `${d5}/${m2}/20`,
        'Consultant Reply (T)': `${d3}/${m2}/20`,
        'Consultant Reply (A)': `${d4}/${m2}/20`,
        'Get Approval (T)': `${d4}/${m5}/20`,
        'Get Approval (A)': `${d4}/${m3}/20`,
        'Construction Issuance Date': '',
        'Construction Start': '',

        'Rev': xxx === 0 ? '0'
            : xxx === 1 ? 'A'
                : xxx === 2 ? 'B' : 'C',

        'Status': yyy === 0 ? 'Approved for Construction'
            : yyy === 1 ? 'Not Started'
                : yyy === 2 ? 'Consultant Reviewing' : 'Reject And Resubmit',

        'Remark': '',
    }
};

export const newObj2 = (headers) => {
    let xxx = getRndInteger(0, 4);
    let yyy = getRndInteger(0, 4);
    let modeller = getRndInteger(0, 4);
    let coord = getRndInteger(0, 2);

    let used = getRndInteger(0, 3);

    let drgType = getRndInteger(0, 2);


    let d1 = addZero(getRndInteger(3, 25));
    let d2 = addZero(getRndInteger(7, 20));
    let d3 = addZero(getRndInteger(1, 16));
    let d4 = addZero(getRndInteger(3, 25));
    let d5 = addZero(getRndInteger(4, 28));


    let m1 = addZero(getRndInteger(1, 11));
    let m2 = addZero(getRndInteger(1, 11));
    let m3 = addZero(getRndInteger(1, 12));
    let m4 = addZero(getRndInteger(1, 12));
    let m5 = addZero(getRndInteger(1, 12));




    return {
        [findHeaderId(headers, 'Level')]: '',
        [findHeaderId(headers, 'RFA Ref')]: `RFA/SUM/ARC/00${addZero(getRndInteger(1, 6))}`,
        [findHeaderId(headers, 'Drawing Number')]: `HAN_WH_A_CS_KP_${namor.generate({ words: 0, numbers: 0 })}`,

        [findHeaderId(headers, 'Use For')]: used === 0 ? 'For RFA'
            : used === 1 ? 'For Coor' : 'For Ref',


        [findHeaderId(headers, 'Unit/CJ')]: '',
        [findHeaderId(headers, 'Drawing Name')]: `Column and Wall Setting_${namor.generate({ words: 0, numbers: 0 })}`,
        [findHeaderId(headers, 'Block/Zone')]: addZero(getRndInteger(1, 4)),
        [findHeaderId(headers, 'Drg Type')]: drgType === 0 ? 'Floor Plan' : 'Section',

        [findHeaderId(headers, 'Coordinator In Charge')]: coord === 0 ? 'Juan' : 'Hannah',

        [findHeaderId(headers, 'Modeller')]: modeller === 0 ? 'Anne'
            : modeller === 1 ? 'Judy'
                : modeller === 2 ? 'Thomas' : 'Chris',


        [findHeaderId(headers, 'Model Start (T)')]: `${d1}/${m1}/20`,
        [findHeaderId(headers, 'Model Start (A)')]: `${d2}/${m2}/20`,
        [findHeaderId(headers, 'Model Finish (T)')]: `${d3}/${m3}/20`,
        [findHeaderId(headers, 'Model Finish (A)')]: `${d4}/${m4}/20`,
        [findHeaderId(headers, 'Model Progress')]: '',
        [findHeaderId(headers, 'Drawing Start (T)')]: `${d1}/${m5}/20`,
        [findHeaderId(headers, 'Drawing Start (A)')]: `${d2}/${m1}/20`,
        [findHeaderId(headers, 'Drawing Finish (T)')]: `${d3}/${m1}/20`,
        [findHeaderId(headers, 'Drawing Finish (A)')]: `${d1}/${m4}/20`,
        [findHeaderId(headers, 'Drawing Progress')]: '',
        [findHeaderId(headers, 'Drg To Consultant (T)')]: `${d4}/${m1}/20`,
        [findHeaderId(headers, 'Drg To Consultant (A)')]: `${d5}/${m2}/20`,
        [findHeaderId(headers, 'Consultant Reply (T)')]: `${d3}/${m2}/20`,
        [findHeaderId(headers, 'Consultant Reply (A)')]: `${d4}/${m2}/20`,
        [findHeaderId(headers, 'Get Approval (T)')]: `${d4}/${m5}/20`,
        [findHeaderId(headers, 'Get Approval (A)')]: `${d4}/${m3}/20`,
        [findHeaderId(headers, 'Construction Issuance Date')]: '',
        [findHeaderId(headers, 'Construction Start')]: '',

        [findHeaderId(headers, 'Rev')]: xxx === 0 ? '0'
            : xxx === 1 ? 'A'
                : xxx === 2 ? 'B' : 'C',

        [findHeaderId(headers, 'Status')]: yyy === 0 ? 'Approved for Construction'
            : yyy === 1 ? 'Not Started'
                : yyy === 2 ? 'Consultant Reviewing' : 'Reject And Resubmit',

        [findHeaderId(headers, 'Remark')]: '',

        
    }
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
            objDwg[checkSpelling(header)] = dwg[columnsIndexArray[header]].value || '';
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