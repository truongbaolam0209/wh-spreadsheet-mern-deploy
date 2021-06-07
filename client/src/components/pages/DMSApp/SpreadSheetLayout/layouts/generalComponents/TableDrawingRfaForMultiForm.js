import { message } from 'antd';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { getHeaderWidth } from '../../utils';
import { convertRowHistoryData, getDataForRFASheet } from '../pageSpreadsheet/PanelSetting';
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


const TableDrawingRfaForMultiForm = ({ onClickCancelModalPickDrawing, onClickApplyModalPickRfaDrawings, dwgsImportFromRFA }) => {


   const { state: stateProject } = useContext(ProjectContext);
   const { role, company, projectId, email, token } = stateProject.allDataOneSheet;

   const [rowsTableInput, setRowsTableInput] = useState([]);

   const [headers, setHeaders] = useState([]);



   useEffect(() => {
      const fetchAllRfaDrawings = async () => {
         try {
            const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
            const resRowHistory = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });
            const { rows, publicSettings } = res.data;
            const dataRowsHistoryConverted = convertRowHistoryData(resRowHistory.data, publicSettings.headers);

            const { rowsDataRFA } = getDataForRFASheet(rows, dataRowsHistoryConverted, role, company);

            setRowsTableInput(rowsDataRFA);
            setHeaders(publicSettings.headers);

         } catch (err) {
            console.log(err);
         };
      };
      fetchAllRfaDrawings();
   }, []);



   const [selectedRows, setSelectedRows] = useState(dwgsImportFromRFA || []);


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
      if (selectedRows.find(x => x.id === rowData.id)) {
         return 'row-selected-rfa';
      };
   };


   const rowEventHandlers = {
      onClick: (props) => {
         const { rowKey, rowData } = props;
         console.log(props);
         console.log();
         if (selectedRows.find(x => x.id === rowKey)) {
            setSelectedRows(selectedRows.filter(row => row.id !== rowKey));
         } else {
            setSelectedRows([...selectedRows, rowData]);
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
                  if (selectedRows.length === 0) {
                     return message.info('Please select drawings', 3);
                  } else {
                     onClickApplyModalPickRfaDrawings(selectedRows);
                  };
               }}
            />
         </div>
      </div>
   );
};

export default TableDrawingRfaForMultiForm;






const TableStyled = styled(Table)`

   .row-selected-rfa {
      background-color: ${colorType.cellHighlighted};
   };
   .row-with-rfa-locked {
      background-color: ${colorType.lockedCell}
   };

   
   .BaseTable__row-cell-text {
      color: black
   };

   .BaseTable__header-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      background: ${colorType.grey1};
      color: black
   };

   .BaseTable__row-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
   };
`;
