import { message } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colorType, imgLink } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import PanelCalendar from './PanelCalendar';

const getRowParentLevelMin = (drawingTypeTree) => {
   let result = 0;
   drawingTypeTree.forEach(x => {
      if (x._rowLevel <= result) result = x._rowLevel;
   });
   return result;
};


const Cell = (props) => {

   const {
      rowData, column, rowIndex, columnIndex,
      onRightClickCell, setPosition, getCurrentDOMCell
   } = props;

   let cellData = props.cellData;

   if ((column.key.includes('(A)') ||
      column.key.includes('(T)') ||
      column.key === 'Construction Issuance Date' ||
      column.key === 'Construction Start') && cellData && cellData.length === 10 && cellData.includes('-')) {
      cellData = moment(cellData, 'YYYY-MM-DD').format('DD/MM/YY');
   };

   const { state: stateCell, getCellModifiedTemp, setCellActive } = useContext(CellContext);
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow, getSheetRows } = useContext(RowContext);
   let { drawingTypeTree, rowsAll, showDrawingsOnly } = stateRow;


   const role = stateProject.allDataOneSheet && stateProject.allDataOneSheet.role;
   const isLockedCell = cellLocked(role, column.key, showDrawingsOnly);

   const inputRef = useRef();
   const cellRef = useRef();
   const panelRef = useRef();
   const buttonRef = useRef();

   const [inputRender, setInputRender] = useState(false);
   const [valueInput, setValueInput] = useState({
      current: cellData || '',
      init: cellData || ''
   });

   const [btnShown, setBtnShown] = useState(false);
   const [panelData, setPanelData] = useState(false);


   useEffect(() => { // after keydown ENTER to show input ...
      if (
         !inputRender &&
         stateCell.cellActive &&
         stateCell.cellActive.rowIndex === rowIndex &&
         stateCell.cellActive.columnIndex === columnIndex &&
         !isLockedCell
      ) {
         setInputRender(true);
      };
   }, [stateCell.cellActive]);


   const getCellTempId = () => {
      return `${rowData['id']}-${column.key}`;
   };
   const cellEditDone = (value) => {
      
      if (rowData._rowLevel === 1) {
         if (
            (checkCellDateFormat(column.key) && !(moment(value, 'DD/MM/YY').format('DD/MM/YY') === value) && value !== '') ||
            (column.key === 'Status' && cellStatusFormat.indexOf(value) === -1 && value !== '')
         ) {
            setValueInput({ ...valueInput, current: valueInput.init });
            message.info('Data input should be in correct format', 1);
         } else {
            
            setValueInput({ ...valueInput, current: value });
            getCellModifiedTemp({ [getCellTempId()]: value });
            
            let row = rowsAll.find(r => r.id === rowData.id);
            row[column.key] = value;
            getSheetRows({
               ...stateRow, rowsAll // no need update rowsAllInit
            });
         };
      } else {
         let row = drawingTypeTree.find(x => x.id === rowData.id);
         row[column.key] = value;
         getSheetRows({ ...stateRow, drawingTypeTree });
      };
   };


   const onDoubleClick = () => {
      if (isLockedCell) return;
      setInputRender(true);
      getCurrentDOMCell();
   };
   const onClick = () => {
      if (isLockedCell) return;
      setBtnShown(true);
      if (!inputRender) {
         setPosition({ cell: cellRef.current.parentElement, rowIndex, columnIndex });
      };
   };
   useEffect(() => { // FOCUS right after press ENTER...
      if (inputRender) {
         inputRef.current.focus();
      };
   }, [inputRender]);


   useEffect(() => {
      document.addEventListener('click', EventClickToHidePanelAndInput);
      return () => document.removeEventListener('click', EventClickToHidePanelAndInput);
   }, []);
   const EventClickToHidePanelAndInput = (e) => {
      if (
         inputRef.current &&
         e.target !== cellRef.current &&
         e.target !== inputRef.current
      ) {
         // setInputRender(false);
      } else if (e.target !== cellRef.current && e.target !== panelRef.current && e.target !== buttonRef.current) {
         setPanelData(false);
      };
   };



   const onMouseLeave = () => {
      setBtnShown(false);
   };
   const onMouseDown = (e) => {
      if (e.button === 2) { // check mouse RIGHT CLICK ...
         onRightClickCell(e, props);
      } else {
         if (isLockedCell) return;
      };
   };
   const pickDataSelect = (type, value) => {
      setBtnShown(false);
      setPanelData(false);
      if (type === 'text') {
         cellEditDone(value);
      } else if (type === 'date') {
         cellEditDone(moment(value).format('DD/MM/YY'));
      };
      setInputRender(false);
   };
   const onBlur = () => {
      setBtnShown(false);
      setPanelData(false);
      cellEditDone(valueInput.current);
      setInputRender(false);
   };
   const onChange = (e) => {
      setValueInput({ ...valueInput, current: e.target.value });
   };
   
   
   // ENTER to hide input after finishing typing ...
   const onKeyPress = (e) => {
      if (
         e.key === 'Enter' &&
         inputRender &&
         stateCell.cellActive &&
         stateCell.cellActive.rowIndex === rowIndex &&
         stateCell.cellActive.columnIndex === columnIndex &&
         !isLockedCell
      ) {
         inputRef.current.blur();
         setCellActive(null);
      };
   };



   return (
      <>
         <div
            ref={cellRef}
            onDoubleClick={onDoubleClick}
            onClick={onClick}
            onMouseLeave={onMouseLeave}
            onMouseDown={onMouseDown}
            style={{
               width: '100%',
               height: '100%',
               padding: 5,
               paddingLeft: (column.key === 'Drawing Number' && rowData._rowLevel === 1 && showDrawingsOnly === 'group-columns') ? ((Math.abs(stateRow.rowsAll[0]._rowLevel) + 2) * 15) :
               (column.key === 'Drawing Number' && rowData._rowLevel === 1 && showDrawingsOnly !== 'group-columns') ? ((Math.abs(getRowParentLevelMin(drawingTypeTree)) + 2) * 15) : 5,
               position: 'relative',
               color: 'black',
               // pointerEvents: isLockedCell && 'none',
               // background: cellBackground(role, column.key, rowData._rowLevel) ? '#fafafa' : 'transparent'
            }}
         >
            {inputRender ? (
               <input
                  value={valueInput.current}
                  onChange={onChange}
                  onBlur={onBlur}
                  onKeyPress={onKeyPress}
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
                     textOverflow: 'ellipsis',
                     overflow: 'hidden',
                     whiteSpace: 'nowrap',
                     width: column.width - 30
                  }}>
                     {
                        stateCell.cellsModifiedTemp[getCellTempId()] ||  // there is modified data
                        (getCellTempId() in stateCell.cellsModifiedTemp && ' ') || // there is modified data === empty
                        cellData // there is no modification
                     }
                  </div>
               )
            }


            {btnShown && !cellBtnDisabled(column.key) && (
               <div style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  right: 5,
                  top: 5,
                  height: 17,
                  width: 17,
                  backgroundImage: checkCellDateFormat(column.key) ? `url(${imgLink.btnDate})` : `url(${imgLink.btnText})`,
                  backgroundSize: 17
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
                  position: 'absolute',
                  background: 'white',
                  top: 30,
                  left: 0,
                  minWidth: column.width,
                  zIndex: 999,
                  padding: '3px 5px 3px 7px',
                  boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px'
               }}
                  ref={panelRef}
               >
                  {checkCellDateFormat(column.key) ? (
                     <PanelCalendar pickDate={(item) => pickDataSelect('date', item)} />
                  ) : getColumnsValue(rowsAll, column.key).map(item => {
                     return (
                        <SelectStyled
                           key={item}
                           onMouseDown={(e) => {
                              e.stopPropagation();
                              pickDataSelect('text', item);
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

const checkCellDateFormat = (header) => {
   return header.includes('(A)') ||
      header.includes('(T)') ||
      header === 'Construction Issuance Date' ||
      header === 'Construction Start';
};

const cellBtnDisabled = (headerId) => {
   if (headerId === 'Index' || headerId === 'Drawing Number' || headerId === 'Drawing Name') return true;
};

const getColumnsValue = (rows, headerKey) => {
   let valueArr = [];
   rows.filter(r => r._rowLevel === 1).forEach(row => {
      valueArr.push(row[headerKey]);
   });
   valueArr = [...new Set(valueArr)].filter(e => e);
   valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));

   if (headerKey === 'Status') return cellStatusFormat;
   return valueArr;
};

const cellStatusFormat = [
   'Not Started',
   '1st cut of model in-progress',
   '1st cut of drawing in-progress',
   'Pending design',
   'Consultant reviewing',
   'Reject and resubmit',
   'Approved with comments, to Resubmit',
   'Revise In-Progress',
   'Approved with Comment, no submission Required',
   'Approved for Construction'
];

const ColumnsLockedModeller = [
   'Drg To Consultant (T)',
   'Drg To Consultant (A)',
   'Consultant Reply (T)',
   'Consultant Reply (A)',
   'Get Approval (T)',
   'Get Approval (A)',
   'Construction Issuance Date',
   'Construction Start',
];
const cellLocked = (title, column, showDrawingsOnly) => {
   // lock in groups columns mode;
   if (showDrawingsOnly === 'group-columns') return true;
   if (title === 'modeller' && ColumnsLockedModeller.includes(column)) return true;
   if (title === 'coordinator' || title === 'document controller') return false;
   if (title === 'manager' || title === 'viewer') return true;
   if (title === 'production' && column !== 'Construction Start') return true;
};
