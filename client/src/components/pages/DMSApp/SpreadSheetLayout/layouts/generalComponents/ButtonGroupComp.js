import React from 'react';
import { colorType } from '../../constants';
import ButtonStyle from './ButtonStyle';



const ButtonGroupComp = ({
   onClickCancel,
   newTextBtnCancel,

   onClickApply,
   newTextBtnApply,

   onClickApplyAdditional01,
   newTextBtnApplyAdditional01
}) => {

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

         {newTextBtnApplyAdditional01 && (
            <ButtonStyle
               colorText='white'
               marginRight={10}
               background={colorType.primary}
               onClick={onClickApplyAdditional01}
               name={newTextBtnApplyAdditional01}
            />
         )}
         {newTextBtnApply !== 'No Submit Button' && (
            <ButtonStyle
               colorText='white'
               background={colorType.primary}
               onClick={onClickApply}
               name={newTextBtnApply || 'Apply'}
            />
         )}
      </div>
   );
};

export default ButtonGroupComp;
