import Axios from 'axios';
import moment from 'moment';
import React, { useContext } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertCellTempToHistory, convertDrawingVersionToHistory, debounceFnc, extractCellInfo, genId, mongoObjectId, validateEmailInput } from '../../utils';
import FormFilter from '../generalComponents/FormFilter';
import FormGroup from '../generalComponents/FormGroup';
import FormSort from '../generalComponents/FormSort';
import PanelConfirm from '../generalComponents/PanelConfirm';
import PanelConfirmResetMode from '../generalComponents/PanelConfirmResetMode';
import PanelPickNumber from '../generalComponents/PanelPickNumber';
import ReorderColumnForm from '../generalComponents/ReorderColumnForm';
import { getOutputRowsAllSorted, headersRfaView } from '../PageSpreadsheet';
import ColorizedForm from './ColorizedForm';
import FormCellColorizedCheck from './FormCellColorizedCheck';
import FormDateAutomation from './FormDateAutomation';
import FormDrawingTypeOrder, { compareCurrentTreeAndTreeFromDB, flattenAllTreeChildNode1, getTradeNameFnc, getTreeFlattenOfNodeInArray } from './FormDrawingTypeOrder';
import PanelAddNewRFA from './PanelAddNewRFA';
import TableActivityHistory from './TableActivityHistory';
import TableCellHistory from './TableCellHistory';
import TableDrawingDetail from './TableDrawingDetail';




const getFileNameFromLinkResponse = (link) => /[^/]*$/.exec(link)[0];

