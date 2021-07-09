import React from 'react';
import styled from 'styled-components';
import { convertTradeCodeMeetingMinutesInverted } from '../generalComponents/PanelAddNewMultiForm';
import { rowLocked } from './Cell';
import { convertTradeCodeInverted } from './PanelAddNewRFA';
import { getKeyTextForSheet } from './PanelSetting';

const CellIndex = (props) => {

   const { rowData, contextInput, rowIndex } = props;
   const { contextCell, contextRow, contextProject } = contextInput;
   const { setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const {
      drawingTypeTree, rowsAll, rowsRfaAll, modeGroup, rowsSelected,
      rowsRfamAll, rowsRfiAll, rowsCviAll, rowsDtAll, rowsMmAll,
   } = stateRow;
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


   const listPage = [
      'page-rfam',
      'page-rfi',
      'page-cvi',
      'page-dt',
      'page-mm'
   ];

   let indexRef;
   if (!rowData.treeLevel) {
      if (pageSheetTypeName === 'page-rfa') {
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
         indexRef = outputArr.indexOf(outputArr.find(r => r.id === rowData.id)) + 1;

      } else if (listPage.indexOf(pageSheetTypeName) !== -1) {
         const listTrade = pageSheetTypeName === 'page-mm' ? [
            'PROJECT PROGRESS MEETING',
            'TECHNICAL MEETING',
            'ICE MEETING'
         ] : ['ARCHI', 'C&S', 'M&E', 'PRECAST'];

         let outputArr = [];
         const refType = getKeyTextForSheet(pageSheetTypeName);
         listTrade.forEach(trade => {
            const dwgsInThisTrade = (
               pageSheetTypeName === 'page-rfam' ? rowsRfamAll :
                  pageSheetTypeName === 'page-rfi' ? rowsRfiAll :
                     pageSheetTypeName === 'page-cvi' ? rowsCviAll :
                        pageSheetTypeName === 'page-dt' ? rowsDtAll : rowsMmAll
            ).filter(x => {
               const refData = x[`${refType}Ref`];
               return pageSheetTypeName === 'page-mm'
                  ? convertTradeCodeMeetingMinutesInverted(refData.split('/')[2]) === trade
                  : convertTradeCodeInverted(refData.split('/')[2]) === trade
            });

            const listRef = [...new Set(dwgsInThisTrade.map(x => x[`${refType}Ref`]))].sort();
            listRef.forEach(ref => {
               const dwgsOfThisRef = dwgsInThisTrade.filter(x => x[`${refType}Ref`] === ref);
               outputArr = [...outputArr, ...dwgsOfThisRef];
            });
         });
         indexRef = outputArr.indexOf(outputArr.find(r => r.id === rowData.id)) + 1;
      };
   };


   return (
      <Styled onClick={onClickCellIndex}>
         {((pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') && !rowData.treeLevel)
            ? (rowData._rowLevel < 1 ? null : (rowsAll.indexOf(rowsAll.find(r => r.id === rowData.id)) + 1))
            : ((pageSheetTypeName === 'page-rfa' || listPage.indexOf(pageSheetTypeName) !== -1) && !rowData.treeLevel)
               ? indexRef
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

