import { message, Modal } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertHistoryData, mongoObjectId } from '../../utils';
import ButtonStyle from '../generalComponents/ButtonStyle';
import FormFilterActivityHistory from '../generalComponents/FormFilterActivityHistory';
import IconTable from '../generalComponents/IconTable';
import PanelCalendarDuration from '../generalComponents/PanelCalendarDuration';



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


const TableActivityHistory = (props) => {

   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);
   const { allDataOneSheet: { publicSettings: { activityRecorded } } } = stateProject;



   const { projectId, token } = stateProject.allDataOneSheet;
   const { headers } = stateProject.allDataOneSheet.publicSettings;

   const [historyAll, setHistoryAll] = useState(null);
   const [historyAllInit, setHistoryAllInit] = useState(null);

   const [loading, setLoading] = useState(false);


   const headersShown = [
      'Drawing Number',
      'Drawing Name',
      'Column',
      'Value',
      'User',
      'Created At',
      'Action'
   ];

   const revKey = headers.find(hd => hd.text === 'Rev').key;
   const statusKey = headers.find(hd => hd.text === 'Status').key;
   const dwgNumber = headers.find(hd => hd.text === 'Drawing Number').key;
   const dwgName = headers.find(hd => hd.text === 'Drawing Name').key;

   useEffect(() => {
      const fetchRowsAndCellHistory = async () => {
         setLoading(true);
         try {
            const resRows = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });
            const resCells = await Axios.get(`${SERVER_URL}/cell/history/`, { params: { token, projectId } });

            let rowsOutput = [];
            resRows.data.forEach(row => {
               const { history } = row;
               if (history) rowsOutput.push({
                  'Drawing Number': history[dwgNumber],
                  'Drawing Name': history[dwgName],
                  'Column': 'Rev & Status',
                  'Value': `${history[revKey] || ''} - ${history[statusKey] || ''}`,
                  'User': row.userId || 'n/a',
                  // 'Created At': moment(row.createdAt).format('DD/MM/YY - HH:mm'),
                  'Created At': row.createdAt,
                  'Action': 'Save Drawing Version',
                  id: mongoObjectId()
               });
            });

            let cellsOutput = [];
            convertHistoryData(resCells.data).forEach(cell => {
               const row = stateRow.rowsAll.find(r => r.id === cell.row);
               const headerFound = headers.find(hd => hd.key === cell.headerKey);
               if (row && headerFound) cellsOutput.push({
                  'Drawing Number': row['Drawing Number'],
                  'Drawing Name': row['Drawing Name'],
                  'Column': headerFound.text,
                  'Value': cell.text || '',
                  'User': cell.email || 'n/a',
                  // 'Created At': moment(cell.createdAt).format('DD/MM/YY - HH:mm'),
                  'Created At': cell.createdAt,
                  'Action': 'Edit Cell',
                  id: mongoObjectId()
               });
            });

            const activityRecordedData = activityRecorded.map(r => {
               return {
                  'Drawing Number': r[dwgNumber],
                  'Drawing Name': r[dwgName],
                  'Column': undefined,
                  'Value': undefined,
                  'User': r.email || 'n/a',
                  // 'Created At': moment(r.createdAt).format('DD/MM/YY - HH:mm'),
                  'Created At': r.createdAt,
                  'Action': r.action,
                  id: mongoObjectId()
               };
            });
            let outputArr = [...rowsOutput, ...cellsOutput, ...activityRecordedData];

            setHistoryAll(sortDataBeforePrint(outputArr));
            setHistoryAllInit(sortDataBeforePrint(outputArr));

            setLoading(false);
         } catch (err) {
            setLoading(false);
            message.warn('Network Error!');
            console.log(err);
         };
      };
      fetchRowsAndCellHistory();
   }, []);

   const [modalFilter, setModalFilter] = useState(false);

   const applyFilter = (data) => {
      setHistoryAll(data);
      setModalFilter(false);
   };

   const sortDataBeforePrint = (data) => {
      data.sort((b, a) => {
         return new Date(a['Created At']) - new Date(b['Created At']);
      });
      data.forEach((dt, i) => {
         dt.index = i + 1;
      });
      return data;
   };


   const [dateRange, setDateRange] = useState(null);
   const onClick = () => {
      if (!dateRange) return;
      let newData = historyAll.filter(r => {
         let xxx = moment(r['Created At']);
         return xxx <= dateRange[1] && xxx >= dateRange[0];
      });
      setHistoryAll(sortDataBeforePrint(newData));
   };
   const resetDataFilter = () => {
      setHistoryAll(sortDataBeforePrint(historyAllInit));
   };

   const checkDataWithinDays = (nos) => {
      const addDays = (date, days) => {
         let result = new Date(date);
         result.setDate(result.getDate() + days);
         return result;
      };

      let today = new Date();
      let dateBefore = addDays(today, nos);
      let newData = historyAllInit.filter(r => {
         let xxx = moment(r['Created At']);
         return xxx <= today && xxx >= dateBefore;
      });
      setHistoryAll(sortDataBeforePrint(newData));
   };


   const [currentWindow, setCurrentWindow] = useState({ width: window.innerWidth, height: window.innerHeight });
   useEffect(() => {
      const handleResize = () => {
         setCurrentWindow({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   });


   return (
      <>
         {historyAll && (
            <div style={{
               background: 'white',
               padding: 10,
               display: 'flex',
               justifyContent: 'center',
               flexDirection: 'column',
            }}>
               <div style={{ display: 'flex', marginBottom: 10 }}>
                  <PanelCalendarDuration pickRangeDate={(e) => setDateRange(e)} />
                  <ButtonStyle
                     onClick={onClick}
                     marginLeft={5}
                     name='Check History'
                  />
               </div>
               <div style={{ display: 'flex', marginBottom: 10 }}>
                  <div style={{ marginRight: 10, display: 'flex' }}>
                     <IconTable type='filter' onClick={() => setModalFilter(true)} isActivityTable={true} />
                     <IconTable type='swap' onClick={resetDataFilter} />
                  </div>

                  <ButtonStyle
                     marginRight={5} name='Today'
                     onClick={() => checkDataWithinDays(-1)}
                  />
                  <ButtonStyle
                     marginRight={5} name='Last 3 Days'
                     onClick={() => checkDataWithinDays(-3)}
                  />

                  <ButtonStyle
                     marginRight={5} name='Last 7 Days'
                     onClick={() => checkDataWithinDays(-7)}
                  />
                  <ButtonStyle
                     marginRight={5} name='Last 14 Days'
                     onClick={() => checkDataWithinDays(-14)}
                  />
                  <ButtonStyle
                     marginRight={5} name='This Month'
                     onClick={() => checkDataWithinDays(-31)}
                  />
               </div>

               <div style={{
                  width: currentWindow.width * 0.8 - 50,
                  height: currentWindow.height * 0.8 - 20,
                  margin: '0 auto',
                  textAlign: 'center'
               }}>
                  <TableStyled
                     fixed
                     columns={generateColumns(headersShown)}
                     data={historyAll}
                     rowHeight={28}
                  />
               </div>
            </div>
         )}

         {modalFilter && (
            <ModalStyledSetting
               title='Filter Data Activity History'
               visible={modalFilter}
               footer={null}
               onCancel={() => {
                  setModalFilter(false);
               }}
               destroyOnClose={true}
               centered={true}
            >
               <FormFilterActivityHistory
                  applyFilter={applyFilter}
                  onClickCancelModal={() => setModalFilter(false)}
                  rowsAll={historyAll}
                  headers={headersShown}
               />
            </ModalStyledSetting>
         )}
      </>
   );
};

export default TableActivityHistory;


const generateColumns = (headers) => {

   return [
      {
         key: 'index',
         dataKey: 'index',
         title: '',
         width: 70,
      },
      ...headers.map((column, columnIndex) => ({
         key: column,
         dataKey: column,
         title: column,
         resizable: true,
         width: getHeaderWidth2(column),
         cellRenderer: column !== 'Created At'
            ? null
            : ({ cellData }) => {
               return (
                  <div style={{ color: 'black' }}>{moment(cellData).format('DD/MM/YY - HH:mm')}</div>
               );
            }
      }))
   ];
};
const getHeaderWidth2 = (header) => {
   if (header === 'Drawing Number') return 300;
   if (header === 'Drawing Name') return 300;
   if (header === 'Column') return 200;
   if (header === 'Value') return 300;
   if (header === 'User') return 200;
   if (header === 'Created At') return 200;
   if (header === 'Action') return 200;
};

const ModalStyledSetting = styled(Modal)`
    .ant-modal-content {
        border-radius: 0;
    }
   .ant-modal-close {
      display: none;
   }
   .ant-modal-header {
      padding: 10px;
   }
   .ant-modal-title {
        padding-left: 10px;
        font-size: 20px;
        font-weight: bold;
   }
   .ant-modal-body {
      padding: 0;
      justify-content: center;
   }
`;
const TableStyled = styled(Table)`

   .BaseTable__row-cell-text {
      color: black
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




