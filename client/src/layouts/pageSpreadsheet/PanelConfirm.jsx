import React from 'react';
import ButtonGroupComp from './ButtonGroupComp';



const PanelConfirm = ({ onClickCancel, onClickApply }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
            <div style={{ padding: 20 }}>
                Are you sure ?
            </div>
            <div style={{ padding: 20, paddingTop: 0, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancel}
                    onClickApply={onClickApply}
                />
            </div>

        </div>
    );
};

export default PanelConfirm;
