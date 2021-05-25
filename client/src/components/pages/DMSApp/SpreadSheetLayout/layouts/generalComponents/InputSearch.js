import { Icon, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';


const InputSearch = ({ searchGlobal, stateRow, getSheetRows, isDashboard, setTableAction, modeFilter }) => {



   const [mode, setMode] = useState(false);
   const [value, setValue] = useState('');

   useEffect(() => {
      if (modeFilter.length === 0) {
         setValue('');
      };
   }, [modeFilter]);

   const onChange = (e) => {
      if (!e.target) return;
      searchGlobal(e.target.value);
      setValue(e.target.value);
   };

   const showDrawingSearchOnly = () => {
      if (isDashboard) {
         setTableAction('show found only');
      } else {
         getSheetRows({
            ...stateRow,
            modeSearch: { ...stateRow.modeSearch, isFoundShownOnly: 'show found only' }
         });
      };
   };

   const showDrawingAll = () => {
      if (isDashboard) {
         setTableAction('show all');

      } else {
         getSheetRows({
            ...stateRow,
            modeSearch: { ...stateRow.modeSearch, isFoundShownOnly: 'show all' }
         });
      };
   };


   return (
      <InputStyled>
         <input
            placeholder='Input search text...'
            onChange={onChange}
            value={value}
            style={{
               border: 'none',
               outline: 'none',
               height: 21,
               background: 'transparent',
               width: 220
            }}
         />
         <div style={{ float: 'right' }}>

            {mode ? (
               <Tooltip title='Show All Drawing'>
                  <IconStyled
                     type='right-circle'
                     onClick={() => {
                        setMode(false);
                        showDrawingAll();
                     }}
                  />
               </Tooltip>
            ) : (
               <Tooltip title='Show Searched Drawing Only'>
                  <IconStyled
                     type='left-circle'
                     onClick={() => {
                        setMode(true);
                        showDrawingSearchOnly();
                     }}
                  />
               </Tooltip>
            )}

         </div>
      </InputStyled>
   );
};

export default InputSearch;


const IconStyled = styled(Icon)`
    font-size: 15px;
    margin-right: 2px;
    margin-top: 3px;
    padding: 3px;
    border-radius: 50%;
    &:hover {
        background-color: ${colorType.grey1}
    }
    transform: translate(0, -3px);
`;

const InputStyled = styled.div`

    margin: 3px;
    padding-top: 1px;
    padding-left: 3px;
    height: 25px;
    width: 250px;
    border: 1px solid black;
    border-radius: 5px;
    /* background-color: ${colorType.grey1} */
`;