import { Divider, Icon, message, Modal } from 'antd';
import Axios from 'axios';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';
import { colorTextRow, colorType, SERVER_URL } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { compareDates, debounceFnc, getActionName, getHeaderWidth, getHeaderWidthForRFAView, getUserRoleTradeCompany, groupByHeaders, mongoObjectId, randomColorRange, randomColorRangeStatus } from '../../utils';
import ButtonAdminCreateAndUpdateRows from '../pageSpreadsheet/ButtonAdminCreateAndUpdateRows';
import ButtonAdminDeleteRowsHistory from '../pageSpreadsheet/ButtonAdminDeleteRowsHistory';
import ButtonAdminUploadData from '../pageSpreadsheet/ButtonAdminUploadData';
import Cell, { columnLocked, rowLocked } from '../pageSpreadsheet/Cell';
import CellForm from '../pageSpreadsheet/CellForm';
import CellIndex from '../pageSpreadsheet/CellIndex';
import CellRFA, { getConsultantLeadName, getConsultantReplyData, getInfoValueFromRfaData, isColumnConsultant, isColumnWithReplyData } from '../pageSpreadsheet/CellRFA';
import ExcelExport from '../pageSpreadsheet/ExcelExport';
import { convertFlattenArraytoTree1, getTreeFlattenOfNodeInArray } from '../pageSpreadsheet/FormDrawingTypeOrder';
import PanelFunction, { getPanelPosition } from '../pageSpreadsheet/PanelFunction';
import PanelSetting, { convertRowHistoryData, getDataForMultiFormSheet, getDataForRFASheet, getKeyTextForSheet, updatePreRowParentRowToState, _processRowsChainNoGroupFnc1 } from '../pageSpreadsheet/PanelSetting';
import CellHeader from './CellHeader';
import { sortFnc } from './FormSort';
import IconSidePanel from './IconSidePanel';
import IconTable from './IconTable';
import InputSearch from './InputSearch';
import LoadingIcon from './LoadingIcon';
import ViewTemplateSelect from './ViewTemplateSelect';

const offsetHeight = 99.78;
const sideBarWidth = 55;

const Table = forwardRef((props, ref) => {
   const { projectIsAppliedRfaView } = props;
   return (
      <AutoResizer>
         {() => <BaseTable
            {...props}
            ref={ref}
            width={window.innerWidth - (projectIsAppliedRfaView ? sideBarWidth : 0)}
            height={window.innerHeight - offsetHeight}
         />}
      </AutoResizer>
   );
});

let previousDOMCell = null;
let currentDOMCell = null;
let isTyping = false;
let addedEvent = false;


