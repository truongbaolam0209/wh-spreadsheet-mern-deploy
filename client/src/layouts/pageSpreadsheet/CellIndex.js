import React, { useContext } from 'react';
import styled from 'styled-components';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { addZero } from '../../utils';
import { rowLocked } from './Cell';


const CellIndex = ({ rowData }) => {

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateCell, setCellActive } = useContext(CellContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { drawingTypeTree, rowsAll, rowsAllInit, showDrawingsOnly, rowsSelected } = stateRow;
   const { roleTradeCompany } = stateProject.allDataOneSheet;

   const isLockedRow = rowLocked(roleTradeCompany, rowData, showDrawingsOnly, drawingTypeTree);


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
         {rowData._rowLevel === 1 ? addZero(rowsAllInit.indexOf(rowsAllInit.find(r => r.id === rowData.id)) + 1) : ''}
      </Styled>
   );
};

export default CellIndex;



const Styled = styled.div`
    color: grey;
    font-size: 12px;

    width: 100%;
    height: 100%;
    padding: 5px;
    padding-right: 8px;
    text-align: right

`;

