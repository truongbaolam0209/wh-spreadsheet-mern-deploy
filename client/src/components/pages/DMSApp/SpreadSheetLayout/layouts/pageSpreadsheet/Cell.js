import { Checkbox, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, imgLink } from '../../constants';
import PanelCalendar from '../generalComponents/PanelCalendar';
import { isColumnWithReplyData } from './CellRFA';
import { getCompanyNameFnc, getTradeNameFnc, getTreeFlattenOfNodeInArray } from './FormDrawingTypeOrder';



const Cell = (props) => {

   let {
      cellData, rowData, column, columns, rowIndex, columnIndex,
      onRightClickCell, setPosition, getCurrentDOMCell, contextInput
   } = props;

   const { contextCell, contextRow, contextProject } = contextInput;
   const { stateCell, getCellModifiedTemp, setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;
   const { drawingTypeTree, rowsAll, modeGroup, rowsSelected, rowsSelectedToMove, modeFilter } = stateRow;

   let columnKeyToPutFolderName;
   if (rowData.treeLevel || rowData._rowLevel < 1) {
      columnKeyToPutFolderName = columns[1].key;
   };



   if ((column.key.includes('(A)') || column.key.includes('(T)') ||
      column.key === 'Construction Issuance Date' || column.key === 'Construction Start') &&
      cellData && cellData.length === 10 && cellData.includes('-')) {
      cellData = moment(cellData, 'YYYY-MM-DD').format('DD/MM/YY');
   };



   const { roleTradeCompany, projectIsAppliedRfaView, company, pageSheetTypeName, publicSettings: { headers } } = stateProject.allDataOneSheet;

   let headerDataEntry;
   if (pageSheetTypeName === 'page-data-entry') {
      headerDataEntry = headers.find(hd => hd.text === column.key);
   };


   let info = '';
   if (rowData.treeLevel && column.key === columnKeyToPutFolderName) {
      const node = drawingTypeTree.find(x => x.id === rowData.id);
      const branches = getTreeFlattenOfNodeInArray(drawingTypeTree, node);

      const branchesWithDrawing = branches.filter(x => !branches.find(y => y.parentId === x.id));

      let rowsArr = [];
      branchesWithDrawing.forEach(brch => {
         rowsArr = [...rowsArr, ...rowsAll.filter(r => r._parentRow === brch.id)];
      });
      modeFilter.forEach(filter => {
         if (filter.id) {
            rowsArr = rowsArr.filter(r => r[filter.header] === filter.value);
         };
      });
      let obj = {};
      rowsArr.forEach(row => {
         if (!row['Status'] || row['Status'] === 'INFO') {
            obj['Not Started'] = (obj['Not Started'] || 0) + 1;
         } else {
            obj[row['Status']] = (obj[row['Status']] || 0) + 1;
         }
      });

      let str = '';
      Object.keys(obj).forEach((stt, i) => {
         let code;
         let init = i === 0 ? '' : ' + ';

         if (stt === 'Not Started') code = 'NS';
         if (stt === '1st cut of model in-progress') code = 'MIP';
         if (stt === '1st cut of drawing in-progress') code = 'DIP';
         if (stt === 'Pending design') code = 'PD';
         if (stt === 'Consultant reviewing') code = 'CR';
         if (stt === 'Reject and resubmit') code = 'RR';
         if (stt === 'Approved with comments, to Resubmit') code = 'AR';
         if (stt === 'Revise In-Progress') code = 'RP';
         if (stt === 'Approved with Comment, no submission Required') code = 'AC';
         if (stt === 'Approved for Construction') code = 'AP';
         if (stt === 'INFO') code = 'NS';

         str += `${init}${obj[stt]} ${code}`;

      });
      let end = rowsArr.length === 0 ? '' : ' : ';
      info = ` - (${rowsArr.length} Drawings${end}${str})`;
   };


   const isLockedColumn = columnLocked(roleTradeCompany, rowData, modeGroup, column.key, projectIsAppliedRfaView, pageSheetTypeName);
   const isLockedRow = rowLocked(roleTradeCompany, rowData, modeGroup, drawingTypeTree);


   const inputRef = useRef();
   const cellRef = useRef();
   const panelRef = useRef();
   const buttonRef = useRef();

   const [inputRender, setInputRender] = useState(false);
   const [valueInput, setValueInput] = useState({ current: cellData || '', init: cellData || '' });

   const [btnShown, setBtnShown] = useState(false);
   const [panelData, setPanelData] = useState(false);


   const cellDataTypeBtn = checkCellDataFormat(column.key, headerDataEntry, pageSheetTypeName);

   const getCellTempId = () => `${rowData['id']}~#&&#~${column.key}`;

   const cellEditDone = (value) => {
      if (rowData._rowLevel === 1) {

         let cellDrgTypeFormatArrText = [];
         const parentNode = drawingTypeTree.find(x => x.id === rowData._parentRow);
         if (parentNode && pageSheetTypeName === 'page-spreadsheet') {
            const tradeName = getTradeNameFnc(parentNode, drawingTypeTree);
            if (tradeName.includes('(SUBCON)')) {
               cellDrgTypeFormatArrText = ['Other'];
            } else {
               cellDrgTypeFormatArrText = cellDrgTypeFormat[tradeName];
            };
         };


         if (
            pageSheetTypeName === 'page-spreadsheet' && (
               (cellDataTypeBtn === 'cell-type-date' && !(moment(value, 'DD/MM/YY').format('DD/MM/YY') === value) && value !== '') ||
               (column.key === 'Status' && cellStatusFormat.indexOf(value) === -1 && value !== '') ||
               (column.key === 'Use For' && cellUseForFormat.indexOf(value) === -1 && value !== '') ||
               ((column.key === 'Model Progress' || column.key === 'Drawing Progress') && cellProgressFormatData.indexOf(value) === -1 && value !== '') ||
               (column.key === 'Drg Type' && cellDrgTypeFormatArrText.indexOf(value) === -1 && value !== '')
            )
         ) {
            setValueInput({ ...valueInput, current: valueInput.init });
            message.info('Data input should be in correct format', 1);

         } else if (
            pageSheetTypeName === 'page-data-entry' && (
               (headerDataEntry.type === 'date' && !(moment(value, 'DD/MM/YY').format('DD/MM/YY') === value) && value !== '') ||
               (headerDataEntry.type === 'dropdown' && headerDataEntry.valueArray.indexOf(value) === -1 && value !== '')
            )
         ) {
            setValueInput({ ...valueInput, current: valueInput.init });
            message.info('Data input should be in correct format', 1);

         } else if (pageSheetTypeName === 'page-data-entry' && headerDataEntry.type === 'checkbox') {
            getCellModifiedTemp({ [getCellTempId()]: !value || value === 'unchecked' ? 'unchecked' : 'checked' });

            let row = rowsAll.find(r => r.id === rowData.id);

            row[column.key] = value ? 'checked' : 'unchecked';
            getSheetRows({ ...stateRow, rowsAll });

         } else {

            setValueInput({ ...valueInput, current: value });

            getCellModifiedTemp({ [getCellTempId()]: value });
            let row = rowsAll.find(r => r.id === rowData.id);
            row[column.key] = value;

            getSheetRows({ ...stateRow, rowsAll });
         };
      };
   };


   
   const onClick = () => {
      if (rowsSelected.length > 0 || rowsSelectedToMove.length > 0) {
         getSheetRows({
            ...stateRow, rowsSelected: [], rowsSelectedToMove: []
         });
      };

      if (isLockedColumn || isLockedRow) return;

      setBtnShown(true);
      if (!inputRender) { // single click just highlight cell, not activate
         setPosition({ cell: cellRef.current.parentElement, rowIndex, columnIndex });
      };
   };
   const onDoubleClick = () => {

      if (isLockedColumn || isLockedRow) return;
      setInputRender(true);
      setBtnShown(false);
      getCurrentDOMCell(); // double click to activate cell
   };
   const onMouseLeave = () => {
      if (btnShown) setBtnShown(false);
   };
   const onMouseDown = (e) => {
      if (e.button === 2) { // check mouse RIGHT CLICK ...
         onRightClickCell(e, props);
      } else {
         if (isLockedColumn || isLockedRow) return;
      };
   };




   useEffect(() => {
      document.addEventListener('click', EventClickToHidePanelAndInput);
      return () => document.removeEventListener('click', EventClickToHidePanelAndInput);
   }, []);

   const EventClickToHidePanelAndInput = (e) => {
      if (!buttonRef.current && panelRef.current) {
         setPanelData(false);
      };
   };


   

   const pickDataSelect = (type, value) => {
      setBtnShown(false);
      setPanelData(false);
      setInputRender(false);
      if (type === 'text') {
         cellEditDone(value);
      } else if (type === 'date') {
         cellEditDone(moment(value).format('DD/MM/YY'));
      } else if (type === 'div') {
         cellEditDone(value.props.type);
      };
   };
   const onBlur = () => {
      cellEditDone(valueInput.current);
      setBtnShown(false);
      setPanelData(false);
      setInputRender(false);
   };
   const onChange = (e) => {
      setValueInput({ ...valueInput, current: e.target.value });
   };

   const [checkBoxValue, setCheckBoxValue] = useState(cellData);
   const onChangeCheckBox = () => {
      setCheckBoxValue(!checkBoxValue || checkBoxValue === 'unchecked' ? 'checked' : 'unchecked');
      cellEditDone(!checkBoxValue || checkBoxValue === 'unchecked' ? 'checked' : 'unchecked');
   };



   useEffect(() => { // after keydown ENTER to show input ...
      if (
         !inputRender &&
         stateCell.cellActive &&
         stateCell.cellActive.rowIndex === rowIndex &&
         stateCell.cellActive.columnIndex === columnIndex &&
         !isLockedColumn && !isLockedRow
      ) {
         setInputRender(true);
      };
   }, [stateCell.cellActive]);

   useEffect(() => {
      if (
         !inputRender &&
         stateCell.cellAppliedAction &&
         stateCell.cellAppliedAction.currentDOMCell.rowIndex === rowIndex &&
         stateCell.cellAppliedAction.currentDOMCell.columnIndex === columnIndex &&
         !isLockedColumn && !isLockedRow
      ) {
         const { e } = stateCell.cellAppliedAction;
         if (e.key === 'Delete') {
            cellEditDone('');
         } else if (e.key === 'v' && e.ctrlKey) {
            cellEditDone(stateCell.tempCopiedText);
         };
      };
   }, [stateCell.cellAppliedAction]);

   useEffect(() => { // FOCUS right after press ENTER...
      if (inputRender) {
         inputRef.current.focus();
      };
   }, [inputRender]);

   useEffect(() => { // Hide Button after pick on PANEL (setBtnShown fasle in pickDataSelect doesn't work)
      if (btnShown) {
         setBtnShown(false);
      };
   }, [valueInput]);

   const onKeyDown = (e) => { // ENTER to hide input after finishing typing ...
      if (
         e.key === 'Enter' &&
         inputRender &&
         stateCell.cellActive &&
         stateCell.cellActive.rowIndex === rowIndex &&
         stateCell.cellActive.columnIndex === columnIndex &&
         !isLockedColumn && !isLockedRow
      ) {
         inputRef.current.blur();
         setCellActive(null);
      };
   };




   const cellStatusFormat = projectIsAppliedRfaView ? [
      'Not Started',
      '1st cut of model in-progress',
      '1st cut of drawing in-progress',
      'Pending design',
   ] : [
      'Not Started',
      '1st cut of model in-progress',
      '1st cut of drawing in-progress',
      'Pending design',


      'Consultant reviewing',
      'Reject and resubmit',
      'Approved with comments, to Resubmit',
      'Revise In-Progress',
      'Approved with Comment, no submission Required',
      'Approved for Construction',
   ];


   return (
      <>
         <div
            ref={cellRef}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
            style={{
               width: '100%', height: '100%', padding: 5, position: 'relative', color: 'black', background: 'transparent',
               paddingLeft: 5,
               overflow: !rowData.treeLevel && column.key === columnKeyToPutFolderName ? 'hidden' : 'visible' // fix bug frozen panel move to the left
            }}
         >
            {rowData._rowLevel === 1 && cellDataTypeBtn === 'cell-type-checkbox' ? (
               <CheckboxStyled
                  onChange={onChangeCheckBox}
                  checked={checkBoxValue === 'checked' ? true : false}
               />
            ) : (
               <>
                  {inputRender ? (
                     <input
                        value={valueInput.current}
                        onChange={onChange}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        ref={inputRef}
                        style={{
                           outline: 'none',
                           border: 'none',
                           background: 'transparent',
                           width: column.width - 30
                        }}
                     />

                  ) : (
                     <div style={{
                        textOverflow: column.key === columnKeyToPutFolderName ? 'unset' : 'ellipsis',
                        overflow: column.key === columnKeyToPutFolderName ? 'visible' : 'hidden',
                        whiteSpace: 'nowrap',
                        width: column.width - 30,
                        color: (rowData['Status'] === 'Revise In-Progress' ? '#DAA520' : colorTextRow[rowData['Status']]) || 'black'
                     }}>
                        {
                           ((column.key === 'Model Progress' || column.key === 'Drawing Progress') && <BtnProgress type={cellData} />) ||
                           (
                              columnKeyToPutFolderName && columnKeyToPutFolderName === column.key &&
                              <><span style={{ fontWeight: 'bold' }}>{rowData.title}</span><span>{info}</span></>
                           ) ||
                           stateCell.cellsModifiedTemp[getCellTempId()] ||  // there is modified data
                           (getCellTempId() in stateCell.cellsModifiedTemp && ' ') || // there is modified data === empty, MUST BE ' ', not ''
                           cellData // there is no modification
                        }
                     </div>
                  )}
               </>
            )}





            {btnShown && !cellBtnDisabled(column.key, pageSheetTypeName, headerDataEntry) && (
               <div
                  style={{
                     cursor: 'pointer', position: 'absolute',
                     right: 4, top: 5, height: 17, width: 17,
                     backgroundSize: 17,
                     backgroundImage: cellDataTypeBtn === 'cell-type-date' ? `url(${imgLink.btnDate})`
                        : cellDataTypeBtn === 'cell-type-text' ? `url(${imgLink.btnText})`
                           : null
                  }}
                  onMouseDown={(e) => {
                     e.stopPropagation();
                     setPanelData(!panelData);
                  }}
                  ref={buttonRef}
               />
            )}


            {panelData && (
               <div style={{
                  position: 'absolute', background: 'white', top: 30, left: 0, zIndex: 999,
                  padding: '3px 5px 3px 7px',
                  boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px',
                  minWidth: column.width,
                  maxHeight: 400, overflowY: 'scroll',
               }}
                  ref={panelRef}
               >
                  {cellDataTypeBtn === 'cell-type-date' ? (
                     <PanelCalendar pickDate={(item) => pickDataSelect('date', item)} />
                  ) : getColumnsValue(rowsAll, column.key, { rowData, drawingTypeTree }, cellStatusFormat, headerDataEntry, pageSheetTypeName).map(item => {
                     return (
                        <SelectStyled
                           key={(column.key === 'Drawing Progress' || column.key === 'Model Progress') ? item.key : item}
                           onMouseDown={(e) => {
                              e.stopPropagation();
                              if (column.key === 'Drawing Progress' || column.key === 'Model Progress') {
                                 pickDataSelect('div', item);
                              } else {
                                 pickDataSelect('text', item);
                              };
                           }}
                        >{item}</SelectStyled>
                     );
                  })}
               </div>
            )}
         </div>
      </>
   );
};

export default Cell;

const SelectStyled = styled.div`
   padding: 4px;
   &:hover {
      background-color: ${colorType.grey4};
      cursor: pointer;
   };
   transition: 0.2s;
`;


const BtnProgress = ({ type }) => {
   const img = type === 'Empty' ? imgLink.btnProgress0 :
      type === 'Quarter' ? imgLink.btnProgress1 :
         type === 'Half' ? imgLink.btnProgress2 :
            type === 'Third Quarter' ? imgLink.btnProgress3 :
               type === 'Full' ? imgLink.btnProgress4 :
                  null;

   return (
      <div style={{ display: 'flex', textAlign: 'center', width: '100%' }}>
         <div style={{
            cursor: 'pointer',
            height: 20,
            width: 20,
            backgroundImage: `url(${img})`,
            backgroundSize: 20,
            padding: 0
         }}
         />
      </div>
   );
};
const cellProgressFormat = [
   <BtnProgress key='0' type='Empty' />,
   <BtnProgress key='1' type='Quarter' />,
   <BtnProgress key='2' type='Half' />,
   <BtnProgress key='3' type='Third Quarter' />,
   <BtnProgress key='4' type='Full' />,
];
const cellProgressFormatData = [
   'Empty', 'Quarter', 'Half', 'Third Quarter', 'Full'
];

const checkCellDataFormat = (header, headerDataEntry, pageSheetTypeName) => {
   if (pageSheetTypeName === 'page-data-entry') {
      if (headerDataEntry.type === 'date') {
         return 'cell-type-date';
      } else if (headerDataEntry.type === 'dropdown') {
         return 'cell-type-text';
      } else if (headerDataEntry.type === 'checkbox') {
         return 'cell-type-checkbox';
      } else if (headerDataEntry.type === 'text') {
         return 'cell-type-none';
      };

   } else {
      if (
         header.includes('(A)') ||
         header.includes('(T)') ||
         header === 'Construction Issuance Date' ||
         header === 'Construction Start'
      ) return 'cell-type-date';

      else if (
         header === 'Index' ||
         header === 'Drawing Number' ||
         header === 'Drawing Name'
         // header === 'RFA Ref'
      ) return 'cell-type-none';

      else return 'cell-type-text';
   };
};
const cellBtnDisabled = (headerId, pageSheetTypeName, headerDataEntry) => {
   if (pageSheetTypeName === 'page-data-entry') {
      if (headerDataEntry.type === 'text' || headerDataEntry.type === 'checkbox') {
         return true;
      } else {
         return false;
      };
   } else if (pageSheetTypeName === 'page-spreadsheet') {
      if (headerId === 'Index' || headerId === 'Drawing Number' || headerId === 'Drawing Name') return true;
   } else {
      return true;
   };
};
const getColumnsValue = (rows, headerKey, drgTypeCheckData, cellStatusFormat, headerDataEntry, pageSheetTypeName) => {

   if (pageSheetTypeName === 'page-data-entry' && headerDataEntry.type === 'dropdown') return headerDataEntry.valueArray;


   if (headerKey === 'Status') return cellStatusFormat;
   if (headerKey === 'Use For') return cellUseForFormat;
   if (headerKey === 'Model Progress' || headerKey === 'Drawing Progress') return cellProgressFormat;


   if (headerKey === 'Drg Type') {
      const { rowData, drawingTypeTree } = drgTypeCheckData;
      const parentNode = drawingTypeTree.find(x => x.id === rowData._parentRow);
      const tradeName = getTradeNameFnc(parentNode, drawingTypeTree);

      if (tradeName.includes('(SUBCON)')) {
         return ['Other'];
      } else {
         return cellDrgTypeFormat[tradeName];
      };
   };


   let valueArr = [];
   rows.filter(r => r._rowLevel === 1).forEach(row => {
      valueArr.push(row[headerKey]);
   });
   valueArr = [...new Set(valueArr)].filter(e => e);
   valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));

   return valueArr;
};




