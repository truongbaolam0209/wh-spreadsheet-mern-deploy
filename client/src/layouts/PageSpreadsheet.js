import { Divider, Icon, message, Modal } from 'antd';
import Axios from 'axios';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../constants';
import { Context as CellContext } from '../contexts/cellContext';
import { Context as ProjectContext } from '../contexts/projectContext';
import { Context as RowContext } from '../contexts/rowContext';
import { debounceFnc, getActionName, getHeaderWidth, getModalWidth, mongoObjectId, randomColorRange, randomColorRangeStatus } from '../utils';
import ButtonAdminUploadData from './pageSpreadsheet/ButtonAdminUploadData';
import ButtonAdminUploadDataPDD from './pageSpreadsheet/ButtonAdminUploadDataPDD';
import ButtonAdminUploadRows from './pageSpreadsheet/ButtonAdminUploadRows';
import Cell, { columnLocked, rowLocked } from './pageSpreadsheet/Cell';
import CellHeader from './pageSpreadsheet/CellHeader';
import CellIndex from './pageSpreadsheet/CellIndex';
import ExportCSV from './pageSpreadsheet/ExportCSV';
import { convertFlattenArraytoTree1, getTreeFlattenOfNodeInArray } from './pageSpreadsheet/FormDrawingTypeOrder';
import IconTable from './pageSpreadsheet/IconTable';
import InputSearch from './pageSpreadsheet/InputSearch';
import PanelFunction, { getPanelPosition } from './pageSpreadsheet/PanelFunction';
import PanelSetting, { updatePreRowParentRowToState, _processRowsChainNoGroupFnc1 } from './pageSpreadsheet/PanelSetting';
import ViewTemplateSelect from './pageSpreadsheet/ViewTemplateSelect';





const Table = forwardRef((props, ref) => {
   return (
      <AutoResizer>
         {() => <BaseTable
            {...props}
            ref={ref}
            width={window.innerWidth}
            height={window.innerHeight - 99.78}
         />}
      </AutoResizer>
   );
});

let previousDOMCell = null;
let currentDOMCell = null;
let isTyping = false;
let addedEvent = false;


