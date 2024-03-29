
import { Icon, Timeline } from 'antd';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import { headersConsultantWithNumber } from '../generalComponents/OverallComponentDMS';
import CellRFA, { getConsultantReplyData, isColumnWithReplyData } from './CellRFA';




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



const TableDrawingDetail = (props) => {

   const { rowData, onClickCancelModal, onClickApply } = props;
   const { id: rowId } = rowData;
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);
   const { headers } = stateProject.allDataOneSheet.publicSettings;
   const { _id: projectId, token, companies, projectIsAppliedRfaView } = stateProject.allDataOneSheet;

   const { rowsVersionsToSave } = stateRow;


   const [rowsHistoryDatabase, setRowsHistoryDatabase] = useState(null);
   const [rowsHistoryPrevious, setRowsHistoryPrevious] = useState([]);
   const [rowCurrent, setRowCurrent] = useState(null);


   useEffect(() => {
      const fetchRowsHistory = async () => {
         try {
            const res = await Axios.get(`${SERVER_URL}/row/history/one-row/`, { params: { token, projectId, rowId } });

            let rowsHistory = [];
            res.data.forEach((r, i) => {
               const { history } = r;
               if (history) {
                  let data = { id: mongoObjectId() };
                  Object.keys(history).forEach(key => {
                     if (key !== 'rfaNumber' && !key.includes('reply-$$$-') && !key.includes('submission-$$$-')) {
                        const hdText = headers.find(hd => hd.key === key).text;
                        data[hdText] = history[key];
                     } else {
                        data[key] = history[key];
                     };
                  });
                  rowsHistory.push(data);
               };
            });
            setRowsHistoryDatabase(rowsHistory);


            let rowsHistoryPrevious = [];
            if (rowsVersionsToSave) {
               rowsHistoryPrevious = rowsVersionsToSave.filter(r => r.id === rowId);
               rowsHistoryPrevious.forEach((r, i) => {
                  r.id = mongoObjectId();
               });
               setRowsHistoryPrevious(rowsHistoryPrevious);
            };

            setRowCurrent({
               ...rowData,
               key: rowsHistory.length + rowsHistoryPrevious.length + 1
            });


         } catch (err) {
            console.log(err);
         };
      };
      fetchRowsHistory();
   }, []);

   let data, input, columnsData;
   if (rowsHistoryDatabase && rowCurrent) {
      input = [
         ...rowsHistoryDatabase,
         ...rowsHistoryPrevious,
         rowCurrent
      ];
      data = convertToVerticalTable(input, headers, companies, projectIsAppliedRfaView);
      columnsData = ['Info', ...input.map((hd, i) => `Version ${i}`)];
   };


   const panelHeight = window.innerHeight * 0.8;
   const columnWidth = 190;
   const columnHeaderWidth = 210;

   const generateColumns = (headers, { columnWidth, columnHeaderWidth }) => headers.map((column, columnIndex) => ({
      key: column,
      dataKey: column,
      title: column === 'Info' ? '' : column,
      resizable: true,
      width: columnIndex === 0 ? columnHeaderWidth : columnWidth,
      className: columnIndex === 0 ? 'column-header' : 'column-data',
      cellRenderer: (props) => {

         const { cellData, rowData, column } = props;
         const infoCol = rowData['Info'];

         if ((headersConsultantWithNumber.indexOf(infoCol) !== -1 || infoCol === 'RFA Ref') && column.key !== 'Info') {
            return (
               <CellRFA
                  {...props}
                  contextInput={{
                     contextRow: { stateRow },
                     contextProject: { stateProject },
                  }}
               />
            );
         } else {
            return (
               <div style={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  padding: 10
               }}>{cellData}</div>
            );
         };
      }
   }));

   return (

      <div style={{ width: '100%', height: '100%', padding: 10 }}>
         {rowsHistoryDatabase && rowCurrent && (
            <div style={{ display: 'flex', paddingBottom: 10, borderBottom: `1px solid ${colorType.grey4}` }}>
               <div style={{
                  width: columnHeaderWidth + columnWidth * input.length + 17,
                  height: panelHeight - 50,
                  color: 'black'
               }}>
                  <TableStyled
                     fixed
                     columns={generateColumns(columnsData, { columnWidth, columnHeaderWidth })}
                     data={data}
                     rowHeight={28}
                  />
               </div>

               <div style={{
                  padding: '0px 30px',
                  height: panelHeight - 50,
                  overflowY: 'scroll'
               }}>
                  {input.map((item, i) => (
                     <TimeLineDrawing
                        key={i}
                        data={item}
                        version={i}
                     />
                  ))}
               </div>
            </div>
         )}
         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={onClickApply}
               newTextBtnApply='Close'
            />
         </div>
      </div>
   );
};

