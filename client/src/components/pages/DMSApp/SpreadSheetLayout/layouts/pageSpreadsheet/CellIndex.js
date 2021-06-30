import React from 'react';
import styled from 'styled-components';
import { rowLocked } from './Cell';
import { convertTradeCodeInverted } from './PanelAddNewRFA';

const CellIndex = (props) => {

   const { rowData, contextInput, rowIndex } = props;
   const { contextCell, contextRow, contextProject } = contextInput;
   const { setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const { drawingTypeTree, rowsAll, rowsRfaAll, modeGroup, rowsSelected } = stateRow;
   const { roleTradeCompany, pageSheetTypeName } = stateProject.allDataOneSheet;



   const onClickCellIndex = () => {
      if (pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry') return;

      if (pageSheetTypeName === 'page-spreadsheet') {
         const isLockedRow = rowLocked(roleTradeCompany, rowData, modeGroup, drawingTypeTree);
         if (isLockedRow) return;
      };

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




   let indexRfa;
   if (pageSheetTypeName === 'page-rfa' && !rowData.treeLevel) {
      const listTrade = ['ARCHI', 'C&S', 'M&E', 'PRECAST'];
      let outputArr = [];
      listTrade.forEach(trade => {
         const dwgsInThisTrade = rowsRfaAll.filter(x => {
            const rfaRef = x['RFA Ref'];
            return convertTradeCodeInverted(rfaRef.split('/')[2]) === trade
         });
         const listRef = [...new Set(dwgsInThisTrade.map(x => x['RFA Ref']))].sort();
         listRef.forEach(ref => {
            const dwgsOfThisRef = dwgsInThisTrade.filter(x => x['RFA Ref'] === ref);
            outputArr = [...outputArr, ...dwgsOfThisRef];
         });
      });
      indexRfa = outputArr.indexOf(outputArr.find(r => r.id === rowData.id)) + 1;
   };

   return (
      <Styled onClick={onClickCellIndex}>
         {((pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') && !rowData.treeLevel)
            ? (rowData._rowLevel < 1 ? null : (rowsAll.indexOf(rowsAll.find(r => r.id === rowData.id)) + 1))
            : (pageSheetTypeName === 'page-rfa' && !rowData.treeLevel)
               ? indexRfa
               : ''}

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