const PageSpreadsheet = (props) => {


   let { email, role, isAdmin, projectId, projectName, token, company, companies } = props;
   const roleTradeCompany = getUserRoleTradeCompany(role, company);

   const tableRef = useRef();

   const handlerBeforeUnload = (e) => {
      if (window.location.pathname === '/drawing-edit') {
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




   const { state: stateCell, setCellActive, OverwriteCellsModified, copyTempData, pasteTempData, applyActionOnCell } = useContext(CellContext);
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
      let { rowsAllInit, rowsUpdatePreRowOrParentRow, rowsSelected, rowsSelectedToMove } = stateRow;
      setPanelFunctionVisible(false);

      if (btn === 'Move Drawings') {
         if (stateRow.rowsSelected.length > 0) {
            getSheetRows({ ...stateRow, rowsSelectedToMove: [...rowsSelected] });
         } else {
            const row = rowsAllInit.find(x => x.id === panelType.cellProps.rowData.id);
            getSheetRows({ ...stateRow, rowsSelectedToMove: [row] });
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
               const rowBelowPrevious = rowsAllInit.find(r => r._preRow === row.id);
               if (rowBelowPrevious) {
                  rowBelowPrevious._preRow = row._preRow;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelowPrevious);
               };
            });
            if (rowData.treeLevel) {
               const lastRowOfBranch = rowsAllInit.find(r => r._parentRow === rowData.id && !rowsAllInit.find(x => x._preRow === r.id));
               rowsSelectedToMove.forEach((row, i) => {
                  row._preRow = i === 0 ? (lastRowOfBranch ? lastRowOfBranch.id : null) : rowsSelectedToMove[i - 1].id;
                  row._parentRow = rowData.id;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
               });
            } else {
               const rowBelowNext = rowsAllInit.find(r => r._preRow === rowData.id);
               if (rowBelowNext) {
                  rowBelowNext._preRow = stateRow.rowsSelectedToMove[stateRow.rowsSelectedToMove.length - 1];
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelowNext);
               };
               rowsSelectedToMove.forEach((row, i) => {
                  row._preRow = i === 0 ? rowData.id : rowsSelectedToMove[i - 1].id;
                  row._parentRow = rowData._parentRow;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
               });
            };
            const rowsOutput = _processRowsChainNoGroupFnc1([...rowsAllInit]);
            getSheetRows({
               ...stateRow,
               rowsAll: rowsOutput,
               rowsAllInit: rowsOutput,
               rowsUpdatePreRowOrParentRow,
               rowsSelectedToMove: [],
               rowsSelected: []
            });
         };

      } else {
         getSheetRows({
            ...stateRow,
            rowsSelected: [],
            rowsSelectedToMove: []
         });
         setCellActive(null);
         copyTempData(null);
         applyActionOnCell(null);

         setPanelSettingType(btn);
         setPanelSettingVisible(true);
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
         update.type === 'insert-drawings' || update.type === 'insert-drawings-by-folder' || update.type === 'duplicate-drawings' ||
         update.type === 'delete-drawing' || update.type === 'add-view-templates' || update.type === 'sort-data-drawing-type' ||
         update.type === 'sort-data-project' || update.type === 'drawing-data-automation' || update.type === 'create-new-drawing-revisions'
      ) {
         getSheetRows({ ...stateRow, ...update.data });

      } else if (update.type === 'filter-by-columns') {
         const { rowsAll, modeFilter } = update.data;
         if (rowsAll.length > 0 && Object.keys(modeFilter).length > 0) {
            getSheetRows({ ...stateRow, ...update.data });

         } else if (rowsAll.length === 0 && Object.keys(modeFilter).length > 0) {
            message.info('There is no drawing found', 1.5);
         };

      } else if (update.type === 'reset-filter-sort') {
         getSheetRows({ ...stateRow, ...update.data });
         setExpandedRows(getRowsKeyExpanded(stateRow.drawingTypeTree, stateRow.viewTemplateNodeId));
         setSearchInputShown(false);
         setCellSearchFound(null);
         setCellHistoryFound(null);

      } else if (update.type === 'reorder-columns' || update.type === 'drawing-colorized') {
         setUserData({ ...stateProject.userData, ...update.data });

      } else if (update.type === 'drawing-folder-organization') {
         getSheetRows({ ...stateRow, ...update.data });
         setExpandedRows(getRowsKeyExpanded(update.data.drawingTypeTree, stateRow.viewTemplateNodeId));

      } else if (update.type === 'group-columns') {
         getSheetRows({ ...stateRow, rowsAll: update.data.rows, showDrawingsOnly: 'group-columns' });
         setExpandedRows(update.data.expandedRows);

      } else if (update.type === 'highlight-cell-history') {
         setCellHistoryFound(update.data);
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });

      } else if (update.type === 'save-data-successfully') {
         message.success('Save Data Successfully', 1.5);
      } else if (update.type === 'save-data-failure') {
         message.error('Network Error', 1.5);

      } else if (update.type === 'reload-data-from-server') {

         fetchDataOneSheet({
            ...update.data,
            email, projectId, projectName, role, token, company, companies, roleTradeCompany
         });
         setUserData(getHeadersData(update.data));
         getSheetRows(getInputDataInitially(update.data));
         setExpandedRows(getRowsKeyExpanded(update.data.publicSettings.drawingTypeTree, update.data.userSettings.viewTemplateNodeId));
         OverwriteCellsModified({});
         setCellActive(null);
         setLoading(false);
      };
      setPanelSettingVisible(false);
      setPanelSettingType(null);
      setPanelType(null);
   };
   const onScroll = () => {
      if (stateCell.cellActive) setCellActive(null);
   };



   // SAVE DATA TO SMART SHEET
   const [state, setstate] = useState(null);
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
            const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });


            fetchDataOneSheet({
               ...res.data,
               email, projectId, projectName, role, token, company, companies, roleTradeCompany
            });
            setUserData(getHeadersData(res.data));
            getSheetRows(getInputDataInitially(res.data));
            setExpandedRows(getRowsKeyExpanded(res.data.publicSettings.drawingTypeTree, res.data.userSettings ? res.data.userSettings.viewTemplateNodeId : null));


            setLoading(false);
         } catch (err) {
            console.log(err);
         };
      };
      fetchOneProject();
   }, []);


   useEffect(() => {
      const interval = setInterval(() => {
         setPanelFunctionVisible(false);
         setPanelSettingType('save-ICON');
         setPanelSettingVisible(true);
      }, 1000 * 60 * 20);
      return () => clearInterval(interval);
   }, []);

   const updateExpandedRowIdsArray = (viewTemplateNodeId) => {
      setExpandedRows(getRowsKeyExpanded(stateRow.drawingTypeTree, viewTemplateNodeId));
   };


   const [expandedRows, setExpandedRows] = useState([]);
   const [expandColumnKey, setExpandColumnKey] = useState('Drawing Number');
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
         <div style={{
            marginLeft: indent,
            paddingLeft: expandable ? 10 : 13 + 10,
            paddingRight: 3,
            background: 'transparent'
         }}>
            {expandable && (
               <Icon
                  type={expanding ? 'plus-square' : 'minus-square'}
                  onClick={() => onExpand(expanding)}
                  style={{ color: 'black', transform: 'translate(0, -1px)' }}
               />
            )}
         </div>
      );
   };
   const expandIconProps = (props) => {
      return ({ expanding: !props.expanded });
   };
   const rowClassName = (props) => {
      const { rowData } = props;
      const { colorization } = stateProject.userData;
      const { rowsSelected, showDrawingsOnly, drawingTypeTree } = stateRow;

      const valueArr = colorization.value;
      const value = rowData[colorization.header];

      const isRowLocked = rowLocked(roleTradeCompany, rowData, showDrawingsOnly, drawingTypeTree);

      if (rowsSelected.find(x => x.id === rowData.id)) {
         return 'row-selected';
      };
      if (!rowData._rowLevel || rowData._rowLevel < 1) {
         return 'row-drawing-type';
      };
      if (isRowLocked) {
         return 'row-locked';
      };

      if (colorization !== null && colorization.header !== 'No Colorization' &&
         valueArr && valueArr.length > 0 && valueArr.indexOf(value) !== -1
      ) {
         if (rowData[colorization.header]) {
            return `colorization-${colorization.header.replace(/\s/g, '').replace(/,/g, '')}-${rowData[colorization.header].replace(/\s/g, '').replace(/,/g, '')}-styled`;
         };
      };
   };


   // const rowProps = (props) => {
   //    const { rowsSelected } = stateRow;
   //    const { rowData } = props;
   //    return {
   //       className: 'className',
   //       rowData: 'rowData'
   //    };
   // };



   const [searchInputShown, setSearchInputShown] = useState(false);
   const searchGlobal = debounceFnc((found) => {
      setCellSearchFound(found);
      setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
      setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });
   }, 500);

   const renderColumns = (arr, nosColumnFixed) => {

      let headersObj = [{
         key: 'Index', dataKey: 'Index', title: '', width: 50,
         frozen: Column.FrozenDirection.LEFT,
         cellRenderer: <CellIndex />,
         style: { padding: 0, margin: 0 }
      }];
      arr.forEach((hd, index) => {
         headersObj.push({
            key: hd, dataKey: hd, title: hd,
            width: getHeaderWidth(hd),
            resizable: true,
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            headerRenderer: (
               <CellHeader
                  onMouseDownColumnHeader={onMouseDownColumnHeader}
               />
            ),
            cellRenderer: (
               <Cell
                  setPosition={setPosition}
                  onRightClickCell={onRightClickCell}
                  getCurrentDOMCell={getCurrentDOMCell}
               />
            ),
            className: (props) => {
               const { rowData, column: { key } } = props;
               const { id } = rowData;

               return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                  ? 'cell-found'
                  : (cellHistoryFound && cellHistoryFound.find(cell => cell.rowId === id && cell.header === key))
                     ? 'cell-history-highlight'
                     : (columnLocked(roleTradeCompany, rowData, stateRow.showDrawingsOnly, key) && rowData._rowLevel)
                        ? 'cell-locked'
                        : '';
            }
         });
      });
      return headersObj;
   };


   return (

      <div
         onContextMenu={(e) => e.preventDefault()}
      >
         <ButtonBox>
            <IconTable type='save' onClick={() => buttonPanelFunction('save-ICON')} />
            <DividerRibbon />
            <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} />
            <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
            <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
            <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />

            {searchInputShown
               ? <InputSearch searchGlobal={searchGlobal} />
               : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

            <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON')} />
            <DividerRibbon />
            <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />
            <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
            <DividerRibbon />
            <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
            <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />
            <ExportCSV fileName={projectName} />
            <DividerRibbon />
            <IconTable type='plus' onClick={() => buttonPanelFunction('viewTemplate-ICON')} />
            <ViewTemplateSelect updateExpandedRowIdsArray={updateExpandedRowIdsArray} />
            <DividerRibbon />
            {isAdmin && (
               <div style={{ display: 'flex' }}>
                  <IconTable type='delete' onClick={() => adminFncServerInit('delete-all-collections')} />
                  <ButtonAdminUploadData />
                  <ButtonAdminUploadRows />
                  <ButtonAdminUploadDataPDD />
               </div>
            )}

            <div style={{ position: 'absolute', top: 3, right: 30, fontSize: 25, color: colorType.primary }}>{projectName}</div>
         </ButtonBox>




         {!loading ? (
            <TableStyled
               dataForStyled={{
                  stateProject,
                  randomColorRange,
                  randomColorRangeStatus,
                  cellSearchFound,
                  cellHistoryFound
               }}
               ref={tableRef}
               fixed
               columns={renderColumns(
                  stateProject.userData.headersShown,
                  stateProject.userData.nosColumnFixed
               )}
               data={arrangeDrawingTypeFinal(stateRow)}
               expandedRowKeys={expandedRows}

               expandColumnKey={expandColumnKey}

               expandIconProps={expandIconProps}
               components={{ ExpandIcon }}
               rowHeight={30}
               overscanRowCount={0}
               onScroll={onScroll}
               rowClassName={rowClassName}
               // rowProps={rowProps}
               onRowExpand={onRowExpand}
            />
         ) : <LoadingIcon />}


         <ModalStyleFunction
            visible={panelFunctionVisible}
            footer={null}
            onCancel={() => setPanelFunctionVisible(false)}
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


         <ModalStyledSetting
            title={getActionName(panelSettingType)}
            visible={panelSettingVisible}
            footer={null}
            onCancel={() => {
               setPanelSettingVisible(false);
               setPanelSettingType(null);
               setPanelType(null);
            }}
            destroyOnClose={true}
            centered={true}
            width={getModalWidth(panelSettingType)}
            width={panelSettingType === 'addDrawingType-ICON' ? 700 : 520}
         >
            <PanelSetting
               panelType={panelType}
               panelSettingType={panelSettingType}
               commandAction={commandAction}
               onClickCancelModal={() => {
                  setPanelSettingVisible(false);
                  setPanelSettingType(null);
                  setPanelType(null);
               }}
               setLoading={setLoading}

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
export default PageSpreadsheet;



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
      background-color: #FAFAD2
   };
   .row-locked {
      background-color: #FAFAD2
   };
   .row-drawing-type {
      background-color: ${colorType.grey3};
      font-weight: bold;
   };
   .row-selected {
      background-color: ${colorType.cellHighlighted};
   };
   
   
   
   ${({ dataForStyled }) => {
      const { stateProject, randomColorRange, randomColorRangeStatus } = dataForStyled;
      let colorization = stateProject.userData.colorization;

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
   }}

   ${({ dataForStyled }) => {
      const { cellSearchFound } = dataForStyled;
      if (cellSearchFound) return `.cell-found { background-color: #7bed9f; }`;
   }}

   ${({ dataForStyled }) => {
      const { cellHistoryFound } = dataForStyled;
      if (cellHistoryFound) return `.cell-history-highlight { background-color: #f6e58d; }`;
   }}

   
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
      padding: 0;
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
   }
   .BaseTable__table-frozen-left {
      border-right: 4px solid #DCDCDC;
      box-shadow: none;
   }
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
const LoadingIcon = () => {
   return (
      <SpinStyled>
         <Icon type='loading' style={{ fontSize: 40, textAlign: 'center', margin: 'auto' }} />
      </SpinStyled>
   );
};
const SpinStyled = styled.div`
    background: rgba(0, 0, 0, 0.05);
    opacity: 0.7;
    position: fixed;
    top: 0;
    left: 0;
    width: ${`${window.innerWidth}px`};
    height: ${`${window.innerHeight}px`};
    display: flex;
    justify-content: center;
    z-index: 1000;
`;



