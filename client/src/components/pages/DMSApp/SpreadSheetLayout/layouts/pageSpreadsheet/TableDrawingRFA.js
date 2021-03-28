import React, { useContext, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { getHeaderWidth } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';


const Table = (props) => {
   return (
      <AutoResizer>
         {({ width, height }) => {
            return (
               <BaseTable
                  {...props}
                  width={width}
                  height={height}
               />
            );
         }}
      </AutoResizer>
   );
};


const TableDrawingRFA = ({ onClickCancelModalPickDrawing, onClickApplyModalPickDrawing }) => {


   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);
   const { headers } = stateProject.allDataOneSheet.publicSettings;
   const { rowsAll } = stateRow;

   const rowsTableInput = rowsAll.filter(r => r['Drawing Number'] || r['Drawing Name']);

   const [selectedIdRows, setSelectedIdRows] = useState([]);


   const generateColumnsRFA = (headers) => {
      return [
         {
            key: 'index',
            dataKey: 'index',
            title: '',
            width: 50,
            cellRenderer: ({ rowIndex }) => <div>{rowIndex + 1}</div>
         },
         ...headers.map(column => ({
            key: column,
            dataKey: column,
            title: column,
            resizable: true,
            width: getHeaderWidth(column),
         }))
      ];
   };
   const rowClassName = ({ rowData }) => {
      if (rowData['RFA Ref']) {
         return 'row-with-rfa-locked';
      };
      if (selectedIdRows.indexOf(rowData.id) !== -1) {
         return 'row-selected-rfa';
      };
   };


   const rowEventHandlers = {
      onClick: (props) => {
         const { rowKey, rowData } = props;
         if (!rowData['RFA Ref']) {
            if (selectedIdRows.indexOf(rowKey) === -1) {
               setSelectedIdRows([...selectedIdRows, rowKey]);
            } else {
               setSelectedIdRows(selectedIdRows.filter(id => id !== rowKey));
            };
         };
      },
   };

   return (
      <div style={{
         width: '100%',
         height: window.innerHeight * 0.8 - 20,
         margin: '0 auto',
         padding: 10,
         textAlign: 'center',
      }}>
         <div>{`Number of drawings selected: ${selectedIdRows.length}`}</div>
         <div style={{ width: '100%', height: window.innerHeight * 0.8 - 200 }}>
            <TableStyled
               fixed
               columns={generateColumnsRFA(headers.map(hd => hd.text))}
               data={rowsTableInput}
               rowHeight={28}
               rowEventHandlers={rowEventHandlers}
               rowClassName={rowClassName}
            />
         </div>
         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModalPickDrawing}
               onClickApply={() => onClickApplyModalPickDrawing(selectedIdRows)}
            />
         </div>
      </div>
   );
};

export default TableDrawingRFA;







const TableStyled = styled(Table)`

   .row-selected-rfa {
      background-color: ${colorType.cellHighlighted};
   };
   .row-with-rfa-locked {
      background-color: ${colorType.lockedCell}
   };

   
   .BaseTable__row-cell-text {
      color: black
   }

   .BaseTable__table .BaseTable__body {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   }

   .BaseTable__header-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      background: ${colorType.grey1};
      color: black
   }

   .BaseTable__row-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
   }
`;
