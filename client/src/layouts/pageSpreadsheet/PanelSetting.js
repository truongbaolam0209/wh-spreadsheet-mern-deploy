import { Input } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertCellTempToHistory, convertDrawingVersionToHistory, debounceFnc, extractCellInfo, genId, reorderRowsFnc } from '../../utils';
import { reorderDrawingsByDrawingTypeTree } from '../PageSpreadsheet';
import ButtonGroupComp from './ButtonGroupComp';
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



const PanelSetting = (props) => {

   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateCell, getCellModifiedTemp, OverwriteCellsModified } = useContext(CellContext);

   const { panelType, panelSettingType, commandAction, onClickCancelModal, setLoading } = props;


   const applyReorderColumns = (data) => commandAction({ type: 'reorder-columns', data });

   const applyFilter = (data) => commandAction({ type: 'filter-by-columns', data });

   const applyResetFilter = () => commandAction({ type: 'reset-filter-sort' });

   const applyGroup = (data) => commandAction({ type: 'group-columns', data });

   const applyColorization = (data) => commandAction({ type: 'drawing-colorized', data });

   const setCellHistoryArr = debounceFnc((data) => commandAction({ type: 'highlight-cell-history', data }), 1);

   const applySort = ({ type, rowsOutput: data }) => {
      commandAction({
         type: type === 'Sort Rows In Drawing Type' ? 'sort-data-drawing-type' : 'sort-data-project',
         data,
      });
   };

   const onClickInsertRow = (nosOfRows) => {
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
         rowBelow = rowsAll.find(r => r.id === panelType.cellProps.rowData.id);

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
            _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow, id: rowBelow.id
         };
      };
      newRows.forEach(r => {
         rowsUpdatePreRowOrParentRow[r.id] = {
            _preRow: r._preRow, _parentRow: r._parentRow, id: r.id
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

   const onClickFolderInsertSubRows = (nosOfRows) => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow } = stateRow;
      let idsArr = genId(nosOfRows);
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
            _preRow: r._preRow, _parentRow: r._parentRow, id: r.id
         };
      });
      let rowBelow = rowsAll.find(r => r._parentRow === panelType.cellProps.rowData.id && r._preRow === null);
      if (rowBelow) {
         rowBelow._preRow = idsArr[idsArr.length - 1];
         rowsUpdatePreRowOrParentRow[rowBelow.id] = {
            _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow, id: rowBelow.id
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

   const deleteDrawing = () => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow, rowsDeleted } = stateRow;
      const { cellsModifiedTemp } = stateCell;
      const rowId = panelType.cellProps.rowData.id;

      let rowBelow = rowsAll.find(r => r._preRow === rowId);
      if (rowBelow) {
         rowBelow._preRow = panelType.cellProps.rowData._preRow;
         rowsUpdatePreRowOrParentRow[rowBelow.id] = {
            _preRow: rowBelow._preRow, _parentRow: rowBelow._parentRow, id: rowBelow.id
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
               _preRow: r._preRow, _parentRow: r._parentRow, id: r.id
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

      const { email, projectId, token, role } = stateProject.allDataOneSheet;
      const { headersShown, headersHidden, nosColumnFixed, colorization } = stateProject.userData;
      const { headers } = stateProject.allDataOneSheet.publicSettings;
      let { cellsModifiedTemp } = stateCell;
      let {
         rowsVersionsToSave,
         rowsUpdatePreRowOrParentRow,
         drawingTypeTreeInit,
         drawingTypeTree,
         rowsDeleted,
      } = stateRow;

      try {
         setLoading(true);
         commandAction({ type: 'confirm-save-data' });

         

         const resDB = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
         
         let { publicSettings: publicSettingsFromDB, rows: rowsFromDBInit } = resDB.data;
         let { drawingTypeTree: drawingTypeTreeFromDB, activityRecorded: activityRecordedFromDB } = publicSettingsFromDB;

         let rowsFromDB = rowsFromDBInit.map(r => ({ id: r.id, _preRow: r._preRow, _parentRow: r._parentRow }));

         // check if row deleted by other users
         let rowsUpdatePreRowOrParentRowArray = Object.values(rowsUpdatePreRowOrParentRow)
            .filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing') &&
               !activityRecordedFromDB.find(r => r.id === row._parentRow && r.action === 'Delete Drawing Type'));

         let arrID = [];
         rowsFromDB.forEach(r => {
            if (rowsUpdatePreRowOrParentRowArray.find(row => row.id === r.id)) {
               arrID.push(r.id);
               let rowBelow = rowsFromDB.find(rrr => rrr._preRow === r.id);
               if (rowBelow) rowBelow._preRow = r._preRow;
            };
         });
         rowsFromDB = rowsFromDB.filter(r => arrID.indexOf(r.id) === -1);


         let rowsInNewParent = rowsUpdatePreRowOrParentRowArray.filter(r => !drawingTypeTreeFromDB.find(tr => tr.id === r._parentRow && tr._rowLevel === 0));
         let rowsInOldParent = rowsUpdatePreRowOrParentRowArray.filter(r => drawingTypeTreeFromDB.find(tr => tr.id === r._parentRow && tr._rowLevel === 0));

         let rowsInOldParentOutput = _processChainRows2([...rowsInOldParent]);

         rowsInOldParentOutput.forEach(arrChain => {
            let rowFirst = arrChain[0];
            let rowAbove = rowsFromDB.find(r => r.id === rowFirst._preRow);
            let parentRowInDB = drawingTypeTreeFromDB.find(tr => tr.id === arrChain[0]._parentRow && tr._rowLevel === 0);

            if (rowAbove) {
               if (rowAbove._parentRow !== rowFirst._parentRow) {
                  let lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
                  rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
                  rowsFromDB = [...rowsFromDB, ...arrChain];
               } else {
                  let rowBelowRowAbove = rowsFromDB.find(r => r._preRow === rowAbove.id);
                  if (rowBelowRowAbove) rowBelowRowAbove._preRow = arrChain[arrChain.length - 1].id;
                  rowFirst._preRow = rowAbove.id;
                  rowsFromDB = [...rowsFromDB, ...arrChain];
               };
            } else {
               if (rowFirst._preRow === null) {
                  let firstRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && r._preRow === null);
                  if (firstRowInParent) { // if firstRowInParent undefined means Drawing type has 0 drawing currently...
                     firstRowInParent._preRow = arrChain[arrChain.length - 1].id;
                  };
                  rowsFromDB = [...rowsFromDB, ...arrChain];
               } else {
                  let lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
                  rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
                  rowsFromDB = [...rowsFromDB, ...arrChain];
               }
            };
         });


         let idsNewParentArray = [...new Set(rowsInNewParent.map(r => r._parentRow))];

         idsNewParentArray.forEach(idP => {
            let arrInput = rowsInNewParent.filter(r => r._parentRow === idP);
            let rowsChildren = _processRows1([...arrInput]);
            rowsChildren.forEach((r, i) => {
               r._preRow = i === 0 ? null : rowsChildren[i - 1].id;
            });
            rowsFromDB = [...rowsFromDB, ...rowsChildren];
         });


         // DELETE ROWS
         let rowDeletedFinal = [];
         rowsDeleted.forEach(row => {
            let rowInDB = rowsFromDB.find(r => r.id === row.id);
            if (rowInDB) {
               let rowBelow = rowsFromDB.find(r => r._preRow === rowInDB.id);
               if (rowBelow) rowBelow._preRow = rowInDB._preRow;
               rowDeletedFinal.push(row);
            };
         });
         

      
         // SAVE CELL HISTORY
         if (Object.keys(cellsModifiedTemp).length > 0) {
            Object.keys(cellsModifiedTemp).forEach(key => {
               let rowId = key.slice(0, 24);
               if (activityRecordedFromDB.find(x => x.id === rowId && x.action === 'Delete Drawing')) {
                  delete cellsModifiedTemp[key];
               };
            });
            await Axios.post(`${SERVER_URL}/cell/history/`, { token, projectId, cellsHistory: convertCellTempToHistory(cellsModifiedTemp, stateProject) });
         };

         // SAVE DRAWINGS NEW VERSION
         rowsVersionsToSave = rowsVersionsToSave.filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing'));
         if (rowsVersionsToSave.length > 0) {
            await Axios.post(`${SERVER_URL}/row/history/`, { token, projectId, email, rowsHistory: convertDrawingVersionToHistory(rowsVersionsToSave, stateProject) });
         };



         const headerKeyDrawingNumber = headers.find(hd => hd.text === 'Drawing Number').key;
         const headerKeyDrawingName = headers.find(hd => hd.text === 'Drawing Name').key;
         // SAVE PUBLIC SETTINGS RECORDED
         let activityRecordedArr = [];
         drawingTypeTree.forEach(fd => {
            if (!drawingTypeTreeInit.find(e => e.id === fd.id)) {
               activityRecordedArr.push({
                  id: fd.id, email, createdAt: new Date(), action: 'Create Drawing Type',
                  [headerKeyDrawingNumber]: fd['Drawing Number'],
               });
            };
         });
         drawingTypeTreeInit.forEach(fd => {
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
         activityRecordedArr.forEach(rc => {
            let newRowsAddedByPreviousUserButParentDeletedByCurrentUser = rowsFromDB.filter(e => e._parentRow === rc.id && rc.action === 'Delete Drawing Type');
            rowDeletedFinal = [...rowDeletedFinal, ...newRowsAddedByPreviousUserButParentDeletedByCurrentUser];
         });
         rowDeletedFinal.forEach(r => {
            activityRecordedArr.push({
               id: r.id, email, createdAt: new Date(), action: 'Delete Drawing',
               [headerKeyDrawingNumber]: r['Drawing Number'],
               [headerKeyDrawingName]: r['Drawing Name'],
            });
         });
         // SAVE PUBLIC DRAWING TYPE
         drawingTypeTreeFromDB.forEach(fd => {
            if (!drawingTypeTreeInit.find(e => e.id === fd.id)) {
               drawingTypeTree.push(fd); // new from DB, added by other user
            };
         });
         drawingTypeTree.forEach(fd => { // check in recorded if some folder deleted
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
         const publicSettingsUpdated = {
            drawingTypeTree,
            activityRecorded: [...activityRecordedFromDB, ...activityRecordedArr]
         };
         await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, { token, projectId, email, publicSettings: publicSettingsUpdated });
         
         const userSettingsUpdated = {
            headersShown: headersShown.map(hd => headers.find(h => h.text === hd).key),
            headersHidden: headersHidden.map(hd => headers.find(h => h.text === hd).key),
            nosColumnFixed, colorization,
         };
         await Axios.post(`${SERVER_URL}/sheet/update-setting-user/`, { token, projectId, email, userSettings: userSettingsUpdated });


         // ROWS FROM DB BEFORE SAVE ...
         rowsFromDB = rowsFromDB.filter(r => !rowDeletedFinal.find(x => x.id === r.id));
         // DELTE MOVE TO HERE...
         if (rowDeletedFinal.length > 0) {
            await Axios.post(`${SERVER_URL}/sheet/delete-rows/`, { token, projectId, email, rowIdsArray: rowDeletedFinal.map(r => r.id) });
         };





         let rowsFromDBFinalToSave = rowsFromDB.map(r => {
            let row = {
               _id: r.id,
               parentRow: r._parentRow,
               preRow: r._preRow,
            };
            Object.keys(cellsModifiedTemp).forEach(key => {
               const { rowId, headerName } = extractCellInfo(key);
               let headerKey = headers.find(hd => hd.text === headerName).key;
               if (rowId === row._id) {
                  row.data = { ...row.data || {}, [headerKey]: cellsModifiedTemp[key] }
               };
            });
            return row;
         });
         if (role !== 'manager' || role !== 'viewer') {
            await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: rowsFromDBFinalToSave });
         };

         commandAction({ type: 'save-data-successfully' });

         const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });

         commandAction({ type: 'reload-data-from-server', data: res.data });

      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };




   return (
      <>
         {panelSettingType === 'save-ICON' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={saveDataToServer}
               content='Do you want to save ?'
            />
         )}

         {panelSettingType === 'filter-ICON' && (
            <FormFilter applyFilter={applyFilter} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'swap-ICON' && (
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
            <PanelPickNumber
               onClickCancelModal={onClickCancelModal}
               onClickApply={onClickInsertRow}
            />
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
               content={`Are you sure to create a new revision of this drawing: ${panelType.cellProps.rowData['Drawing Number'] || ' '} - ${panelType.cellProps.rowData['Drawing Name'] || ' '} ?`}
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
               content={`Are you sure to delete the: ${panelType.cellProps.rowData['Drawing Number'] || ' '} - ${panelType.cellProps.rowData['Drawing Name'] || ' '} ?`}
            />
         )}

         {panelSettingType === 'colorized-ICON' && (
            <ColorizedForm applyColorization={applyColorization} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'Insert Drawings By Type' && (
            <PanelPickNumber
               onClickCancelModal={onClickCancelModal}
               onClickApply={onClickFolderInsertSubRows}
            />
         )}
      </>
   );
};