const getInputDataInitially = (data) => {
   const { rows, publicSettings, userSettings } = data;
   const { drawingTypeTree } = publicSettings;
   let viewTemplates = [];
   let viewTemplateNodeId = null;
   if (userSettings) {
      viewTemplates = userSettings.viewTemplates || [];
      viewTemplateNodeId = userSettings.viewTemplateNodeId || null;
   };

   let rowsAllOutput = getOutputRowsAllSorted(drawingTypeTree, rows);

   const { treeNodesToAdd, rowsToAdd, rowsUpdatePreOrParent } = rearrangeRowsNotMatchTreeNode(rows, rowsAllOutput, drawingTypeTree);


   return {
      rowsAll: [...rowsAllOutput, ...rowsToAdd], // CHECK
      rowsAllInit: [...rowsAllOutput, ...rowsToAdd], // CHECK
      rowsVersionsToSave: [],
      showDrawingsOnly: false,

      viewTemplates,
      viewTemplateNodeId,
      drawingTypeTree: [...drawingTypeTree, ...treeNodesToAdd], // CHECK
      drawingTypeTreeInit: drawingTypeTree,
      drawingsTypeDeleted: [],
      drawingsTypeNewIds: [...treeNodesToAdd.map(x => x.id)], // CHECK

      rowsDeleted: [],
      idRowsNew: [],
      rowsUpdatePreRowOrParentRow: { ...rowsUpdatePreOrParent }, // CHECK

      rowsSelected: [],
      rowsSelectedToMove: [],

      modeFilter: {},

      isRfaView: false
   };
};

