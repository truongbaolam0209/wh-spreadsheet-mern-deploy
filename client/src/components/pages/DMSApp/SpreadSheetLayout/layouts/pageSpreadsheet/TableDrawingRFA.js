import { message, Select } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { getHeaderWidth } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import { convertTradeCodeInverted, findTradeOfDrawing } from './PanelAddNewRFA';


const { Option } = Select;

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


const TableDrawingRFA = ({ onClickCancelModalPickDrawing, onClickApplyModalPickDrawing, dwgsToAddNewRFA, tradeOfRfaForFirstTimeSubmit, formRfaType, existingTradeOfResubmision }) => {


   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);

   const { headers } = stateProject.allDataOneSheet.publicSettings;


   const { rowsAll, drawingTypeTreeDmsView } = stateRow;

   const [drawingTrade, setDrawingTrade] = useState(existingTradeOfResubmision || convertTradeCodeInverted(tradeOfRfaForFirstTimeSubmit) || 'ARCHI');
   const [rowsTableInput, setRowsTableInput] = useState([]);


   useEffect(() => {

      if (drawingTrade !== convertTradeCodeInverted(tradeOfRfaForFirstTimeSubmit)) {
         setSelectedIdRows([]);
      };
      
      const rowsList = rowsAll.filter(r => {
         const trade = findTradeOfDrawing(r, drawingTypeTreeDmsView);
         return (r['Drawing Number'] || r['Drawing Name']) &&
            !r.rfaNumber &&
            trade.includes(drawingTrade);
      });
      setRowsTableInput(rowsList);

   }, [drawingTrade]);


   const [selectedIdRows, setSelectedIdRows] = useState(dwgsToAddNewRFA ? dwgsToAddNewRFA.map(x => x.id) : []);


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
      if (selectedIdRows.indexOf(rowData.id) !== -1) {
         return 'row-selected-rfa';
      };
   };


   const rowEventHandlers = {
      onClick: (props) => {
         const { rowKey, rowData } = props;
         if (selectedIdRows.indexOf(rowKey) === -1) {
            setSelectedIdRows([...selectedIdRows, rowKey]);
         } else {
            setSelectedIdRows(selectedIdRows.filter(id => id !== rowKey));
         };
      },
   };

   return (
      <div style={{
         width: '100%',
         height: window.innerHeight * 0.85 - 20,
         margin: '0 auto',
         padding: 10,
         textAlign: 'center',
      }}>
         <div style={{ display: 'flex' }}>
            <SelectStyled
               style={{ minWidth: 100, paddingRight: 10 }}
               value={drawingTrade}
               onChange={(e) => setDrawingTrade(e)}
               disabled={formRfaType === 'form-resubmit-RFA'}
            >
               {['ARCHI', 'C&S', 'M&E', 'PRECAST'].map(item => (
                  <Option key={item} value={item}>{item}</Option>
               ))}
            </SelectStyled>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{`Number of drawings selected: ${selectedIdRows.length}`}</div>
         </div>

         <div style={{ width: '100%', height: window.innerHeight * 0.8 - 150 }}>
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
               onClickApply={() => {
                  if (selectedIdRows.length === 0) {
                     return message.info('Please select drawings to submit!', 3);
                  } else {
                     onClickApplyModalPickDrawing(formRfaType, drawingTrade, selectedIdRows);
                  };
               }}
            />
         </div>
      </div>
   );
};

export default TableDrawingRFA;




const SelectStyled = styled(Select)`
   .ant-select-selection {
      border-radius: 0;
   }
`;


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
      /* -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none; */
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
