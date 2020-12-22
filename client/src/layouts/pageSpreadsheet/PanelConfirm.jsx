import React from 'react';
import ButtonGroupComp from './ButtonGroupComp';



const PanelConfirm = () => {
    return (
        <>
            <div style={{ padding: 20 }}>
                Are you sure ?
            </div>
            <div style={{ padding: 20, paddingTop: 0, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp />
            </div>
            
        </>
    );
};

export default PanelConfirm;
