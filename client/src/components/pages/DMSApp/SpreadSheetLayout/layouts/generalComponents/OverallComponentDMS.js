import { Divider, Icon, message, Modal } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { colorTextRow, colorType, SERVER_URL, tradeArrayForm, tradeArrayMeetingMinutesForm } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { compareDates, compareDatesMultiForm, debounceFnc, genId, getActionName, getHeaderWidth, getHeaderWidthForRFAView, getUserRoleTradeCompany, groupByHeaders, mongoObjectId, randomColorRange, randomColorRangeStatus } from '../../utils';
import ButtonAdminCreateAndUpdateRows from '../pageSpreadsheet/ButtonAdminCreateAndUpdateRows';
import ButtonAdminCreateAndUpdateRowsHistory from '../pageSpreadsheet/ButtonAdminCreateAndUpdateRowsHistory';
import Cell, { columnLocked, rowLocked } from '../pageSpreadsheet/Cell';
import CellForm, { getInfoValueFromRefDataForm } from '../pageSpreadsheet/CellForm';
import CellIndex from '../pageSpreadsheet/CellIndex';
import CellRFA, { getConsultantReplyData, getInfoValueFromRfaData, isColumnConsultant, isColumnWithReplyData } from '../pageSpreadsheet/CellRFA';
import ExcelExport from '../pageSpreadsheet/ExcelExport';
import { convertFlattenArraytoTree1, getTreeFlattenOfNodeInArray } from '../pageSpreadsheet/FormDrawingTypeOrder';
import PanelFunction, { getPanelPosition } from '../pageSpreadsheet/PanelFunction';
import PanelSetting, { convertRowHistoryData, getDataForMultiFormSheet, getDataForRFASheet, getKeyTextForSheet, saveDataToServer, updatePreRowParentRowToState, _processRowsChainNoGroupFnc1 } from '../pageSpreadsheet/PanelSetting';
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
   const { projectIsAppliedRfaView, pageSheetTypeName } = props;

   return (
      <AutoResizer>
         {({ width }) => {
            return <BaseTable
               {...props}
               ref={ref}
               width={
                  pageSheetTypeName === 'page-data-entry'
                     ? width
                     : window.innerWidth - (projectIsAppliedRfaView ? sideBarWidth : 0)
               }
               height={window.innerHeight - offsetHeight}
            />
         }}
      </AutoResizer>
   );
});


let previousDOMCell = null;
let currentDOMCell = null;
let isTyping = false;
let addedEvent = false;


