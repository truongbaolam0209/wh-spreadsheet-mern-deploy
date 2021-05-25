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
import { convertCellTempToHistory, debounceFnc, genId, getActionName, groupByHeaders, mongoObjectId, processRowsFromDB, randomColorRange } from '../utils';
import CellHeader from './generalComponents/CellHeader';
import { sortFnc } from './generalComponents/FormSort';
import IconTable from './generalComponents/IconTable';
import InputSearch from './generalComponents/InputSearch';
import ViewTemplateSelect from './generalComponents/ViewTemplateSelect';
import Cell2 from './pageDataEntrySheet/Cell2';
import CellIndex2 from './pageDataEntrySheet/CellIndex2';
import ExcelExport2 from './pageDataEntrySheet/ExcelExport2';
import { convertFlattenArraytoTree1, getTreeFlattenOfNodeInArray } from './pageDataEntrySheet/FormDrawingTypeOrder2';
import PanelFunction2, { getPanelPosition } from './pageDataEntrySheet/PanelFunction2';
import PanelSetting2, { updatePreRowParentRowToState, _processRowsChainNoGroupFnc1 } from './pageDataEntrySheet/PanelSetting2';



const Table = forwardRef((props, ref) => {
   return (
      <AutoResizer>
         {({ width }) => {
            return (
               <BaseTable
                  {...props}
                  ref={ref}
                  height={window.innerHeight - 99.78 - 33.6}
                  width={width}
               />
            );
         }}
      </AutoResizer>
   );
});

let previousDOMCell = null;
let currentDOMCell = null;
let isTyping = false;
let addedEvent = false;


