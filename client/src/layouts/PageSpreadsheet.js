import { Divider, Icon, message, Modal } from 'antd';
import Axios from 'axios';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';
import { colorType, dimension, SERVER_URL } from '../constants';
import { Context as CellContext } from '../contexts/cellContext';
import { Context as ProjectContext } from '../contexts/projectContext';
import { Context as RowContext } from '../contexts/rowContext';
import { debounceFnc, getActionName, getCurrentAndHistoryDrawings, getDataConvertedSmartsheet, getHeaderWidth, getModalWidth, randomColorRange, randomColorRangeStatus, reorderRowsFnc } from '../utils';
import Cell from './pageSpreadsheet/Cell';
import CellHeader from './pageSpreadsheet/CellHeader';
import CellIndex from './pageSpreadsheet/CellIndex';
import IconTable from './pageSpreadsheet/IconTable';
import InputSearch from './pageSpreadsheet/InputSearch';
import PanelFunction from './pageSpreadsheet/PanelFunction';
import PanelSetting from './pageSpreadsheet/PanelSetting';



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


   const { email, role, isAdmin, projectId, projectName, token } = props;
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
      if (isTyping) {
         isTyping = false;
      } else {
         isTyping = true;
         setCellActive(currentDOMCell);
      };
   };
   const setPosition = (e) => {
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
         if (isTyping) return;
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
         if (isTyping) return;

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

         if (isTyping) return;

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

         if (isTyping) return;

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
         if (isTyping) {
            isTyping = false;
         } else {
            isTyping = true;
            setCellActive(currentDOMCell);
         };
      };
   };




   const { state: stateCell, setCellActive, OverwriteCellsModified } = useContext(CellContext);
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
      const { rowsAll, rowsUpdatePreRowOrParentRow } = stateRow;
      setPanelFunctionVisible(false);

      if (btn === 'Move Drawing') {
         getSheetRows({ ...stateRow, rowsToMoveId: panelType.cellProps.rowData.id });
      } else if (btn === 'Paste Drawing') {

         const rowToMove = rowsAll.find(r => r.id === stateRow.rowsToMoveId);
         const rowBelowPrevious = rowsAll.find(r => r._preRow === stateRow.rowsToMoveId);
         if (rowBelowPrevious) {
            rowBelowPrevious._preRow = rowToMove._preRow;
            rowsUpdatePreRowOrParentRow[rowBelowPrevious.id] = {
               _preRow: rowBelowPrevious._preRow, _parentRow: rowBelowPrevious._parentRow, id: rowBelowPrevious.id
            };
         };
         const rowBelowNext = rowsAll.find(r => r._preRow === panelType.cellProps.rowData.id);
         if (rowBelowNext) {
            rowBelowNext._preRow = stateRow.rowsToMoveId;
            rowsUpdatePreRowOrParentRow[rowBelowNext.id] = {
               _preRow: rowBelowNext._preRow, _parentRow: rowBelowNext._parentRow, id: rowBelowNext.id
            };
         };

         rowToMove._preRow = panelType.cellProps.rowData.id;
         rowToMove._parentRow = panelType.cellProps.rowData._parentRow;
         rowsUpdatePreRowOrParentRow[rowToMove.id] = {
            _preRow: rowToMove._preRow, _parentRow: rowToMove._parentRow, id: rowToMove.id
         };
         getSheetRows({
            ...stateRow,
            rowsAll: reorderRowsFnc(rowsAll),
            rowsAllInit: reorderRowsFnc(rowsAll),
            rowsUpdatePreRowOrParentRow,
            rowsToMoveId: null
         });
      } else {
         getSheetRows({ ...stateRow, rowsToMoveId: null });

         setPanelSettingType(btn);
         setPanelSettingVisible(true);
      };
   };
   const onMouseDownColumnHeader = (e, header) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setPanelType({ type: 'column', header });
      setPanelFunctionVisible(true);
   };
   const onRightClickCell = (e, cellProps) => {
      setCursor({ x: e.clientX, y: e.clientY });
      setPanelType({ type: 'cell', cellProps });
      setPanelFunctionVisible(true);
   };
   const commandAction = (update) => {

      if (update.type === 'sort-data-drawing-type') {
         getSheetRows({ ...stateRow, rowsAll: update.data });
      } else if (update.type === 'sort-data-project') {
         getSheetRows({ ...stateRow, rowsAll: update.data, showDrawingsOnly: 'sort-data-project' });

      } else if (update.type === 'filter-by-columns') {
         if (update.data.length > 0) {
            getSheetRows({ ...stateRow, rowsAll: update.data });
         } else message.info('There is no drawing found', 1.5);

      } else if (update.type === 'reset-filter-sort') {
         getSheetRows({
            ...stateRow,
            rowsAll: stateRow.rowsAllInit,
            showDrawingsOnly: false
         });
         setExpandedRows(getRowsKeyExpanded(stateRow.drawingTypeTree));
         setSearchInputShown(false);
         setCellSearchFound(null);
         setCellHistoryFound(null);

      } else if (update.type === 'reorder-columns') {
         setUserData({
            ...stateProject.userData,
            headersHidden: update.data.headersHidden,
            headersShown: update.data.headersShown,
            nosColumnFixed: update.data.nosColumnFixed,
         });

      } else if (update.type === 'insert-drawings' || update.type === 'insert-drawings-by-folder') {
         getSheetRows({
            ...stateRow,
            rowsAll: update.data.rowsAll,
            rowsAllInit: update.data.rowsAll,
            idRowsNew: update.data.idRowsNew
         });

      } else if (update.type === 'drawing-data-automation') {
         getSheetRows({
            ...stateRow,
            rowsAll: update.data,
            rowsAllInit: update.data
         });

      } else if (update.type === 'create-new-drawing-revisions') {
         getSheetRows({
            ...stateRow,
            rowsAll: update.data.rowsAll,
            rowsAllInit: update.data.rowsAll,
            rowsVersionsToSave: update.data.rowsVersionsToSave
         });

      } else if (update.type === 'group-columns') {
         getSheetRows({ ...stateRow, rowsAll: update.data.rows, showDrawingsOnly: 'group-columns' });
         setExpandedRows(update.data.expandedRows);

      } else if (update.type === 'drawing-colorized') {
         setUserData({
            ...stateProject.userData,
            colorization: update.data
         });

      } else if (update.type === 'highlight-cell-history') {
         setCellHistoryFound(update.data);
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
         setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });

      } else if (update.type === 'drawing-folder-organization') {
         getSheetRows({
            ...stateRow,
            rowsAll: update.data.rowsAll,
            rowsAllInit: update.data.rowsAll,
            drawingTypeTree: update.data.drawingTypeTree,
            rowsDeleted: update.data.rowsDeleted,
            idRowsNew: update.data.idRowsNew
         });
         setExpandedRows(getRowsKeyExpanded(update.data.drawingTypeTree));

      } else if (update.type === 'delete-drawing') {

         getSheetRows({
            ...stateRow,
            rowsAll: update.data.rowsAll,
            rowsAllInit: update.data.rowsAll,
            rowsDeleted: update.data.rowsDeleted,
            idRowsNew: update.data.idRowsNew
         });

      } else if (update.type === 'save-data-successfully') {
         message.success('Save Data Successfully', 1.5);
      } else if (update.type === 'save-data-failure') {
         message.error('Network Error', 1.5);

      } else if (update.type === 'reload-data-from-server') {

         fetchDataOneSheet({
            ...update.data,
            email, projectId, projectName, role, token
         });
         setUserData(getHeadersData(update.data));
         getSheetRows(getInputDataInitially(update.data));
         setExpandedRows(getRowsKeyExpanded(update.data.publicSettings.drawingTypeTree));
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
         if (btn === 'upload-sumang') {
            await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: state['Sumang'].rows });
            await Axios.post(`${SERVER_URL}/row/history/`, { token, projectId, email, rowsHistory: state['Sumang'].historyRows });
            await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, { token, projectId, email, publicSettings: { drawingTypeTree: state['Sumang'].drawingTypeTree } });
            message.info('DONE...Save SMARTSHEET To Server SUMANG');
         } else if (btn === 'upload-handy') {
            await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: state['Handy'].rows });
            await Axios.post(`${SERVER_URL}/row/history/`, { token, projectId, email, rowsHistory: state['Handy'].historyRows });
            await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, { token, projectId, email, publicSettings: { drawingTypeTree: state['Handy'].drawingTypeTree } });
            message.info('DONE...Save SMARTSHEET To Server HANDY');
         } else if (btn === 'delete-all-rows') {
            await Axios.post(`${SERVER_URL}/sheet/delete-rows-project/`, { token, projectId });
            message.info('DONE...Delete Rows In Current Project');
         } else if (btn === 'delete-all-collections') {
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
            // console.log('MONGO ...', res.data);



            const resultSmartsheet = await Axios.post(
               'https://bim.wohhup.com/api/smartsheet/get-sheets-dashboard',
               { listSheetId: [4758181617395588, 8919906142971780] }
            );
            const rowsAllSmartSheet = getDataConvertedSmartsheet(resultSmartsheet.data);
            const dataToSave = getCurrentAndHistoryDrawings(rowsAllSmartSheet, res.data.publicSettings.headers);
            setstate(dataToSave);





            fetchDataOneSheet({
               ...res.data,
               email, projectId, projectName, role, token
            });
            setUserData(getHeadersData(res.data));
            getSheetRows(getInputDataInitially(res.data));
            setExpandedRows(getRowsKeyExpanded(res.data.publicSettings.drawingTypeTree));


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
      const indent = (depth * 15).toString() + 'px';
      if (!expandable) return null;
      return (
         <div style={{
            marginLeft: indent,
            paddingLeft: 10,
            paddingRight: 10,
            background: 'transparent'
         }}>
            <Icon
               type={expanding ? 'plus-square' : 'minus-square'}
               onClick={() => onExpand(expanding)}
               style={{
                  color: 'black',
                  transform: 'translate(0, -1px)'
               }}
            />
         </div>
      );
   };
   const expandIconProps = (props) => {
      return ({ expanding: !props.expanded });
   };
   const rowProps = (props) => {
      const { rowData } = props;
      return {
         tagName: rowData._rowLevel < 1 ? RowStyled : undefined
      };
   };

   const rowClassName = (props) => {
      const { rowData } = props;
      const { colorization } = stateProject.userData;

      const valueArr = colorization.value;
      const value = rowData[colorization.header];

      if (colorization !== null &&
         colorization.header !== 'No Colorization' &&
         valueArr &&
         valueArr.length > 0 &&
         valueArr.indexOf(value) !== -1
      ) {
         if (rowData[colorization.header]) {
            return `colorization-${colorization.header.replace(/\s/g, '').replace(/,/g, '')}-${rowData[colorization.header].replace(/\s/g, '').replace(/,/g, '')}-styled`;
         };
      };
   };


   const [searchInputShown, setSearchInputShown] = useState(false);
   const searchGlobal = debounceFnc((found) => {
      setCellSearchFound(found);
      setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
      setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });
   }, 500);
   const closeSearchInput = () => {
      setSearchInputShown(false);
      setCellSearchFound(null);
   };


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
               const { rowData: { id }, column: { key } } = props;
               return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                  ? 'cell-found'
                  : (cellHistoryFound && cellHistoryFound.find(cell => cell.rowId === id && cell.header === key))
                     ? 'cell-history-highlight'
                     : ''
            }
         });
      });
      return headersObj;
   };




   return (

      <PageSpreadsheetStyled
         onContextMenu={(e) => e.preventDefault()}
      >
         <ButtonBox>
            <IconTable type='save' onClick={() => buttonPanelFunction('save-ICON')} />
            <DividerRibbon />
            <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} />
            <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
            <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
            <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />

            {searchInputShown ? (
               <InputSearch searchGlobal={searchGlobal} closeSearchInput={closeSearchInput} />
            ) : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

            <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON')} />
            <DividerRibbon />
            <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />

            <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
            <DividerRibbon />
            <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
            <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />

            <DividerRibbon />
            {isAdmin && (
               <div style={{ display: 'flex' }}>
                  <IconTable type='fullscreen-exit' onClick={() => adminFncServerInit('upload-sumang')} />
                  <IconTable type='fall' onClick={() => adminFncServerInit('upload-handy')} />
                  <IconTable type='delete' onClick={() => adminFncServerInit('delete-all-rows')} />
                  <IconTable type='stock' onClick={() => adminFncServerInit('delete-all-collections')} />
                  {/* <IconTable type='stock' onClick={() => history.push('/sheet')} />
                  <IconTable type='stock' onClick={() => history.push('/dashboard')} /> */}
               </div>
            )}
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
               rowProps={rowProps}
               rowClassName={rowClassName}
               onRowExpand={onRowExpand}
            />
         ) : <LoadingIcon />}


         <ModalStyleFunction
            visible={panelFunctionVisible}
            footer={null}
            onCancel={() => setPanelFunctionVisible(false)}
            destroyOnClose={true}
            style={{ position: 'fixed', left: cursor && cursor.x, top: cursor && cursor.y }}
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
      </PageSpreadsheetStyled>

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
const RowStyled = styled.a`
    background-color: ${colorType.grey3};
    font-weight: bold;
    cursor: default;
    &:hover {
        background-color: ${colorType.grey3};
    }
`;
const PageSpreadsheetStyled = styled.div`
    /* padding-top: ${dimension.navBarHeight}; */
`;