const OverallComponentDMS = (props) => {

   let {
      email, role, isAdmin, projectId, projectName, token, company,
      companies, projectIsAppliedRfaView, listUser, listGroup, projectNameShort, pageSheetTypeName,
      history, localState
   } = props;



   const roleTradeCompany = getUserRoleTradeCompany(role, company);


   const isUserCanSubmitBothSide = isAdmin;

   const tableRef = useRef();

   const handlerBeforeUnload = (e) => {
      if (window.location.pathname === '/dms-spreadsheet') {
         e.preventDefault();
         e.returnValue = '';
      };
   };
   useEffect(() => {
      if (!addedEvent) {
         window.onbeforeunload = handlerBeforeUnload;
         addedEvent = true;
      };
   }, []);




   const getCurrentDOMCell = () => {
      isTyping = true;
      setCellActive(currentDOMCell);
   };
   const setPosition = (e) => { // just set position => highlight cell, not active
      if (previousDOMCell) {
         previousDOMCell.cell.classList.remove('cell-current');
      };
      currentDOMCell = e;
      currentDOMCell.cell.classList.add('cell-current');
      previousDOMCell = e;
      isTyping = false;
   };
   useEffect(() => {
      window.addEventListener('keydown', EventKeyDown);
      return () => window.removeEventListener('keydown', EventKeyDown);
   }, []);
   const EventKeyDown = (e) => {
      if (e.key === 'Control') return;
      if (e.key === 'ArrowUp') {
         if (isTyping || !currentDOMCell) return;
         let cellTop = currentDOMCell.cell.parentElement.offsetTop;
         if (currentDOMCell.rowIndex === 0) return;

         currentDOMCell.cell.classList.remove('cell-current');
         let index;
         currentDOMCell.cell.parentElement.childNodes.forEach((dv, i) => {
            if (dv === currentDOMCell.cell) index = i;
         });
         if (!currentDOMCell.cell.parentElement.previousSibling) return; // Scroll out of sight of cell selected
         currentDOMCell.cell = currentDOMCell.cell.parentElement.previousSibling.childNodes[index];
         currentDOMCell.cell.classList.add('cell-current');
         currentDOMCell.rowIndex = currentDOMCell.rowIndex - 1;

         e.preventDefault();
         if (cellTop <= tableRef.current._scroll.scrollTop) {
            tableRef.current.scrollToTop(currentDOMCell.cell.parentElement.offsetTop);
         };

      } else if (e.key === 'ArrowRight') {
         if (isTyping || !currentDOMCell) return;

         if (currentDOMCell.columnIndex < tableRef.current.leftTable.props.columns.length - 1) {
            currentDOMCell.cell.classList.remove('cell-current');
            currentDOMCell.cell = currentDOMCell.cell.nextSibling;
            currentDOMCell.cell.classList.add('cell-current');
            currentDOMCell.columnIndex = currentDOMCell.columnIndex + 1;

         } else if (
            currentDOMCell.columnIndex >= tableRef.current.leftTable.props.columns.length &&
            currentDOMCell.columnIndex < tableRef.current.columnManager._columns.length - 1
         ) {
            let cellRight = currentDOMCell.cell.offsetLeft + currentDOMCell.cell.offsetWidth;
            let innerTableWidth = window.innerWidth - 15;

            e.preventDefault();
            if (cellRight > innerTableWidth - 100) {
               tableRef.current.scrollToLeft(cellRight - innerTableWidth + 100);
            };

            currentDOMCell.cell.classList.remove('cell-current');
            currentDOMCell.cell = currentDOMCell.cell.nextSibling;
            currentDOMCell.cell.classList.add('cell-current');
            currentDOMCell.columnIndex = currentDOMCell.columnIndex + 1;
         };

      } else if (e.key === 'ArrowDown') {

         if (isTyping || !currentDOMCell) return;

         if (currentDOMCell.rowIndex >= Object.keys(tableRef.current._depthMap).length - 1) return;
         let cellTop = currentDOMCell.cell.parentElement.offsetTop;

         currentDOMCell.cell.classList.remove('cell-current');
         let index;
         currentDOMCell.cell.parentElement.childNodes.forEach((dv, i) => {
            if (dv === currentDOMCell.cell) index = i;
         });
         if (!currentDOMCell.cell.parentElement.nextSibling) return; // Scroll out of sight of cell selected
         currentDOMCell.cell = currentDOMCell.cell.parentElement.nextSibling.childNodes[index];
         currentDOMCell.cell.classList.add('cell-current');
         currentDOMCell.rowIndex = currentDOMCell.rowIndex + 1;

         e.preventDefault();
         if (
            cellTop < tableRef.current._scroll.scrollTop || cellTop > tableRef.current._scroll.scrollTop + 490
         ) {
            tableRef.current.scrollToTop(currentDOMCell.cell.parentElement.offsetTop - 520);
         };
      } else if (e.key === 'ArrowLeft') {
         if (isTyping || !currentDOMCell) return;

         if (currentDOMCell.columnIndex > 1 &&
            currentDOMCell.columnIndex < tableRef.current.leftTable.props.columns.length
         ) {
            currentDOMCell.cell.classList.remove('cell-current');
            currentDOMCell.cell = currentDOMCell.cell.previousSibling;
            currentDOMCell.cell.classList.add('cell-current');
            currentDOMCell.columnIndex = currentDOMCell.columnIndex - 1;

         } else if (
            currentDOMCell.columnIndex > tableRef.current.leftTable.props.columns.length &&
            currentDOMCell.columnIndex < tableRef.current.columnManager._columns.length
         ) {
            let cellLeft = currentDOMCell.cell.offsetLeft;
            let innerTableWidth = window.innerWidth - 15;

            currentDOMCell.cell.classList.remove('cell-current');
            currentDOMCell.cell = currentDOMCell.cell.previousSibling;
            currentDOMCell.cell.classList.add('cell-current');;
            currentDOMCell.columnIndex = currentDOMCell.columnIndex - 1;

            e.preventDefault();

            if (cellLeft <= tableRef.current.columnManager._cached.columnsWidth - innerTableWidth + 820) {
               tableRef.current.scrollToLeft(cellLeft - 820 - currentDOMCell.cell.offsetWidth);
            };
         };

      } else if (e.key === 'Enter') {
         if (!currentDOMCell) return;
         if (isTyping) isTyping = false;
         else {
            isTyping = true;
            setCellActive(currentDOMCell);
         };
      } else if (e.key === 'c' && e.ctrlKey) {
         if (isTyping || !currentDOMCell) return;
         copyTempData(currentDOMCell.cell.innerText);
      } else {
         if (isTyping || !currentDOMCell) return;
         applyActionOnCell({ currentDOMCell, e });
      };
   };



   const { state: stateCell, setCellActive, getCellModifiedTemp, OverwriteCellsModified, copyTempData, applyActionOnCell } = useContext(CellContext);
   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject, fetchDataOneSheet, setUserData } = useContext(ProjectContext);

   // useEffect(() => console.log('STATE-CELL...', stateCell), [stateCell]);
   useEffect(() => console.log('STATE-ROW...', stateRow), [stateRow]);
   // useEffect(() => console.log('STATE-PROJECT...', stateProject), [stateProject]);
   // console.log('ALL STATES...', stateCell, stateRow, stateProject);


   const [cursor, setCursor] = useState(null);
   const [panelType, setPanelType] = useState(null);
   const [panelSettingType, setPanelSettingType] = useState(null);
   const [panelFunctionVisible, setPanelFunctionVisible] = useState(false);
   const [panelSettingVisible, setPanelSettingVisible] = useState(false);



   const buttonPanelFunction = (btn) => {
      let { rowsAll, rowsUpdatePreRowOrParentRow, rowsSelected, rowsSelectedToMove } = stateRow;

      setPanelFunctionVisible(false);
      setCellHistoryFound(null);

      if (btn === 'Move Drawings') {
         if (stateRow.rowsSelected.length > 0) {
            getSheetRows({
               ...stateRow,
               rowsSelectedToMove: [...rowsSelected],
            });
         } else {
            const row = rowsAll.find(x => x.id === panelType.cellProps.rowData.id);
            getSheetRows({
               ...stateRow,
               rowsSelectedToMove: [row],
            });
         };
      } else if (btn === 'Paste Drawings') {
         const { rowData } = panelType.cellProps;
         if (
            rowsSelectedToMove.find(x => x.id === rowData.id) ||
            (rowData.treeLevel && rowsSelectedToMove.find(x => x._parentRow === rowData.id))
         ) {
            getSheetRows({ ...stateRow, rowsSelectedToMove: [], rowsSelected: [] });
         } else {
            rowsSelectedToMove.forEach(row => {
               const rowBelowPrevious = rowsAll.find(r => r._preRow === row.id);
               if (rowBelowPrevious) {
                  rowBelowPrevious._preRow = row._preRow;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelowPrevious);
               };
            });
            if (rowData.treeLevel) {
               const lastRowOfBranch = rowsAll.find(r => r._parentRow === rowData.id && !rowsAll.find(x => x._preRow === r.id));
               rowsSelectedToMove.forEach((row, i) => {
                  row._preRow = i === 0 ? (lastRowOfBranch ? lastRowOfBranch.id : null) : rowsSelectedToMove[i - 1].id;
                  row._parentRow = rowData.id;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
               });
            } else {
               const rowBelowNext = rowsAll.find(r => r._preRow === rowData.id);
               if (rowBelowNext) {
                  rowBelowNext._preRow = stateRow.rowsSelectedToMove[stateRow.rowsSelectedToMove.length - 1].id;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelowNext);
               };
               rowsSelectedToMove.forEach((row, i) => {
                  row._preRow = i === 0 ? rowData.id : rowsSelectedToMove[i - 1].id;
                  row._parentRow = rowData._parentRow;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
               });
            };
            const rowsOutput = _processRowsChainNoGroupFnc1([...rowsAll]);
            getSheetRows({
               ...stateRow,
               rowsAll: rowsOutput,
               rowsUpdatePreRowOrParentRow,
               rowsSelectedToMove: [],
               rowsSelected: [],
               modeFilter: [],
               modeSort: {}
            });
         };

      } else {
         setCellActive(null);
         copyTempData(null);
         applyActionOnCell(null);

         setPanelSettingType(btn);
         setPanelSettingVisible(true);

         const objAttr = btn === 'Date Automation' || btn === 'Move Drawings'
            ? {}
            : { rowsSelected: [] };

         getSheetRows({
            ...stateRow,
            ...objAttr,
            rowsSelectedToMove: []
         });
      };

      setCellActive(null);
      if (currentDOMCell) currentDOMCell.cell.classList.remove('cell-current');
      currentDOMCell = null;

   };


   const onMouseDownColumnHeader = (e, header) => {
      // setCursor({ x: e.clientX, y: e.clientY });
      // setPanelType({ type: 'column', header });
      // setPanelFunctionVisible(true);
   };
   const onRightClickCell = (e, cellProps) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setPanelType({ type: 'cell', cellProps });
      setPanelFunctionVisible(true);
   };
   const commandAction = (update) => {
      if (
         update.type === 'add-view-templates' || update.type === 'sort-data' || update.type === 'filter-by-columns'
      ) {
         getSheetRows({ ...stateRow, ...update.data });

      } else if (
         update.type === 'insert-drawings' || update.type === 'insert-drawings-by-folder' ||
         update.type === 'duplicate-drawings' || update.type === 'delete-drawing' ||
         update.type === 'drawing-data-automation' || update.type === 'create-new-drawing-revisions'
      ) {
         getSheetRows({
            ...stateRow,
            ...update.data,
            modeFilter: [],
            modeSort: {},
            rowsSelected: [],
         });

      } else if (update.type === 'reset-filter-sort') {

         getSheetRows({ ...stateRow, ...update.data });

         setCellSearchFound(null);

         if (pageSheetTypeName !== 'page-spreadsheet') {
            setSearchInputShown(false);
         };

      } else if (update.type === 'reorder-columns' || update.type === 'drawing-colorized') {
         setUserData({ ...stateProject.userData, ...update.data });

      } else if (update.type === 'drawing-folder-organization') {
         getSheetRows({ ...stateRow, ...update.data });
         if (update.data.viewTemplateNodeId) {
            setExpandedRows(getRowsKeyExpanded(update.data.drawingTypeTree, update.data.viewTemplateNodeId));
         } else {
            setExpandedRows(getRowsKeyExpanded(update.data.drawingTypeTree, stateRow.viewTemplateNodeId));
         };

      } else if (update.type === 'group-columns') {
         getSheetRows({ ...stateRow, ...update.data });

      } else if (update.type === 'highlight-cell-history') {
         setCellHistoryFound(update.data);
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });



      } else if (update.type === 'reload-data-view-rfa') {

         getSheetRows(getInputDataInitially({ sheetData: update.data.dataAllFromServer, rowsHistoryData: update.data.dataRowsHistoryFromServer }, roleTradeCompany, pageSheetTypeName));
         setExpandedRows(update.data.expandedRowsIdArr);

         OverwriteCellsModified({});
         setCellActive(null);
         setLoading(false);
         setSearchInputShown(true);

      } else if (update.type === 'reload-data-view-multi-form') {

         getSheetRows(getInputDataInitially(update.data.rowsAllMultiForm, roleTradeCompany, pageSheetTypeName));
         setExpandedRows(update.data.expandedRowsIdArr);

         OverwriteCellsModified({});
         setCellActive(null);
         setLoading(false);
         setSearchInputShown(true);

      } else if (update.type === 'save-data-successfully') {
         message.success('Save Data Successfully', 1.5);
      } else if (update.type === 'save-data-failure') {
         message.error('Network Error', 1.5);
         setLoading(false);
      } else if (update.type === 'reload-data-from-server') {
         fetchDataOneSheet({
            ...update.data,
            email, projectId, projectName, role, token, company, companies, roleTradeCompany,
            projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isUserCanSubmitBothSide, pageSheetTypeName
         });
         setUserData(getHeadersData(update.data));
         getSheetRows(getInputDataInitially(update.data, roleTradeCompany, pageSheetTypeName));
         setExpandedRows(getRowsKeyExpanded(
            update.data.publicSettings.drawingTypeTree,
            update.data.userSettings ? update.data.userSettings.viewTemplateNodeId : null
         ));
         OverwriteCellsModified({});
         setCellActive(null);
         setLoading(false);

         setCellSearchFound(null);
         setCellHistoryFound(null);


         if (update.isBackToDms) {
            setSearchInputShown(false);
         };
      };

      if (update.type !== 'save-data-failure') {
         setPanelSettingVisible(false);
         setPanelSettingType(null);
         setPanelType(null);
      };
   };
   const onScroll = () => {
      if (stateCell.cellActive) setCellActive(null);
   };



   const [adminFncInitPanel, setAdminFncInitPanel] = useState(false);
   const [adminFncBtn, setAdminFncBtn] = useState(null);
   const adminFncServerInit = (btn) => {
      setAdminFncInitPanel(true);
      setAdminFncBtn(btn);
   };
   const adminFnc = async (btn) => {
      try {
         if (btn === 'delete-all-collections') {
            await Axios.post(`${SERVER_URL}/cell/history/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/row/history/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/sheet/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/settings/delete-all/`, { token });
            message.info('DONE...Delete All Data In Every DB Collections');
         };
      } catch (err) {
         console.log(err);
      };
   };




   const [loading, setLoading] = useState(true);
   useEffect(() => {
      const fetchOneProject = async () => {
         try {
            setLoading(true);

            if (pageSheetTypeName === 'page-spreadsheet') {

               const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });

               fetchDataOneSheet({
                  ...res.data,
                  email, projectId, projectName, role, token, company, companies, roleTradeCompany,
                  projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isUserCanSubmitBothSide, pageSheetTypeName
               });

               setUserData(getHeadersData(res.data));
               getSheetRows(getInputDataInitially(res.data, roleTradeCompany, pageSheetTypeName));

               setExpandedRows(getRowsKeyExpanded(
                  res.data.publicSettings.drawingTypeTree,
                  res.data.userSettings ? res.data.userSettings.viewTemplateNodeId : null
               ));
            } else if (pageSheetTypeName === 'page-rfa') {

               const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
               const resRowHistory = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });
               const { rows } = res.data;

               fetchDataOneSheet({
                  ...res.data,
                  email, projectId, projectName, role, token, company, companies, roleTradeCompany,
                  projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isUserCanSubmitBothSide, pageSheetTypeName
               });
               getSheetRows(getInputDataInitially({ sheetData: res.data, rowsHistoryData: resRowHistory.data }, roleTradeCompany, pageSheetTypeName));
               setExpandedRows([
                  'ARCHI', 'C&S', 'M&E', 'PRECAST',
                  ...rows.filter(x => x.rfaNumber).map(x => x.rfaNumber)
               ]);
               setSearchInputShown(true);

            } else if (pageSheetTypeName && pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-rfa') {

               const route = pageSheetTypeName === 'page-rfam' ? 'row-rfam'
                  : pageSheetTypeName === 'page-cvi' ? 'row-cvi'
                     : pageSheetTypeName === 'page-rfi' ? 'row-rfi'
                        : pageSheetTypeName === 'page-dt' ? 'row-dt'
                           : 'n/a';

               const refKey = getKeyTextForSheet(pageSheetTypeName) + 'Ref';
 
               const res = await Axios.get(`${SERVER_URL}/${route}/`, { params: { token, projectId, email } });
               const rows = res.data;

               getSheetRows(getInputDataInitially(rows, roleTradeCompany, pageSheetTypeName));
               setExpandedRows([
                  'ARCHI', 'C&S', 'M&E', 'PRECAST',
                  ...rows.filter(x => x[refKey]).map(x => x[refKey])
               ]);

               fetchDataOneSheet({
                  email, projectId, projectName, role, token, company, companies, roleTradeCompany,
                  projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isUserCanSubmitBothSide, pageSheetTypeName
               });
               setSearchInputShown(true);
            };






            // const resDataCheck = await Axios.get(`${SERVER_URL}/sheet/get-all-collections?user=truongbaolam0209`);
            // const { rows, settings, rowHistories } = resDataCheck.data;

            // const projectIdsArray = [...new Set(rows.map(x => x.sheet))];
            // let objCheck = {};
            // projectIdsArray.forEach(projectId => {
            //    const rowsChildren = rows.filter(x => x.sheet === projectId);
            //    objCheck[projectId] = rowsChildren;
            // });
            // console.log('ALL-DATA-BASE', objCheck);
            // let settingsUSER = [];
            // let settingsPUBLIC = [];
            // settings.forEach(setting => {
            //    if (setting.user) settingsUSER.push(setting);
            //    else settingsPUBLIC.push(setting);
            // });
            // console.log('ALL-DATA-BASE-SETTING', { settingsUSER, settingsPUBLIC });

            // const findAllDataInProject = (data) => {
            //    let output = [];
            //    data.forEach(r => {
            //       if (r.sheet === 'MTU3NDgyNTcyMzUwNC1UZXN0') {
            //          output.push(r);
            //       };
            //    });
            //    return output;
            // };





            setLoading(false);
         } catch (err) {
            console.log(err);
         };
      };
      fetchOneProject();
   }, []);


   useEffect(() => {

      // const interval = stateRow ? setInterval(() => {
      //    setPanelFunctionVisible(false);
      //    setPanelSettingType('save-ICON');
      //    setPanelSettingVisible(true);
      // }, 1000 * 60 * 30) : null;
      // return () => interval !== null && clearInterval(interval);

      // const interval = setInterval(() => {
      //    if (stateRow) {
      //       setPanelFunctionVisible(false);
      //       setPanelSettingType('save-ICON');
      //       setPanelSettingVisible(true);
      //    };
      // }, 1000 * 60 * 0.01);
      // return () => clearInterval(interval);
   }, []);

   const updateExpandedRowIdsArray = (viewTemplateNodeId) => {
      setExpandedRows(getRowsKeyExpanded(stateRow.drawingTypeTree, viewTemplateNodeId));
   };


   const [expandedRows, setExpandedRows] = useState([]);
   const [cellSearchFound, setCellSearchFound] = useState(null);
   const [cellHistoryFound, setCellHistoryFound] = useState(null);

   const onRowExpand = (props) => {
      const { rowKey, expanded } = props;
      let arr = [...expandedRows];
      if (expanded) {
         arr.push(rowKey);
      } else {
         arr.splice(arr.indexOf(rowKey), 1);
      };
      setExpandedRows(arr);
   };
   const ExpandIcon = (props) => {
      const { expanding, expandable, onExpand, depth } = props;
      const indent = (depth * 17).toString() + 'px';

      return (
         <div
            style={{
               marginLeft: indent,
               paddingLeft: expandable ? 10 : 13 + 10,
               paddingRight: 3,
               background: 'transparent'
            }}

         >
            {expandable && (
               <Icon
                  type={expanding ? 'plus-square' : 'minus-square'}
                  style={{ color: 'black', transform: 'translate(0, -1px)' }}
                  onClick={() => {
                     onExpand(expanding);
                  }}
               />
            )}
         </div>
      );
   };
   const expandIconProps = (props) => {
      return ({ expanding: !props.expanded });
   };
   const rowClassName = (props) => {
      const { rowsSelected, modeGroup, drawingTypeTree } = stateRow;
      const { rowData } = props;

      if (rowData.treeLevel) {
         return 'row-drawing-type';
      };

      let isRowLocked;
      if (pageSheetTypeName === 'page-spreadsheet') {
         isRowLocked = rowLocked(roleTradeCompany, rowData, modeGroup, drawingTypeTree);
         if (isRowLocked) {
            return 'row-locked';
         };
      };


      if (rowsSelected && rowsSelected.find(x => x.id === rowData.id)) {
         return 'row-selected';
      };

      if (stateProject.userData) {
         const { colorization } = stateProject.userData;
         const valueArr = colorization.value;
         const value = rowData[colorization.header];
         if (colorization !== null && colorization.header !== 'No Colorization' &&
            valueArr && valueArr.length > 0 && valueArr.indexOf(value) !== -1
         ) {
            if (rowData[colorization.header]) {
               return `colorization-${colorization.header.replace(/\s/g, '').replace(/,/g, '')}-${rowData[colorization.header].replace(/\s/g, '').replace(/,/g, '')}-styled`;
            };
         };
      };
   };


   const [searchInputShown, setSearchInputShown] = useState(false);
   const searchGlobal = debounceFnc((textSearch) => {
      if (pageSheetTypeName === 'page-spreadsheet') {
         let searchDataObj = {};
         if (textSearch !== '') {
            stateRow.rowsAll.forEach(row => {
               let obj = {};
               Object.keys(row).forEach(key => {
                  if (
                     key !== 'id' && key !== '_preRow' && key !== '_parentRow' &&
                     row[key] &&
                     row[key].toString().toLowerCase().includes(textSearch.toLowerCase())
                  ) {
                     obj[row.id] = [...obj[row.id] || [], key];
                  };
               });
               if (Object.keys(obj).length > 0) searchDataObj = { ...searchDataObj, [row.id]: obj[row.id] };
            });
         };
         setCellSearchFound(searchDataObj);
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });
         getSheetRows({
            ...stateRow,
            modeSearch: { searchDataObj, isFoundShownOnly: 'show all' }
         });
      } else {
         let searchDataObj = {};
         if (textSearch !== '') {
            stateRow.rowsRfaAllInit.forEach(row => {
               let obj = {};
               Object.keys(row).forEach(key => {
                  if (
                     key !== 'id' && key !== '_preRow' && key !== '_parentRow' &&
                     row[key] &&
                     row[key].toString().toLowerCase().includes(textSearch.toLowerCase())
                  ) {
                     obj[row.id] = [...obj[row.id] || [], key];
                  };
               });
               if (Object.keys(obj).length > 0) searchDataObj = { ...searchDataObj, [row.id]: obj[row.id] };
            });
         };
         setCellSearchFound(searchDataObj);
         setNosColumnFixedRfaView(1);
         setNosColumnFixedRfaView(0);
         getSheetRows({
            ...stateRow,
            modeSearch: { searchDataObj, isFoundShownOnly: 'show all' }
         });
      };
   }, 400);

   const clearAllFilterSortSearchGroup = debounceFnc(() => {
      getSheetRows({
         ...stateRow,
         modeFilter: [],
         modeSort: {},
         modeSearch: {},
         modeGroup: []
      });
      if (pageSheetTypeName === 'page-spreadsheet') {
         setSearchInputShown(false);
      };
      setCellSearchFound(null);
   }, 1);



   const renderColumns = (arr, nosColumnFixed) => {

      let headersObj = [{
         key: 'Index', dataKey: 'Index', title: '', width: 50,
         frozen: Column.FrozenDirection.LEFT,
         cellRenderer: (
            <CellIndex
               contextInput={{
                  contextCell: { setCellActive },
                  contextRow: { stateRow, getSheetRows },
                  contextProject: { stateProject },
               }}
            />
         ),
      }];

      let AdditionalHeadersForProjectRFA = [];
      if (projectIsAppliedRfaView && pageSheetTypeName === 'page-spreadsheet') {
         AdditionalHeadersForProjectRFA = [...headersConsultantWithNumber];
      };
      let headerArrayForTable = [...arr, ...AdditionalHeadersForProjectRFA];
      headerArrayForTable = headerArrayForTable.filter(hd => hd !== 'Drawing');

      headerArrayForTable.forEach((hd, index) => {
         headersObj.push({
            key: hd, dataKey: hd, title: hd,
            width: pageSheetTypeName !== 'page-spreadsheet'
               ? getHeaderWidthForRFAView(hd)
               : getHeaderWidth(hd),
            resizable: true,
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            headerRenderer: (
               <CellHeader
                  onMouseDownColumnHeader={onMouseDownColumnHeader}
               />
            ),

            cellRenderer: (pageSheetTypeName === 'page-rfa' || (pageSheetTypeName === 'page-spreadsheet' && projectIsAppliedRfaView &&
               (
                  isColumnWithReplyData(hd) ||
                  isColumnConsultant(hd) ||
                  hd === 'RFA Ref'
               )
            )) ? (
               <CellRFA
                  buttonPanelFunction={buttonPanelFunction}
                  contextInput={{
                     contextRow: { stateRow, getSheetRows },
                     contextProject: { stateProject },
                  }}
               />
            ) : pageSheetTypeName === 'page-spreadsheet' ? (
               <Cell
                  setPosition={setPosition}
                  onRightClickCell={onRightClickCell}
                  getCurrentDOMCell={getCurrentDOMCell}

                  contextInput={{
                     contextCell: { stateCell, getCellModifiedTemp, setCellActive },
                     contextRow: { stateRow, getSheetRows },
                     contextProject: { stateProject },
                  }}
               />
            ) : (
               <CellForm
                  contextInput={{
                     contextCell: { stateCell, getCellModifiedTemp, setCellActive },
                     contextRow: { stateRow, getSheetRows },
                     contextProject: { stateProject },
                  }}
                  buttonPanelFunction={buttonPanelFunction}
                  commandAction={commandAction}
                  setLoading={setLoading}
               />
            ),
            className: (props) => {
               const { rowData, column: { key } } = props;
               const { id } = rowData;

               return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                  ? 'cell-found'
                  : (cellHistoryFound && cellHistoryFound.find(cell => cell.rowId === id && cell.header === key))
                     ? 'cell-history-highlight'
                     : (columnLocked(roleTradeCompany, rowData, stateRow.modeGroup, key, projectIsAppliedRfaView, pageSheetTypeName) && rowData._rowLevel === 1)
                        ? 'cell-locked'
                        : '';
            }
         });
      });
      return headersObj;
   };

   const [nosColumnFixedRfaView, setNosColumnFixedRfaView] = useState(0);
   const [headersAllFormViewArray, setHeadersAllFormViewArray] = useState([...getHeadersForm(pageSheetTypeName), ...getHeaderConsultantColumn(pageSheetTypeName)]);

   const switchConsultantsHeader = () => {
      if (headersAllFormViewArray.includes('Consultant (1)')) {
         setHeadersAllFormViewArray([...getHeadersForm(pageSheetTypeName), ...getHeaderConsultantColumn(pageSheetTypeName)]);
         getSheetRows({
            ...stateRow,
            isShowAllConsultant: false
         });
      } else {
         setHeadersAllFormViewArray([...getHeadersForm(pageSheetTypeName), ...headersConsultantWithNumber]);
         getSheetRows({
            ...stateRow,
            isShowAllConsultant: true
         });
      };
   };

   const onClickQuickFilter = (typeOfFilter) => {
      const typeFilter = typeOfFilter === 'noOfRfaOverdue'
         ? 'Overdue'
         : typeOfFilter === 'noOfRfaOverdueNext3Days'
            ? 'Due in 3 days'
            : 'RFA outstanding';

      getSheetRows({
         ...stateRow,
         modeFilter: [
            { id: mongoObjectId(), header: 'Overdue RFA', value: typeFilter },
            { isIncludedParent: 'included' }
         ]
      });
   };

   const onClickquickFilterStatus = (status) => {
      getSheetRows({
         ...stateRow,
         modeFilter: [
            { id: mongoObjectId(), header: 'Status', value: status },
            { isIncludedParent: 'included' }
         ]
      });
   };


   const buttonSpreadsheetMode = ((stateRow && !projectIsAppliedRfaView) || (stateRow && projectIsAppliedRfaView && pageSheetTypeName === 'page-spreadsheet'));

   
   if ((role === 'Consultant' || role === 'Client') && pageSheetTypeName === 'page-spreadsheet') {
      return (
         <div>There is no data display for client</div>
      );
   };

   return (
      <div
         style={{ color: 'black' }}
         onContextMenu={(e) => e.preventDefault()}
      >

         <ButtonBox>
            {buttonSpreadsheetMode && (
               <>
                  <IconTable type='save' onClick={() => buttonPanelFunction('save-ICON')} />
                  <DividerRibbon />
                  <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} />
                  <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
                  <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />
               </>
            )}

            <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
            {searchInputShown
               ? <InputSearch
                  searchGlobal={searchGlobal}
                  stateRow={stateRow}
                  getSheetRows={getSheetRows}
                  modeFilter={stateRow.modeFilter}
               />
               : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

            {stateRow && stateRow.modeGroup.length > 0 ? (
               <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-1')} />
            ) : (
               <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-2')} />
            )}

            <IconTable type='retweet' onClick={clearAllFilterSortSearchGroup} />

            {buttonSpreadsheetMode && (
               <>
                  <DividerRibbon />
                  <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />
                  <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
                  <DividerRibbon />
                  <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
                  <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />
                  <ExcelExport fileName={projectName} />
                  <DividerRibbon />
                  <IconTable type='plus' onClick={() => buttonPanelFunction('viewTemplate-ICON')} />
                  <ViewTemplateSelect updateExpandedRowIdsArray={updateExpandedRowIdsArray} />
                  <DividerRibbon />
               </>
            )}



            {stateRow && projectIsAppliedRfaView && pageSheetTypeName !== 'page-spreadsheet' && (
               <IconTable type='block' onClick={switchConsultantsHeader} />
            )}


            {stateRow && projectIsAppliedRfaView && pageSheetTypeName === 'page-rfa' && role === 'Document Controller' && !isUserCanSubmitBothSide && (
               <>
                  <IconTable
                     type='plus-square'
                     onClick={() => {
                        buttonPanelFunction('form-submit-RFA');
                        getSheetRows({
                           ...stateRow,
                           currentRfaToAddNewOrReplyOrEdit: {
                              currentRfaNumber: null,
                              currentRfaRef: null,
                              currentRfaData: null,
                              formRfaType: 'form-submit-RFA',
                              isFormEditting: false
                           },
                        });
                     }}
                  />
                  <DividerRibbon />
               </>
            )}

            {stateRow && projectIsAppliedRfaView && pageSheetTypeName === 'page-rfa' && isUserCanSubmitBothSide && (
               <>
                  <IconTable
                     type='plus-square'
                     onClick={() => buttonPanelFunction('form-RFA-submit-for-admin')}
                  />
                  <DividerRibbon />
               </>
            )}



            {stateRow && role === 'Document Controller' && (
               pageSheetTypeName === 'page-rfam' ||
               pageSheetTypeName === 'page-rfi' ||
               pageSheetTypeName === 'page-cvi' ||
               pageSheetTypeName === 'page-dt'
            ) && (
                  <>
                     <IconTable
                        type='plus-square'
                        pageSheetTypeName={pageSheetTypeName}
                        onClick={() => {
                           buttonPanelFunction('form-submit-multi-type');
                           getSheetRows({
                              ...stateRow,
                              currentRefToAddNewOrReplyOrEdit: {
                                 currentRefNumber: null,
                                 currentRefData: null,
                                 formRefType: 'form-submit-multi-type',
                                 isFormEditting: false
                              },
                           });
                        }}
                     />
                     <DividerRibbon />
                  </>
               )}



            {stateRow && projectIsAppliedRfaView && stateRow.rfaStatistics && (
               <>
                  {Object.keys(stateRow.rfaStatistics).map((item, i) => {
                     return (
                        <DataStatisticRibbon item={item} key={i} onClickQuickFilter={onClickQuickFilter} />
                     )
                  })}
               </>
            )}


            {isAdmin && (
               <div style={{ display: 'flex' }}>
                  {/* <IconTable type='delete' onClick={() => adminFncServerInit('delete-all-collections')} />
                  <ButtonAdminUploadData /> */}
                  <ButtonAdminCreateAndUpdateRows />
                  {/* <ButtonAdminDeleteRowsHistory /> */}
                  {/* 
                        <ButtonAdminUploadDataPDD />
                        
                        
                        <ButtonAdminCreateAndUpdateRowsHistory />
                        <ButtonAdminUpdateProjectSettings /> 
                     */}

               </div>
            )}

            {(pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-rfa') && (
               <div style={{ position: 'absolute', display: 'flex', top: 3, right: 30 }}>
                  <div style={{ display: 'flex', marginRight: 25, transform: 'translate(0, 5px)' }}>
                     {[
                        'Approved with Comment, no submission Required',
                        'Approved with comments, to Resubmit',
                        'Approved for Construction',
                        'Reject and resubmit'
                     ].map(btn => (
                        <div
                           style={{
                              display: 'flex', paddingLeft: 5, paddingRight: 5, marginRight: 7, cursor: 'pointer', height: 20, borderRadius: 3,
                              background: stateRow && stateRow.modeFilter.find(x => x['header'] === 'Status' && x.value === btn) ? colorType.grey1 : 'transparent'
                           }}
                           onClick={() => onClickquickFilterStatus(btn)}
                           key={btn}
                        >
                           <div
                              style={{
                                 width: 10, height: 10, marginRight: 5,
                                 background: colorTextRow[btn],
                                 transform: 'translate(0, 4px)'
                              }}
                           />
                           <div style={{ fontSize: 11, paddingTop: 1 }}>
                              <span style={{ fontWeight: 'bold', marginRight: 3 }}>
                                 {stateRow && stateRow.rowsAll ? stateRow.rowsAll.filter(r => r['Status'] === btn).length : 0}
                              </span>
                              {btn === 'Approved with Comment, no submission Required'
                                 ? 'AC'
                                 : btn === 'Approved with comments, to Resubmit'
                                    ? 'AC, resubmit'
                                    : btn === 'Approved for Construction'
                                       ? 'Approved'
                                       : 'Reject'}
                           </div>
                        </div>
                     ))}
                  </div>
                  <div style={{ fontSize: 25, color: colorType.primary }}>{projectName}</div>
               </div>
            )}


         </ButtonBox>


         <div style={{ display: 'flex', overflowX: 'hidden', height: window.innerHeight - offsetHeight }}>

            {projectIsAppliedRfaView && (
               <div style={{ width: sideBarWidth, background: colorType.primary }}>
                  {(
                     (role !== 'Consultant' && role !== 'Client')
                     ? ['side-dms', 'side-rfa', 'side-rfam', 'side-rfi', 'side-cvi', 'side-dt']
                     : ['side-rfa', 'side-rfam', 'side-rfi', 'side-cvi', 'side-dt']
                  ).map((btnType, i) => {

                     return (
                     <IconSidePanel 
                        key={i} 
                        type={btnType} 
                        onClick={() => buttonPanelFunction(btnType)} 
                        isLocked={
                           pageSheetTypeName.slice(5, pageSheetTypeName.length) === btnType.slice(5, btnType.length) ||
                           (pageSheetTypeName.slice(5, pageSheetTypeName.length) === 'spreadsheet' && btnType.slice(5, btnType.length) === 'dms')
                        }
                     />
                  )})}
               </div>
            )}
               



            {!loading ? (
               <TableStyled
                  dataForStyled={{ stateProject, randomColorRange, randomColorRangeStatus, cellSearchFound, cellHistoryFound }}
                  ref={tableRef}
                  fixed
                  projectIsAppliedRfaView={projectIsAppliedRfaView}

                  columns={renderColumns(
                     (projectIsAppliedRfaView && pageSheetTypeName !== 'page-spreadsheet') ? headersAllFormViewArray : stateProject.userData.headersShown,
                     (projectIsAppliedRfaView && pageSheetTypeName !== 'page-spreadsheet') ? nosColumnFixedRfaView : stateProject.userData.nosColumnFixed
                  )}

                  data={arrangeDrawingTypeFinal(stateRow, companies, company, roleTradeCompany.role, pageSheetTypeName)}
                  expandedRowKeys={expandedRows}

                  expandColumnKey={
                     (projectIsAppliedRfaView && pageSheetTypeName !== 'page-spreadsheet')
                        ? pageSheetTypeName.slice(5, pageSheetTypeName.length).toUpperCase() + ' Ref'
                        : stateProject.userData.headersShown[0]}

                  expandIconProps={expandIconProps}
                  components={{ ExpandIcon }}
                  rowHeight={30}
                  overscanRowCount={0}
                  onScroll={onScroll}
                  rowClassName={rowClassName}
                  onRowExpand={onRowExpand}
               />
            ) : <LoadingIcon />}

         </div>


         {((stateRow && pageSheetTypeName === 'page-spreadsheet') || !projectIsAppliedRfaView) && (
            <ModalStyleFunction
               visible={panelFunctionVisible}
               footer={null}
               onCancel={() => {
                  getSheetRows({
                     ...stateRow,
                     rowsSelected: [],
                     rowsSelectedToMove: []
                  });
                  setPanelFunctionVisible(false);
               }}
               destroyOnClose={true}
               style={{
                  position: 'fixed',
                  left: cursor && getPanelPosition(cursor).x,
                  top: cursor && getPanelPosition(cursor).y
               }}
               mask={false}
               width={250}
            >
               <PanelFunction
                  panelType={panelType}
                  buttonPanelFunction={buttonPanelFunction}
               />
            </ModalStyleFunction>
         )}


         <ModalStyledSetting
            title={stateRow && stateRow.modeGroup && stateRow.modeGroup.length > 0 ? 'Quit Grouping Mode' : getActionName(panelSettingType)}
            visible={panelSettingVisible}
            footer={null}
            onCancel={() => {
               if (
                  panelSettingType !== 'form-submit-RFA' &&
                  panelSettingType !== 'form-resubmit-RFA' &&
                  panelSettingType !== 'form-reply-RFA' &&
                  panelSettingType !== 'addDrawingType-ICON' &&
                  panelSettingType !== 'form-submit-multi-type' &&
                  panelSettingType !== 'form-resubmit-multi-type' &&
                  panelSettingType !== 'form-reply-multi-type' 
               ) {
                  setPanelSettingVisible(false);
                  setPanelSettingType(null);
                  setPanelType(null);
               };
            }}
            destroyOnClose={true}
            centered={true}
            width={
               panelSettingType === 'addDrawingType-ICON' ? window.innerWidth * 0.85 :
                  (
                     panelSettingType &&
                     (panelSettingType.includes('form-submit-') ||
                        panelSettingType.includes('form-resubmit-') ||
                        panelSettingType.includes('form-reply-'))
                  ) ? window.innerWidth * 0.9 :
                     panelSettingType === 'pickTypeTemplate-ICON' ? window.innerWidth * 0.6 :
                        panelSettingType === 'View Drawing Revision' ? window.innerWidth * 0.8 :
                           panelSettingType === 'filter-ICON' ? window.innerWidth * 0.5 :
                              520
            }
         >
            <PanelSetting
               panelType={panelType}
               panelSettingType={panelSettingType}
               commandAction={commandAction}
               onClickCancelModal={() => {
                  setPanelSettingVisible(false);
                  setPanelSettingType(null);
                  setPanelType(null);
                  getSheetRows({ ...stateRow, currentRfaToAddNewOrReplyOrEdit: null });
               }}
               setLoading={setLoading}
               buttonPanelFunction={buttonPanelFunction}
               history={history}
               localState={localState}
            />
         </ModalStyledSetting>



         {adminFncInitPanel && (
            <Modal
               title={adminFncBtn + ' ... ... sure ???'}
               visible={adminFncInitPanel}
               onOk={() => {
                  adminFnc(adminFncBtn);
                  setAdminFncInitPanel(false)
               }}
               onCancel={() => setAdminFncInitPanel(false)}
            ></Modal>
         )}
      </div>

   );
};
export default OverallComponentDMS;



