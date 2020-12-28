import createDataContext from './_createDataContext';


const projectReducer = (state, { type, payload }) => {
    switch (type) {

        case 'FETCH_DATA_ONE_SHEET':
            return {
                ...state,
                allDataOneSheet: payload
            }
        case 'SET_USER_DATA':
            return {
                ...state,
                userData: payload
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
const setUserData = dispatch => (data) => {
    dispatch({
        type: 'SET_USER_DATA',
        payload: data
    });
};


export const { Provider, Context } = createDataContext(
    projectReducer,
    {
        fetchDataOneSheet,
        setUserData
    },
    {
        allDataOneSheet: null,
        userData: null
    }
);
