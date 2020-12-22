import createDataContext from './_createDataContext';
const SERVER_URL = 'http://localhost:9000/api';



const rowReducer = (state, { type, payload }) => {
    switch (type) {

        // case 'SET_USER':
        //     return {
        //         ...state,
        //         user: payload
        //     };

        case 'SET_SETTINGS':
            return {
                ...state,
                ...payload
            };
            
        default:
            return state;
    };
};

// const setUser = dispatch => (user) => {
//     dispatch({
//         type: 'SET_USER',
//         payload: user
//     });
// };
const setSettings = dispatch => (obj) => {
    dispatch({
        type: 'SET_SETTINGS',
        payload: obj
    });
};


export const { Provider, Context } = createDataContext(
    rowReducer,
    {
        setSettings
    },
    null
);
