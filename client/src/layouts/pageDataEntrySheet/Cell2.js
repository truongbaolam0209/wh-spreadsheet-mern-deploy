import { Checkbox, message } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colorType, imgLink } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import PanelCalendar from '../generalComponents/PanelCalendar';




const Cell2 = (props) => {

   const {
      rowData, column, columns, rowIndex, columnIndex, onRightClickCell,
      setPosition, getCurrentDOMCell
   } = props;

   let { cellData } = props;


   const { state: stateCell, getCellModifiedTemp, setCellActive } = useContext(CellContext);
   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);


   let { rowsAll, rowsSelected, rowsSelectedToMove } = stateRow;
   const { role, publicSettings } = stateProject.allDataOneSheet;
   const headerData = publicSettings.headers.find(hd => hd.text === column.key);

   const isLockedColumn = headerData.roleCanEdit.indexOf(role.name) === -1;
   const isLockedRow = rowData.treeLevel || rowData._rowLevel < 1;


   let columnKeyToPutFolderName;
   if (rowData.treeLevel || rowData._rowLevel < 1) {
      columnKeyToPutFolderName = columns[1].key;
   };


   const inputRef = useRef();
   const cellRef = useRef();
   const panelRef = useRef();
   const buttonRef = useRef();

   const [inputRender, setInputRender] = useState(false);
   const [valueInput, setValueInput] = useState({ current: cellData || '', init: cellData || '' });

   const [btnShown, setBtnShown] = useState(false);
   const [panelData, setPanelData] = useState(false);


   const getCellTempId = () => `${rowData['id']}-${column.key}`;

   const cellEditDone = (value) => {

      if (rowData._rowLevel === 1) {
         if (
            (headerData.type === 'date' && !(moment(value, 'DD/MM/YY').format('DD/MM/YY') === value) && value !== '') ||
            (headerData.type === 'dropdown' && headerData.valueArray.indexOf(value) === -1 && value !== '')
         ) {
            setValueInput({ ...valueInput, current: valueInput.init });
            message.info('Data input should be in correct format', 1);

         } else if (headerData.type === 'checkbox') {
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


   const onDoubleClick = () => {
      if (isLockedColumn || isLockedRow || headerData.type === 'checkbox') return;
      setInputRender(true);
      setBtnShown(false);
      getCurrentDOMCell(); // double click to activate cell
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



   useEffect(() => {
      document.addEventListener('click', EventClickToHidePanelAndInput);
      return () => document.removeEventListener('click', EventClickToHidePanelAndInput);
   }, []);
   const EventClickToHidePanelAndInput = (e) => {
      if (!buttonRef.current && panelRef.current) {
         setPanelData(false);
      };
   };


   const onMouseLeave = () => {
      if (btnShown) {
         setBtnShown(false);
      };
   };
   const onMouseDown = (e) => {
      if (isLockedColumn) return;
      if (e.button === 2) { // check mouse RIGHT CLICK ...
         onRightClickCell(e, props);
      };
   };
   const pickDataSelect = (value) => {
      setBtnShown(false);
      setPanelData(false);
      setInputRender(false);
      cellEditDone(value);
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
      if (inputRender) inputRef.current.focus();
   }, [inputRender]);

   useEffect(() => { // Hide Button after pick on PANEL (setBtnShown fasle in pickDataSelect doesn't work)
      setBtnShown(false);
   }, [valueInput]);

   const onKeyDown = (e) => { // ENTER to hide input after finishing typing ...
      if (
         e.key === 'Enter' &&
         inputRender &&
         stateCell.cellActive &&
         stateCell.cellActive.rowIndex === rowIndex &&
         stateCell.cellActive.columnIndex === columnIndex &&
         !isLockedColumn
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
               width: '100%', height: '100%', padding: 5,
               position: 'relative',
               color: 'black', background: 'transparent'
            }}
         >
            {headerData.type !== 'checkbox' ? (
               <>
                  {inputRender ? (
                     <input
                        value={valueInput.current}
                        onChange={onChange}
                        onBlur={onBlur}
                        onKeyDown={onKeyDown}
                        ref={inputRef}
                        style={{ outline: 'none', border: 'none', background: 'transparent', width: column.width - 30 }}
                     />

                  ) : (
                     <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        width: column.width - 30,
                     }}>
                        {
                           (columnKeyToPutFolderName && columnKeyToPutFolderName === column.key && rowData.title) ||
                           stateCell.cellsModifiedTemp[getCellTempId()] ||  // there is modified data
                           (getCellTempId() in stateCell.cellsModifiedTemp && ' ') || // there is modified data === empty, MUST BE ' ', not ''
                           cellData // there is no modification
                        }
                     </div>
                  )}
               </>
            ) : (
               <>
                  {rowData._rowLevel && rowData._rowLevel === 1 ? (
                     <CheckboxStyled
                        onChange={onChangeCheckBox}
                        checked={checkBoxValue === 'checked' ? true : false}
                     />
                  ) : null}
               </>
            )}




            {btnShown && headerData.type !== 'checkbox' && (
               <div style={{
                  cursor: 'pointer',
                  position: 'absolute',
                  right: 4,
                  top: 5,
                  height: 17,
                  width: 17,
                  backgroundImage: headerData.type === 'date' ? `url(${imgLink.btnDate})`
                     : headerData.type === 'dropdown' ? `url(${imgLink.btnText})`
                        : null,
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
               <div
                  style={{
                     position: 'absolute',
                     background: 'white',
                     top: 30,
                     left: 0,
                     minWidth: column.width,
                     zIndex: 999,
                     padding: '3px 5px 3px 7px',
                     boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px',
                     maxHeight: 400,
                     overflowY: 'scroll'
                  }}
                  ref={panelRef}
               >
                  {headerData.type === 'date' ? (
                     <PanelCalendar pickDate={(item) => pickDataSelect(moment(item).format('DD/MM/YY'))} />
                  ) : getColumnsValue(rowsAll, column.key, headerData).map(item => {
                     return (
                        <SelectStyled
                           key={item}
                           onMouseDown={(e) => {
                              e.stopPropagation();
                              pickDataSelect(item);
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

export default Cell2;

const SelectStyled = styled.div`
   padding: 4px;
   &:hover {
      background-color: ${colorType.grey4};
      cursor: pointer;
   };
   transition: 0.2s;
`;

const CheckboxStyled = styled(Checkbox)`
   
   .ant-checkbox-inner {
      border-radius: 0;
   };
`;




const getColumnsValue = (rows, headerKey, headerData) => {

   if (headerData.type === 'dropdown') return headerData.valueArray;

   let valueArr = [];
   rows.filter(r => r._rowLevel === 1).forEach(row => {
      valueArr.push(row[headerKey]);
   });
   valueArr = [...new Set(valueArr)].filter(e => e);
   valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));

   return valueArr;
};





