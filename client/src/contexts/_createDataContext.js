import React, { createContext, useReducer } from 'react';


export default (reducer, actions, initValue) => {

    const Context = createContext();

    const Provider = ({ children }) => {
        const [state, dispatch] = useReducer(reducer, initValue);

        const boundActions = {};
        for (let key in actions) {
            boundActions[key] = actions[key](dispatch);
        };

        return (
            <Context.Provider value={{ state, ...boundActions }}>
                {children}
            </Context.Provider>
        );
    };
    return { Context, Provider };
};