const CheckboxStyled = styled(Checkbox)`
   
   .ant-checkbox-inner {
      border-radius: 0;
   };
`;

const cellUseForFormat = [
   'Coordination',
   'Issue for Construction',
   'Request for Approval',
   'Request for Confirmation',
];

const cellDrgTypeFormat = {
   'ARCHI': [
      'Key plan',
      'Wall setting out',
      'Column wall setting out',
      'Tile layout & detail',
      'Reflected celing plan',
      'Finishing layout',
      'Door layout',
      'Core layout & detail',
      'Toilet',
      'Edeck layout & detail',
      'Staircase layout & detail',
      'Surface drain',
      'Lift lobby/ corridor',
      'Material schedule',
      'Other'
   ],
   'C&S': [
      'CBP',
      'Piling layout',
      'Rebar shop drawing',
      'Temporary work'
   ],
   'M&E': [
      'CSD',
      'Penetration drawing',
      'M&E trade shop drawing'
   ],
   'PRECAST': [
      'Precast layout',
      'Precast detail',
      'Precast shop drawing'
   ],
};

const columnsLockedModeller = [
   'Model Start (T)',
   'Model Finish (T)',
   'Drawing Start (T)',
   'Drawing Finish (T)',
   'Drg To Consultant (T)',
   'Consultant Reply (T)',
   'Get Approval (T)',
   'Construction Issuance Date',
   'Construction Start',
];