const PageDataEntrySheet = (props) => {

   const {
      role, email, isAdmin, token, sheetDataInput: sheetDataInputRaw, sheetId: projectId, sheetName: projectName,
      cellsHistoryInCurrentSheet, cellOneHistory,
      saveDataToServerCallback, outputDataType
   } = props;


   let sheetDataInput = convertSheetInputRaw(sheetDataInputRaw);
   const result = resolveDataFromProps(sheetDataInput);

   useEffect(() => {
      fetchDataOneSheet({ ...result, email, projectId, projectName, role, token });

      setUserData(getHeadersData(result));

      getSheetRows(getInputDataInitially(result));

      setExpandedRows(getRowsKeyExpanded(
         result.publicSettings.drawingTypeTree,
         result.userSettings ? result.userSettings.viewTemplateNodeId : null
      ));
   }, [sheetDataInputRaw]);



   const handlerBeforeUnload = (e) => {
      if (window.location.pathname === '/data-entry-sheet') {
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

   const tableRef = useRef();
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


   const { state: stateCell, setCellActive, OverwriteCellsModified, copyTempData, applyActionOnCell } = useContext(CellContext);
   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject, fetchDataOneSheet, setUserData } = useContext(ProjectContext);


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


   // useEffect(() => console.log('STATE-CELL...', stateCell), [stateCell]);
   // useEffect(() => console.log('STATE-ROW...', stateRow), [stateRow]);
   useEffect(() => console.log('STATE-PROJECT...', stateProject), [stateProject]);


   const [cursor, setCursor] = useState(null);
   const [panelType, setPanelType] = useState(null);
   const [panelSettingType, setPanelSettingType] = useState(null);
   const [panelFunctionVisible, setPanelFunctionVisible] = useState(false);
   const [panelSettingVisible, setPanelSettingVisible] = useState(false);

   const [expandedRows, setExpandedRows] = useState([]);
   const [expandColumnKey, setExpandColumnKey] = useState(null);
   const [cellSearchFound, setCellSearchFound] = useState(null);
   const [cellHistoryFound, setCellHistoryFound] = useState(null);


   const buttonPanelFunction = (btn) => {
      let { rowsAll, rowsUpdatePreRowOrParentRow, rowsSelected, rowsSelectedToMove } = stateRow;

      setPanelFunctionVisible(false);
      setCellHistoryFound(null);

      if (btn === 'Move Drawings') {
         if (stateRow.rowsSelected.length > 0) {
            getSheetRows({ ...stateRow, rowsSelectedToMove: [...rowsSelected] });
         } else {
            const row = rowsAll.find(x => x.id === panelType.cellProps.rowData.id);
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

   const onRightClickCell = (e, cellProps) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setPanelType({ type: 'cell', cellProps });
      setPanelFunctionVisible(true);
   };

   const commandAction = (update) => {
      if (
         update.type === 'add-view-templates' || update.type === 'sort-data' || update.type === 'filter-by-columns' ||
         update.type === 'drawing-data-automation' || update.type === 'create-new-drawing-revisions'
      ) {
         getSheetRows({ ...stateRow, ...update.data });

      } else if (
         update.type === 'insert-drawings' || update.type === 'insert-drawings-by-folder' ||
         update.type === 'duplicate-drawings' || update.type === 'delete-drawing'
      ) {
         getSheetRows({ ...stateRow, ...update.data, modeFilter: [], modeSort: {} });

      } else if (update.type === 'reset-filter-sort') {

         getSheetRows({ ...stateRow, ...update.data });
         setSearchInputShown(false);
         setCellSearchFound(null);

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


      } else if (update.type === 'save-data-successfully') {
         message.success('Save Data Successfully', 1.5);
      } else if (update.type === 'save-data-failure') {
         message.error('Network Error', 1.5);

      } else if (update.type === 'reload-data-from-server') {
         // fetchDataOneSheet({
         //    ...update.data,
         //    email, projectId, projectName, role, token
         // });
         // setUserData(getHeadersData(update.data));
         // getSheetRows(getInputDataInitially(update.data));
         // setExpandedRows(getRowsKeyExpanded(
         //    update.data.publicSettings.drawingTypeTree,
         //    update.data.userSettings.viewTemplateNodeId
         // ));
         // OverwriteCellsModified({});
         // setCellActive(null);
         // setLoading(false);
      };
      setPanelSettingVisible(false);
      setPanelSettingType(null);
      setPanelType(null);
   };
   const onScroll = () => {
      if (stateCell.cellActive) setCellActive(null);
   };













   useEffect(() => {
      // const interval = setInterval(() => {
      //    setPanelFunctionVisible(false);
      //    setPanelSettingType('save-ICON');
      //    setPanelSettingVisible(true);
      // }, 1000 * 60 * 20);
      // return () => clearInterval(interval);
   }, []);


   const updateExpandedRowIdsArray = (viewTemplateNodeId) => {
      setExpandedRows(getRowsKeyExpanded(stateRow.drawingTypeTree, viewTemplateNodeId));
   };



   useEffect(() => {
      if (stateProject.userData) {
         setExpandColumnKey(stateProject.userData.headersShown[0]);
      };
   }, [stateProject.userData]);

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
      const { rowsSelected } = stateRow;

      const valueArr = colorization.value;
      const value = rowData[colorization.header];


      if (rowsSelected.find(x => x.id === rowData.id)) {
         return 'row-selected';
      };
      if (!rowData._rowLevel || rowData._rowLevel < 1) {
         return 'row-drawing-type';
      };


      if (colorization !== null && colorization.header !== 'No Colorization' &&
         valueArr && valueArr.length > 0 && valueArr.indexOf(value) !== -1
      ) {
         if (rowData[colorization.header]) {
            return `colorization-${colorization.header.replace(/\s/g, '').replace(/,/g, '')}-${rowData[colorization.header].replace(/\s/g, '').replace(/,/g, '')}-styled`;
         };
      };
   };


   const [searchInputShown, setSearchInputShown] = useState(false);
   const searchGlobal = debounceFnc((textSearch) => {
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
   }, 500);





   if (
      !sheetDataInput ||
      !sheetDataInput.publicSettings ||
      !sheetDataInput.publicSettings.headers ||
      sheetDataInput.publicSettings.headers.length === 0
   ) {
      return (
         <div style={{
            width: window.innerWidth,
            height: window.innerHeight,
            textAlign: 'center',
            display: 'table-cell',
            verticalAlign: 'middle',
            fontSize: 30
         }}>Please add headers to sheet</div>
      );
   };


   const renderColumns = (headerArr, nosColumnFixed) => {
      let headersObj = [{
         key: 'Index', dataKey: 'Index', title: '', width: 50,
         frozen: Column.FrozenDirection.LEFT,
         cellRenderer: <CellIndex2 />,
         style: { padding: 0, margin: 0 }
      }];

      headerArr.forEach((hd, index) => {
         headersObj.push({
            key: hd, dataKey: hd, title: hd,
            width: widthColumn(stateProject.allDataOneSheet.publicSettings.headers, hd),
            resizable: true,
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            headerRenderer: <CellHeader />,
            cellRenderer: (
               <Cell2
                  setPosition={setPosition}
                  onRightClickCell={onRightClickCell}
                  getCurrentDOMCell={getCurrentDOMCell}
               />
            ),
            className: (props) => {
               const { rowData, column: { key } } = props;
               const { id } = rowData;
               const headerData = stateProject.allDataOneSheet.publicSettings.headers.find(hd => hd.text === key);

               return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                  ? 'cell-found'
                  : (cellHistoryFound && cellHistoryFound.find(cell => cell.rowId === id && cell.header === key))
                     ? 'cell-history-highlight'
                     : (headerData.roleCanEdit.indexOf(role.name) === -1 && rowData._rowLevel)
                        ? 'cell-locked'
                        : '';
            }
         });
      });

      return headersObj;
   };



   const saveDataSheet = () => {

      const { drawingTypeTree, rowsAll, drawingsTypeDeleted, rowsDeleted } = stateRow;
      const { cellsModifiedTemp } = stateCell;
      const { publicSettings } = stateProject.allDataOneSheet;
      const { headers } = publicSettings;


      const rowToSaveArr = rowsAll.map(row => {
         let rowToSave = { _id: row.id, parentRow: row._parentRow, preRow: row._preRow, level: row._rowLevel };
         headers.forEach(hd => {
            rowToSave.data = { ...rowToSave.data || {}, [hd.text]: row[hd.text] || '' };
         });
         return rowToSave;
      });

      
      saveDataToServerCallback({
         drawingTypeTree,
         rowsAll: rowToSaveArr,
         drawingsTypeDeleted,
         rowsDeleted,
         cellHistory: convertCellTempToHistory(cellsModifiedTemp, stateProject, true)
      });
   };




   return (
      <div
         onContextMenu={(e) => e.preventDefault()}
      >
         <ButtonBox>
            <IconTable type='save' onClick={saveDataSheet} />
            <DividerRibbon />
            <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} />
            <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
            <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
            <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />

            {searchInputShown
               ? <InputSearch searchGlobal={searchGlobal} />
               : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

            {stateRow && stateRow.modeGroup.length > 0 ? (
               <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-1')} />
            ) : (
               <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-2')} />
            )}

            <DividerRibbon />
            <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />
            <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
            <DividerRibbon />
            <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
            <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />
            <ExcelExport2 fileName={projectName} />
            <DividerRibbon />
            <IconTable type='plus' onClick={() => buttonPanelFunction('viewTemplate-ICON')} />
            <ViewTemplateSelect updateExpandedRowIdsArray={updateExpandedRowIdsArray} />
            <DividerRibbon />
            {isAdmin && (
               <div style={{ display: 'flex' }}>
                  {/* <IconTable type='delete' onClick={() => adminFncServerInit('delete-all-collections')} /> */}
               </div>
            )}
         </ButtonBox>


         {stateProject.allDataOneSheet !== null && (
            <TableStyled
               dataForStyled={{
                  stateProject,
                  randomColorRange,
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
               onRowExpand={onRowExpand}
            />
         )}


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
            <PanelFunction2
               panelType={panelType}
               buttonPanelFunction={buttonPanelFunction}
            />
         </ModalStyleFunction>


         <ModalStyledSetting
            title={stateRow && stateRow.modeGroup.length > 0 ? 'Quit Grouping Mode' : getActionName(panelSettingType)}
            visible={panelSettingVisible}
            footer={null}
            onCancel={() => {
               setPanelSettingVisible(false);
               setPanelSettingType(null);
               setPanelType(null);
            }}
            destroyOnClose={true}
            centered={true}

            width={
               panelSettingType === 'addDrawingType-ICON' ? window.innerWidth * 0.8 :
                  panelSettingType === 'filter-ICON' ? window.innerWidth * 0.5 :
                     520
            }
         >
            <PanelSetting2
               panelType={panelType}
               panelSettingType={panelSettingType}
               commandAction={commandAction}
               onClickCancelModal={() => {
                  setPanelSettingVisible(false);
                  setPanelSettingType(null);
                  setPanelType(null);
               }}
               outputDataType={outputDataType}
               cellsHistoryInCurrentSheet={cellsHistoryInCurrentSheet}
               cellOneHistory={cellOneHistory}
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
export default PageDataEntrySheet;



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
      font-weight: bold;
   };
   .row-selected {
      background-color: ${colorType.cellHighlighted};
   };
   
   ${({ dataForStyled }) => {
      const { stateProject, randomColorRange } = dataForStyled;
      let colorization = stateProject.userData.colorization;

      const value = colorization.value || [];

      let res = [];
      value.map(n => {
         let color = randomColorRange[value.indexOf(n)];
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
   };
   .BaseTable__header-cell {
      padding: 5px;
      border-right: 1px solid #DCDCDC;
      background: ${colorType.primary};
      color: white
   };
   .BaseTable__row-cell {
      padding: 0;
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
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
   width: 100%;
   position: relative;
   display: flex;
   padding-top: 7px;
   padding-bottom: 7px;
   padding-left: 7px;
   background: ${colorType.grey4};
`;

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
const getInputDataInitially = (data) => {

   const { rows, publicSettings, userSettings } = data;
   const { drawingTypeTree, sheetId } = publicSettings;

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

   const newRows = createRowsInit(sheetId, 1);
   const sheetInitState = (drawingTypeTree.length === 0 && rows.length === 0);

   let rowsAllOutput = getOutputRowsAllSorted(drawingTypeTree, rows);
   const { treeNodesToAdd, rowsToAdd, rowsUpdatePreOrParent } = rearrangeRowsNotMatchTreeNode(rows, rowsAllOutput, drawingTypeTree);

   return {
      rowsAll: sheetInitState ? newRows : [...rowsAllOutput, ...rowsToAdd], // handle rows can not match parent


      viewTemplates,
      viewTemplateNodeId,

      drawingTypeTree: [...drawingTypeTree, ...treeNodesToAdd], // handle rows can not match parent
      drawingTypeTreeInit: drawingTypeTree,
      drawingsTypeDeleted: [],
      drawingsTypeNewIds: [...treeNodesToAdd.map(x => x.id)], // handle rows can not match parent

      rowsDeleted: [],
      idRowsNew: sheetInitState ? newRows.map(r => r.id) : [],
      rowsUpdatePreRowOrParentRow: sheetInitState ? newRows : { ...rowsUpdatePreOrParent }, // handle rows can not match parent

      rowsSelected: [],
      rowsSelectedToMove: [],

      modeFilter,
      modeSort,
      modeSearch: {},
      modeGroup: [],
   };
};

const arrangeDrawingTypeFinal = (stateRow) => {

   const {
      rowsAll, drawingTypeTree, viewTemplateNodeId,
      modeFilter, modeGroup, modeSort, modeSearch
   } = stateRow;

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


   if (drawingTypeTreeTemplate.length === 0) return rowsAllInTemplate;

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
      colorization
   };
};

export const getOutputRowsAllSorted = (drawingTypeTree, rowsAll) => {
   const drawingTypeTreeClone = drawingTypeTree.map(x => ({ ...x }));
   const treeTemp = convertFlattenArraytoTree1(drawingTypeTreeClone);
   if (treeTemp.length === 0) return rowsAll;

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
            title: 'New Folder',
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



export const resolveDataFromProps = (data) => {

   let { rows, publicSettings, userSettings } = data;
   const { headers } = publicSettings;

   headers.forEach(hd => {
      if (!hd.text && !hd.key) {
         hd.text = hd.name;
         hd.key = hd.id;
         delete hd.name;
         delete hd.id;
      };
   });

   const rowsOutput = processRowsFromDB(headers, rows);

   return {
      rows: rowsOutput,
      publicSettings,
      userSettings
   };
};



const convertSheetInputRaw = (data) => {

   if (!data.publicSettings) return {};

   return {
      rows: (!data.rows || data.rows.length === 0) ? [] : data.rows.map(x => ({ ...x })),
      publicSettings: {
         sheetId: data.publicSettings ? data.publicSettings.sheetId : null,
         headers: data.publicSettings.headers ? data.publicSettings.headers.map(x => ({ ...x })) : [],
         drawingTypeTree: data.publicSettings.drawingTypeTree ? data.publicSettings.drawingTypeTree.map(x => ({ ...x })) : [],
         activityRecorded: data.publicSettings.activityRecorded ? data.publicSettings.activityRecorded.map(x => ({ ...x })) : [],
      },
      userSettings: {}
   };
};





const widthColumn = (headers, hd) => {
   const type = headers.find(x => x.text === hd).type;
   return type === 'date' ? 95 : type === 'checkbox' ? 50 : hd.length * 25
};