export default PanelSetting;


const PanelPickNumber = ({ onClickCancelModal, onClickApply }) => {
   const [nosOfRows, setNosOfRows] = useState(1);
   return (
      <div style={{ padding: 20 }}>
         <Input
            placeholder='Enter Number Of Drawings...'
            type='number' min='1'
            value={nosOfRows}
            onChange={(e) => setNosOfRows(e.target.value)}
            style={{
               marginBottom: 20,
               borderRadius: 0
            }}
         />
         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={() => onClickApply(nosOfRows)}
            />
         </div>
      </div>
   );
};





function _processRows1(rows) {
   let rowsProcessed = []

   if (!(rows instanceof Array) || !rows.length) {
      return rowsProcessed
   };

   // sort & format rows
   let firstRowIndex = rows.findIndex((row) => !row._preRow)
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0]
      while (preRow) {
         rowsProcessed.push(preRow)

         let nextRowIndex = rows.findIndex(
            (row) => String(row._preRow) == String(preRow.id)
         )
         if (nextRowIndex >= 0) {
            preRow = rows.splice(nextRowIndex, 1)[0]
         } else {
            preRow = null
         }
      }
      firstRowIndex = rows.findIndex((row) => !row._preRow)
   }

   _processRowsLossHead1(rows, rowsProcessed)

   return rowsProcessed
};
function _processRowsLossHead1(rows, rowsProcessed) {
   if (!rows.length) {
      return
   }

   let firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow(r, rows))
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0]
      while (preRow) {
         rowsProcessed.push(preRow)

         let nextRowIndex = rows.findIndex(
            (row) => String(row._preRow) == String(preRow.id)
         )
         if (nextRowIndex >= 0) {
            preRow = rows.splice(nextRowIndex, 1)[0]
         } else {
            preRow = null
         }
      }
      firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow(r, rows))
   }
};
function _processChainRows2(rows) {
   let rowsProcessed = []

   if (!(rows instanceof Array) || !rows.length) {
      return rowsProcessed
   }

   // sort & format rows
   let firstRowIndex = rows.findIndex((row) => !row._preRow)
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0]
      let chain = []
      while (preRow) {
         chain.push(preRow)

         let nextRowIndex = rows.findIndex(
            (row) => String(row._preRow) == String(preRow.id)
         )
         if (nextRowIndex >= 0) {
            preRow = rows.splice(nextRowIndex, 1)[0]
         } else {
            preRow = null
         }
      }
      rowsProcessed.push(chain)
      firstRowIndex = rows.findIndex((row) => !row._preRow)
   }

   _processChainRowsLossHead2(rows, rowsProcessed)

   return rowsProcessed
};
function _processChainRowsLossHead2(rows, rowsProcessed) {
   if (!rows.length) {
      return
   }

   let firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow(r, rows))
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0]
      let chain = []
      while (preRow) {
         chain.push(preRow)

         let nextRowIndex = rows.findIndex(
            (row) => String(row._preRow) == String(preRow.id)
         )
         if (nextRowIndex >= 0) {
            preRow = rows.splice(nextRowIndex, 1)[0]
         } else {
            preRow = null
         }
      }
      rowsProcessed.push(chain)
      firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow(r, rows))
   };
};
function _filterRowLossPreRow(row, rows) {
   return rows.every(r => String(row._preRow) != String(r.id));
};