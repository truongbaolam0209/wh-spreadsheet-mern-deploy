import createDataContext from './_createDataContext';

const SERVER_URL = 'http://localhost:9000/api';


const projectReducer = (state, { type, payload }) => {
    switch (type) {

        case 'FETCH_DATA_ONE_SHEET':
            return {
                ...state,
                allDataOneSheet: payload
            }

        default:
            return state;
    };
};

const fetchDataOneSheet = dispatch => (data) => {
    dispatch({
        type: 'FETCH_DATA_ONE_SHEET',
        payload: data
    });
};


export const { Provider, Context } = createDataContext(
    projectReducer,
    {
        fetchDataOneSheet
    },
    {
        allDataOneSheet: null
    }
);
