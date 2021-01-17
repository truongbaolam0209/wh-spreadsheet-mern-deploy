import React, { useContext } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';

const PanelFunction = (props) => {

   const { buttonPanelFunction, panelType } = props;

   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const role = stateProject.allDataOneSheet && stateProject.allDataOneSheet.role;

   const { rowsToMoveId } = stateRow;


   const listButton = panelType.type === 'cell' && [
      'View Drawing Revision',
      'Create New Drawing Revision',
      'Date Automation',
      'View Cell History',
      'Insert Drawings Below',
      'Insert Drawings Above',
      'Move Drawing',
      'Paste Drawing',
      'Delete Drawing',
      'Insert Drawings By Type'
   ];

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
               onMouseDown={() => buttonPanelFunction(btn)}
               style={disabledBtn(props, btn, rowsToMoveId, role)}
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


const disabledBtn = ({ panelType }, btn, rowsToMoveId, role) => {
   if (!rowsToMoveId && btn === 'Paste Drawing') {
      return { pointerEvents: 'none', color: 'grey' };
   };

   const { _rowLevel } = panelType.cellProps.rowData;

   if (
      (_rowLevel === 1 && btn === 'Insert Drawings By Type') ||
      (_rowLevel !== 1 && btn !== 'Insert Drawings By Type') ||
      (role === 'modeller' && btnLocked_1.indexOf(btn) !== -1) ||
      ((role === 'viewer' || role === 'manager' || role === 'production') && btnLocked_2.indexOf(btn) !== -1)
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
   'Insert Drawings Below',
   'Insert Drawings Above',
   'Move Drawing',
   'Paste Drawing',
   'Delete Drawing',
   'Insert Drawings By Type'
];

