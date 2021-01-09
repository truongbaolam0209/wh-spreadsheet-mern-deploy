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


         console.log('rowsUpdatePreRowOrParentRow', rowsUpdatePreRowOrParentRow);

         rowsFromDB = rowsFromDB.map(r => ({ id: r.id, _preRow: r._preRow, _parentRow: r._parentRow }));
         console.log('rowsFromDB ..........', rowsFromDB);
         // check if row deleted by other users
         let rowsUpdatePreRowOrParentRowArray = Object.values(rowsUpdatePreRowOrParentRow)
            .filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing') ||
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
         console.log('rowsInNewParent ..........rowsInOldParent', rowsInNewParent, rowsInOldParent);
         let rowsInOldParentOutput = chainRow(rowsInOldParent);
         console.log('rowsInOldParentOutput ..........', rowsInOldParentOutput);
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
               let lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
               rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
               rowsFromDB = [...rowsFromDB, ...arrChain];
            };
         });
         console.log('rowsFromDBtgttgt ............', rowsFromDB, rowsInNewParent.map(r => r._parentRow));

         let idsNewParentArray = [...new Set(rowsInNewParent.map(r => r._parentRow))];
         console.log('idsNewParentArray', idsNewParentArray);

         idsNewParentArray.forEach(idP => {
            let ccc = rowsInNewParent.filter(r => r._parentRow === idP);
            console.log(ccc);
            let rowsChildren = _processRows1(ccc);
            console.log('er', rowsChildren);
            rowsChildren.forEach((r, i) => {
               r._preRow = i === 0 ? null : rowsChildren[i - 1].id;
            });
            rowsFromDB = [...rowsFromDB, ...rowsChildren];
         });

         console.log('rowsFromDB333333 ............', rowsFromDB);

         // DELETE ROWS ------------------------------------->>>>> DONE
         let rowDeletedFinal = [];
         rowsDeleted.forEach(row => {
            let rowInDB = rowsFromDB.find(r => r.id === row.id);
            if (rowInDB) {
               let rowBelow = rowsFromDB.find(r => r._preRow === rowInDB.id);
               if (rowBelow) rowBelow._preRow = rowInDB._preRow;
               rowDeletedFinal.push(rowInDB);
            };
         });

         rowsFromDB = rowsFromDB.filter(r => !rowDeletedFinal.find(x => x.id === r.id));

         if (rowDeletedFinal.length > 0) {
            await Axios.post(
               `${SERVER_URL}/sheet/delete-rows/${projectId}?userId=${email}`,
               rowDeletedFinal.map(r => r.id)
            );
         };


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
         rowDeletedFinal.forEach(r => { //------------------------------------->>>>> DONE
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
         console.log('rowsFromDB .........222.', rowsFromDB);
         rowsFromDB.forEach(row => {
            row.preRow = row._preRow;
            delete row._preRow;
            row.parentRow = row._parentRow;
            delete row._parentRow;
            row._id = row.id;
            delete row.id;

            Object.keys(cellsModifiedTemp).forEach(key => {
               const { rowId, headerName } = extractCellInfo(key);
               let headerKey = headers.find(hd => hd.text === headerName).key;
               if (rowId === row.id) {
                  row.data = { ...row.data || {}, [headerKey]: cellsModifiedTemp[key] }
               };
            });
         });

      
         console.log('before saveeee .........222.', rowsFromDB);
         await Axios.post(
            `${SERVER_URL}/sheet/update-rows/${projectId}`,
            { rows: rowsFromDB }
         );
         


         await Axios.post( // SAVE SETTINGS ..........................
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


function chainRow(rows) {
   let chains = [];

   rows.forEach(row => {
      let newChain = [row];

      chains.forEach((chain, index) => {
         if (chain[0]._preRow == row.id) {
            newChain = newChain.concat(chain);
            chains.splice(index, 1);
         };

         if (chain[chain.length - 1].id === row._preRow) {
            newChain = chain.concat(newChain);
            chains.splice(index, 1);
         };
      });

      chains.push(newChain);
   });

   return chains;
};



let exampleInputRows = [
   { id: 'id6', _preRow: 'id3' },
   { id: 'id1', _preRow: 'id9' },
   { id: 'id7', _preRow: null },
   { id: 'idrrrr7', _preRow: 'id344444444444' },
   
   
   { id: 'id2', _preRow: 'id99' },
   { id: 'id3', _preRow: 'id1' },
   { id: 'id344444444444', _preRow: 'id4' },
   
   { id: 'id4', _preRow: 'id777' },
   
   { id: 'id8', _preRow: 'id2' },
   { id: 'id10', _preRow: 'id5' },
   { id: 'id10777777777', _preRow: 'id9' },
   
   
   { id: 'id9', _preRow: null },
   { id: 'id5', _preRow: 'id899' },
   { id: 'id5555555', _preRow: 'id3' },
   
   { id: 'id777777777777777', _preRow: 'id10' },
];
let exampleInputRowsrrrrr = [
   { id: 'uuuuuuuuuuuuuu', _preRow: 'tg9999' },
   { id: 'id6', _preRow: 'id3' },
   { id: 'id1', _preRow: 'id9' },
   { id: 'id7', _preRow: null },
   { id: 'idrrrr7', _preRow: 'id344444444444' },
   { id: 'tg6777', _preRow: 'tttt' },


   { id: 'lam111', _preRow: 'lam444' },

   { id: 'lam111ggg', _preRow: 'lam444777' },
   
   { id: 'gggggggggg', _preRow: null },
   { id: 'tg9999', _preRow: null },
   { id: 'id2', _preRow: 'id99' },
   { id: 'id3', _preRow: 'id1' },
   { id: 'id344444444444', _preRow: 'id4' },
   
   { id: 'id4', _preRow: 'id777' },
   
   { id: 'id8', _preRow: 'id2' },
   { id: 'id10', _preRow: 'id5' },
   { id: 'id10777777777', _preRow: 'id9' },
   
   
   { id: 'id9', _preRow: null },
   { id: 'id5', _preRow: 'id899' },
   { id: 'id5555555', _preRow: 'id3' },
   
   { id: 'id777777777777777', _preRow: 'id10' },

   { id: 'tttt', _preRow: 'idrrrr7' },
];

let ttttttttttttttttt = [
   { id: 'idrrrr7', _preRow: 'id7' },
   { id: 'fgfg', _preRow: 'idrrrr7' },
   { id: 'id1', _preRow: 'id6' },
   { id: 'id7', _preRow: 'id1' },
   { id: 'eeee', _preRow: '6666t' },
   { id: '6666t', _preRow: 'ttt' },
   { id: 'ttt', _preRow: 'fgfg' },
   { id: 'id6', _preRow: 'id3' },
];


// console.log('XXXXXXXXXXXXXXXXX444444444', _processRows1([...exampleInputRows]), _processRows1([...ttttttttttttttttt]));
// console.log('XXXXXXXXXXXXXXXXX444444444', _processChainRows2([...exampleInputRows]), _processChainRows2([...ttttttttttttttttt]));

console.log('XXXXXXXXXXXXXXXXX444444444', _processRows1([...exampleInputRowsrrrrr]), _processChainRows2([...exampleInputRowsrrrrr]));






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
 }
 function _processRowsLossHead1(rows, rowsProcessed) {
   if (!rows.length) {
     return
   }
 
   let firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow1(r, rows))
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
     firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow1(r, rows))
   }
 }
 function _filterRowLossPreRow1(row, rows) {
   return rows.every(r => String(row._preRow) != String(r.id))
 }


 

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
 }
 
 function _processChainRowsLossHead2(rows, rowsProcessed) {
   if (!rows.length) {
     return
   }
 
   let firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow2(r, rows))
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
     firstRowIndex = rows.findIndex((r) => _filterRowLossPreRow2(r, rows))
   }
 }
 
 function _filterRowLossPreRow2(row, rows) {
   return rows.every(r => String(row._preRow) != String(r.id))
 }