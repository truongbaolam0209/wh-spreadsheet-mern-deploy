import React from 'react';
import { colorType } from '../../constants';
import ButtonStyle from './ButtonStyle';



const ButtonGroupComp = ({ onClickCancel, onClickApply, newText }) => {

    return (
        <div>
            <ButtonStyle
                colorText='black'
                marginRight={10}
                borderColor={colorType.grey1}
                background={colorType.grey4}
                onClick={onClickCancel}
                name='Cancel'
            />
            <ButtonStyle
                colorText='white'
                background={colorType.primary}
                onClick={onClickApply}
                name={newText || 'Apply'}
            />
        </div>
    );
};

export default ButtonGroupComp;