const OverallComponentDMS = (props) => {



   let {
      email, role: roleInit, isAdmin, projectId, projectName, token, company,
      companies, projectIsAppliedRfaView, listUser: listUserInput, listGroup: listGroupInput, projectNameShort, pageSheetTypeName,
      history, localState,

      // sheet-data-entry
      sheetDataInput: sheetDataInputRaw, sheetId, sheetName, canEditParent,
      saveDataToServerCallback, callbackSelectRow, rowsImportedFromModel
   } = props;

   let role = roleInit;
   let sheetDataInput;
   if (pageSheetTypeName === 'page-data-entry') {
      role = roleInit.name;
      sheetDataInput = convertDataEntryInput(sheetDataInputRaw);
   };


   const roleTradeCompany = getUserRoleTradeCompany(role, company, pageSheetTypeName);
   const listUser = [...new Set(listUserInput)];
   const listGroup = [...new Set(listGroupInput)];
   const isBothSideActionUser = isAdmin || (roleInit === 'Document Controller' && company === 'Woh Hup Private Ltd');

   let history1 = useHistory();



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
   // useEffect(() => console.log('STATE-ROW...', stateRow), [stateRow]);
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

      } else if (btn === 'select-single-row-ICON') {
         if (rowsSelected.length === 1) {
            const { publicSettings } = stateProject.allDataOneSheet;
            const { headers } = publicSettings;

            const oneRowSelected = rowsSelected[0];
            let rowOutput = { _id: oneRowSelected.id, parentRow: oneRowSelected._parentRow, preRow: oneRowSelected._preRow, level: oneRowSelected._rowLevel };
            for (const key in oneRowSelected) {
               if (key !== 'id' && key !== '_parentRow' && key !== '_preRow' && key !== '_rowLevel') {
                  if (headers.find(hd => hd.text === key)) {
                     rowOutput.data = { ...rowOutput.data || {}, [key]: oneRowSelected[key] || '' };
                  } else {
                     rowOutput[key] = oneRowSelected[key];
                  };
               };
            };
            callbackSelectRow(rowOutput);
         } else {
            message.warn('Please select 1 row only!', 1.5);
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
            rowsSelectedToMove: [],
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

         if (pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry') {
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

         getSheetRows(getInputDataInitially(update.data.rowsAllMultiForm, roleTradeCompany, pageSheetTypeName, update.data.projectTree));
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
            projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isBothSideActionUser, pageSheetTypeName,
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

      } else if (update.type === 'reload-data-entry-from-server') {
         const dataLoadedFromServer = convertDataEntryInput(update.data);

         fetchDataOneSheet({
            ...dataLoadedFromServer, roleTradeCompany,
            email, sheetId, sheetName, canEditParent, role, token, isAdmin, pageSheetTypeName
         });

         setUserData(getHeadersData(dataLoadedFromServer));
         getSheetRows(getInputDataInitially(dataLoadedFromServer, roleTradeCompany, pageSheetTypeName));

         setExpandedRows(getRowsKeyExpanded(
            dataLoadedFromServer.publicSettings.drawingTypeTree,
            dataLoadedFromServer.userSettings ? dataLoadedFromServer.userSettings.viewTemplateNodeId : null
         ));

         OverwriteCellsModified({});
         setCellActive(null);
         setLoading(false);

         setCellSearchFound(null);
         setCellHistoryFound(null);

         saveDataToServerCallback(update.data);
      };



      if (update.type !== 'save-data-failure') {
         resetAllPanelInitMode();
      };
   };
   const onScroll = () => {
      if (stateCell.cellActive) setCellActive(null);
   };

   const resetAllPanelInitMode = () => {
      setPanelSettingVisible(false);
      setPanelSettingType(null);
      setPanelType(null);
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

            await Axios.post(`${SERVER_URL}/row-data-entry/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/settings-data-entry/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/row-rfam/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/row-rfi/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/row-cvi/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/row-dt/delete-all/`, { token });
            await Axios.post(`${SERVER_URL}/row-mm/delete-all/`, { token });
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
                  projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isBothSideActionUser, pageSheetTypeName
               });

               setUserData(getHeadersData(res.data));
               getSheetRows(getInputDataInitially(res.data, roleTradeCompany, pageSheetTypeName));

               setExpandedRows(getRowsKeyExpanded(
                  res.data.publicSettings.drawingTypeTree,
                  res.data.userSettings ? res.data.userSettings.viewTemplateNodeId : null
               ));

            } else if (pageSheetTypeName === 'page-data-entry') {


               fetchDataOneSheet({
                  ...sheetDataInput, roleTradeCompany,
                  email, sheetId, sheetName, canEditParent, role, token, isAdmin, pageSheetTypeName
               });

               setUserData(getHeadersData(sheetDataInput));
               getSheetRows(getInputDataInitially(sheetDataInput, roleTradeCompany, pageSheetTypeName));

               setExpandedRows(getRowsKeyExpanded(
                  sheetDataInput.publicSettings.drawingTypeTree,
                  sheetDataInput.userSettings ? sheetDataInput.userSettings.viewTemplateNodeId : null
               ));



            } else if (pageSheetTypeName === 'page-rfa') {

               const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
               const resRowHistory = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });
               const { rows } = res.data;

               fetchDataOneSheet({
                  ...res.data,
                  email, projectId, projectName, role, token, company, companies, roleTradeCompany,
                  projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isBothSideActionUser, pageSheetTypeName,
               });
               getSheetRows(getInputDataInitially({ sheetData: res.data, rowsHistoryData: resRowHistory.data }, roleTradeCompany, pageSheetTypeName));
               setExpandedRows([
                  'ARCHI', 'C&S', 'M&E', 'PRECAST',
                  ...rows.filter(x => x.rfaNumber).map(x => x.rfaNumber)
               ]);

               setSearchInputShown(true);

            } else if (
               pageSheetTypeName === 'page-rfam' ||
               pageSheetTypeName === 'page-rfi' ||
               pageSheetTypeName === 'page-cvi' ||
               pageSheetTypeName === 'page-dt' ||
               pageSheetTypeName === 'page-mm'
            ) {

               const route = pageSheetTypeName === 'page-rfam' ? 'row-rfam'
                  : pageSheetTypeName === 'page-cvi' ? 'row-cvi'
                     : pageSheetTypeName === 'page-rfi' ? 'row-rfi'
                        : pageSheetTypeName === 'page-dt' ? 'row-dt'
                           : pageSheetTypeName === 'page-mm' ? 'row-mm'
                              : 'n/a';

               const refKey = getKeyTextForSheet(pageSheetTypeName) + 'Ref';

               const resSettings = await Axios.get(`${SERVER_URL}/settings/get-all-settings-this-project/`, { params: { token, projectId } });
               const projectSetting = resSettings.data.find(x => x.headers);
               let projectTree = [];
               if (projectSetting) {
                  projectTree = projectSetting.drawingTypeTree;
               };

               const res = await Axios.get(`${SERVER_URL}/${route}/`, { params: { token, projectId, email } });
               const rows = res.data;

               getSheetRows(getInputDataInitially(rows, roleTradeCompany, pageSheetTypeName, projectTree));
               setExpandedRows([
                  ...(pageSheetTypeName === 'page-mm' ? tradeArrayMeetingMinutesForm : tradeArrayForm),
                  ...rows.filter(x => x[refKey]).map(x => x[refKey])
               ]);

               fetchDataOneSheet({
                  email, projectId, projectName, role, token, company, companies, roleTradeCompany,
                  projectIsAppliedRfaView, listUser, listGroup, projectNameShort, isAdmin, isBothSideActionUser, pageSheetTypeName
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
         arr = arr.filter(id => id !== rowKey);
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

      if (rowData.treeLevel || rowData._rowLevel < 1) {
         return 'row-drawing-type';
      };

      let isRowLocked;
      if (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') {
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
      if (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') {
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
      } else if (pageSheetTypeName === 'page-rfa') {
         let searchDataObj = {};
         if (textSearch !== '') {
            (stateRow.rowsRfaAllInit || []).forEach(row => {
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

      } else if (
         pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi' || pageSheetTypeName === 'page-cvi' ||
         pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm'
      ) {
         const rowsAllFormInit = pageSheetTypeName === 'page-rfam' ? stateRow.rowsRfamAllInit
            : pageSheetTypeName === 'page-rfi' ? stateRow.rowsRfiAllInit
               : pageSheetTypeName === 'page-cvi' ? stateRow.rowsCviAllInit
                  : pageSheetTypeName === 'page-dt' ? stateRow.rowsDtAllInit
                     : pageSheetTypeName === 'page-mm' ? stateRow.rowsMmAllInit
                        : [];

         let searchDataObj = {};
         if (textSearch !== '') {
            rowsAllFormInit.forEach(row => {
               let obj = {};
               Object.keys(row).forEach(key => {
                  if (
                     key !== 'id' && key !== 'btn' && key !== 'parentId' && key !== 'trade' &&
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
      setCellHistoryFound(null);
      getSheetRows({
         ...stateRow,
         modeFilter: [],
         modeSort: {},
         modeSearch: {},
         modeGroup: []
      });
      if (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') {
         setSearchInputShown(false);
      };
      setCellSearchFound(null);
   }, 1);



   const renderColumns = (arr, nosColumnFixed) => {

      let headersObj = [{
         key: 'Index', dataKey: 'Index', title: '', width: 50,
         frozen: (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') ? Column.FrozenDirection.LEFT : undefined,
         cellRenderer: (
            <CellIndex
               setCellActive={setCellActive}
               stateRow={stateRow}
               getSheetRows={getSheetRows}
               stateProject={stateProject}
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
               ? getHeaderWidthForRFAView(hd, pageSheetTypeName)
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
            ) : (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') ? (
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


   const switchToOtherPage = async (buttonPanelName) => {

      const routeSuffix = buttonPanelName.slice(5, buttonPanelName.length);
      try {
         if (pageSheetTypeName === 'page-spreadsheet') {
            setLoading(true);
            commandAction({ type: '' });

            await saveDataToServer(stateCell, stateRow, stateProject, commandAction, setLoading);
            history.push({
               pathname: `/${'dms-' + routeSuffix}`,
               state: localState
            });

         } else {
            if (routeSuffix === 'dms') {
               history.push({
                  pathname: '/dms-spreadsheet',
                  state: localState
               });
            } else {
               history.push({
                  pathname: `/${'dms-' + routeSuffix}`,
                  state: localState
               });
            };
         };
      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };




   useEffect(() => {
      if (!stateRow || !rowsImportedFromModel || rowsImportedFromModel.length === 0) return;

      let { rowsAll, rowsUpdatePreRowOrParentRow, idRowsNew } = stateRow;

      const { publicSettings } = stateProject.allDataOneSheet;
      const { headers, drawingTypeTree, sheetId } = publicSettings;

      const folderFoundImportModel = drawingTypeTree.find(fd => fd.folderType === 'MODEL_DATA_IMPORTED');
      const folderFoundContainRows = drawingTypeTree.find(fd => !fd.folderType);


      let cellsModifiedTempObj = {};

      const rowsInput = rowsImportedFromModel.map(r => {
         const newId = mongoObjectId();
         if (!r._id) {
            r._id = newId;
         };
         const obj = { id: r._id || newId };
         for (const key in r) {
            if (key !== '_id' && key !== 'parentRow' && key !== 'preRow' && key !== 'level' && key !== 'data') {
               obj[key] = r[key];
            };
         };
         const data = r.data || {};
         for (const key in data) {
            const headerFound = headers.find(hd => hd.key === key);
            if (headerFound) {
               obj[headerFound.text] = data[key];
            };
         };
         return obj;
      });

      const rowsExistingToUpdate = rowsInput.filter(r => rowsAll.find(x => x.id === r.id));

      rowsExistingToUpdate.forEach(row => {
         for (const key in row) {
            if (key !== 'id' && key !== '_parentRow' && key !== '_preRow' && key !== '_rowLevel') {
               const rowFoundInCurrentDB = rowsAll.find(r => r.id === row.id);
               if (rowFoundInCurrentDB[key] !== row[key]) {
                  rowFoundInCurrentDB[key] = row[key];
                  if (headers.find(hd => hd.text === key)) {
                     cellsModifiedTempObj[`${row.id}~#&&#~${key}`] = row[key];
                  };
               };
            };
         };
      });


      let idFolderImportModel;
      let idFolderContainRows;
      let newDrawingTypeTree;

      if (!folderFoundImportModel && !folderFoundContainRows) {

         idFolderContainRows = mongoObjectId();
         idFolderImportModel = mongoObjectId();

         newDrawingTypeTree = [
            {
               expanded: true, treeLevel: 1,
               id: idFolderContainRows,
               parentId: sheetId,
               title: 'New Folder',

            },
            {
               expanded: true, treeLevel: 1,
               id: idFolderImportModel,
               parentId: sheetId,
               title: 'MODEL_DATA_IMPORTED',
               folderType: 'MODEL_DATA_IMPORTED'
            }
         ];

         rowsAll.forEach(row => {
            row._parentRow = idFolderContainRows;
            updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
         });

      } else if (!folderFoundImportModel && folderFoundContainRows) {

         idFolderImportModel = mongoObjectId();

         newDrawingTypeTree = [
            ...drawingTypeTree,
            {
               expanded: true, treeLevel: 1,
               id: idFolderImportModel,
               parentId: sheetId,
               title: 'MODEL_DATA_IMPORTED',
               folderType: 'MODEL_DATA_IMPORTED'
            }
         ];
      } else {
         idFolderImportModel = folderFoundImportModel.id;
      };

      const rowsNewToAdd = rowsInput.filter(r => !rowsAll.find(x => x.id === r.id));

      const allRowsOfFolderModelImported = rowsAll.filter(r => r._parentRow === idFolderImportModel);
      const lastRowCurrent = allRowsOfFolderModelImported[allRowsOfFolderModelImported.length - 1];

      rowsNewToAdd.forEach((row, i) => {
         row._parentRow = idFolderImportModel;
         row._preRow = i === 0 ? (lastRowCurrent ? lastRowCurrent.id : null) : rowsNewToAdd[i - 1].id;
         row._rowLevel = 1;

         for (const key in row) {
            if (key !== 'id' && key !== '_parentRow' && key !== '_preRow' && key !== '_rowLevel') {
               if (headers.find(hd => hd.text === key)) {
                  cellsModifiedTempObj[`${row.id}~#&&#~${key}`] = row[key];
               };
            };
         };
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
         idRowsNew = [...idRowsNew, row.id];
      });


      OverwriteCellsModified({ ...stateCell.cellsModifiedTemp, ...cellsModifiedTempObj });


      let updateStateDrawingTypeTree = {};
      if (!folderFoundImportModel) {
         updateStateDrawingTypeTree = {
            drawingsTypeNewIds: idFolderContainRows ? [idFolderImportModel, idFolderContainRows] : [idFolderImportModel],
            drawingTypeTree: newDrawingTypeTree,
         };
         setExpandedRows([...expandedRows, ...newDrawingTypeTree.map(node => node.id)]);
      };


      getSheetRows({
         ...stateRow,
         rowsAll: [...rowsAll, ...rowsNewToAdd],
         rowsUpdatePreRowOrParentRow,
         ...updateStateDrawingTypeTree,
         idRowsNew,
         additionalFieldToSave: rowsImportedFromModel,
         rowsSelectedToMove: [],
         rowsSelected: [],
         modeFilter: [],
         modeSort: {}
      });

   }, [rowsImportedFromModel]);

   const getCurrentDataTable = () => {
      const { rowsAll } = stateRow;
      const { publicSettings } = stateProject.allDataOneSheet;
      const { headers } = publicSettings;

      const rowToSaveArr = rowsAll.map(row => {
         let rowToSave = { _id: row.id, parentRow: row._parentRow, preRow: row._preRow, level: row._rowLevel };
         for (const key in row) {
            if (key !== 'id' && key !== '_parentRow' && key !== '_preRow' && key !== '_rowLevel') {
               const headerFound = headers.find(hd => hd.text === key);
               if (headerFound) {
                  rowToSave.data = { ...rowToSave.data || {}, [headerFound.key]: row[key] || '' };
               } else {
                  rowToSave[key] = row[key];
               };
            };
         };
         return rowToSave;
      });
      return rowToSaveArr;
   };

   const getIdOfFolderModelImported = () => {
      const { publicSettings: { drawingTypeTree } } = stateProject.allDataOneSheet;
      const folderModel = drawingTypeTree.find(node => node.folderType === 'MODEL_DATA_IMPORTED') || {};
      return folderModel.id;
   };

   window.getCurrentDataTable = getCurrentDataTable;
   window.getIdOfFolderModelImported = getIdOfFolderModelImported;




   const [currentWindow, setCurrentWindow] = useState({ width: window.innerWidth, height: window.innerHeight });

   useEffect(() => {
      const handleResize = () => {
         setCurrentWindow({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   });


   if ((role === 'Consultant' || role === 'Client') && pageSheetTypeName === 'page-spreadsheet') {
      return <div>There is no data display for "Client" and "Consultant"</div>
   } else if (role === 'Document Controller' && company !== 'Woh Hup Private Ltd') {
      return <div>"Document Controller" must come from "Woh Hup Private Ltd"</div>
   };

   return (
      <div
         style={{ color: 'black' }}
         onContextMenu={(e) => e.preventDefault()}
      >
         <ButtonBox>
            {stateRow && !loading && (
               <>
                  {(pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') && (
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
                        stateProject={stateProject}
                        getSheetRows={getSheetRows}
                     />
                     : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

                  {stateRow.modeGroup.length > 0 ? (
                     <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-1')} />
                  ) : (
                     <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-2')} />
                  )}

                  <IconTable type='retweet' onClick={clearAllFilterSortSearchGroup} />

                  {(pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') && (
                     <>
                        <DividerRibbon />
                        <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />

                        {pageSheetTypeName === 'page-spreadsheet' && (
                           <>
                              <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
                              <DividerRibbon />
                              <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
                              <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />
                           </>
                        )}

                        <ExcelExport fileName={projectName} />
                        <DividerRibbon />
                        {pageSheetTypeName === 'page-data-entry' && (
                           <>
                              <IconTable type='border-outer' onClick={() => buttonPanelFunction('select-single-row-ICON')} />
                              <DividerRibbon />
                           </>
                        )}
                        {pageSheetTypeName === 'page-spreadsheet' && (
                           <>
                              <IconTable type='plus' onClick={() => buttonPanelFunction('viewTemplate-ICON')} />
                              <ViewTemplateSelect updateExpandedRowIdsArray={updateExpandedRowIdsArray} />
                              <DividerRibbon />
                           </>
                        )}
                     </>
                  )}



                  {projectIsAppliedRfaView && (
                     pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry' &&
                     pageSheetTypeName !== 'page-cvi' && pageSheetTypeName !== 'page-dt' && pageSheetTypeName !== 'page-mm'
                  ) && (
                        <IconTable type='block' onClick={switchConsultantsHeader} />
                     )}

                  {(pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry') && (
                     <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
                  )}
                  <DividerRibbon />


                  {projectIsAppliedRfaView && (
                     pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam' ||
                     pageSheetTypeName === 'page-rfi' || pageSheetTypeName === 'page-cvi' ||
                     pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm'
                  ) &&
                     (isBothSideActionUser || role === 'Document Controller') && (
                        <>
                           <IconTable
                              type='plus-square'
                              pageSheetTypeName={pageSheetTypeName}
                              onClick={() => {
                                 if (isBothSideActionUser) {
                                    buttonPanelFunction('option-email-or-not-for-admin');
                                 } else {
                                    buttonPanelFunction(pageSheetTypeName === 'page-rfa' ? 'form-submit-RFA' : 'form-submit-multi-type');
                                    getSheetRows({
                                       ...stateRow,
                                       currentRefToAddNewOrReplyOrEdit: {
                                          currentRefData: null,
                                          formRefType: pageSheetTypeName === 'page-rfa' ? 'form-submit-RFA' : 'form-submit-multi-type',
                                          isFormEditting: false,
                                       },
                                    });
                                 };
                              }}
                           />
                           <DividerRibbon />
                        </>
                     )}



                  {projectIsAppliedRfaView && stateRow.rfaStatistics && (
                     <>
                        {Object.keys(stateRow.rfaStatistics).map((item, i) => {
                           return (
                              <DataStatisticRibbon
                                 item={item}
                                 key={i}
                                 onClickQuickFilter={onClickQuickFilter}
                                 filterState={stateRow.modeFilter}
                              />
                           )
                        })}
                        <DividerRibbon />
                     </>
                  )}

                  {isAdmin && (
                     <div style={{ display: 'flex' }}>
                        <ButtonAdminCreateAndUpdateRows />
                        <ButtonAdminCreateAndUpdateRowsHistory />

                     </div>
                  )}


                  <div style={{ position: 'absolute', display: 'flex', right: 30 }}>
                     {(pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam') && (
                        <DrawingStatusStatisticRight
                           onClickquickFilterStatus={onClickquickFilterStatus}
                           stateRow={stateRow}
                           pageSheetTypeName={pageSheetTypeName}
                        />
                     )}
                     <div style={{ fontSize: 25, color: colorType.primary, marginTop: -5, paddingTop: 0 }}>{projectName}</div>
                  </div>
               </>
            )}
         </ButtonBox>


         <div style={{ display: 'flex', overflowX: 'hidden', height: currentWindow.height - offsetHeight }}>

            {pageSheetTypeName !== 'page-data-entry' && projectIsAppliedRfaView && (
               <div style={{ width: sideBarWidth, background: colorType.primary }}>
                  {(
                     (role !== 'Consultant' && role !== 'Client')
                        ? ['side-dms', 'side-rfa', 'side-rfam', 'side-rfi', 'side-cvi', 'side-dt', 'side-mm']
                        : ['side-rfa', 'side-rfam', 'side-rfi', 'side-cvi', 'side-dt', 'side-mm']
                  ).map((btnType, i) => {
                     return (
                        <IconSidePanel
                           key={i}
                           type={btnType}
                           onClick={() => switchToOtherPage(btnType)}
                           isLocked={
                              pageSheetTypeName.slice(5, pageSheetTypeName.length) === btnType.slice(5, btnType.length) ||
                              (pageSheetTypeName.slice(5, pageSheetTypeName.length) === 'spreadsheet' && btnType.slice(5, btnType.length) === 'dms')
                           }
                        />
                     )
                  })}
               </div>
            )}




            {!loading ? (
               <TableStyled
                  dataForStyled={{ stateProject, randomColorRange, randomColorRangeStatus, cellSearchFound, cellHistoryFound }}
                  ref={tableRef}
                  fixed
                  projectIsAppliedRfaView={projectIsAppliedRfaView}
                  pageSheetTypeName={pageSheetTypeName}

                  columns={renderColumns(
                     (projectIsAppliedRfaView && (pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry')) ? headersAllFormViewArray : stateProject.userData.headersShown,
                     (projectIsAppliedRfaView && (pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry')) ? nosColumnFixedRfaView : stateProject.userData.nosColumnFixed
                  )}

                  data={arrangeDrawingTypeFinal(stateRow, companies, company, roleTradeCompany.role, pageSheetTypeName)}
                  expandedRowKeys={expandedRows}

                  expandColumnKey={
                     (projectIsAppliedRfaView && (pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry'))
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


         {(stateRow && (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry')) && (
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
                  resetAllPanelInitMode();
               };
            }}
            destroyOnClose={true}
            centered={true}
            width={
               panelSettingType === 'addDrawingType-ICON' ? currentWindow.width * 0.85 :
                  (
                     (panelSettingType && (panelSettingType.includes('form-submit-') || panelSettingType.includes('form-resubmit-') || panelSettingType.includes('form-reply-')))) ? currentWindow.width * 0.9 :
                     panelSettingType === 'pickTypeTemplate-ICON' ? currentWindow.width * 0.6 :
                        panelSettingType === 'View Drawing Revision' ? currentWindow.width * 0.8 :
                           panelSettingType === 'filter-ICON' ? currentWindow.width * 0.5 :
                              panelSettingType === 'history-ICON' ? currentWindow.width * 0.8 :
                                 550
            }
         >
            <PanelSetting
               panelType={panelType}
               panelSettingType={panelSettingType}
               commandAction={commandAction}
               onClickCancelModal={() => {
                  resetAllPanelInitMode();
                  getSheetRows({
                     ...stateRow,
                     currentRefToAddNewOrReplyOrEdit: null
                  });
               }}
               setLoading={setLoading}
               buttonPanelFunction={buttonPanelFunction}
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
      justify-content: center;
   }
`;
const ButtonBox = styled.div`
   width: 100%;
   height: 46px;
   position: relative;
   display: flex;
   padding-top: 7px;
   padding-bottom: 7px;
   padding-left: 7px;
   background: ${colorType.grey4};
`;


export const getInputDataInitially = (data, { role, company }, pageSheetTypeName, projectTree) => {


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
         currentRefToAddNewOrReplyOrEdit: null,
         rfaStatistics,
         isShowAllConsultant: false,
         loading: false
      };

   } else if (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') {

      const { rows, publicSettings, userSettings } = data;

      const { drawingTypeTree, sheetId } = publicSettings;


      // DATA-ENTRY
      const newRowInitDataEntry = createRowsInit(sheetId, 1)[0];
      const dataEntrySheetInitState = (drawingTypeTree.length === 0 && rows.length === 0 && pageSheetTypeName === 'page-data-entry');

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

         rowsAll: dataEntrySheetInitState ? [newRowInitDataEntry] : [...rowsAllOutput, ...rowsToAdd], // HANDLE_ROWS_CAN_NOT_MATCH_PARENT
         rowsVersionsToSave: [],

         viewTemplates,
         viewTemplateNodeId,
         drawingTypeTree: [...drawingTypeTree, ...treeNodesToAdd], // HANDLE_ROWS_CAN_NOT_MATCH_PARENT
         drawingTypeTreeInit: drawingTypeTree,
         drawingsTypeDeleted: [],
         drawingsTypeNewIds: [...treeNodesToAdd.map(x => x.id)], // HANDLE_ROWS_CAN_NOT_MATCH_PARENT

         rowsDeleted: [],
         idRowsNew: dataEntrySheetInitState ? [newRowInitDataEntry.id] : [],
         rowsUpdatePreRowOrParentRow: dataEntrySheetInitState ? { [newRowInitDataEntry.id]: newRowInitDataEntry } : { ...rowsUpdatePreOrParent }, // HANDLE_ROWS_CAN_NOT_MATCH_PARENT
         rowsUpdateSubmissionOrReplyForNewDrawingRev: [],

         rowsSelected: [],
         rowsSelectedToMove: [],

      };
   } else if (
      pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi' || pageSheetTypeName === 'page-cvi' ||
      pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm'
   ) {

      const keySuffix = pageSheetTypeName === 'page-rfam' ? 'Rfam'
         : pageSheetTypeName === 'page-cvi' ? 'Cvi'
            : pageSheetTypeName === 'page-rfi' ? 'Rfi'
               : pageSheetTypeName === 'page-dt' ? 'Dt'
                  : 'Mm';

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
         projectTree,


      };
   }
};




const arrangeDrawingTypeFinal = (stateRow, companies, company, role, pageSheetTypeName) => {

   const {
      rowsAll, drawingTypeTree, viewTemplateNodeId,
      modeFilter, modeGroup, modeSort, modeSearch,

      rowsRfaAll, rowsRfamAll, rowsRfiAll, rowsCviAll, rowsDtAll, rowsMmAll
   } = stateRow;

   const refType = getKeyTextForSheet(pageSheetTypeName);

   if (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') {

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

      if (drawingTypeTreeTemplate.length === 0) {
         return rowsAllInTemplate;
      } else {
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
      };



   } else if (
      pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi' ||
      pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm'
   ) {
      let rowsAllFinalMultiForm = pageSheetTypeName === 'page-rfa' ? rowsRfaAll
         : pageSheetTypeName === 'page-rfam' ? rowsRfamAll
            : pageSheetTypeName === 'page-rfi' ? rowsRfiAll
               : pageSheetTypeName === 'page-cvi' ? rowsCviAll
                  : pageSheetTypeName === 'page-dt' ? rowsDtAll
                     : rowsMmAll;

      if (Object.keys(modeSearch).length === 2) {
         const { isFoundShownOnly, searchDataObj } = modeSearch;
         if (isFoundShownOnly === 'show found only') {
            rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(row => row.id in searchDataObj);
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
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const arrayCompanyFilter = filterObj[header];
                  const { replyCompany } = getConsultantReplyData(r, header, companies);
                  return arrayCompanyFilter.indexOf(replyCompany) !== -1;
               });

            } else if (header === `Overdue ${refType.toUpperCase()}`) {

               let outputDrawingsAfterFilter = [];
               filterObj[header].forEach(filterData => {
                  if (filterData === 'Overdue' || filterData === 'Due in 3 days') {
                     outputDrawingsAfterFilter = [
                        ...outputDrawingsAfterFilter,
                        ...rowsAllFinalMultiForm.filter(r => {

                           const leadConsultant = pageSheetTypeName === 'page-rfa'
                              ? getInfoValueFromRfaData(r, 'submission', 'consultantMustReply')[0]
                              : getInfoValueFromRefDataForm(r, 'submission', refType, 'consultantMustReply')[0];

                           const replyStatusValue = pageSheetTypeName === 'page-rfa'
                              ? getInfoValueFromRfaData(r, 'reply', 'status', leadConsultant)
                              : getInfoValueFromRefDataForm(r, 'reply', refType, 'status', leadConsultant);

                           let nosOfDate;

                           if (!replyStatusValue) {
                              nosOfDate = pageSheetTypeName === 'page-rfa'
                                 ? compareDates(r['Consultant Reply (T)'])
                                 : compareDatesMultiForm(getInfoValueFromRefDataForm(r, 'submission', refType, 'due'))
                           };
                           return filterData === 'Overdue' ? nosOfDate < 0 : nosOfDate < 3;
                        })];

                  } else if (filterData === `${refType.toUpperCase()} outstanding`) {

                     outputDrawingsAfterFilter = [
                        ...outputDrawingsAfterFilter,
                        ...rowsAllFinalMultiForm.filter(r => {
                           let replyStatusValue;
                           if (role === 'Consultant') {
                              replyStatusValue = pageSheetTypeName === 'page-rfa'
                                 ? getInfoValueFromRfaData(r, 'reply', 'status', company)
                                 : getInfoValueFromRefDataForm(r, 'reply', refType, 'status', company);

                              const consultantMustReply = pageSheetTypeName === 'page-rfa'
                                 ? getInfoValueFromRfaData(r, 'submission', 'consultantMustReply')
                                 : getInfoValueFromRefDataForm(r, 'submission', refType, 'consultantMustReply');

                              return !replyStatusValue && consultantMustReply.indexOf(company) !== -1;

                           } else {

                              const leadConsultant = pageSheetTypeName === 'page-rfa'
                                 ? getInfoValueFromRfaData(r, 'submission', 'consultantMustReply')[0]
                                 : getInfoValueFromRefDataForm(r, 'submission', refType, 'consultantMustReply')[0];

                              replyStatusValue = pageSheetTypeName === 'page-rfa'
                                 ? getInfoValueFromRfaData(r, 'reply', 'status', leadConsultant)
                                 : getInfoValueFromRefDataForm(r, 'reply', refType, 'status', leadConsultant);
                              return !replyStatusValue;
                           };
                        })];
                  };
               });
               rowsAllFinalMultiForm = outputDrawingsAfterFilter;
            } else if (header === 'Requested By') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const requestedBy = pageSheetTypeName === 'page-rfa'
                     ? getInfoValueFromRfaData(r, 'submission', 'requestedBy')
                     : getInfoValueFromRefDataForm(r, 'submission', refType, 'requestedBy')
                  return filterObj[header].indexOf(requestedBy) !== -1;
               });
            } else if (header === 'Signatured By') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const signaturedBy = getInfoValueFromRefDataForm(r, 'submission', refType, 'signaturedBy')
                  return filterObj[header].indexOf(signaturedBy) !== -1;
               });
            } else if (header === 'Submission Type') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const submissionType = getInfoValueFromRefDataForm(r, 'submission', refType, 'submissionType')
                  return filterObj[header].indexOf(submissionType) !== -1;
               });
            } else if (header === 'Submission Date') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const submissionDate = pageSheetTypeName === 'page-rfa'
                     ? r['Drg To Consultant (A)']
                     : moment(getInfoValueFromRefDataForm(r, 'submission', refType, 'date')).format('DD/MM/YY');
                  return filterObj[header].indexOf(submissionDate) !== -1;
               });
            } else if (header === 'Conversation Date') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const dateConversation = getInfoValueFromRefDataForm(r, 'submission', refType, 'dateConversation')
                     ? moment(getInfoValueFromRefDataForm(r, 'submission', refType, 'dateConversation')).format('DD/MM/YY')
                     : '';
                  return filterObj[header].indexOf(dateConversation) !== -1;
               });
            } else if (header === 'Due Date') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const dueDate = pageSheetTypeName === 'page-rfa'
                     ? r['Consultant Reply (T)']
                     : (
                        getInfoValueFromRefDataForm(r, 'submission', refType, 'due')
                           ?
                           moment(getInfoValueFromRefDataForm(r, 'submission', refType, 'due')).format('DD/MM/YY')
                           : ''
                     );
                  return filterObj[header].indexOf(dueDate) !== -1;
               });
            } else if (header === 'Cost Implication') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const isCostImplication = getInfoValueFromRefDataForm(r, 'submission', refType, 'isCostImplication') ? 'True' : 'False';
                  return filterObj[header].indexOf(isCostImplication) !== -1;
               });
            } else if (header === 'Time Extension') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const isTimeExtension = getInfoValueFromRefDataForm(r, 'submission', refType, 'isTimeExtension') ? 'True' : 'False';
                  return filterObj[header].indexOf(isTimeExtension) !== -1;
               });
            } else if (header === 'Attachment Type') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const herewithForDt = getInfoValueFromRefDataForm(r, 'submission', refType, 'herewithForDt');
                  return filterObj[header].indexOf(herewithForDt) !== -1;
               });
            } else if (header === 'Transmitted For') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const transmittedForDt = getInfoValueFromRefDataForm(r, 'submission', refType, 'transmittedForDt');
                  return filterObj[header].indexOf(transmittedForDt) !== -1;
               });
            } else if (header === 'Status' && pageSheetTypeName === 'page-rfam') {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => {
                  const consultantLead = getInfoValueFromRefDataForm(r, 'submission', refType, 'consultantMustReply')[0];
                  const replyStatus = getInfoValueFromRefDataForm(r, 'reply', refType, 'status', consultantLead);
                  return filterObj[header].indexOf(replyStatus) !== -1;
               });
            } else {
               rowsAllFinalMultiForm = rowsAllFinalMultiForm.filter(r => filterObj[header].indexOf(r[header]) !== -1);
            };
         });
      };

      if (modeFilter.find(x => x.isIncludedParent === 'not included')) return rowsAllFinalMultiForm;

      let dataOutputFinal = [];
      drawingTypeTree.forEach(item => {
         let newItem = { ...item };
         let rowsChildren = [];

         if (pageSheetTypeName === 'page-rfa') {
            rowsChildren = rowsAllFinalMultiForm.filter(r => r['rfaNumber'] === item.id);
         } else {
            rowsChildren = rowsAllFinalMultiForm.filter(r => r.parentId === item.id);
         };

         if (rowsChildren.length > 0) {
            newItem.children = rowsChildren;
         };
         dataOutputFinal.push(newItem);
      });
      const outputMultiForm = convertFlattenArraytoTree1(dataOutputFinal);

      return outputMultiForm;
   };
};


const createRowsInit = (sheetId, nos) => {
   const idsArr = genId(nos);
   return idsArr.map((id, i) => {
      return ({
         id, _rowLevel: 1,
         _parentRow: sheetId,
         _preRow: i === 0 ? null : idsArr[i - 1]
      });
   });
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
   const { headers } = publicSettings;


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

   if (treeTemp.length === 0) {
      return rowsAll;
   } else {
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
   if (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm') return [];
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
         'Contract Specification',
         'Proposed Specification',
         'Requested By',
         'Signatured By',
         'Submission Date',
         'Submission Type',
         'Due Date'
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
   } else if (pageSheetTypeName === 'page-mm') {
      return [
         'MM Ref',
         'Submission Date',
         'Conversation Date',
         'Description',
      ];
   } else {
      return [];
   };
};


const DataStatisticRibbon = ({ onClickQuickFilter, item, filterState }) => {


   const textInfo = item === 'noOfRfaOverdue'
      ? 'Overdue'
      : item === 'noOfRfaOverdueNext3Days'
         ? 'Due in 3 days'
         : item === 'noOfRfaOutstanding'
            ? 'RFA outstanding'
            : ''

   const { state: stateRow } = useContext(RowContext);

   return (
      <div style={{
         marginLeft: 7, marginRight: 2,
         marginTop: 7,
         display: 'flex',
         cursor: 'pointer',
         paddingLeft: 5, paddingRight: 5, height: 20, borderRadius: 3,
         background: filterState.find(x => x['header'] === 'Overdue RFA' && x.value === textInfo) ? colorType.grey1 : 'transparent'
      }} onClick={() => onClickQuickFilter(item)}>
         <div
            style={{
               width: 8,
               height: 8,
               borderRadius: '50%',
               background: item === 'noOfRfaOverdue' ? colorType.red : item === 'noOfRfaOverdueNext3Days' ? 'yellow' : colorType.primary,
               transform: 'translate(0, 6px)',
               marginRight: 5
            }}
         />
         <span style={{ fontWeight: 'bold', marginRight: 4, fontSize: 12 }}>{stateRow.rfaStatistics[item]}</span>
         <span style={{ fontSize: 12 }}>{textInfo}</span>
      </div>
   );
};



const DrawingStatusStatisticRight = ({ onClickquickFilterStatus, stateRow, pageSheetTypeName }) => {

   const { modeFilter } = stateRow;

   const rowsToFilter = pageSheetTypeName === 'page-spreadsheet' ? stateRow.rowsAll
      : pageSheetTypeName === 'page-rfa' ? stateRow.rowsRfaAll
         : pageSheetTypeName === 'page-rfam' ? stateRow.rowsRfamAll
            : [];

   return (
      <div style={{ display: 'flex', marginRight: 25, transform: 'translate(0, 5px)' }}>
         {rowsToFilter && [
            'Approved for Construction',
            'Approved with Comment, no submission Required',
            'Approved with comments, to Resubmit',
            'Reject and resubmit',
            'Consultant reviewing'
         ].map(btn => (
            <div
               style={{
                  display: 'flex', paddingLeft: 5, paddingRight: 5, marginRight: 7, cursor: 'pointer', height: 20, borderRadius: 3,
                  background: modeFilter.find(x => x['header'] === 'Status' && x.value === btn) ? colorType.grey1 : 'transparent'
               }}
               onClick={() => onClickquickFilterStatus(btn)}
               key={btn}
            >
               <div style={{ width: 10, height: 10, marginRight: 5, background: colorTextRow[btn], transform: 'translate(0, 6px)' }} />
               <div style={{ fontSize: 12, paddingTop: 1 }}>
                  <span style={{ fontWeight: 'bold', marginRight: 3 }}>
                     {pageSheetTypeName === 'page-rfam'
                        ? rowsToFilter.filter(r => {
                           const consultantLead = getInfoValueFromRefDataForm(r, 'submission', 'rfam', 'consultantMustReply')[0];
                           return getInfoValueFromRefDataForm(r, 'reply', 'rfam', 'status', consultantLead) === btn;
                        }).length
                        : rowsToFilter.filter(r => r['Status'] === btn).length
                     }
                  </span>
                  {btn === 'Approved with Comment, no submission Required' ? 'AC'
                     : btn === 'Approved with comments, to Resubmit' ? 'AC, resubmit'
                        : btn === 'Approved for Construction' ? 'Approved'
                           : btn === 'Consultant reviewing' ? 'UR'
                              : 'Reject'}
               </div>
            </div>
         ))}
      </div>
   )
};






export const converHeaderForDataEntryOutput = (headers) => {
   return headers.map(hd => {
      const obj = { ...hd };
      obj.id = obj.key;
      obj.name = obj.text;

      delete obj.key;
      delete obj.text;
      return obj;
   });
};

export const convertDataEntryInput = (inputData) => {
   const { publicSettings, userSettings, rows } = inputData;

   const { headers } = publicSettings;
   const headersOutput = headers.map(hd => {
      const obj = { ...hd };
      obj.key = obj.id;
      obj.text = obj.name;
      delete obj.id;
      delete obj.name;
      return obj;
   });


   const rowsOutput = rows.map(r => {
      const obj = {
         id: r._id,
         _rowLevel: r.level,
         _preRow: r.preRow,
         _parentRow: r.parentRow
      };

      for (const key in r) {
         if (key !== '_id' && key !== 'data' && key !== 'level' && key !== 'preRow' && key !== 'parentRow') {
            obj[key] = r[key];
         };
      };

      const data = r.data || {};
      for (const key in data) {
         const headerFound = headersOutput.find(hd => hd.key === key);
         if (headerFound) {
            obj[headerFound.text] = data[key];
         };
      };
      return obj;
   });


   return {
      publicSettings: {
         headers: headersOutput,
         sheetId: publicSettings.sheetId,
         drawingTypeTree: publicSettings.drawingTypeTree,
         activityRecorded: publicSettings.activityRecorded,
      },
      userSettings,
      rows: rowsOutput
   };
};








