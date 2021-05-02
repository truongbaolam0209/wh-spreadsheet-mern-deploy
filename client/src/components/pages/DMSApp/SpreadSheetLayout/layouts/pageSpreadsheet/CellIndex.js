import React from 'react';
import styled from 'styled-components';
import { rowLocked } from './Cell';


const CellIndex = (props) => {

   const { rowData, contextInput, rowIndex } = props;
   const { contextCell, contextRow, contextProject } = contextInput;
   const { setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const { drawingTypeTree, rowsAll, modeGroup, rowsSelected } = stateRow;
   const { roleTradeCompany } = stateProject.allDataOneSheet;
   
   const isLockedRow = rowLocked(roleTradeCompany, rowData, modeGroup, drawingTypeTree);

   const onClickCellIndex = () => {
      setCellActive(null);
      if (isLockedRow) return;
      const row = rowsAll.find(x => x.id === rowData.id);
      if (!rowsSelected.find(x => x.id === rowData.id) && rowData._rowLevel === 1) {
         getSheetRows({
            ...stateRow,
            rowsSelected: [...rowsSelected, row],
            rowsSelectedToMove: []
         });
      };
   };

   return (
      <Styled onClick={onClickCellIndex}>
         {rowData._rowLevel === 1 ? rowsAll.indexOf(rowsAll.find(r => r.id === rowData.id)) + 1 : ''}
         {/* {rowIndex + 1} */}
      </Styled>
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