const DividerRibbon = () => {
   return (
      <Divider type='vertical' style={{
         height: 32,
         marginLeft: 8,
         marginRight: 8,
         background: 'white'
      }} />
   );
};


const TableStyled = styled(Table)`

  

   .cell-locked {
      background-color: ${colorType.lockedCell};
   };
   .row-locked {
      background-color: ${colorType.lockedCell};
   };
   .row-drawing-type {
      background-color: ${colorType.grey3};
   };
   .row-selected {
      background-color: ${colorType.cellHighlighted};
   };
   
   
   
   ${({ dataForStyled }) => {
      const { stateProject, randomColorRange, randomColorRangeStatus } = dataForStyled;

      if (stateProject.userData) {
         let { colorization } = stateProject.userData;
         const value = colorization.value || [];

         let res = [];
         value.map(n => {
            let color = stateProject.userData.colorization.header === 'Status' ?
               randomColorRangeStatus[n] :
               randomColorRange[value.indexOf(n)];
            if (n) {
               res.push(`.colorization-${stateProject.userData.colorization.header.replace(/\s/g, '').replace(/,/g, '')}-${n.replace(/\s/g, '').replace(/,/g, '')}-styled {
                  background-color: ${color};
            }`);
            };
         });
         const output = [...new Set(res)].join('\n');

         return output;
      };
   }}

   ${({ dataForStyled }) => {
      const { cellSearchFound } = dataForStyled;
      if (cellSearchFound) return `.cell-found { background-color: #7bed9f; }`;
   }}

   ${({ dataForStyled }) => {
      const { cellHistoryFound } = dataForStyled;
      if (cellHistoryFound) return `.cell-history-highlight { background-color: #f6e58d; }`;
   }}


   .BaseTable__header-row {
      background: ${colorType.primary};
   };
   .cell-current {
      background-color: ${colorType.cellHighlighted}
   };

   .BaseTable__table .BaseTable__body {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   }
   .BaseTable__header-cell {
      padding: 5px;
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
const ModalStyleFunction = styled(Modal)`
   .ant-modal-close, .ant-modal-header {
      display: none;
   }
   .ant-modal-body {
      padding: 0;
   }
`;
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
      display: flex;
      justify-content: center;
   }
