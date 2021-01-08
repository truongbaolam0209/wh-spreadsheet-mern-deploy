import { Button, Input } from 'antd';
import Axios from 'axios';
import _, { debounce } from 'lodash';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertCellTempToHistory, convertDrawingVersionToHistory, extractCellInfo, mongoObjectId, reorderRowsFnc } from '../../utils';
import { reorderDrawingsByDrawingTypeTree } from '../PageSpreadsheet';
import ColorizedForm from './ColorizedForm';
import FormCellColorizedCheck from './FormCellColorizedCheck';
import FormDateAutomation from './FormDateAutomation';
import FormDrawingTypeOrder from './FormDrawingTypeOrder';
import FormFilter from './FormFilter';
import FormGroup from './FormGroup';
import FormSort from './FormSort';
import PanelConfirm from './PanelConfirm';
import ReorderColumnForm from './ReorderColumnForm';
import TableActivityHistory from './TableActivityHistory';
import TableCellHistory from './TableCellHistory';
import TableDrawingDetail from './TableDrawingDetail';

const genId = (xxx) => {
   let arr = [];
   for (let i = 0; i < xxx; i++) {
      arr.push(mongoObjectId());
   };
   return arr;
};


const PanelSetting = (props) => {

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateCell, getCellModifiedTemp, OverwriteCellsModified } = useContext(CellContext);

   const { panelType, panelSettingType, commandAction, onClickCancelModal, setLoading } = props;

   useEffect(() => {
      if (panelSettingType === 'save-every-20min') {
         saveDataToServer();
      };
   }, []);


   const applyReorderColumns = (data) => {
      commandAction({ type: 'reorder-columns', data });
   };
   const applyFilter = (data) => {
      commandAction({ type: 'filter-by-columns', data });
   };
   const applySort = ({ type, rowsOutput: data }) => {
      commandAction({
         type: type === 'Sort Rows In Drawing Type' ? 'sort-data-drawing-type' : 'sort-data-project',
         data,
      });
   };
   const applyResetFilter = debounce(() => {
      commandAction({ type: 'reset-filter-sort' });
   }, 7);

   
   const applyGroup = (data) => {
      commandAction({ type: 'group-columns', data });
   };

   

   const [nosOfRows, setNosOfRows] = useState(1);
   const onClickInsertRow = () => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow } = stateRow;

      let idsArr = genId(nosOfRows);

      idRowsNew = [...idRowsNew, ...idsArr];

      let newRows = [];
      let rowBelow;
      if (panelSettingType === 'Insert Drawings Below') {
         let rowAbove = panelType.cellProps.rowData;
         newRows = idsArr.map((id, i) => {
            return ({
               id,
               _rowLevel: 1,
               _parentRow: rowAbove._parentRow,
               _preRow: i === 0 ? rowAbove.id : idsArr[i - 1]
            });
         });

         rowBelow = rowsAll.find(r => r._preRow === rowAbove.id);
         if (rowBelow) {
            rowBelow._preRow = idsArr[idsArr.length - 1];
         };

      } else if (panelSettingType === 'Insert Drawings Above') {
         let rowBelow = panelType.cellProps.rowData;
         newRows = idsArr.map((id, i) => {
            return ({
               id,
               _rowLevel: 1,
               _parentRow: rowBelow._parentRow,
               _preRow: i === 0 ? rowBelow._preRow : idsArr[i - 1]
            });
         });
         rowBelow._preRow = idsArr[idsArr.length - 1];
      };

      if (rowBelow) {
         rowsUpdatePreRowOrParentRow[rowBelow.id] = { 
            ...rowsUpdatePreRowOrParentRow[rowBelow.id] || {}, 
            _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow
         };
      };
      newRows.forEach(r => {
         rowsUpdatePreRowOrParentRow[r.id] = { 
            ...rowsUpdatePreRowOrParentRow[r.id] || {}, 
            _preRow: r._preRow, _parentRow: r._parentRow
         };
      });

      rowsAll = [...rowsAll, ...newRows];

      commandAction({
         type: 'insert-drawings',
         data: {
            rowsAll: reorderRowsFnc(rowsAll),
            rowsUpdatePreRowOrParentRow,
            idRowsNew
         }
      });
   };

   const [nosOfRowsSub, setNosOfRowsSub] = useState(1);
   const onClickFolderInsertSubRows = () => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow } = stateRow;

      let idsArr = genId(nosOfRowsSub);
      idRowsNew = [...idRowsNew, ...idsArr];

      let newRows = idsArr.map((id, i) => {
         return ({
            id,
            _rowLevel: 1,
            _parentRow: panelType.cellProps.rowData.id,
            _preRow: i === 0 ? null : idsArr[i - 1]
         });
      });
      newRows.forEach(r => {
         rowsUpdatePreRowOrParentRow[r.id] = { 
            ...rowsUpdatePreRowOrParentRow[r.id] || {}, 
            _preRow: r._preRow, _parentRow: r._parentRow
         };
      });
      let rowBelow = rowsAll.find(r => r._parentRow === panelType.cellProps.rowData.id && r._preRow === null);
      if (rowBelow) {
         rowBelow._preRow = idsArr[idsArr.length - 1];
         rowsUpdatePreRowOrParentRow[rowBelow.id] = { 
            ...rowsUpdatePreRowOrParentRow[rowBelow.id] || {}, 
            _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow
         };
      };
      rowsAll = [...rowsAll, ...newRows];

      commandAction({
         type: 'insert-drawings-by-folder',
         data: {
            rowsAll: reorderRowsFnc(rowsAll),
            rowsUpdatePreRowOrParentRow,
            idRowsNew
         }
      });
   };

   const applyDateAutomation = (dateAutomation) => {
      let { rowsAll } = stateRow;
      const rowId = panelType.cellProps.rowData.id;
      let row = rowsAll.find(r => r.id === rowId);

      Object.keys(dateAutomation).forEach(key => {
         const cellTempId = `${rowId}-${key}`;
         const dateConverted = moment(dateAutomation[key]).format('DD/MM/YY');
         getCellModifiedTemp({ [cellTempId]: dateConverted });
         row[key] = dateConverted;
      });

      commandAction({
         type: 'drawing-data-automation',
         data: rowsAll
      });
   };

   const createNewDrawingRevision = () => {
      const arrHeadersGoBlank = [
         'Model Start (T)', 'Model Start (A)', 'Model Finish (T)', 'Model Finish (A)', 'Drawing Start (T)', 'Drawing Start (A)',
         'Drawing Finish (T)', 'Drawing Finish (A)', 'Drg To Consultant (T)', 'Drg To Consultant (A)', 'Consultant Reply (T)',
         'Consultant Reply (A)', 'Get Approval (T)', 'Get Approval (A)', 'Construction Issuance Date', 'Construction Start', 'Rev', 'Status'
      ];

      let { rowsAll } = stateRow;
      const rowId = panelType.cellProps.rowData.id;
      let row = rowsAll.find(r => r.id === rowId);
      let rowOldVersiontoSave = { ...row };

      arrHeadersGoBlank.forEach(hd => {
         const cellTempId = `${rowId}-${hd}`;
         getCellModifiedTemp({ [cellTempId]: '' });
         row[hd] = '';
      });

      commandAction({
         type: 'create-new-drawing-revisions',
         data: {
            rowsAll,
            rowsVersionsToSave: [...stateRow.rowsVersionsToSave || [], rowOldVersiontoSave]
         }
      });
   };

   const setCellHistoryArr = debounce((data) => {
      commandAction({ type: 'highlight-cell-history', data });
   }, 7);

   const deleteDrawing = () => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow, rowsDeleted } = stateRow;
      const { cellsModifiedTemp } = stateCell;
      const rowId = panelType.cellProps.rowData.id;

      let rowBelow = rowsAll.find(r => r._preRow === rowId);
      if (rowBelow) {
         rowBelow._preRow = panelType.cellProps.rowData._preRow;
         rowsUpdatePreRowOrParentRow[rowBelow.id] = { 
            ...rowsUpdatePreRowOrParentRow[rowBelow.id] || {}, 
            _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow
         };
      };

      if (rowId in rowsUpdatePreRowOrParentRow) delete rowsUpdatePreRowOrParentRow[rowId];
      rowsAll = rowsAll.filter(r => r.id !== rowId);

      if (idRowsNew.indexOf(rowId) === -1) {
         rowsDeleted = [...rowsDeleted, panelType.cellProps.rowData];
      } else {
         idRowsNew.splice(idRowsNew.indexOf(rowId), 1);
      };
      Object.keys(cellsModifiedTemp).forEach(key => {
         if (key.slice(0, 24) === rowId) {  // deleted cells modified temporary...
            delete cellsModifiedTemp[key];
         };
      });
      OverwriteCellsModified({ ...cellsModifiedTemp });

      commandAction({
         type: 'delete-drawing',
         data: {
            rowsAll,
            rowsUpdatePreRowOrParentRow,
            rowsDeleted,
            idRowsNew,
         }
      });
   };

   const applyFolderOrganize = (drawingTypeTreeNew) => {
      let { drawingTypeTree, rowsAll, rowsDeleted, idRowsNew, rowsUpdatePreRowOrParentRow } = stateRow;

      drawingTypeTree.forEach(r => { // find deleted folder
         let folder = drawingTypeTreeNew.find(row => row.id === r.id);
         if (!folder && r._rowLevel === 0) { // save to deleted rows
            let rowsChildren = rowsAll.filter(row => row._parentRow === r.id);
            rowsChildren.forEach(rrr => {
               if (idRowsNew.indexOf(rrr.id) === -1) {
                  rowsDeleted = [...rowsDeleted, rrr];
               } else {
                  idRowsNew.splice(idRowsNew.indexOf(rrr.id), 1);
               };
               if (rrr.id in rowsUpdatePreRowOrParentRow) delete rowsUpdatePreRowOrParentRow[rrr.id];
            });
            rowsAll = rowsAll.filter(r => r._parentRow !== r.id);
         };
      });

      // new drawings
      const drawingTypeL0New = drawingTypeTreeNew.filter(r => !drawingTypeTree.find(row => row.id === r.id));
      
      drawingTypeL0New.forEach(row => {
         let idsArr = genId(5);
         idRowsNew = [...idRowsNew, ...idsArr];
         const newRows = idsArr.map((id, i) => {
            return ({
               id,
               _rowLevel: 1,
               _parentRow: row.id,
               _preRow: i === 0 ? null : idsArr[i - 1]
            });
         });
         newRows.forEach(r => {
            rowsUpdatePreRowOrParentRow[r.id] = { 
               ...rowsUpdatePreRowOrParentRow[r.id] || {}, 
               _preRow: r._preRow, _parentRow: r._parentRow
            };
         });
         rowsAll = [...rowsAll, ...newRows];
      });

      commandAction({
         type: 'drawing-folder-organization',
         data: {
            rowsAll: reorderDrawingsByDrawingTypeTree(rowsAll, drawingTypeTreeNew),
            rowsUpdatePreRowOrParentRow,
            rowsDeleted,
            idRowsNew,
            drawingTypeTree: drawingTypeTreeNew,
         }
      });
   };



   const saveDataToServer = async () => {

      const { email, projectId } = stateProject.allDataOneSheet;
      const { headers } = stateProject.allDataOneSheet.publicSettings;
      let { cellsModifiedTemp } = stateCell;
      let {
         rowsVersionsToSave,
         rowsUpdatePreRowOrParentRow,
         rowsAll,
         drawingTypeTreeInit,
         drawingTypeTree,
         rowsDeleted,
         rowsAllInitToCompareBeforeSave
      } = stateRow;

      try {
         setLoading(true);
         commandAction({ type: 'confirm-save-data' });

         // GET LATEST ROWS FROM DB
         const resDB = await Axios.get(`${SERVER_URL}/sheet/${projectId}?userId=${email}`);
         let {
            publicSettings: publicSettingsFromDB,
            rows: rowsFromDB,
            userSettings: userSettingsFromDB
         } = resDB.data;

         let {
            drawingTypeTree: drawingTypeTreeFromDB, 
            activityRecorded: activityRecordedFromDB
         } = publicSettingsFromDB;

         // DELETE ROWS ------------------------------------->>>>> DONE
         if (rowsDeleted.length > 0) {
            rowsDeleted = rowsDeleted.filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing'));
            await Axios.post(
               `${SERVER_URL}/sheet/delete-rows/${projectId}?userId=${email}`,
               rowsDeleted.map(r => r.id)
            );
         };

         
         // check if there are rows deleted previously by other users.
         let rowsDeletedByOtherUsers = rowsAll.filter(r => activityRecordedFromDB.find(x => x.id === r.id && x.action === 'Delete Drawing'));
         if (rowsDeletedByOtherUsers.length > 0) {
            rowsDeletedByOtherUsers.forEach(row => {
               let rowBelow = rowsAll.find(r => r._preRow === row.id);
               if (rowBelow) {
                  rowBelow._preRow = row._preRow;
                  rowsUpdatePreRowOrParentRow[rowBelow.id] = { 
                     ...rowsUpdatePreRowOrParentRow[rowBelow.id] || {}, 
                     _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow
                  };
               };
            });
         };

         // new rows added by other users
         let newRowsByParents = {};
         rowsFromDB.forEach(row => {
            if (!rowsAllInitToCompareBeforeSave.find(r => r.id === row.id)) {
               newRowsByParents[row._parentRow] = [...newRowsByParents[row._parentRow] || [], row];
            };
         });
         Object.keys(newRowsByParents).forEach(keyParent => {
            if (drawingTypeTree.find(r => r.id === keyParent)) {
               let rows = newRowsByParents[keyParent];
               let lastRowsSameCurrent = rowsAll.find(row => row._parentRow === keyParent && !rowsAll.find(x => x._preRow === row.id));

               let idFirst = lastRowsSameCurrent ? lastRowsSameCurrent.id : null;
               rows.forEach((r, i) => {
                  r._preRow = i === 0 ? idFirst : rows[i - 1].id;

                  rowsUpdatePreRowOrParentRow[r.id] = { 
                     ...rowsUpdatePreRowOrParentRow[r.id] || {}, 
                     _preRow: r._preRow, _parentRow: r._parentRow
                  };
                  rowsAll.push(r);
               });
            };
         });



         // SAVE CELL HISTORY
         if (!_.isEmpty(cellsModifiedTemp)) {
            Object.keys(cellsModifiedTemp).forEach(key => {
               let rowId = key.slice(0, 24);
               if (activityRecordedFromDB.find(x => x.id === rowId && x.action === 'Delete Drawing')) {
                  delete cellsModifiedTemp[key];
               };
            });
            await Axios.post(`${SERVER_URL}/cell/history/${projectId}`,
               convertCellTempToHistory(cellsModifiedTemp, stateProject)
            );
         };

         // SAVE DRAWINGS NEW VERSION ------------------------------------->>>>> DONE
         rowsVersionsToSave = rowsVersionsToSave.filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing'));
         if (rowsVersionsToSave.length > 0) {
            await Axios.post(`${SERVER_URL}/row/history/${projectId}?userId=${email}`,
               convertDrawingVersionToHistory(rowsVersionsToSave, stateProject)
            );
         };

         

         const headerKeyDrawingNumber = headers.find(hd => hd.text === 'Drawing Number').key;
         const headerKeyDrawingName = headers.find(hd => hd.text === 'Drawing Name').key;
         // SAVE PUBLIC SETTINGS RECORDED
         let activityRecordedArr = [];
         drawingTypeTree.forEach(fd => {   //------------------------------------->>>>> DONE
            if (!drawingTypeTreeInit.find(e => e.id === fd.id)) {
               activityRecordedArr.push({
                  id: fd.id, email, createdAt: new Date(), action: 'Create Drawing Type',
                  [headerKeyDrawingNumber]: fd['Drawing Number'],
               });
            };
         });
         drawingTypeTreeInit.forEach(fd => { //------------------------------------->>>>> DONE
            if (
               !drawingTypeTree.find(e => e.id === fd.id) &&
               !activityRecordedFromDB.find(e => e.id === fd.id && e.action === 'Delete Drawing Type')
            ) {
               activityRecordedArr.push({
                  id: fd.id, email, createdAt: new Date(), action: 'Delete Drawing Type',
                  [headerKeyDrawingNumber]: fd['Drawing Number'],
               });
            };
         });
         rowsDeleted.forEach(r => { //------------------------------------->>>>> DONE
            activityRecordedArr.push({
               id: r.id, email, createdAt: new Date(), action: 'Delete Drawing',
               [headerKeyDrawingNumber]: r['Drawing Number'], 
               [headerKeyDrawingName]: r['Drawing Name'],
            });
         });

         // SAVE PUBLIC DRAWING TYPE //------------------------------------->>>>> DONE
         drawingTypeTreeFromDB.forEach(fd => {
            if (!drawingTypeTreeInit.find(e => e.id === fd.id)) {
               drawingTypeTree.push(fd); // new from DB, added by other user ...
            };
         });
         drawingTypeTree.forEach(fd => { // check in recorded if some folder deleted ...
            if (activityRecordedFromDB.find(r => r.id === fd.id && r.action === 'Delete Drawing Type')) {
               drawingTypeTree = drawingTypeTree.filter(e => e.id !== fd.id);
            };
         });
         drawingTypeTree.forEach(tr => {
            headers.forEach(hd => {
               if (hd.text in tr) {
                  tr[hd.key] = tr[hd.text];
                  delete tr[hd.text];
               };
            });
         });
         await Axios.post(`${SERVER_URL}/sheet/update-setting-public/${projectId}?userId=${email}`,
            {
               drawingTypeTree,
               activityRecorded: [...activityRecordedFromDB, ...activityRecordedArr]
            }
         );



         
         // SAVE DRAWINGS DATA
         if (!_.isEmpty(rowsUpdatePreRowOrParentRow) || !_.isEmpty(cellsModifiedTemp)) {


            let objRowsUpdate = {};
            Object.keys(rowsUpdatePreRowOrParentRow).forEach(key => {
               objRowsUpdate[key] = {
                  ...objRowsUpdate[key] || {}, 
                  preRow: rowsUpdatePreRowOrParentRow[key]._preRow,
                  parentRow: rowsUpdatePreRowOrParentRow[key]._parentRow,
                  level: 1
               };
            });
            Object.keys(cellsModifiedTemp).forEach(key => {
               const { rowId, headerName } = extractCellInfo(key);
               let headerKey = headers.find(hd => hd.text === headerName).key;
               objRowsUpdate[rowId] = {
                  ...objRowsUpdate[rowId] || {}, 
                  data: {
                     ...(objRowsUpdate[rowId] ? objRowsUpdate[rowId].data : {}) || {}, 
                     [headerKey]: cellsModifiedTemp[key]
                  },
                  level: 1
               };
            });
            const finalOutput = Object.keys(objRowsUpdate).map(key => {
               return {
                  _id: key,
                  ...objRowsUpdate[key]
               };
            });

            await Axios.post(
               `${SERVER_URL}/sheet/update-rows/${projectId}`,
               { rows: finalOutput }
            );
         };
         


         await Axios.post(             // SAVE SETTINGS ..........................
            `${SERVER_URL}/sheet/update-setting-user/${projectId}?userId=${email}`,
            {
               headersShown: stateProject.userData.headersShown.map(hd => headers.find(h => h.text === hd).key),
               headersHidden: stateProject.userData.headersHidden.map(hd => headers.find(h => h.text === hd).key),
               nosColumnFixed: stateProject.userData.nosColumnFixed,
               colorization: stateProject.userData.colorization,
            }
         );


         commandAction({ type: 'save-data-successfully' });

         const res = await Axios.get(`${SERVER_URL}/sheet/${projectId}?userId=${email}`);

         commandAction({ type: 'reload-data-from-server', data: res.data });

      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };



   const applyColorization = (data) => {
      commandAction({ type: 'drawing-colorized', data });
   };



   return (
      <>
         {panelSettingType === 'save-ICON' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={saveDataToServer}
            />
         )}
         {/* {panelSettingType === 'save-every-20min' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={saveDataToServer}
            />
         )} */}

         {panelSettingType === 'filter-ICON' && (
            <FormFilter applyFilter={applyFilter} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'rollback-ICON' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={applyResetFilter}
            />
         )}

         {panelSettingType === 'reorderColumn-ICON' && (
            <ReorderColumnForm
               applyReorderColumns={applyReorderColumns}
               onClickCancelModal={onClickCancelModal}
            />
         )}



         {panelSettingType === 'sort-ICON' && (
            <FormSort applySort={applySort} onClickCancel={onClickCancelModal} />
         )}

 
         {panelSettingType === 'group-ICON' && (
            <FormGroup applyGroup={applyGroup} onClickCancelModal={onClickCancelModal} />
         )}


         {(panelSettingType === 'Insert Drawings Below' || panelSettingType === 'Insert Drawings Above') && (
            <div>
               <Input
                  placeholder='Enter Number Of Drawings...'
                  type='number' min='1'
                  value={nosOfRows}
                  onChange={(e) => setNosOfRows(e.target.value)}
                  style={{
                     marginBottom: 20
                  }}
               />
               <Button onClick={onClickInsertRow}>Apply</Button>
            </div>
         )}

         {panelSettingType === 'history-ICON' && (
            <TableActivityHistory />
         )}

         {panelSettingType === 'color-cell-history-ICON' && (
            <FormCellColorizedCheck setCellHistoryArr={setCellHistoryArr} />
         )}


         {panelSettingType === 'Date Automation' && (
            <FormDateAutomation applyDateAutomation={applyDateAutomation} />
         )}

         {panelSettingType === 'Create New Drawing Revision' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={createNewDrawingRevision}
            />
         )}

         {panelSettingType === 'View Drawing Revision' && (
            <TableDrawingDetail {...panelType.cellProps} />
         )}

         {panelSettingType === 'addDrawingType-ICON' && (
            <FormDrawingTypeOrder applyFolderOrganize={applyFolderOrganize} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'View Cell History' && (
            <TableCellHistory {...panelType.cellProps} />
         )}


         {panelSettingType === 'Delete Drawing' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={deleteDrawing}
               content={`Are you sure to delete the: ${panelType.cellProps.rowData['Drawing Number'] || ' '}-${panelType.cellProps.rowData['Drawing Name'] || ' '} ?`}
            />
         )}

         {panelSettingType === 'colorized-ICON' && (
            <ColorizedForm applyColorization={applyColorization} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'Insert Drawings By Type' && (
            <div>
               <Input
                  placeholder='Enter Number Of Drawings...'
                  type='number' min='1'
                  value={nosOfRowsSub}
                  onChange={(e) => setNosOfRowsSub(e.target.value)}
                  style={{
                     marginBottom: 20
                  }}
               />
            <Button onClick={onClickFolderInsertSubRows}>Apply</Button>
         </div>
         )}


      </>
   );
};

export default PanelSetting;














