
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, imgLink, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { getHeaderWidth, mongoObjectId } from '../../utils';


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
                     const hdText = headers.find(hd => hd.key === key).text;
                     data[hdText] = history[key];
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

   let data;
   if (rowsHistoryDatabase && rowCurrent) {
      data = [
         ...rowsHistoryDatabase,
         ...rowsHistoryPrevious,
         rowCurrent
      ];
   };

   const panelWidth = window.innerWidth * 0.8;
   const panelHeight = window.innerHeight * 0.8;


   return (
      <div style={{
         height: panelHeight,
         background: 'white',
         padding: 10,
         display: 'flex',
         justifyContent: 'center',
         flexDirection: 'column',
      }}>

         {rowsHistoryDatabase && rowCurrent && (
            <>
               <div style={{
                  width: panelWidth,
                  height: 100 + data.length * 30,
                  margin: '0 auto',
                  textAlign: 'center'
               }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold' }}>DRAWING HISTORY</div>
                  <TableStyled
                     fixed
                     columns={generateColumns(getHeadersText(stateProject.allDataOneSheet.publicSettings.headers))}
                     data={data}
                     rowHeight={28}
                  />

               </div>

               <div style={{
                  margin: '0 auto',
                  textAlign: 'center',
                  marginTop: 100
               }}>
                  <img src={imgLink.timeline} alt='visualize' height={panelHeight - (100 + data.length * 30) - 100} />
               </div>
            </>
         )}



      </div>

   );
};

export default TableDrawingDetail;


const generateColumns = (headers) => headers.map((column, columnIndex) => ({

   key: column,
   dataKey: column,
   title: column,
   resizable: true,
   width: getHeaderWidth(column),
}));

const getHeadersText = (headersData) => {
   return headersData.map(hd => {
      return hd.text;
   });
};




const TableStyled = styled(Table)`


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