const PanelSetting = (props) => {

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateCell, getCellModifiedTemp, OverwriteCellsModified } = useContext(CellContext);
   const { projectIsAppliedRfaView, companies } = stateProject.allDataOneSheet;

   const { panelType, panelSettingType, commandAction, onClickCancelModal, setLoading } = props;

   const applyReorderColumns = (data) => commandAction({ type: 'reorder-columns', data });

   const applyFilter = (filter) => commandAction({ type: 'filter-by-columns', data: { modeFilter: filter } });

   const applyResetMode = (modeReset) => {
      const modeResetObj = {};
      modeReset.forEach(type => {
         if (type.header === 'Filter' && type.mode === 'hidden') modeResetObj.modeFilter = [];
         if (type.header === 'Sort' && type.mode === 'hidden') modeResetObj.modeSort = {};
         if (type.header === 'Search' && type.mode === 'hidden') modeResetObj.modeSearch = {};
      });
      return commandAction({
         type: 'reset-filter-sort',
         data: {
            rowsAll: stateRow.rowsAll,
            ...modeResetObj
         }
      });
   };
   const applyQuitGroupingMode = () => {
      return commandAction({
         type: 'reset-filter-sort',
         data: { modeGroup: [], modeSearch: {} }
      });
   };


   const applyGroup = (data) => commandAction({ type: 'group-columns', data: { modeGroup: data } });

   const applyColorization = (data) => commandAction({ type: 'drawing-colorized', data });

   const setCellHistoryArr = debounceFnc((data) => commandAction({ type: 'highlight-cell-history', data }), 1);

   const applySort = (data) => commandAction({ type: 'sort-data', data: { modeSort: data } });

   const applyViewTemplate = (name) => {
      let { allDataOneSheet: { publicSettings: { headers } }, userData: { headersShown, headersHidden, nosColumnFixed, colorization } } = stateProject;
      const { viewTemplateNodeId, viewTemplates, modeFilter, modeSort } = stateRow;

      headersShown = headersShown.map(hd => headers.find(x => x.text === hd).key);
      headersHidden = headersHidden.map(hd => headers.find(x => x.text === hd).key);

      commandAction({
         type: 'add-view-templates',
         data: {
            viewTemplates: [...viewTemplates, {
               id: mongoObjectId(),
               name,
               headersShown,
               headersHidden,
               nosColumnFixed,
               colorization,
               viewTemplateNodeId,
               modeFilter,
               modeSort
            }]
         }
      });
   };


   const onClickInsertRow = (nosOfRows) => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow } = stateRow;

      const idsArr = genId(nosOfRows);
      idRowsNew = [...idRowsNew, ...idsArr];

      let newRows = [];
      let rowBelow;
      if (panelSettingType === 'Insert Drawings Below') {
         let rowAbove = panelType.cellProps.rowData;
         newRows = idsArr.map((id, i) => {
            return ({
               id, _rowLevel: 1,
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
               id, _rowLevel: 1,
               _parentRow: rowBelow._parentRow,
               _preRow: i === 0 ? rowBelow._preRow : idsArr[i - 1]
            });
         });
         rowBelow._preRow = idsArr[idsArr.length - 1];
      };

      if (rowBelow) {
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelow);
      };
      newRows.forEach(row => {
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
      });
      rowsAll = [...rowsAll, ...newRows];

      const rowsOutput = _processRowsChainNoGroupFnc1([...rowsAll]);
      commandAction({
         type: 'insert-drawings',
         data: {
            rowsAll: rowsOutput,
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
            id, _rowLevel: 1,
            _parentRow: panelType.cellProps.rowData.id,
            _preRow: i === 0 ? null : idsArr[i - 1]
         });
      });
      newRows.forEach(row => {
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
      });
      let rowBelow = rowsAll.find(r => r._parentRow === panelType.cellProps.rowData.id && r._preRow === null);
      if (rowBelow) {
         rowBelow._preRow = idsArr[idsArr.length - 1];
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelow);
      };
      rowsAll = [...rowsAll, ...newRows];

      const rowsOutput = _processRowsChainNoGroupFnc1([...rowsAll]);
      commandAction({
         type: 'insert-drawings-by-folder',
         data: {
            rowsAll: rowsOutput,
            rowsUpdatePreRowOrParentRow,
            idRowsNew
         }
      });
   };
   const onClickDuplicateRows = (nosOfRows) => {
      let { rowsAll, idRowsNew, rowsUpdatePreRowOrParentRow } = stateRow;
      const { headers } = stateProject.allDataOneSheet.publicSettings;

      let idsArr = genId(nosOfRows);
      idRowsNew = [...idRowsNew, ...idsArr];

      const rowAbove = panelType.cellProps.rowData;

      const newRows = idsArr.map((id, i) => ({
         ...rowAbove, id,
         _preRow: i === 0 ? rowAbove.id : idsArr[i - 1]
      }));

      const rowBelow = rowsAll.find(r => r._preRow === rowAbove.id);
      if (rowBelow) {
         rowBelow._preRow = idsArr[idsArr.length - 1];
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelow);
      };

      let cellsModifiedTempObj = {};
      newRows.forEach(row => {
         headers.forEach(hd => {
            if (row[hd.text]) {
               cellsModifiedTempObj[`${row.id}~#&&#~${hd.text}`] = row[hd.text];
            };
         });
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
      });
      OverwriteCellsModified({ ...stateCell.cellsModifiedTemp, ...cellsModifiedTempObj });
      rowsAll = [...rowsAll, ...newRows];

      const rowsOutput = _processRowsChainNoGroupFnc1([...rowsAll]);
      commandAction({
         type: 'duplicate-drawings',
         data: {
            rowsAll: rowsOutput,
            rowsUpdatePreRowOrParentRow,
            idRowsNew
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
         updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, rowBelow);
      };

      if (rowId in rowsUpdatePreRowOrParentRow) delete rowsUpdatePreRowOrParentRow[rowId];
      rowsAll = rowsAll.filter(r => r.id !== rowId);

      if (idRowsNew.indexOf(rowId) === -1) {
         rowsDeleted = [...rowsDeleted, panelType.cellProps.rowData];
      } else {
         idRowsNew.splice(idRowsNew.indexOf(rowId), 1);
      };

      Object.keys(cellsModifiedTemp).forEach(key => {
         const { rowId: rowIdExtract } = extractCellInfo(key);
         if (rowIdExtract === rowId) {  // deleted cells modified temporary...
            delete cellsModifiedTemp[key];
         };
      });
      OverwriteCellsModified({ ...cellsModifiedTemp });

      const rowsOutput = _processRowsChainNoGroupFnc1([...rowsAll]);

      commandAction({
         type: 'delete-drawing',
         data: {
            rowsAll: rowsOutput,
            rowsUpdatePreRowOrParentRow,
            rowsDeleted,
            idRowsNew,
         }
      });
   };

   const applyFolderOrganize = (drawingTypeTreeNew, mergeList, nodeIsolated) => {

      let {
         rowsAll, rowsDeleted, idRowsNew, rowsUpdatePreRowOrParentRow,
         drawingsTypeDeleted, drawingsTypeNewIds, drawingTypeTree, viewTemplateNodeId
      } = stateRow;

      const { cellsModifiedTemp } = stateCell;

      mergeList.forEach(parentNodeId => {
         const node = drawingTypeTree.find(x => x.id === parentNodeId);
         const treeBranchToMerge = getTreeFlattenOfNodeInArray(drawingTypeTree, node);

         const treeBranchChildren = treeBranchToMerge.filter(x => x.id !== parentNodeId);
         let arr = [];
         treeBranchChildren.forEach(node => {
            const rowsChildren = rowsAll.filter(r => r._parentRow === node.id);
            arr = [...arr, ...rowsChildren];
         });
         arr.forEach((row, i) => {
            row._parentRow = parentNodeId;
            row._preRow = i === 0 ? null : arr[i - 1].id;
            updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, row);
         });
      });


      let drawingTypeTreeUpdate = flattenAllTreeChildNode1(drawingTypeTreeNew);
      drawingTypeTreeUpdate.forEach(item => {
         delete item.children;
      });


      drawingTypeTree.forEach(tr => {
         if (!drawingTypeTreeUpdate.find(x => x.id === tr.id)) {
            if (drawingsTypeNewIds.indexOf(tr.id) !== -1) {
               drawingsTypeNewIds = drawingsTypeNewIds.filter(id => id !== tr.id);
            } else {
               drawingsTypeDeleted = [...drawingsTypeDeleted, tr];
            };
         };
      });
      drawingTypeTreeUpdate.forEach(tr => {
         if (!drawingTypeTree.find(x => x.id === tr.id)) {
            drawingsTypeNewIds.push(tr.id);
         };
      });


      let allDrawingsParentId = [...new Set(rowsAll.map(x => x._parentRow))];
      allDrawingsParentId.forEach(drawingParentId => {
         const rowsChildren = rowsAll.filter(row => row._parentRow === drawingParentId);

         if (!drawingTypeTreeUpdate.find(x => x.id === drawingParentId) && !mergeList.find(item => item.id === drawingParentId)) {
            rowsChildren.forEach(rrr => {
               if (idRowsNew.indexOf(rrr.id) === -1) {
                  rowsDeleted = [...rowsDeleted, rrr];
               } else {
                  idRowsNew.splice(idRowsNew.indexOf(rrr.id), 1);
               };

               Object.keys(cellsModifiedTemp).forEach(key => {
                  const { rowId: rowIdExtract } = extractCellInfo(key);
                  if (rowIdExtract === rrr.id) {  // deleted cells modified temporary...
                     delete cellsModifiedTemp[key];
                  };
               });
               if (rrr.id in rowsUpdatePreRowOrParentRow) delete rowsUpdatePreRowOrParentRow[rrr.id];
            });
            rowsAll = rowsAll.filter(r => r._parentRow !== drawingParentId);
         } else if (!drawingTypeTreeUpdate.find(x => x.id === drawingParentId) && mergeList.find(item => item.id === drawingParentId)) {



         } else {
            if (drawingTypeTreeUpdate.find(x => x.parentId === drawingParentId)) {
               // some folders are added below drawing parent => add new type to contain
               const nodeParentPrevious = drawingTypeTreeUpdate.find(x => x.id === drawingParentId);
               const allTreeLevel = [...new Set(drawingTypeTreeUpdate.map(x => x.treeLevel))];

               let arrayNodes = [nodeParentPrevious];

               for (let i = nodeParentPrevious.treeLevel; i <= allTreeLevel.length; i++) {
                  let arrFilter = drawingTypeTreeUpdate.filter(x => x.treeLevel === allTreeLevel[i] && arrayNodes.find(dt => dt.id === x.parentId));
                  arrayNodes = [...arrayNodes, ...arrFilter];
               };
               const lowestLevel = Math.max(...arrayNodes.map(x => x.treeLevel));
               const dwgTypeParentToShiftDrawings = arrayNodes.find(x => x.treeLevel === lowestLevel);

               rowsChildren.forEach(r => {
                  r._parentRow = dwgTypeParentToShiftDrawings.id;
                  updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, r);
               });
            };
         };
      });

      OverwriteCellsModified({ ...cellsModifiedTemp });

      const rowsOutput = getOutputRowsAllSorted(drawingTypeTreeUpdate, rowsAll);

      let templateObj = {};
      if (viewTemplateNodeId !== nodeIsolated) {
         templateObj.viewTemplateNodeId = nodeIsolated;
      };

      commandAction({
         type: 'drawing-folder-organization',
         data: {
            rowsAll: rowsOutput,
            rowsDeleted,
            drawingTypeTree: drawingTypeTreeUpdate,
            rowsUpdatePreRowOrParentRow,
            drawingsTypeDeleted,
            drawingsTypeNewIds,
            idRowsNew,
            ...templateObj
         }
      });
   };
   const applyDateAutomation = (dateAutomation) => {
      let { rowsAll } = stateRow;
      const rowId = panelType.cellProps.rowData.id;
      let row = rowsAll.find(r => r.id === rowId);

      Object.keys(dateAutomation).forEach(key => {
         const cellTempId = `${rowId}~#&&#~${key}`;
         const dateConverted = moment(dateAutomation[key]).format('DD/MM/YY');
         getCellModifiedTemp({ [cellTempId]: dateConverted });
         row[key] = dateConverted;
      });

      commandAction({
         type: 'drawing-data-automation',
         data: { rowsAll }
      });
   };
   const createNewDrawingRevision = () => {
      const { roleTradeCompany: { company } } = stateProject.allDataOneSheet;

      const arrHeadersGoBlank = [
         'Model Start (T)', 'Model Start (A)', 'Model Finish (T)', 'Model Finish (A)', 'Drawing Start (T)', 'Drawing Start (A)',
         'Drawing Finish (T)', 'Drawing Finish (A)', 'Drg To Consultant (T)', 'Drg To Consultant (A)', 'Consultant Reply (T)',
         'Consultant Reply (A)', 'Get Approval (T)', 'Get Approval (A)', 'Construction Issuance Date', 'Construction Start', 'Rev', 'Status',
         'RFA Ref'
      ];

      let { rowsAll } = stateRow;
      const rowId = panelType.cellProps.rowData.id;
      let row = rowsAll.find(r => r.id === rowId);
      let rowOldVersiontoSave = { ...row };

      arrHeadersGoBlank.forEach(hd => {
         const cellTempId = `${rowId}~#&&#~${hd}`;
         getCellModifiedTemp({ [cellTempId]: '' });
         row[hd] = '';
      });


      let objForRFA = {};
      if (projectIsAppliedRfaView) {
         let rowsUpdateSubmissionOrReplyForNewDrawingRev = stateRow.rowsUpdateSubmissionOrReplyForNewDrawingRev;
         Object.keys(row).forEach(key => {
            if (
               key.includes('reply-$$$-') || 
               key.includes(`submission-$$$-drawing-${company}`) || 
               key.includes(`submission-$$$-user-${company}`) 
            ) {
               row[key] = '';
            };
         });
         if (rowsUpdateSubmissionOrReplyForNewDrawingRev.indexOf(rowId) === -1) {
            rowsUpdateSubmissionOrReplyForNewDrawingRev = [ ...rowsUpdateSubmissionOrReplyForNewDrawingRev, rowId ];
            objForRFA = { rowsUpdateSubmissionOrReplyForNewDrawingRev };
         };
      };

      commandAction({
         type: 'create-new-drawing-revisions',
         data: {
            rowsAll,
            rowsVersionsToSave: [...stateRow.rowsVersionsToSave || [], rowOldVersiontoSave],
            ...objForRFA
         }
      });
   };

   const saveDataToServer = async () => {
      const { email, projectId, token, role, projectName, projectIsAppliedRfaView, publicSettings, company } = stateProject.allDataOneSheet;
      const { headersShown, headersHidden, nosColumnFixed, colorization } = stateProject.userData;
      const { headers } = publicSettings;

      let { cellsModifiedTemp } = stateCell;
      let {
         rowsVersionsToSave,
         rowsUpdatePreRowOrParentRow,
         drawingTypeTreeInit,
         drawingTypeTree,
         drawingsTypeDeleted,
         rowsDeleted,

         rowsAll,
         rowsUpdateSubmissionOrReplyForNewDrawingRev,

         viewTemplateNodeId,
         viewTemplates,
         modeFilter,
         modeSort,
      } = stateRow;


      // check new version reply go blank
      const rowsGetNewRev = rowsAll.filter(r => rowsUpdateSubmissionOrReplyForNewDrawingRev.indexOf(r.id) !== -1);


      try {
         setLoading(true);
         commandAction({ type: '' });

         const resDB = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
         const resCellsHistory = await Axios.get(`${SERVER_URL}/cell/history/`, { params: { token, projectId } });

         let { publicSettings: publicSettingsFromDB, rows: rowsFromDBInit } = resDB.data;
         let { drawingTypeTree: drawingTypeTreeFromDB, activityRecorded: activityRecordedFromDB } = publicSettingsFromDB;

         const headerKeyDrawingNumber = headers.find(hd => hd.text === 'Drawing Number').key;
         const headerKeyDrawingName = headers.find(hd => hd.text === 'Drawing Name').key;

         let rowsFromDB = rowsFromDBInit.map(row => ({ ...row }));

         let {
            needToSaveTree,
            treeDBModifiedToSave,
            nodesToAddToDB,
            nodesToRemoveFromDB
         } = compareCurrentTreeAndTreeFromDB(
            drawingTypeTreeInit,
            drawingTypeTree,
            drawingsTypeDeleted,
            drawingTypeTreeFromDB,
            activityRecordedFromDB.filter(x => x.action === 'Delete Drawing Type'),
         );
         let activityRecordedArr = [];


         // check if row or its parents deleted by other users
         const rowsUpdatePreRowOrParentRowArray = Object.values(rowsUpdatePreRowOrParentRow)
            .filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing') &&
               !activityRecordedFromDB.find(r => r.id === row._parentRow && r.action === 'Delete Drawing Type'));


         if (rowsUpdatePreRowOrParentRowArray.length > 0) {

            let arrID = [];
            rowsFromDB.forEach(r => { // take out temporarily all rowsUpdatePreRowOrParentRowArray from DB
               if (rowsUpdatePreRowOrParentRowArray.find(row => row.id === r.id)) {
                  arrID.push(r.id);
                  const rowBelow = rowsFromDB.find(rrr => rrr._preRow === r.id);
                  if (rowBelow) rowBelow._preRow = r._preRow;
               };
            });
            rowsFromDB = rowsFromDB.filter(r => arrID.indexOf(r.id) === -1);



            const rowsInOldParent = rowsUpdatePreRowOrParentRowArray.filter(r => {
               return treeDBModifiedToSave.find(tr => tr.id === r._parentRow && !treeDBModifiedToSave.find(x => x.parentId === tr.id));
            });
            const rowsInOldParentDivertBranches = rowsUpdatePreRowOrParentRowArray.filter(r => {
               return treeDBModifiedToSave.find(tr => tr.id === r._parentRow && treeDBModifiedToSave.find(x => x.parentId === tr.id));
            });
            const rowsInNewParent = rowsUpdatePreRowOrParentRowArray.filter(r => {
               return !treeDBModifiedToSave.find(tr => tr.id === r._parentRow);
            });



            const rowsInOldParentOutput = _processChainRowsSplitGroupFnc2([...rowsInOldParent]);
            rowsInOldParentOutput.forEach(arrChain => {
               const rowFirst = arrChain[0];
               const parentRowInDB = treeDBModifiedToSave.find(tr => tr.id === rowFirst._parentRow);
               const rowAbove = rowsFromDB.find(r => r.id === rowFirst._preRow);
               if (rowAbove) {
                  if (rowAbove._parentRow !== rowFirst._parentRow) { // rowAbove move to other parent by other user
                     const lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
                     rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
                  } else { // rowAbove is still in the same parent
                     const rowBelowRowAbove = rowsFromDB.find(r => r._preRow === rowAbove.id);
                     if (rowBelowRowAbove) rowBelowRowAbove._preRow = arrChain[arrChain.length - 1].id;
                     rowFirst._preRow = rowAbove.id;
                  };
               } else {
                  if (rowFirst._preRow === null) {
                     const firstRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && r._preRow === null);
                     if (firstRowInParent) { // if firstRowInParent undefined means Drawing type has 0 drawing currently...
                        firstRowInParent._preRow = arrChain[arrChain.length - 1].id;
                     };
                  } else {
                     const lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
                     rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
                  };
               };
               rowsFromDB = [...rowsFromDB, ...arrChain];
            });



            let idsOldParentDivertBranches = [...new Set(rowsInOldParentDivertBranches.map(r => r._parentRow))];
            idsOldParentDivertBranches.forEach(idP => {
               let arrInput = rowsInOldParentDivertBranches.filter(r => r._parentRow === idP);
               let rowsChildren = _processRowsChainNoGroupFnc1([...arrInput]);

               const treeNode = treeDBModifiedToSave.find(x => x.id === idP);
               const newIdParent = mongoObjectId();
               treeDBModifiedToSave.push({
                  title: 'New Drawing Type',
                  id: newIdParent,
                  parentId: treeNode.id,
                  treeLevel: treeNode.treeLevel + 1,
                  expanded: true,
               });
               needToSaveTree = true;

               activityRecordedArr.push({
                  id: newIdParent,
                  email,
                  createdAt: new Date(),
                  action: 'Create Drawing Type',
                  [headerKeyDrawingNumber]: 'New Drawing Type',
               });

               rowsChildren.forEach((r, i) => {
                  r._preRow = i === 0 ? null : rowsChildren[i - 1].id;
                  r._parentRow = newIdParent;
               });
               rowsFromDB = [...rowsFromDB, ...rowsChildren];
            });



            let idsNewParentArray = [...new Set(rowsInNewParent.map(r => r._parentRow))];
            idsNewParentArray.forEach(idP => {
               let arrInput = rowsInNewParent.filter(r => r._parentRow === idP);
               let rowsChildren = _processRowsChainNoGroupFnc1([...arrInput]);
               rowsChildren.forEach((r, i) => {
                  r._preRow = i === 0 ? null : rowsChildren[i - 1].id;
               });
               rowsFromDB = [...rowsFromDB, ...rowsChildren];
            });
         };


         // SAVE CELL HISTORY
         let objCellHistory = {};
         resCellsHistory.data.map(cell => {
            const headerFound = headers.find(hd => hd.key === cell.headerKey);
            if (headerFound) {
               const headerText = headerFound.text;
               if (cell.histories.length > 0) {
                  const latestHistoryText = cell.histories[cell.histories.length - 1].text;
                  objCellHistory[`${cell.row}-${headerText}`] = latestHistoryText;
               };
            };
         });
         Object.keys(cellsModifiedTemp).forEach(key => {
            if (objCellHistory[key] && objCellHistory[key] === cellsModifiedTemp[key]) {
               delete cellsModifiedTemp[key];
            } else {
               let rowId = extractCellInfo(key).rowId;
               if (activityRecordedFromDB.find(x => x.id === rowId && x.action === 'Delete Drawing')) {
                  delete cellsModifiedTemp[key];
               };
            };
         });

         if (Object.keys(cellsModifiedTemp).length > 0) {
            await Axios.post(`${SERVER_URL}/cell/history/`, { token, projectId, cellsHistory: convertCellTempToHistory(cellsModifiedTemp, stateProject) });
         };

         // SAVE DRAWINGS NEW VERSION
         rowsVersionsToSave = rowsVersionsToSave.filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing'));
         if (rowsVersionsToSave.length > 0) {
            await Axios.post(`${SERVER_URL}/row/history/`, { token, projectId, email, rowsHistory: convertDrawingVersionToHistory(rowsVersionsToSave, stateProject) });
         };




         // DELETE ROWS
         let rowDeletedFinal = [];
         rowsDeleted.forEach(row => { // some rows already deleted by previous user => no need to delete anymore
            const rowInDB = rowsFromDB.find(r => r.id === row.id);
            if (rowInDB) {
               const rowBelow = rowsFromDB.find(r => r._preRow === rowInDB.id);
               if (rowBelow) {
                  rowBelow._preRow = rowInDB._preRow;
               };
               rowsFromDB = rowsFromDB.filter(r => r.id !== rowInDB.id); // FIXEDDDDDDDDDDDDDDDDDDD
               rowDeletedFinal.push(row);
            };
         });




         if (nodesToRemoveFromDB.length > 0) {
            nodesToRemoveFromDB.forEach(fd => {
               activityRecordedArr.push({
                  id: fd.id, email, createdAt: new Date(), action: 'Delete Drawing Type',
                  [headerKeyDrawingNumber]: fd.title,
               });
            });
         };
         if (nodesToAddToDB.length > 0) {
            nodesToAddToDB.forEach(fd => {
               activityRecordedArr.push({
                  id: fd.id, email, createdAt: new Date(), action: 'Create Drawing Type',
                  [headerKeyDrawingNumber]: fd.title,
               });
            });
         };

         // SAVE PUBLIC SETTINGS RECORDED
         activityRecordedArr.forEach(rc => {
            const newRowsAddedByPreviousUserButParentDeletedByCurrentUser = rowsFromDB.filter(e => {
               return e._parentRow === rc.id &&
                  rc.action === 'Delete Drawing Type' &&
                  !rowDeletedFinal.find(x => x.id === e.id);
            });
            rowDeletedFinal = [...rowDeletedFinal, ...newRowsAddedByPreviousUserButParentDeletedByCurrentUser];
         });

         rowDeletedFinal.forEach(r => {
            activityRecordedArr.push({
               id: r.id, email, createdAt: new Date(), action: 'Delete Drawing',
               [headerKeyDrawingNumber]: r['Drawing Number'],
               [headerKeyDrawingName]: r['Drawing Name'],
            });
         });


         rowsFromDB = rowsFromDB.filter(r => !rowDeletedFinal.find(x => x.id === r.id));
         // DELETE ...
         if (rowDeletedFinal.length > 0) {
            await Axios.post(`${SERVER_URL}/sheet/delete-rows/`, { token, projectId, email, rowIdsArray: rowDeletedFinal.map(r => r.id) });
         };


         treeDBModifiedToSave.forEach(tr => {
            headers.forEach(hd => {
               if (hd.text in tr) {
                  tr[hd.key] = tr[hd.text];
                  delete tr[hd.text];
               };
            });
         });

         let publicSettingsUpdated = { projectName };
         if (needToSaveTree) {
            publicSettingsUpdated = { ...publicSettingsUpdated, drawingTypeTree: treeDBModifiedToSave };
         };
         if (activityRecordedArr.length > 0) {
            publicSettingsUpdated = { ...publicSettingsUpdated, activityRecorded: [...activityRecordedFromDB, ...activityRecordedArr] };
         };
         await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, { token, projectId, email, publicSettings: publicSettingsUpdated });

         const userSettingsUpdated = {
            headersShown: headersShown.map(hd => headers.find(h => h.text === hd).key),
            headersHidden: headersHidden.map(hd => headers.find(h => h.text === hd).key),
            nosColumnFixed, colorization, role, viewTemplateNodeId, viewTemplates, modeFilter, modeSort
         };
         await Axios.post(`${SERVER_URL}/sheet/update-setting-user/`, { token, projectId, email, userSettings: userSettingsUpdated });



         // FILTER FINAL ROW TO UPDATE......
         let rowsToUpdateFinal = [];
         rowsFromDB.map(row => {
            
            Object.keys(cellsModifiedTemp).forEach(key => {
               const { rowId, headerName } = extractCellInfo(key);
               if (rowId === row.id) row[headerName] = cellsModifiedTemp[key];
            });

            let rowOutput;
            const found = rowsFromDBInit.find(r => r.id === row.id);
            if (found) {
               let toUpdate = false;
               Object.keys(row).forEach(key => {
                  if (found[key] !== row[key]) toUpdate = true;
               });
               if (toUpdate) rowOutput = { ...row };
            } else {
               rowOutput = { ...row };
            };

            if (rowOutput) {
               let rowToSave = { _id: rowOutput.id, parentRow: rowOutput._parentRow, preRow: rowOutput._preRow };
               headers.forEach(hd => {
                  if (rowOutput[hd.text] || rowOutput[hd.text] === '') {
                     rowToSave.data = { ...rowToSave.data || {}, [hd.key]: rowOutput[hd.text] };
                  };
               });
               
               const rowFoundInRowsGetNewRev = rowsGetNewRev.find(x => x.id === rowToSave._id);
               if (rowFoundInRowsGetNewRev) {
                  Object.keys(rowFoundInRowsGetNewRev).forEach(key => {
                     if (
                        key.includes('reply-$$$-') || 
                        key.includes(`submission-$$$-drawing-${company}`) || 
                        key.includes(`submission-$$$-user-${company}`) 
                     ) {
                        rowToSave.data = { ...rowToSave.data || {}, [key]: '' };
                     };
                  });
               };

               rowsToUpdateFinal.push(rowToSave);
            };
         });

         if (rowsToUpdateFinal.length > 0) {
            await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: rowsToUpdateFinal });
         };
         commandAction({ type: 'save-data-successfully' });

      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };
   const saveDataToServerAndReloadData = async () => {
      const { projectId, token, email } = stateProject.allDataOneSheet;
      try {
         await saveDataToServer();
         const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
         commandAction({ type: 'reload-data-from-server', data: res.data });

      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };


   const reloadDataFromServerViewRFA = async () => {
      const { projectId, token, email } = stateProject.allDataOneSheet;
      try {
         const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
         const resRowHistory = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });
         const { rows } = res.data;

         const expandedRowsIdArr = [
            'ARCHI', 'C&S', 'M&E', 'PRECAST',
            ...rows.filter(x => x.rfaNumber).map(x => x.rfaNumber)
         ];

         commandAction({
            type: 'reload-data-view-rfa',
            data: {
               dataAllFromServer: res.data,
               dataRowsHistoryFromServer: resRowHistory.data,
               expandedRowsIdArr
            }
         });
      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };


   const saveDataToServerAndRedirectToViewRFA = async () => {
      try {
         setLoading(true);
         commandAction({ type: '' });

         await saveDataToServer();
         await reloadDataFromServerViewRFA();
      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };


   const onClickApplyAddNewRFA = async (dataDwg) => {
      const { email, projectId, token, publicSettings, roleTradeCompany: { role, company }, companies, listUser, listGroup } = stateProject.allDataOneSheet;
      const { headers } = publicSettings;
      const { files, type, dwgsToAddNewRFA, trade, rfaToSave, rfaToSaveVersionOrToReply, recipient, emailTitle, emailTextContent } = dataDwg;

      const listConsultant = companies.filter(x => x.companyType === 'Consultant');
      let consultantLead = listConsultant.find(x => x.isLeadConsultant);
      if (!consultantLead) {
         consultantLead = listConsultant[0];
      };
      const rfaRefData = rfaToSaveVersionOrToReply === '-' ? rfaToSave : (rfaToSave + rfaToSaveVersionOrToReply);

      let data = new FormData();
      files.forEach(file => {
         data.append('files', file.originFileObj);
      });
      data.append('projectId', projectId);
      data.append('trade', trade);
      data.append('rfa', rfaToSave);
      data.append('rfaNumber', rfaToSaveVersionOrToReply === '-' ? '0' : rfaToSaveVersionOrToReply); // CHECK...
      data.append('type', type);


      try {
         setLoading(true);
         commandAction({ type: '' });

         if (data !== undefined || data !== null) {

            const res = await Axios.post('https://test.bql-app.com/api/drawing/set-drawing-files', data);

            const listFileName = res.data;
            const arrayFileName = listFileName.map(link => ({
               fileName: getFileNameFromLinkResponse(link),
               fileLink: link
            }));

            let rowsToUpdate = [];


            dwgsToAddNewRFA.forEach(r => {

               let rowOutput = { _id: r.id };

               if (type === 'submission' && !r['RFA Ref']) {
                  
                  r['RFA Ref'] = rfaRefData;
                  r['rfaNumber'] = rfaToSave;
                  r['Status'] = 'Consultant reviewing';
                  r['Drg To Consultant (A)'] = moment(new Date()).format('DD/MM/YY');
                  r['Consultant Reply (T)'] = moment().add(14, 'days').format('DD/MM/YY');

                  const fileFound = arrayFileName.find(fl => fl.fileName === r[`submission-$$$-drawing-${company}`]);
                  if (fileFound) {
                     r[`submission-$$$-drawing-${company}`] = fileFound.fileLink;
                  };
                  r[`submission-$$$-user-${company}`] = email;
                  r[`submission-$$$-trade-${company}`] = trade;

                  const arrHeadersSubmit = ['RFA Ref', 'Status', 'Drg To Consultant (A)', 'Consultant Reply (T)', 'Rev'];

                  headers.forEach(hd => {
                     if (r[hd.text] && arrHeadersSubmit.indexOf(hd.text) !== -1) {
                        rowOutput.data = { ...rowOutput.data || {}, [hd.key]: r[hd.text] };
                     };
                  });
                  rowOutput.data.rfaNumber = r['rfaNumber'];

                  const listDataToAddReply = ['drawing', 'status', 'date', 'comment', 'user'];
                  listDataToAddReply.forEach(txt => {
                     rowOutput.data[`reply-$$$-${txt}-${consultantLead.company}`] = '';
                  });

                  
                  const listDataToAddSubmision = ['drawing', 'trade', 'user'];
                  listDataToAddSubmision.forEach(txt => {
                     rowOutput.data[`submission-$$$-${txt}-${company}`] = r[`submission-$$$-${txt}-${company}`];
                  });
                  rowOutput.data[`submission-$$$-emailTo-${company}`] = recipient.to;
                  rowOutput.data[`submission-$$$-emailCc-${company}`] = recipient.cc;

               } else if (type === 'reply') {

                  const fileFound = arrayFileName.find(fl => fl.fileName === r[`reply-$$$-drawing-${company}`]);
                  if (fileFound) {
                     r[`reply-$$$-drawing-${company}`] = fileFound.fileLink;
                  };
                  r[`reply-$$$-date-${company}`] = moment(new Date()).format('DD/MM/YY');
                  r[`reply-$$$-user-${company}`] = email;

                  let keyToSaveValue;
                  if (r.row) keyToSaveValue = 'history';
                  else keyToSaveValue = 'data';

                  Object.keys(r).forEach(key => {
                     if (key.includes('reply-$$$-') && key.includes(company)) {
                        rowOutput[keyToSaveValue] = { ...rowOutput[keyToSaveValue] || {}, [key]: r[key] };
                     };
                  });

                  if (consultantLead.company === company) {
                     r['Consultant Reply (A)'] = moment(new Date()).format('DD/MM/YY');
                     r['Status'] = r[`reply-$$$-status-${company}`]

                     const arrHeadersSubmit = ['Status', 'Consultant Reply (A)'];

                     arrHeadersSubmit.forEach(hd => {
                        const header = headers.find(x => x.text === hd);
                        rowOutput[keyToSaveValue] = { ...rowOutput[keyToSaveValue] || {}, [header.key]: r[hd] };
                     });
                  };
               };
               rowsToUpdate.push(rowOutput);
            });


            if (rowsToUpdate.length > 0) {
               await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: rowsToUpdate });
               let cellHistoriesToSave = [];
               rowsToUpdate.forEach(row => {

                  localStorage.setItem(`editLastTime-${type}-${rfaRefData}-${row._id}`, JSON.stringify(new Date()));
                  if (row.data[`reply-$$$-status-${company}`]) {
                     cellHistoriesToSave.push({
                        rowId: row._id,
                        headerKey: company,
                        history: {
                           text: company + '__' +
                              row.data[`reply-$$$-status-${company}`] + '__' +
                              moment(row.data[`reply-$$$-date-${company}`]).format('DD/MM/YY'),
                           email,
                           createdAt: new Date(),
                        }
                     });
                  };

                  headers.forEach(hd => {
                     if (row.data[hd.key]) {
                        cellHistoriesToSave.push({
                           rowId: row._id,
                           headerKey: hd.key,
                           history: {
                              text: row.data[hd.key],
                              email,
                              createdAt: new Date(),
                           }
                        });
                     };
                  });
               });
               await Axios.post(`${SERVER_URL}/cell/history/`, { token, projectId, cellsHistory: cellHistoriesToSave });
            };
         };

         let listUserOutput = {};
         let listGroupOutput = {};

         Object.keys(recipient).forEach(key => {
            recipient[key].forEach(item => {
               if (listUser.indexOf(item) !== -1) {
                  listUserOutput[key] = [...listUserOutput[key] || [], item];
               } else if (listGroup.indexOf(item) !== -1) {
                  listGroupOutput[key] = [...listGroupOutput[key] || [], item];
               } else if (validateEmailInput(item)) {
                  listUserOutput[key] = [...listUserOutput[key] || [], item];
               };
            });
         });


         const dwgsNewRFAClone = dwgsToAddNewRFA.map(dwg => ({ ...dwg }));

         
         // const getDrawingURLFromDB = async () => {
         //    try {
         //       return await Promise.all(dwgsNewRFAClone.map(async dwg => {
         //          const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwg[`${type}-$$$-drawing-${company}`], expire: 1000 } });
         //          dwg[`${type}-$$$-drawing-${company}`] = res.data;
         //          return dwg;
         //       }));
         //    } catch (err) {
         //       console.log(err);
         //    };
         // };

         // please respond to this RFA by 20/01/20, you can click to download

         // const dwgsToAddNewRFAGetDrawingURL = await getDrawingURLFromDB();

         // const contentText = type === 'reply' ? `
         //    <div>
         //       <span>${emailTextContent}</span>
         //       <span>
         //          Please respond to this RFA by ${moment().add(14, 'days').format('DD/MM/YY')}, you can click to download
         //       </span>
         //    </div>
         // ` : type === 'submission' ? `
         //    <div>
         //       <span>${emailTextContent}</span>
         //    </div>
         // ` : '';

         // const contentTable = generateEmailInnerHTML(company, type, dwgsToAddNewRFAGetDrawingURL);

         // await Axios.post(`/api/issue/rfa-mail`, { token, title: emailTitle, content: contentText + contentTable, listUser: listUserOutput, listGroup: listGroupOutput, projectId });

         await reloadDataFromServerViewRFA();

      } catch (err) {
         commandAction({ type: 'save-file-failure' });
         console.log(err);
      };
   };


   const redirectToViewDMS = async () => {
      const { projectId, token, email } = stateProject.allDataOneSheet;
      try {
         setLoading(true);
         commandAction({ type: '' });
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
               onClickApply={saveDataToServerAndReloadData}
               content='Do you want to save ?'
            />
         )}

         {panelSettingType === 'filter-ICON' && (
            <FormFilter
               applyFilter={applyFilter}
               onClickCancelModal={onClickCancelModal}
               headers={stateRow.isRfaView
                  ? headersRfaView
                  : stateProject.userData.headersShown
               }
               modeFilter={stateRow.modeFilter}
               rowsAll={stateRow.rowsAll}
               rowsRfaAll={stateRow.rowsRfaAll}
               isRfaView={stateRow.isRfaView}
               companies={companies}
            />
         )}

         {panelSettingType === 'swap-ICON-1' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={applyQuitGroupingMode}
               content='Do you want to quit grouping mode ?'
            />
         )}
         {panelSettingType === 'swap-ICON-2' && (
            <PanelConfirmResetMode
               onClickCancel={onClickCancelModal}
               applyResetMode={applyResetMode}
               modeFilter={stateRow.modeFilter}
               modeSort={stateRow.modeSort}
               modeSearch={stateRow.modeSearch}
            />
         )}


         {panelSettingType === 'reorderColumn-ICON' && (
            <ReorderColumnForm applyReorderColumns={applyReorderColumns} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'viewTemplate-ICON' && (
            <PanelConfirm
               onClickApply={applyViewTemplate} onClickCancel={onClickCancelModal}
               content='Do you want to save a new view template ?'
            />
         )}


         {panelSettingType === 'sort-ICON' && (
            <FormSort
               applySort={applySort}
               onClickCancel={onClickCancelModal}
               headers={stateProject.userData.headersShown}
               modeSort={stateRow.modeSort}
            />
         )}


         {panelSettingType === 'group-ICON' && (
            <FormGroup
               applyGroup={applyGroup}
               onClickCancelModal={onClickCancelModal}
               headers={stateProject.userData.headersShown}
            />
         )}


         {(panelSettingType === 'Insert Drawings Below' || panelSettingType === 'Insert Drawings Above') && (
            <PanelPickNumber
               onClickCancelModal={onClickCancelModal}
               onClickApply={onClickInsertRow}
            />
         )}

         {panelSettingType === 'Duplicate Drawings' && (
            <PanelPickNumber
               onClickCancelModal={onClickCancelModal}
               onClickApply={onClickDuplicateRows}
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
            <PanelPickNumber onClickCancelModal={onClickCancelModal} onClickApply={onClickFolderInsertSubRows} />
         )}


         {panelSettingType === 'addNewRFA-ICON' && (
            <PanelAddNewRFA
               onClickCancelModal={onClickCancelModal}
               onClickApplyAddNewRFA={onClickApplyAddNewRFA}
            />
         )}

         {panelSettingType === 'goToViewRFA-ICON' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={saveDataToServerAndRedirectToViewRFA}
               content={'Do you want to save and redirect to RFA sheet ?'}
            />
         )}

         {panelSettingType === 'goToViewDMS-ICON' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={redirectToViewDMS}
               content={'Do you want to go to DMS sheet ?'}
            />
         )}

      </>
   );
};