const arrangeDrawingTypeFinal = (stateRow) => {
   const { rowsAll, showDrawingsOnly, drawingTypeTree, viewTemplateNodeId } = stateRow;

   let drawingTypeTreeTemplate;
   let rowsAllTemplate;
   const templateNode = drawingTypeTree.find(x => x.id === viewTemplateNodeId);

   if (templateNode) {
      const nodeArray = getTreeFlattenOfNodeInArray(drawingTypeTree, templateNode);
      if (nodeArray.length > 1) {
         drawingTypeTreeTemplate = nodeArray.filter(x => x.id !== templateNode.id);
         rowsAllTemplate = rowsAll.filter(x => drawingTypeTreeTemplate.find(tr => tr.id === x._parentRow));
      } else {
         const parent = nodeArray[0];
         return rowsAll.filter(x => x._parentRow === parent.id);
      };
   } else {
      drawingTypeTreeTemplate = drawingTypeTree.map(x => ({ ...x }));
      rowsAllTemplate = rowsAll.map(x => ({ ...x }));
   };


   if (showDrawingsOnly === 'sort-data-project') return rowsAllTemplate;
   if (showDrawingsOnly === 'group-columns') return rowsAllTemplate;


   let dataOutput = [];
   drawingTypeTreeTemplate.forEach(item => {
      let newItem = { ...item };
      let rowsChildren = rowsAllTemplate.filter(r => r._parentRow === newItem.id);
      if (rowsChildren.length > 0) {
         newItem.children = rowsChildren;
      };
      dataOutput.push(newItem);
   });
   const output = convertFlattenArraytoTree1(dataOutput);
   return output;
};

