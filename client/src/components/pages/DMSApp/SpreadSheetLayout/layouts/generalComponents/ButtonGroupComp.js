import React from 'react';
import { colorType } from '../../constants';
import ButtonStyle from './ButtonStyle';



const ButtonGroupComp = ({ onClickCancel, onClickApply, isPanelAddNewRfa }) => {

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
                name={isPanelAddNewRfa ? 'Submit' : 'Apply'}
            />
        </div>
    );
};

export default ButtonGroupComp;
