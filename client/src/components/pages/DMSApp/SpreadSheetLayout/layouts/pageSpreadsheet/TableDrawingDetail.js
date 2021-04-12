
import { Icon, Timeline } from 'antd';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';




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

   const { rowData } = props;
   const { id: rowId } = rowData;
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);
   const { headers } = stateProject.allDataOneSheet.publicSettings;
   const { _id: projectId, token } = stateProject.allDataOneSheet;

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
                     if (key !== 'rfaNumber' && !key.includes('reply-$$$-')) {
                        const hdText = headers.find(hd => hd.key === key).text;
                        data[hdText] = history[key];
                     };
                  });
                  rowsHistory.push(data);
               };
            });
            setRowsHistoryDatabase(rowsHistory);


            let rowsHistoryPrevious = [];
            if (stateRow.rowsVersionsToSave) {
               rowsHistoryPrevious = stateRow.rowsVersionsToSave.filter(r => r.id === rowId);
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
      data = convertToVerticalTable(input, headers);
      columnsData = ['Info', ...input.map((hd, i) => `Version ${i + 1}`)];
   };


   const panelHeight = window.innerHeight * 0.8;
   const columnWidth = 120;
   const columnHeaderWidth = 190;

   return (
      <div style={{
         height: panelHeight,
         background: 'white',
         padding: 10,
         display: 'flex',
         justifyContent: 'center',
         // flexDirection: 'column',
      }}>
         {rowsHistoryDatabase && rowCurrent && (
            <>
               <div style={{
                  width: columnHeaderWidth + columnWidth * input.length + 17,
                  height: panelHeight - 100,
                  margin: '0 auto',
                  textAlign: 'center'
               }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>DRAWING HISTORY</div>
                  <TableStyled
                     fixed
                     columns={generateColumns(columnsData, { columnWidth, columnHeaderWidth })}
                     data={data}
                     rowHeight={28}
                  />
               </div>

               <div style={{ display: 'flex', padding: '15px 30px' }}>
                  {input.map((item, i) => (

                     <TimeLineDrawing
                        key={i}
                        data={item}
                        version={i + 1}
                     />

                  ))}
               </div>
            </>
         )}
      </div>
   );
};

export default TableDrawingDetail;




const generateColumns = (headers, { columnWidth, columnHeaderWidth }) => headers.map((column, columnIndex) => ({
   key: column,
   dataKey: column,
   title: column === 'Info' ? '' : column,
   resizable: true,
   width: columnIndex === 0 ? columnHeaderWidth : columnWidth,
   className: columnIndex === 0 ? 'column-header' : 'column-data'
}));

const getHeadersText = (headersData) => {
   return headersData.map(hd => {
      return hd.text;
   });
};


const convertToVerticalTable = (data, headers) => {
   let dwgArray = [];
   headers.forEach(hd => {
      let obj = {
         id: mongoObjectId(),
         Info: hd.text
      };
      data.forEach((row, i) => {
         obj[`Version ${i + 1}`] = row[hd.text] || '';
      });
      dwgArray.push(obj);
   });
   return dwgArray;
};




const TableStyled = styled(Table)`
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
      padding: 10px;
      border-right: 1px solid #DCDCDC;

      overflow: visible !important;
   }
`;



const TimeLineDrawing = ({ data, version }) => {


   const { state: stateProject } = useContext(ProjectContext);
   const { headers } = stateProject.allDataOneSheet.publicSettings;

   const headersForTimeline = headers.filter(hd => {
      return hd.text.includes('(A)') ||
         hd.text.includes('(T)') ||
         hd.text === 'Construction Issuance Date' ||
         hd.text === 'Construction Start';
   });

   return (
      <div style={{ width: 350 }}>
         <div style={{ marginBottom: 15, fontSize: 17, fontWeight: 'bold' }}>Version {version}</div>
         <Timeline>
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
         </Timeline>
      </div>
   );
};