export default PanelSetting;








export const _processRowsChainNoGroupFnc1 = (rows) => {
   let rowsProcessed = [];

   if (!(rows instanceof Array) || !rows.length) {
      return rowsProcessed;
   };

   let firstRowIndex = rows.findIndex((row) => !row._preRow);
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0];
      while (preRow) {
         rowsProcessed.push(preRow);

         let nextRowIndex = rows.findIndex((row) => String(row._preRow) == String(preRow.id));
         if (nextRowIndex >= 0) preRow = rows.splice(nextRowIndex, 1)[0];
         else preRow = null;
      };
      firstRowIndex = rows.findIndex((row) => !row._preRow);
   };
   _processRowsLossHeadFnc1(rows, rowsProcessed);
   return rowsProcessed;
};
const _processRowsLossHeadFnc1 = (rows, rowsProcessed) => {
   if (!rows.length) return;

   let firstRowIndex = rows.findIndex((r) => _filterRowLossPreRowFnc(r, rows));
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0];
      while (preRow) {
         rowsProcessed.push(preRow);

         let nextRowIndex = rows.findIndex((row) => String(row._preRow) == String(preRow.id));
         if (nextRowIndex >= 0) preRow = rows.splice(nextRowIndex, 1)[0];
         else preRow = null;
      };
      firstRowIndex = rows.findIndex((r) => _filterRowLossPreRowFnc(r, rows));
   };
};
const _processChainRowsSplitGroupFnc2 = (rows) => {
   let rowsProcessed = [];

   if (!(rows instanceof Array) || !rows.length) return rowsProcessed;

   let firstRowIndex = rows.findIndex((row) => !row._preRow);
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0];
      let chain = [];
      while (preRow) {
         chain.push(preRow);
         let nextRowIndex = rows.findIndex((row) => String(row._preRow) == String(preRow.id));

         if (nextRowIndex >= 0) preRow = rows.splice(nextRowIndex, 1)[0];
         else preRow = null;
      };
      rowsProcessed.push(chain);
      firstRowIndex = rows.findIndex((row) => !row._preRow);
   };
   _processChainRowsLossHeadFnc2(rows, rowsProcessed);
   return rowsProcessed;
};
const _processChainRowsLossHeadFnc2 = (rows, rowsProcessed) => {
   if (!rows.length) return;

   let firstRowIndex = rows.findIndex((r) => _filterRowLossPreRowFnc(r, rows));
   while (firstRowIndex >= 0) {
      let preRow = rows.splice(firstRowIndex, 1)[0];
      let chain = [];
      while (preRow) {
         chain.push(preRow);

         let nextRowIndex = rows.findIndex((row) => String(row._preRow) == String(preRow.id));
         if (nextRowIndex >= 0) preRow = rows.splice(nextRowIndex, 1)[0];
         else preRow = null;
      };
      rowsProcessed.push(chain);
      firstRowIndex = rows.findIndex((r) => _filterRowLossPreRowFnc(r, rows));
   };
};
const _filterRowLossPreRowFnc = (row, rows) => {
   return rows.every(r => String(row._preRow) != String(r.id));
};
export const updatePreRowParentRowToState = (objState, row) => {
   objState[row.id] = {
      id: row.id,
      _preRow: row._preRow,
      _parentRow: row._parentRow,
   };
};



