import createDataContext from './createDataContext';




const rowReducer = (state, { type, payload }) => {
    switch (type) {

        case 'GET_SHEET_ROWS':
            // return {
            //     ...state,
            //     ...payload
            // };
            return payload;
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


export const { Provider, Context } = createDataContext(
    rowReducer,
    {
        getSheetRows
    },
    null
);
