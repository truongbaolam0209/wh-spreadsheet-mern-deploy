import { Modal } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';
import ButtonStyle from '../generalComponents/ButtonStyle';
import FormFilterActivityHistory from '../generalComponents/FormFilterActivityHistory';
import IconTable from '../generalComponents/IconTable';
import PanelCalendarDuration from '../generalComponents/PanelCalendarDuration';
import { getInfoValueFromRefDataForm } from '../pageSpreadsheet/CellForm';
import { getInfoValueFromRfaData } from '../pageSpreadsheet/CellRFA';
import { getKeyTextForSheet } from '../pageSpreadsheet/PanelSetting';




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


const TableAllFormActivityHistory = (props) => {

   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);

   const { pageSheetTypeName } = stateProject.allDataOneSheet;

   const [historyAll, setHistoryAll] = useState(null);
   const [historyAllInit, setHistoryAllInit] = useState(null);


   const refType = getKeyTextForSheet(pageSheetTypeName);

   const rowsAllToCheck = pageSheetTypeName === 'page-rfa' ? stateRow.rowsRfaAllInit
      : pageSheetTypeName === 'page-rfam' ? stateRow.rowsRfamAllInit
         : pageSheetTypeName === 'page-rfi' ? stateRow.rowsRfiAllInit
            : pageSheetTypeName === 'page-cvi' ? stateRow.rowsCviAllInit
               : pageSheetTypeName === 'page-dt' ? stateRow.rowsDtAllInit
                  : pageSheetTypeName === 'page-mm' ? stateRow.rowsMmAllInit
                     : [];

   const headersShown = [
      `${refType.toUpperCase()} Ref`,
      'Rev',
      'Status',
      'Action',
      'User',
      'Company',
      'Created At',
   ];



   useEffect(() => {

      let outputArr = [];

      rowsAllToCheck.forEach(row => {
         outputArr.push({
            id: mongoObjectId(),
            [`${refType.toUpperCase()} Ref`]: pageSheetTypeName === 'page-rfa'
               ? row['RFA Ref']
               : row[`${refType}Ref`] + (row.revision === '0' ? '' : row.revision),

            'User': pageSheetTypeName === 'page-rfa'
               ? getInfoValueFromRfaData(row, 'submission', 'user')
               : getInfoValueFromRefDataForm(row, 'submission', refType, 'user'),

            'Status': 'Consultant reviewing',
            'Action': 'Submission',

            'Created At': pageSheetTypeName === 'page-rfa'
               ? (getInfoValueFromRfaData(row, 'submission', 'dateSendNoEmail') || getInfoValueFromRfaData(row, 'submission', 'date'))
               : (getInfoValueFromRefDataForm(row, 'submission', refType, 'dateSendNoEmail') || getInfoValueFromRefDataForm(row, 'submission', refType, 'date')),

            'Rev': pageSheetTypeName === 'page-rfa'
               ? (row['RFA Ref'].slice(row.rfaNumber.length, row['RFA Ref'].length) || '0')
               : row.revision,

            'Company': 'Woh Hup Private Ltd'
         });

         const consultantMustReplyArray = pageSheetTypeName === 'page-rfa'
            ? (getInfoValueFromRfaData(row, 'submission', 'consultantMustReply') || [])
            : (getInfoValueFromRefDataForm(row, 'submission', refType, 'consultantMustReply') || []);


         consultantMustReplyArray.forEach(cmp => {
            const statusReply = pageSheetTypeName === 'page-rfa'
               ? getInfoValueFromRfaData(row, 'reply', 'status', cmp)
               : getInfoValueFromRefDataForm(row, 'reply', refType, 'status', cmp);

            if (statusReply) {
               outputArr.push({
                  id: mongoObjectId(),
                  [`${refType.toUpperCase()} Ref`]: pageSheetTypeName === 'page-rfa'
                     ? row['RFA Ref']
                     : row[`${refType}Ref`] + (row.revision === '0' ? '' : row.revision),

                  'User': pageSheetTypeName === 'page-rfa'
                     ? getInfoValueFromRfaData(row, 'reply', 'user', cmp)
                     : getInfoValueFromRefDataForm(row, 'reply', refType, 'user', cmp),

                  'Status': pageSheetTypeName === 'page-rfa'
                     ? getInfoValueFromRfaData(row, 'reply', 'status', cmp)
                     : getInfoValueFromRefDataForm(row, 'reply', refType, 'status', cmp),

                  'Action': 'Reply',
                  'Created At': pageSheetTypeName === 'page-rfa'
                     ? (getInfoValueFromRfaData(row, 'reply', 'dateSendNoEmail', cmp) || getInfoValueFromRfaData(row, 'reply', 'date', cmp))
                     : (getInfoValueFromRefDataForm(row, 'reply', refType, 'dateSendNoEmail', cmp) || getInfoValueFromRefDataForm(row, 'reply', refType, 'date', cmp)),

                  'Rev': pageSheetTypeName === 'page-rfa'
                     ? (row['RFA Ref'].slice(row.rfaNumber.length, row['RFA Ref'].length) || '0')
                     : row.revision,

                  'Company': cmp
               })
            };
         });
      });



      setHistoryAll(sortDataBeforePrint(outputArr));
      setHistoryAllInit(sortDataBeforePrint(outputArr));

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

export default TableAllFormActivityHistory;


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
   if (header.includes(' Ref')) return 300;
   if (header === 'Rev') return 50;
   if (header === 'Action') return 100;
   if (header === 'User') return 250;
   if (header === 'Created At') return 170;
   if (header === 'Status') return 350;
   if (header === 'Company') return 200;
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