export const convertRowHistoryData = (dataRowsHistory, headers) => {
   return dataRowsHistory.map(r => {
      const { history } = r;
      if (history) {
         let data = { id: r._id, row: r.row };
         Object.keys(history).forEach(key => {
            if (key === 'rfaNumber' || key.includes('reply-$$$-') || key.includes('submission-$$$-')) {
               data[key] = history[key];
            } else {
               const header = headers.find(hd => hd.key === key);
               if (header) {
                  data[header.text] = history[key];
               };
            };
         });
         return data;
      };
   });
};

export const getDataForRFASheet = (rows, rowsHistory, drawingTypeTree, role) => {

   const nodeTitleArr = ['ARCHI', 'C&S', 'M&E', 'PRECAST'];

   const rowsWithRFA = rows.filter(x => x.rfaNumber);
   const rowsHistoryWithRFA = rowsHistory.filter(x => x.rfaNumber);

   let TreeViewRFA = [];

   nodeTitleArr.forEach(title => {

      TreeViewRFA.push({
         id: title,
         treeLevel: 2,
         expanded: true,
         title
      });

      const rowsUnderThisTrade = rowsWithRFA.filter(row => {
         const parentNode = drawingTypeTree.find(x => x.id === row._parentRow);
         return getTradeNameFnc(parentNode, drawingTypeTree) === title;
      });

      const allRfaCode = [...new Set(rowsUnderThisTrade.map(x => x['rfaNumber']))];
      const rfaParentNodeArray = [];

      allRfaCode.forEach(rfaNumb => {
         let allDwgs = [...rowsUnderThisTrade, ...rowsHistoryWithRFA].filter(dwg => dwg['rfaNumber'] === rfaNumb);

         const allRfaRef = [...new Set(allDwgs.map(x => x['RFA Ref']))];

         let btnTextArray = allRfaRef.map(rfa => {
            return rfa.slice(rfaNumb.length, rfa.length) || '-';
         });
         btnTextArray.push('-');


         rfaParentNodeArray.push({
            id: rfaNumb,
            'rfaNumber': rfaNumb,
            'btn': [...new Set(btnTextArray)],
            treeLevel: 3,
            expanded: true,
            parentId: title
         });
      });
      TreeViewRFA = [...TreeViewRFA, ...rfaParentNodeArray];
   });

   let allRowsForRFA = [...rowsWithRFA, ...rowsHistoryWithRFA];

   if (role === 'Consultant') {
      allRowsForRFA = allRowsForRFA.filter(x => x['RFA Ref']);
   };
   

   allRowsForRFA.sort((a, b) => {
      if (!b['RFA Ref']) return 1;
      
      if (a['RFA Ref'] > b['RFA Ref']) return -1;
      if (a['RFA Ref'] < b['RFA Ref']) return 1;

      if (a['Drawing Number'] > b['Drawing Number']) return 1;
      if (a['Drawing Number'] < b['Drawing Number']) return -1;
   });

   return {
      rowsDataRFA: allRowsForRFA,
      TreeViewRFA
   };
};