`;
const ButtonBox = styled.div`
   width: ${`${window.innerWidth}px`};
   position: relative;
   display: flex;
   padding-top: 7px;
   padding-bottom: 7px;
   padding-left: 7px;
   background: ${colorType.grey4};
`;




export const getInputDataInitially = (data, { role, company }, pageSheetTypeName) => {



   if (pageSheetTypeName === 'page-rfa') {
      const { sheetData, rowsHistoryData } = data;
      const { rows, publicSettings } = sheetData;
      const { drawingTypeTree } = publicSettings;
      let rowsAllOutput = getOutputRowsAllSorted(drawingTypeTree, rows);
      const { rowsToAdd } = rearrangeRowsNotMatchTreeNode(rows, rowsAllOutput, drawingTypeTree);
      const dataRowsHistoryConverted = convertRowHistoryData(rowsHistoryData, publicSettings.headers);
      const { rowsDataRFA, treeViewRFA, rfaStatistics } = getDataForRFASheet(rows, dataRowsHistoryConverted, role, company);


      return {

         modeFilter: [],
         modeSearch: {},
         modeGroup: [],

         drawingTypeTree: treeViewRFA,
         drawingTypeTreeDmsView: drawingTypeTree,
         rowsAll: [...rowsAllOutput, ...rowsToAdd],
         rowsRfaAll: rowsDataRFA.filter(r => !r['row']),
         rowsRfaAllInit: rowsDataRFA,
         currentRfaToAddNewOrReplyOrEdit: null,
         rfaStatistics,
         isShowAllConsultant: false,
         loading: false
      };

   } else if (pageSheetTypeName === 'page-spreadsheet') {
      const { rows, publicSettings, userSettings } = data;
      const { drawingTypeTree } = publicSettings;
      let rowsAllOutput = getOutputRowsAllSorted(drawingTypeTree, rows);
      const { treeNodesToAdd, rowsToAdd, rowsUpdatePreOrParent } = rearrangeRowsNotMatchTreeNode(rows, rowsAllOutput, drawingTypeTree);

      let viewTemplates = [];
      let viewTemplateNodeId = null;
      let modeFilter = [];
      let modeSort = {};
      if (userSettings) {
         viewTemplates = userSettings.viewTemplates || [];
         viewTemplateNodeId = userSettings.viewTemplateNodeId || null;
         modeFilter = userSettings.modeFilter || [];
         modeSort = userSettings.modeSort || {};
      };

      return {
         modeFilter,
         modeSort,
         modeSearch: {},
         modeGroup: [],

         rowsAll: [...rowsAllOutput, ...rowsToAdd], // handle rows can not match parent
         rowsVersionsToSave: [],


         viewTemplates,
         viewTemplateNodeId,
         drawingTypeTree: [...drawingTypeTree, ...treeNodesToAdd], // handle rows can not match parent
         drawingTypeTreeInit: drawingTypeTree,
         drawingsTypeDeleted: [],
         drawingsTypeNewIds: [...treeNodesToAdd.map(x => x.id)], // handle rows can not match parent

         rowsDeleted: [],
         idRowsNew: [],
         rowsUpdatePreRowOrParentRow: { ...rowsUpdatePreOrParent }, // handle rows can not match parent
         rowsUpdateSubmissionOrReplyForNewDrawingRev: [],

         rowsSelected: [],
         rowsSelectedToMove: [],

      };
   } else if (
      pageSheetTypeName === 'page-rfam' ||
      pageSheetTypeName === 'page-rfi' ||
      pageSheetTypeName === 'page-cvi' ||
      pageSheetTypeName === 'page-dt'
   ) {

      const keySuffix = pageSheetTypeName === 'page-rfam' ? 'Rfam'
         : pageSheetTypeName === 'page-cvi' ? 'Cvi'
            : pageSheetTypeName === 'page-rfi' ? 'Rfi'
               : 'Dt';

      const keyType = pageSheetTypeName.slice(5, pageSheetTypeName.length);

      const { rowsData, treeView } = getDataForMultiFormSheet(data, pageSheetTypeName);

      let outputRowsRef = [];

      const listRef = [... new Set(rowsData.map(x => x[`${keyType}Ref`]))];
      listRef.forEach(ref => {

         const rowsThisRef = rowsData.filter(r => r[`${keyType}Ref`] === ref);
         const arrayVersion = [...new Set(rowsThisRef.map(x => x.revision))];
         const latestVersion = arrayVersion.sort()[arrayVersion.length - 1];
         outputRowsRef.push(rowsThisRef.find(x => x.revision === latestVersion));
      });

      return {

         modeFilter: [],
         modeSearch: {},
         modeGroup: [],

         drawingTypeTree: treeView,
         [`rows${keySuffix}All`]: outputRowsRef,
         [[`rows${keySuffix}AllInit`]]: rowsData,

         isShowAllConsultant: false,
         loading: false,

         


      };
   }
};

const arrangeDrawingTypeFinal = (stateRow, companies, company, role, pageSheetTypeName) => {

   const {
      rowsAll, drawingTypeTree, viewTemplateNodeId,
      modeFilter, modeGroup, modeSort, modeSearch,

      rowsRfaAll,

      rowsRfamAll, rowsRfiAll, rowsCviAll, rowsDtAll
   } = stateRow;


   if (pageSheetTypeName === 'page-rfa') {


      let rowsAllFinalRFA = [...rowsRfaAll];

      if (Object.keys(modeSearch).length === 2) {
         const { isFoundShownOnly, searchDataObj } = modeSearch;
         if (isFoundShownOnly === 'show found only') {
            rowsAllFinalRFA = rowsAllFinalRFA.filter(row => row.id in searchDataObj);
         };
      };

      if (modeFilter.length > 0) {
         let filterObj = {};
         modeFilter.forEach(filter => {
            if (filter.header) {
               filterObj[filter.header] = [...filterObj[filter.header] || [], filter.value];
            };
         });

         Object.keys(filterObj).forEach(header => {
            if (isColumnWithReplyData(header) || isColumnConsultant(header)) {

               rowsAllFinalRFA = rowsAllFinalRFA.filter(r => {
                  const arrayCompanyFilter = filterObj[header];
                  const { replyCompany } = getConsultantReplyData(r, header, companies);
                  return arrayCompanyFilter.indexOf(replyCompany) !== -1;
               });

            } else if (header === 'Overdue RFA') {

               let outputDrawingsAfterFilter = [];
               filterObj[header].forEach(filterData => {
                  if (filterData === 'Overdue' || filterData === 'Due in 3 days') {
                     outputDrawingsAfterFilter = [
                        ...outputDrawingsAfterFilter,
                        ...rowsAllFinalRFA.filter(r => {

                           const consultantLeadName = getConsultantLeadName(r);
                           let consultantLeadReply;
                           if (consultantLeadName) {
                              consultantLeadReply = getInfoValueFromRfaData(r, 'reply', 'status', consultantLeadName);
                           };

                           let nosOfDate;
                           if (!consultantLeadReply) {
                              nosOfDate = compareDates(r['Consultant Reply (T)']);
                           };
                           return filterData === 'Overdue' ? nosOfDate < 0 : nosOfDate < 3;
                        })];

                  } else if (filterData === 'RFA outstanding') {

                     outputDrawingsAfterFilter = [
                        ...outputDrawingsAfterFilter,
                        ...rowsAllFinalRFA.filter(r => {
                           let replyStatusValue;
                           if (role === 'Consultant') {
                              replyStatusValue = getInfoValueFromRfaData(r, 'reply', 'status', company);
                              const consultantMustReply = getInfoValueFromRfaData(r, 'submission', 'consultantMustReply');
                              return !replyStatusValue && consultantMustReply.indexOf(company) !== -1;
                           } else {
                              const leadConsultant = getInfoValueFromRfaData(r, 'submission', 'consultantMustReply')[0];
                              replyStatusValue = getInfoValueFromRfaData(r, 'reply', 'status', leadConsultant);
                              return !replyStatusValue;
                           };
                        })];
                  };
               });
               rowsAllFinalRFA = outputDrawingsAfterFilter;
            } else if (header === 'Requested By') {
               rowsAllFinalRFA = rowsAllFinalRFA.filter(r => {
                  const requestedBy = getInfoValueFromRfaData(r, 'submission', 'requestedBy');
                  return filterObj[header].indexOf(requestedBy) !== -1;
               });
            } else if (header === 'Submission Date') {
               rowsAllFinalRFA = rowsAllFinalRFA.filter(r => {
                  const submissionDate = r['Drg To Consultant (A)'];
                  return filterObj[header].indexOf(submissionDate) !== -1;
               });
            } else if (header === 'Due Date') {
               rowsAllFinalRFA = rowsAllFinalRFA.filter(r => {
                  const dueDate = r['Consultant Reply (T)'];
                  return filterObj[header].indexOf(dueDate) !== -1;
               });
            } else {
               rowsAllFinalRFA = rowsAllFinalRFA.filter(r => filterObj[header].indexOf(r[header]) !== -1);
            };
         });
      };


      let dataOutputRFA = [];
      drawingTypeTree.forEach(item => {
         let newItem = { ...item };
         let rowsChildren = rowsAllFinalRFA.filter(r => r['rfaNumber'] === item.id);
         if (rowsChildren.length > 0) {
            newItem.children = rowsChildren;
         };
         dataOutputRFA.push(newItem);
      });

      const outputRFA = convertFlattenArraytoTree1(dataOutputRFA);

      return outputRFA;

   } else if (pageSheetTypeName === 'page-spreadsheet') {
      // DMS VIEW .......................................
      let drawingTypeTreeTemplate;
      let rowsAllInTemplate;
      const templateNode = drawingTypeTree.find(x => x.id === viewTemplateNodeId);


      if (templateNode) {
         const nodeArray = getTreeFlattenOfNodeInArray(drawingTypeTree, templateNode);
         if (nodeArray.length > 1) {
            drawingTypeTreeTemplate = nodeArray.filter(x => x.id !== templateNode.id);
            rowsAllInTemplate = rowsAll.filter(x => drawingTypeTreeTemplate.find(tr => tr.id === x._parentRow));
         } else {
            const parent = nodeArray[0];
            return rowsAll.filter(x => x._parentRow === parent.id);
         };
      } else {
         drawingTypeTreeTemplate = drawingTypeTree.map(x => ({ ...x }));
         rowsAllInTemplate = rowsAll.map(x => ({ ...x }));
      };



      if (Object.keys(modeSearch).length === 2) {
         const { isFoundShownOnly, searchDataObj } = modeSearch;
         if (isFoundShownOnly === 'show found only') {
            rowsAllInTemplate = rowsAllInTemplate.filter(row => row.id in searchDataObj);
         };
      };


      if (modeFilter.length > 0) {
         let filterObj = {};
         modeFilter.forEach(filter => {
            if (filter.header) {
               filterObj[filter.header] = [...filterObj[filter.header] || [], filter.value];
            };
         });
         Object.keys(filterObj).forEach(header => {
            rowsAllInTemplate = rowsAllInTemplate.filter(r => filterObj[header].indexOf(r[header]) !== -1);
         });
         if (Object.keys(modeSort).length !== 3 && modeFilter.find(x => x.isIncludedParent === 'not included')) {
            return rowsAllInTemplate;
         };
      };



      if (Object.keys(modeSort).length === 3) {
         const { isIncludedParent: isIncludedParentSort, column: columnSort, type: typeSort } = modeSort;
         if (isIncludedParentSort === 'included') {
            const listParentIds = [...new Set(rowsAllInTemplate.map(x => x._parentRow))];
            let rowsSortedOutput = [];
            listParentIds.forEach(parentId => {
               let subRows = rowsAllInTemplate.filter(x => x._parentRow === parentId);
               if (typeSort === 'ascending') {
                  subRows = sortFnc(subRows, columnSort, true);
               } else if (typeSort === 'descending') {
                  subRows = sortFnc(subRows, columnSort, false);
               };
               rowsSortedOutput = [...rowsSortedOutput, ...subRows];
            });
            rowsAllInTemplate = [...rowsSortedOutput];

            if (modeFilter.find(x => x.isIncludedParent === 'not included')) return rowsAllInTemplate;

         } else if (isIncludedParentSort === 'not included') {
            if (typeSort === 'ascending') {
               rowsAllInTemplate = sortFnc(rowsAllInTemplate, columnSort, true);
            } else if (typeSort === 'descending') {
               rowsAllInTemplate = sortFnc(rowsAllInTemplate, columnSort, false);
            };
            return rowsAllInTemplate;
         };
      };


      if (modeGroup.length > 0) {
         const { rows } = groupByHeaders(rowsAllInTemplate, modeGroup);
         return rows;
      };


      let dataOutput = [];
      drawingTypeTreeTemplate.forEach(item => {
         let newItem = { ...item };
         let rowsChildren = rowsAllInTemplate.filter(r => r._parentRow === newItem.id);
         if (rowsChildren.length > 0) {
            newItem.children = rowsChildren;
         };
         dataOutput.push(newItem);
      });

      const output = convertFlattenArraytoTree1(dataOutput);

      return output;


   } else if (
      pageSheetTypeName === 'page-rfam' ||
      pageSheetTypeName === 'page-rfi' ||
      pageSheetTypeName === 'page-cvi' ||
      pageSheetTypeName === 'page-dt'
   ) {


      const keyRef = getKeyTextForSheet(pageSheetTypeName) + 'Ref';

      let dataOutputMultiForm = [];
      drawingTypeTree.forEach(item => {
         let newItem = { ...item };

         let rowsChildren = (
            pageSheetTypeName === 'page-rfam' ? rowsRfamAll
               : pageSheetTypeName === 'page-rfi' ? rowsRfiAll
                  : pageSheetTypeName === 'page-cvi' ? rowsCviAll
                     : rowsDtAll
         ).filter(r => r[keyRef] === item.id);

         if (rowsChildren.length > 0) {
            newItem.children = rowsChildren;
         };
         dataOutputMultiForm.push(newItem);
      });
      
      const outputRowsData = convertFlattenArraytoTree1(dataOutputMultiForm);
      return outputRowsData;
   };
};


export const getRowsKeyExpanded = (drawingTypeTree, viewTemplateNodeId) => {
   const templateNode = drawingTypeTree.find(x => x.id === viewTemplateNodeId);
   if (templateNode) {
      const drawingTypeTreeTemplate = getTreeFlattenOfNodeInArray(drawingTypeTree, templateNode).filter(x => x.id !== templateNode.id);
      return drawingTypeTreeTemplate.map(x => x.id);
   } else {
      return drawingTypeTree.map(x => x.id);
   };
};
export const getHeadersData = (projectData) => {

   const { publicSettings, userSettings } = projectData;
   let { headers } = publicSettings;

   let headersShown, headersHidden, colorization, nosColumnFixed;

   if (!userSettings || Object.keys(userSettings).length === 0) {
      headersShown = headers.map(hd => hd.text);
      headersHidden = [];
      colorization = {};
      nosColumnFixed = 0;
   } else {
      headersShown = userSettings.headersShown.map(hd => headers.find(h => h.key === hd).text);
      headersHidden = userSettings.headersHidden.map(hd => headers.find(h => h.key === hd).text);
      colorization = userSettings.colorization;
      nosColumnFixed = userSettings.nosColumnFixed;
   };

   return {
      headersShown,
      nosColumnFixed,
      headersHidden,
      colorization,
   };
};
export const getOutputRowsAllSorted = (drawingTypeTree, rowsAll) => {

   const drawingTypeTreeClone = drawingTypeTree.map(x => ({ ...x }));
   const treeTemp = convertFlattenArraytoTree1(drawingTypeTreeClone);

   let rowsOutput = [];
   const getIndex = (arr) => {
      arr.forEach(i => {
         if (i.children.length > 0) {
            getIndex(i.children);
         } else if (i.children.length === 0) {
            const rows = rowsAll.filter(r => r._parentRow === i.id);
            rowsOutput = [...rowsOutput, ...rows];
         };
      });
   };
   getIndex(treeTemp);
   return rowsOutput;
};


const rearrangeRowsNotMatchTreeNode = (rows, rowsArranged, drawingTypeTree) => {
   const rowsToArrange = rows.filter(x => !rowsArranged.find(r => r.id === x.id));
   if (rowsToArrange.length === 0) {
      return { treeNodesToAdd: [], rowsToAdd: [], rowsUpdatePreOrParent: {} };
   };

   const parentIdsArr = [...new Set(rowsToArrange.map(x => x._parentRow))];

   let treeNodesToAdd = [];
   let rowsToAdd = [];
   let rowsUpdatePreOrParent = {}
   parentIdsArr.map(id => {
      const nodeInTree = drawingTypeTree.find(x => x.id === id);
      if (nodeInTree) {
         const newId = mongoObjectId();
         treeNodesToAdd.push({
            title: 'New Drawing Type',
            id: newId,
            parentId: nodeInTree.id,
            treeLevel: nodeInTree.treeLevel + 1,
            expanded: true,
         });
         const rowsFound = rowsToArrange.filter(x => x._parentRow === id);
         rowsFound.forEach((r, i) => {
            r._parentRow = newId;
            r._preRow = i === 0 ? null : rowsFound[i - 1].id;
            updatePreRowParentRowToState(rowsUpdatePreOrParent, r);
         });
         rowsToAdd = [...rowsToAdd, ...rowsFound];
      };
   });
   return {
      treeNodesToAdd,
      rowsToAdd,
      rowsUpdatePreOrParent
   };
};


const getHeaderConsultantColumn = (pageSheetTypeName) => {
   if (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt') return [];
   return ['Consultant'];
};

export const headersConsultantWithNumber = [
   'Consultant (1)',
   'Consultant (2)',
   'Consultant (3)',
   'Consultant (4)',
   'Consultant (5)',
];

export const getHeadersForm = (pageSheetTypeName) => {
   if (pageSheetTypeName === 'page-rfa') {
      return [
         'RFA Ref',
         'Rev',
         'Drawing Number',
         'Drawing Name',
         'Requested By',
         'Submission Date',
         'Due Date'
      ];
   } else if (pageSheetTypeName === 'page-cvi') {
      return [
         'CVI Ref',
         'Description',
         'Requested By',
         'Signatured By',
         'Conversation Among',
         'Submission Date',
         'Conversation Date',
         'Cost Implication',
         'Time Extension',
         'Received By',
      ];
   } else if (pageSheetTypeName === 'page-rfam') {
      return [
         'RFAM Ref',
         'Description',
         'Requested By',
         'Signatured By',
         'Submission Date',
         'Submission Type',
         'Contract Specification',
         'Proposed Specification',
      ];
   } else if (pageSheetTypeName === 'page-rfi') {
      return [
         'RFI Ref',
         'Description',
         'Requested By',
         'Signatured By',
         'Submission Date',
         'Due Date',
      ];
   } else if (pageSheetTypeName === 'page-dt') {
      return [
         'DT Ref',
         'Description',
         'Requested By',
         'Signatured By',
         'Submission Date',
         'Attachment Type',
         'Transmitted For',
         'Received By',
      ];
   } else {
      return [];
   };
};


const DataStatisticRibbon = ({ onClickQuickFilter, item }) => {

   const { state: stateRow } = useContext(RowContext);

   return (
      <div style={{ marginLeft: 7, display: 'flex', cursor: 'pointer' }} onClick={() => onClickQuickFilter(item)}>
         <div
            style={{
               width: 8,
               height: 8,
               borderRadius: '50%',
               background: item === 'noOfRfaOverdue' ? colorType.red : item === 'noOfRfaOverdueNext3Days' ? 'yellow' : colorType.primary,
               transform: 'translate(0, 7px)',
               marginRight: 5
            }}
         />

         <span style={{ fontWeight: 'bold', marginRight: 4 }}>{stateRow.rfaStatistics[item]}</span>

         {item === 'noOfRfaOverdue'
            ? 'Overdue'
            : item === 'noOfRfaOverdueNext3Days'
               ? 'Due in 3 days'

               // meeting presentation
               : item === 'noOfRfaOutstanding'
                  ? 'RFA outstanding'
                  : ''
         }
         <DividerRibbon />
      </div>
   );
};













