import { Icon, Tooltip } from 'antd';
import _ from 'lodash';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as RowContext } from '../../contexts/rowContext';


const InputSearch = ({ searchGlobal }) => {

   const { state: stateRow, getSheetRows } = useContext(RowContext);

   const [mode, setMode] = useState(false);
   const [rowsFoundSearch, setRowsFoundSearch] = useState(false);


   const onChange = (e) => {
      if (!e.target) return;
      
      if (e.target.value === '') {
         searchGlobal({});
         setRowsFoundSearch({});
      } else {
         let search = e.target.value;
         let rowsFound = {};
         stateRow.rowsAll.forEach(row => {
            let obj = {};
            Object.keys(row).forEach(key => {
               if (
                  key !== 'id' && key !== '_preRow' && key !== '_parentRow' &&
                  row[key] &&
                  row[key].toString().toLowerCase().includes(search.toLowerCase())
               ) {
                  obj[row.id] = [...obj[row.id] || [], key];
               };
            });
            if (!_.isEmpty(obj)) rowsFound = { ...rowsFound, [row.id]: obj[row.id] };
         });
         searchGlobal(rowsFound);
         setRowsFoundSearch(rowsFound);
      };
   };


   const showDrawingSearchOnly = (rowsFoundSearch) => {
      let arr = [];
      let parentObj = [];
      Object.keys(rowsFoundSearch).forEach(key => {
         const row = stateRow.rowsAll.find(r => r.id === key);
         parentObj.push(row._parentRow);
      });
      stateRow.rowsAll.forEach(r => {
         if (parentObj.indexOf(r._parentRow) !== -1 && rowsFoundSearch[r.id]) {
            arr.push(r);
         };
      });
      getSheetRows({ ...stateRow, rowsAll: arr, showDrawingsOnly: true });
   };

   const showDrawingAll = () => {
      getSheetRows({ ...stateRow, rowsAll: stateRow.rowsAllInit, showDrawingsOnly: false });
   };


   return (
      <InputStyled>
         <input
            placeholder='Input search text...'
            onChange={onChange}
            style={{
               border: 'none',
               outline: 'none',
               height: 21,
               background: 'transparent'
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
                           showDrawingSearchOnly(rowsFoundSearch);
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
    background-color: ${colorType.grey4}
`;