const generateEmailInnerHTML = (company, emailType, rowsData) => {
   const headersArray = [
      'Drawing Number',
      'Drawing Name',
      'RFA Ref',
      'Drg To Consultant (A)',
      'Consultant Reply (T)',
      'Rev',
      'Status',
      'File'
   ];


   const th_td_style = `style='border: 1px solid #dddddd; text-align: left; padding: 8px; position: relative;'`;

   let contentBody = '';
   rowsData.forEach(rowData => {
      let str = '';
      headersArray.forEach(headerText => {
         if (headerText === 'File') {
            const btnHTMLContent = `<a href='${rowData[`${emailType}-$$$-drawing-${company}`]}'>BTN</a>`;
            str += `<td ${th_td_style}>${btnHTMLContent}</td>`;
         } else {
            if (headerText === 'Status' && emailType === 'reply') {
               str += `<td ${th_td_style}>${rowData[`reply-$$$-status-${company}`]}</td>`;
            } else {
               str += `<td ${th_td_style}>${rowData[headerText]}</td>`;
            };
         };
      });
      contentBody += `<tr>${str}</tr>`;
   });


   let contentHeader = '';
   headersArray.forEach(headerText => {
      contentHeader += `<th ${th_td_style}>${headerText}</th>`;
   });
   contentHeader = `<tr style='background: #34495e; color: white;'>${contentHeader}</tr>`;


   return contentHeader + contentBody;
};