const TableStyled = styled(Table)`

   
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

export const reorderDrawingsByDrawingTypeTree = (rows, drawingTypeTree) => {
   let rowsReordered = [];
   drawingTypeTree.forEach(tr => {
      if (tr._rowLevel === 0) {
         rowsReordered = [...rowsReordered, ...rows.filter(r => r._parentRow === tr.id)];
      };
   });
   return rowsReordered;
};
const getInputDataInitially = (data) => {

   const { drawingTypeTree } = data.publicSettings;
   const { rows } = data;
   const rowsReordered = reorderDrawingsByDrawingTypeTree(rows, drawingTypeTree);

   const rowsAllInitToCompareBeforeSave = rows.map(r => ({ ...r }));

   return {
      rowsAll: rowsReordered,
      rowsAllInit: rowsReordered,
      rowsAllInitToCompareBeforeSave,
      rowsVersionsToSave: [],
      showDrawingsOnly: false,
      drawingTypeTree,
      drawingTypeTreeInit: drawingTypeTree,
      rowsDeleted: [],
      idRowsNew: [],
      rowsUpdatePreRowOrParentRow: {},
      rowsToMoveId: null
   };
};

const arrangeDrawingTypeFinal = (stateRow) => {

   const { rowsAll, showDrawingsOnly, drawingTypeTree } = stateRow;

   if (showDrawingsOnly === 'sort-data-project') return rowsAll;
   if (showDrawingsOnly === 'group-columns') return rowsAll;


   let data = drawingTypeTree.map(e => {
      let obj = { ...e };
      if (obj._rowLevel === 0) {
         let rowsChildren = rowsAll.filter(r => r._parentRow === e.id).map(x => ({ ...x }));
         obj.children = rowsChildren;
      };
      return { ...obj };
   });

   // currently applied for level 0 only ...

   return data;
};

const getRowsKeyExpanded = (drawingTypeTree) => {
   return drawingTypeTree.map(x => {
      if (x._rowLevel === 0) return x.id;
   });
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





