export const columnLocked = (roleTradeCompany, rowData, modeGroup, column, projectIsAppliedRfaView, pageSheetTypeName) => {
   if (
      (projectIsAppliedRfaView && pageSheetTypeName === 'page-spreadsheet' && (
         column === 'RFA Ref' ||
         column === 'Drg To Consultant (A)' ||
         column === 'Rev' ||
         column === 'Consultant Reply (T)' ||
         column === 'Consultant Reply (A)'
      )) ||
      (isColumnWithReplyData(column)) ||
      (rowData && !rowData._rowLevel) || // lock drawing type ...
      (modeGroup && modeGroup.length > 0) ||
      (roleTradeCompany.role === 'Modeller' && columnsLockedModeller.includes(column)) ||
      (roleTradeCompany.role === 'View-Only User') ||
      (roleTradeCompany.role === 'Production' && column !== 'Construction Start')
   ) {
      return true;
   } else {
      return false;
   };
};
export const rowLocked = (roleTradeCompany, rowData, modeGroup, drawingTypeTree) => {
   if (!rowData._rowLevel || rowData._rowLevel < 1) return true;

   if (modeGroup.length > 0) return true;

   if (roleTradeCompany.role === 'Document Controller') return false;


   const drawingTypeTreeClone = drawingTypeTree.map(x => ({ ...x }));
   const dwgType = drawingTypeTreeClone.find(x => x.id === rowData._parentRow);

   let companyName;
   if (dwgType.treeLevel >= 1) {
      companyName = getCompanyNameFnc(dwgType, drawingTypeTreeClone);
   };

   if (roleTradeCompany.role === 'Production' && companyName === 'Woh Hup Private Ltd') return false;

   let tradeName;
   if (companyName === 'Woh Hup Private Ltd' && dwgType.treeLevel >= 2) {
      tradeName = getTradeNameFnc(dwgType, drawingTypeTreeClone);
      return companyName !== roleTradeCompany.company || tradeName !== roleTradeCompany.trade;
   } else {
      return companyName !== roleTradeCompany.company;
   };
};



