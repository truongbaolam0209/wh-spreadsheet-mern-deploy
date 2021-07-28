import React from 'react';
import styled from 'styled-components';
import { rowLocked } from './Cell';


const CellIndex = (props) => {

   const { rowData, rowIndex, setCellActive, stateRow, getSheetRows, stateProject } = props;

   const { drawingTypeTree, rowsAll, modeGroup, rowsSelected } = stateRow;

   const { roleTradeCompany, pageSheetTypeName } = stateProject.allDataOneSheet;


   const onClickCellIndex = () => {
      if (pageSheetTypeName !== 'page-spreadsheet') return;

      const isLockedRow = rowLocked(roleTradeCompany, rowData, modeGroup, drawingTypeTree);
      if (isLockedRow) return;


      setCellActive(null);
      const row = rowsAll.find(x => x.id === rowData.id);
      if (!rowsSelected.find(x => x.id === rowData.id) && rowData._rowLevel === 1) {
         getSheetRows({
            ...stateRow,
            rowsSelected: [...rowsSelected, row],
            rowsSelectedToMove: []
         });
      } else if (rowsSelected.find(x => x.id === rowData.id) && rowData._rowLevel === 1) {
         getSheetRows({
            ...stateRow,
            rowsSelected: rowsSelected.filter(r => r.id !== row.id),
            rowsSelectedToMove: []
         });
      };
   };


   return (
      <Styled onClick={onClickCellIndex}>{rowIndex + 1}</Styled>
   );
};

export default CellIndex;



const Styled = styled.div`
   color: grey;
   font-size: 12px;
   cursor: pointer;
   width: 100%;
   height: 100%;
   padding: 5px;
   padding-right: 8px;
   text-align: right
`;