const getRowsKeyExpanded = (drawingTypeTree, viewTemplateNodeId) => {

   const templateNode = drawingTypeTree.find(x => x.id === viewTemplateNodeId);
   if (templateNode) {
      const drawingTypeTreeTemplate = getTreeFlattenOfNodeInArray(drawingTypeTree, templateNode).filter(x => x.id !== templateNode.id);
      return drawingTypeTreeTemplate.map(x => x.id);
   } else {
      return drawingTypeTree.map(x => x.id);
   };
};


const getHeadersData = (projectData) => {

   const { publicSettings, userSettings } = projectData;
   let { headers } = publicSettings;

   let headersShown, headersHidden, colorization, nosColumnFixed;

   if (!userSettings) {
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
            'Drawing Number': 'New Drawing Type',
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



const getUserRoleTradeCompany = (role, company) => {

   const roleArray = [
      'Document Controller',

      'WH Archi Coordinator',
      'WH C&S Design Engineer',
      'WH M&E Coordinator',
      'WH PRECAST Coordinator',

      'WH Archi Modeller',
      'WH C&S Modeller',
      'WH M&E Modeller',
      'WH PRECAST Modeller',

      'Production',

      'WH Archi Manager',
      'WH C&S Manager',
      'WH M&E Manager',
      'WH PRECAST Manager',

      'Planning Engineer',
      'QS',
      'Project Manager',
      'Corporate Manager',
      'QAQC',
      'Safety',
      'Client',

      'Sub-Con',
      'Consultant',
   ];


   if (
      !role || !company || roleArray.indexOf(role) === -1 ||
      role === 'WH Archi Manager' || role === 'WH C&S Manager' || role === 'WH M&E Manager' || role === 'WH PRECAST Manager' ||
      role === 'Planning Engineer' || role === 'QS' || role === 'Project Manager' || role === 'Corporate Manager' ||
      role === 'Client' || role === 'QAQC' || role === 'Safety'
   ) {
      return { role: 'View-Only User', trade: null, company: null };
   };

   if (role === 'WH Archi Coordinator') return { role: 'Coordinator', trade: 'ARCHI', company };
   if (role === 'WH C&S Design Engineer') return { role: 'Coordinator', trade: 'C&S', company };
   if (role === 'WH M&E Coordinator') return { role: 'Coordinator', trade: 'M&E', company };
   if (role === 'WH PRECAST Coordinator') return { role: 'Coordinator', trade: 'PRECAST', company };

   if (role === 'WH Archi Modeller') return { role: 'Modeller', trade: 'ARCHI', company };
   if (role === 'WH C&S Modeller') return { role: 'Modeller', trade: 'C&S', company };
   if (role === 'WH M&E Modeller') return { role: 'Modeller', trade: 'M&E', company };
   if (role === 'WH PRECAST Modeller') return { role: 'Modeller', trade: 'PRECAST', company };

   return { role, trade: null, company };
};






















