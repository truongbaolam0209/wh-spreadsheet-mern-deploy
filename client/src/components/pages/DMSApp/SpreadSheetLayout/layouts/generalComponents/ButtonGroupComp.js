import React from 'react';
import { colorType } from '../../constants';
import ButtonStyle from './ButtonStyle';



const ButtonGroupComp = ({ onClickCancel, onClickApply, newTextBtnApply, newTextBtnCancel }) => {

    return (
        <div style={{ display: 'flex' }}>
            <ButtonStyle
                colorText='black'
                marginRight={10}
                borderColor={colorType.grey1}
                background={colorType.grey4}
                onClick={onClickCancel}
                name={newTextBtnCancel || 'Cancel'}
            />
            <ButtonStyle
                colorText='white'
                background={colorType.primary}
                onClick={onClickApply}
                name={newTextBtnApply || 'Apply'}
            />
        </div>
    );
};

export default ButtonGroupComp;
