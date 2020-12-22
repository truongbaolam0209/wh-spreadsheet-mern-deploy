import createDataContext from './_createDataContext';



const cellReducer = (state, { type, payload }) => {
    switch (type) {


        case 'GET_CELL_MODIFIED_TEMP':
            return {
                ...state,
                cellsModifiedTemp: { 
                    ...state.cellsModifiedTemp, 
                    ...payload 
                }
            };
        case 'CLEAR_CELL_MODIFIED_TEMP':
            return {
                ...state,
                cellsModifiedTemp: {}
            };

        case 'SET_CELL_ACTIVE':
            return {
                ...state,
                cellActive: payload
            };

        case 'SET_CELLS_RANGE_START':
            return {
                ...state,
                cellsRangeStart: payload
            };
        case 'SET_CELLS_RANGE_END':
            return {
                ...state,
                cellsRangeEnd: payload
            };

        default:
            return state;
    };
};


const getCellModifiedTemp = dispatch => (value) => {
    dispatch({
        type: 'GET_CELL_MODIFIED_TEMP',
        payload: value
    });
};
const clearCellModifiedTemp = dispatch => () => {
    dispatch({
        type: 'CLEAR_CELL_MODIFIED_TEMP',
    });
};
const setCellActive = dispatch => (cell) => {
    dispatch({
        type: 'SET_CELL_ACTIVE',
        payload: cell
    });
};
const setCellsRangeStart = dispatch => (data) => {
    dispatch({
        type: 'SET_CELLS_RANGE_START',
        payload: data
    });
};
const setCellsRangeEnd = dispatch => (data) => {
    dispatch({
        type: 'SET_CELLS_RANGE_END',
        payload: data
    });
};



export const { Provider, Context } = createDataContext(
    cellReducer,
    {
        getCellModifiedTemp,
        clearCellModifiedTemp,
        setCellActive,
        setCellsRangeStart,
        setCellsRangeEnd,
    },
    {
        cellsModifiedTemp: {},
        cellActive: null,
        cellsRangeStart: null,
        cellsRangeEnd: null,
    }
);
