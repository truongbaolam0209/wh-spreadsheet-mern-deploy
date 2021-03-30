import { Icon, Tooltip } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { imgLink } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';



const CellRFA = (props) => {

   const { rowData, cellData, column, buttonPanelFunction } = props;

   

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany } = stateProject.allDataOneSheet;

   const [btnShown, setBtnShown] = useState(false);

   const onClickRfaDrawing = (rfaCode, btn) => {
      let arrayOutput = [];
      const { rowsRfaAll } = stateRow;

      rowsRfaAll.forEach(rfa => {
         if (rfa.id !== rfaCode) {
            arrayOutput.push(rfa);
         } else {
            const rowsRFAFiltered = rfa.children.filter(r => r['RFA Ref'] === rfaCode + btn);
            arrayOutput.push({
               id: rfa.id,
               'rfaNumber': rfa.id,
               'btn': rfa.btn,
               rfaRowLevel: 0,
               children: rowsRFAFiltered
            });
         };
      });

      getSheetRows({ ...stateRow, rowsRfaAll: arrayOutput });
   };



   const onClickSubmitOrReplyRFA = () => {
      buttonPanelFunction('addNewRFA-ICON');
      getSheetRows({
         ...stateRow,
         currentRFAToAddNew: rowData.id,
      });
   };

   let consultantIndex;
   let consultantReplyStatus;
   if (column.key.includes('Consultant (')) {
      consultantIndex = getIndexOfConsultant(column.key);
      consultantReplyStatus = rowData[`Status (${consultantIndex})`];
   };


   return (
      <div
         style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            padding: 5,
            color: 'black',
            background: consultantReplyStatus === 'Approved for Construction' ? 'yellow' : 'transparent'
         }}
         onMouseOver={() => setBtnShown(true)}
         onMouseLeave={() => setBtnShown(false)}
      >
         {(rowData.rfaRowLevel === 0 && column.key === 'RFA Ref') ? (
            <div style={{ display: 'flex', position: 'relative' }}>
               <span style={{ marginRight: 5 }}>{rowData['rfaNumber']}</span>
               <div style={{ display: 'flex' }}>
                  {[...rowData['btn'], 'All'].map(btn => (
                     <ButtonRFA
                        key={btn}
                        onClick={() => onClickRfaDrawing(rowData['rfaNumber'], btn)}
                     >{btn}</ButtonRFA>
                  ))}
               </div>

               {roleTradeCompany.role === 'Consultant' ? (
                  <Tooltip placement='top' title='Reply To This RFA'>
                     <Icon
                        type='edit'
                        style={{
                           fontSize: 18,
                           transform: 'translateY(1.5px)',
                           position: 'absolute',
                           right: 3,
                           top: 0
                        }}
                        onClick={onClickSubmitOrReplyRFA}
                     />
                  </Tooltip>
               ) : (
                  <Tooltip placement='top' title='Add New RFA For This RFA'>
                     <Icon
                        type='plus-square'
                        style={{
                           fontSize: 18,
                           transform: 'translateY(1.5px)',
                           position: 'absolute',
                           right: 3,
                           top: 0
                        }}
                        onClick={onClickSubmitOrReplyRFA}
                     />
                  </Tooltip>
               )}


            </div>
         ) : (rowData._rowLevel && column.key.includes('Consultant (') && cellData) ? (
            <div>{`${cellData} - Reply (${rowData[`Date Reply (${consultantIndex})`]})`}</div>
         ) : cellData}

         {(btnShown && consultantIndex && rowData._rowLevel) && (
            <>
               {['See Comment', 'Open Drawing File'].map(btn => (
                  <Tooltip key={btn} placement='top' title={btn}>
                     <div style={{
                        cursor: 'pointer',
                        position: 'absolute',
                        right: btn === 'See Comment' ? 4 : 24,
                        top: 5,
                        height: 17,
                        width: 17,
                        backgroundImage: `url(${imgLink.btnDate})`,
                        backgroundSize: 17
                     }}
                        onMouseDown={() => { }}
                     />
                  </Tooltip>
               ))}
            </>
         )}

      </div>
   );
};

export default CellRFA;


const getIndexOfConsultant = (header) => {
   return header.slice(12, header.length - 1);
};


const ButtonRFA = styled.div`
   &:hover {
      cursor: pointer;
      background: yellow
   };
   border-radius: 0;
   border: 1px solid grey;
   background: white;
   min-width: 24px;
   margin-right: 3px;
   
   text-align: center;
   transition: 0.3s;
`;

