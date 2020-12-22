import { extractCellInfo, formatStringNameToId } from '../utils';
import createDataContext from './_createDataContext';
const SERVER_URL = 'http://localhost:9000/api';



const rowReducer = (state, { type, payload }) => {
    switch (type) {

        case 'GET_SHEET_ROWS':
        case 'GET_SHEET_ROWS_SHOWN':
            return {
                ...state,
                ...payload
            };

        case 'UPDATE_SHEET_ROWS':
            return {
                ...state,
                sheetRows: payload
            };

        case 'SAVE_ROW_PREVIOUS_REV':
            const { rowId, rev, data } = payload;
            return {
                ...state,
                rowsPreviousRev: {
                    ...state.rowsPreviousRev,
                    [rowId]: { ...state.rowsPreviousRev[rowId], [rev]: data }
                }
            };

        default:
            return state;
    };
};

const getSheetRows = dispatch => (data) => {
    dispatch({
        type: 'GET_SHEET_ROWS',
        payload: data
    });
};
const getSheetRowsShown = dispatch => (data) => {
    dispatch({
        type: 'GET_SHEET_ROWS_SHOWN',
        payload: data
    });
};


const updateSheetRows = dispatch => (currentRows, cells) => {

    for (const key in cells) {
        const { rowId, headerName } = extractCellInfo(key);
        currentRows.forEach(r => {
            if (r.id === rowId) {
                r[headerName] = cells[key];
            };
        });
    };

    dispatch({
        type: 'UPDATE_SHEET_ROWS',
        payload: [...currentRows]
    });
};


const saveRowPreviousRev = dispatch => (row, sheetAllData) => {
    let data = {};
    sheetAllData.headers.forEach(hd => {
        if (row.original[formatStringNameToId(hd.text)]) {
            data[hd.key] = row.original[formatStringNameToId(hd.text)]
        };
    });
    dispatch({
        type: 'SAVE_ROW_PREVIOUS_REV',
        payload: {
            data,
            rowId: row.original._id,
            rev: row.original.rev
        }
    });
};


export const { Provider, Context } = createDataContext(
    rowReducer,
    {
        getSheetRows,
        getSheetRowsShown,

        updateSheetRows,
        saveRowPreviousRev,
    },
    null
);
