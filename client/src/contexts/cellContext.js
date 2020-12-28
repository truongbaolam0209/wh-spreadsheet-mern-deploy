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
        case 'SET_CELL_ACTIVE':
            return {
                ...state,
                cellActive: payload
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
const setCellActive = dispatch => (cell) => {
    dispatch({
        type: 'SET_CELL_ACTIVE',
        payload: cell
    });
};


export const { Provider, Context } = createDataContext(
    cellReducer,
    {
        getCellModifiedTemp,
        setCellActive,
    },
    {
        cellsModifiedTemp: {},
        cellActive: null,
    }
);