export default TableDrawingDetail;








const convertToVerticalTable = (data, headers, companies, projectIsAppliedRfaView) => {

   let dwgArray = [];

   const additionalHeadersForProjectWithRFA = projectIsAppliedRfaView
      ? headersConsultantWithNumber.map(text => ({ key: mongoObjectId(), text }))
      : [];


   const headersArr = [
      ...headers.filter(hd => hd.text !== 'Drawing'),
      ...additionalHeadersForProjectWithRFA
   ];


   headersArr.filter(hd => hd.text !== 'Drawing').forEach(hd => {
      let obj = {
         id: mongoObjectId(),
         Info: hd.text
      };
      data.forEach((row, i) => {
         if (isColumnWithReplyData(hd.text) || hd.text === 'RFA Ref') {
            const rfaNumber = row.rfaNumber;
            const rfaRef = row['RFA Ref'];
            if (rfaNumber && rfaRef) {

               if (isColumnWithReplyData(hd.text)) {
                  const { replyStatus, replyCompany, replyDate } = getConsultantReplyData(row, hd.text, companies);

                  if (replyStatus) {
                     obj[i] = { ...obj[i] || {}, [`reply-$$$-status-${replyCompany}`]: replyStatus };
                     obj[i] = { ...obj[i] || {}, [`reply-$$$-date-${replyCompany}`]: replyDate };
                     obj[i] = { ...obj[i] || {}, [`reply-$$$-drawing-${replyCompany}`]: row[`reply-$$$-drawing-${replyCompany}`] };
                     obj[i] = { ...obj[i] || {}, [`reply-$$$-comment-${replyCompany}`]: row[`reply-$$$-comment-${replyCompany}`] || '' };
                     obj[i] = { ...obj[i] || {}, [`reply-$$$-user-${replyCompany}`]: row[`reply-$$$-user-${replyCompany}`] };
                  };
               };

               for (const key in row) {
                  if (key.includes('submission-$$$-') && row[key]) {
                     obj[i] = { ...obj[i] || {}, [key]: row[key] };
                  };
               };

               if (rfaRef) {
                  obj[i] = { ...obj[i] || {}, rfaRef };
               };
            };

         } else {
            obj[`Version ${i}`] = row[hd.text] || '';
         };
      });

      dwgArray.push(obj);
   });
   return dwgArray;
};




const TableStyled = styled(Table)`

   color: black;
   
   .BaseTable__row-cell-text {
      /* color: black; */
   }
   .column-header {
      background: ${colorType.primary};
      color: white;
      font-weight: bold;
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
      background: ${colorType.primary};
      color: white
   }

   .BaseTable__row-cell {
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
      padding: 0;
   };

   .BaseTable__table-main .BaseTable__row-cell:last-child {
      padding-right: 0;
   };
   
`;



const TimeLineDrawing = ({ data, version }) => {


   const { state: stateProject } = useContext(ProjectContext);
   const { headers } = stateProject.allDataOneSheet.publicSettings;

   const headersForTimeline = headers.filter(hd => {
      return (hd.text.includes('(A)') ||
         hd.text === 'Construction Issuance Date' ||
         hd.text === 'Construction Start') &&
         hd.text !== 'Model Start (A)' && hd.text !== 'Model Finish (A)';
   });

   return (
      <div style={{ width: 350 }}>
         <div style={{ marginBottom: 15, fontSize: 17, fontWeight: 'bold' }}>Version {version}</div>
         <TimelineStyled>
            {headersForTimeline.map((hd, i) => {
               return (
                  <Timeline.Item
                     dot={<Icon type='clock-circle-o' style={{ fontSize: '16px' }} />}
                     color={colorType.primary}
                     key={i}
                  >
                     ({data[hd.text] || 'n/a'}) - (<span style={{ fontWeight: 'bold' }}>{hd.text}</span>)
                  </Timeline.Item>
               );
            })}
         </TimelineStyled>
      </div>
   );
};



const TimelineStyled = styled(Timeline)`
   .ant-timeline-item {
      padding-bottom: 5px;
   }

`;