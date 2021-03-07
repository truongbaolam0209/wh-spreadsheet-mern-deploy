import React, { useContext } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { columnLocked, getCompanyNameTextFnc, getTradeNameTextFnc, rowLocked } from './Cell';



const PanelFunction = (props) => {

   const { buttonPanelFunction, panelType } = props;

   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany } = stateProject.allDataOneSheet;

   const { rowsSelectedToMove, rowsSelected, drawingTypeTree, modeGroup } = stateRow;

   const { rowData, column } = panelType.cellProps;

   const isLockedColumn = columnLocked(roleTradeCompany, rowData, modeGroup, column.key);
   const isLockedRow = rowLocked(roleTradeCompany, rowData, modeGroup, drawingTypeTree);

   const dwgType = drawingTypeTree.find(x => x.id === rowData.id);

   let company, trade;
   if (rowData.treeLevel >= 1) {
      company = getCompanyNameTextFnc(dwgType, drawingTypeTree);
   };
   if (rowData.treeLevel >= 2) {
      trade = getTradeNameTextFnc(dwgType, drawingTypeTree);
   };

   const isLockedByCompanyOrTrade =
      roleTradeCompany.role === 'Document Controller' && roleTradeCompany.company === 'Woh Hup Private Ltd'
         ? false
         : roleTradeCompany.company === 'Woh Hup Private Ltd'
            ? (company !== roleTradeCompany.company || trade !== roleTradeCompany.trade)
            : company !== roleTradeCompany.company;


   const listButton = (rowData._rowLevel && rowData._rowLevel === 1 && !isLockedColumn && !isLockedRow) ? [
      'View Drawing Revision',
      'Create New Drawing Revision',
      'Date Automation',
      'View Cell History',
      'Duplicate Drawings',
      'Insert Drawings Below',
      'Insert Drawings Above',
      'Move Drawings',
      'Paste Drawings',
      'Delete Drawing'

   ] : (rowData._rowLevel && rowData._rowLevel === 1 && (isLockedColumn || isLockedRow)) ? [
      'View Drawing Revision',
      'View Cell History',

   ] : (rowData.treeLevel) ? [
      'Paste Drawings',
      'Insert Drawings By Type'

   ] : [];


   const onClickBtn = (btn) => {
      buttonPanelFunction(btn);
   };


   return (
      <div
         style={{
            border: `1px solid ${colorType.grey1}`,
            background: 'white',
         }}
      >
         {listButton.map(btn => (
            <Container
               key={btn}
               onMouseDown={() => onClickBtn(btn)}
               style={disabledBtn(
                  props,
                  btn,
                  rowsSelectedToMove,
                  roleTradeCompany,
                  isLockedByCompanyOrTrade,
                  rowsSelected,
                  drawingTypeTree
               )}
            >
               {btn}
            </Container>

         ))}
      </div>
   );
};

export default PanelFunction;

const Container = styled.div`
    padding: 7px;
    padding-left: 25px;
    
    cursor: pointer;
    color: black;
    &:hover {
        background: ${colorType.grey0};
    };

`;


const disabledBtn = ({ panelType }, btn, rowsSelectedToMove, roleTradeCompany, isLockedByCompanyOrTrade, rowsSelected, drawingTypeTree) => {
   const { rowData } = panelType.cellProps;
   const { _rowLevel, children, treeLevel, id } = rowData;


   if (
      (rowsSelectedToMove.length === 0 && btn === 'Paste Drawings') ||
      (_rowLevel === 1 && roleTradeCompany.role === 'Modeller' && btnLocked_1.indexOf(btn) !== -1) ||

      (_rowLevel === 1 && rowsSelected.length > 0 && rowsSelectedToMove.length === 0 && btn !== 'Move Drawings') ||
      (_rowLevel === 1 && rowsSelected.length > 0 && rowsSelectedToMove.length > 0 && btn !== 'Paste Drawings') ||
      (_rowLevel === 1 && (roleTradeCompany.role === 'View-Only User' || roleTradeCompany.role === 'Production') && btnLocked_2.indexOf(btn) !== -1) ||

      (treeLevel === 1 && rowData['Drawing Number'] === 'Woh Hup Private Ltd' && (btn === 'Paste Drawings' || btn === 'Insert Drawings By Type')) ||
      (treeLevel > 1 && drawingTypeTree.find(x => x.parentId === id) && (btn === 'Paste Drawings' || btn === 'Insert Drawings By Type')) ||
      (treeLevel > 1 && !drawingTypeTree.find(x => x.parentId === id) && rowsSelectedToMove.length === 0 && btn === 'Paste Drawings')
      ||
      (treeLevel >= 1 && isLockedByCompanyOrTrade)

   ) return {
      pointerEvents: 'none',
      color: 'grey'
   };
};


const btnLocked_1 = [
   'Create New Drawing Revision',
   'Date Automation',
];

const btnLocked_2 = [
   'Create New Drawing Revision',
   'Date Automation',
   'Duplicate Drawings',
   'Insert Drawings Below',
   'Insert Drawings Above',
   'Move Drawings',
   'Paste Drawings',
   'Delete Drawing',
   'Insert Drawings By Type'
];


export const getPanelPosition = ({ x: clickX, y: clickY }) => {
   const screenW = window.innerWidth;
   const screenH = window.innerHeight;

   const right = (screenW - clickX) < 200;
   const left = clickX < 200;
   const top = clickY < 200;
   const bottom = (screenH - clickY) < 200;

   return { 
      x: right && top ? clickX - 250 :
         right && bottom ? clickX - 250 :
         left && bottom ? clickX :
         left && top ? clickX :
         right ? clickX - 250 : clickX,
      y: right && top ? clickY :
         right && bottom ? clickY - 300 :
         left && bottom ? clickY - 300 :
         left && top ? clickY :
         bottom ? clickY - 300 : clickY
   };
};