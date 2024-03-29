import { pdf } from '@react-pdf/renderer';
import { message } from 'antd';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { EDIT_DURATION_MIN, SERVER_URL, tradeArrayForm, tradeArrayMeetingMinutesForm } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { compareDates, convertCellTempToHistory, convertDrawingVersionToHistory, debounceFnc, extractCellInfo, genId, mongoObjectId } from '../../utils';
import ExportPdf from '../generalComponents/ExportPdf';
import FormFilter from '../generalComponents/FormFilter';
import FormGroup from '../generalComponents/FormGroup';
import FormSort from '../generalComponents/FormSort';
import { converHeaderForDataEntryOutput, convertDataEntryInput, getHeadersForm, getInputDataInitially, getOutputRowsAllSorted, headersConsultantWithNumber } from '../generalComponents/OverallComponentDMS';
import PanelAddNewMultiForm, { convertTradeCodeInverted } from '../generalComponents/PanelAddNewMultiForm';
import PanelConfirm from '../generalComponents/PanelConfirm';
import PanelConfirmResetMode from '../generalComponents/PanelConfirmResetMode';
import PanelPickNumber from '../generalComponents/PanelPickNumber';
import ReorderColumnForm from '../generalComponents/ReorderColumnForm';
import TableAllFormActivityHistory from '../generalComponents/TableAllFormActivityHistory';
import { getInfoValueFromRefDataForm } from './CellForm';
import { getConsultantLeadName, getInfoValueFromRfaData } from './CellRFA';
import ColorizedForm from './ColorizedForm';
import FormCellColorizedCheck from './FormCellColorizedCheck';
import FormDateAutomation from './FormDateAutomation';
import FormDrawingTypeOrder, { compareCurrentTreeAndTreeFromDB, flattenAllTreeChildNode1, getTreeFlattenOfNodeInArray } from './FormDrawingTypeOrder';
import FormDrawingTypeOrderDataEntry from './FormDrawingTypeOrderDataEntry';
import PanelAddNewRFA from './PanelAddNewRFA';
import TableActivityHistory from './TableActivityHistory';
import TableCellHistory from './TableCellHistory';
import TableDrawingDetail from './TableDrawingDetail';




export const getFileNameFromLinkResponse = (link) => /[^/]*$/.exec(link)[0];



const PanelSetting = (props) => {

   let history1 = useHistory();

   const { state: stateRow, getSheetRows } = useContext(RowContext);

   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateCell, getCellModifiedTemp, OverwriteCellsModified } = useContext(CellContext);
   const { projectIsAppliedRfaView, companies, pageSheetTypeName, sheetId, isBothSideActionUser } = stateProject.allDataOneSheet;
   const { isShowAllConsultant, rowsSelected } = stateRow;
   const {
      panelType, panelSettingType, commandAction, onClickCancelModal, setLoading, buttonPanelFunction,
   } = props;


   const refType = getKeyTextForSheet(pageSheetTypeName);
   const refKey = refType + 'Ref';

   const applyReorderColumns = (data) => commandAction({ type: 'reorder-columns', data });

   const applyFilter = (filter) => {
      commandAction({ type: 'filter-by-columns', data: { modeFilter: filter } });
   };
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

      const rowAboveClone = { ...rowAbove };

      let arrIgnore = ['RFA Ref', 'Drg To Consultant (A)', 'Consultant Reply (T)', 'Consultant Reply (A)', 'Status', 'Rev'];
      if (projectIsAppliedRfaView) {
         Object.keys(rowAbove).forEach(key => {
            if (key.includes('submission-$$$-') || key.includes('reply-$$$-') || key === 'rfaNumber' || arrIgnore.indexOf(key) !== -1) {
               delete rowAboveClone[key];
            };
         });
      };

      const newRows = idsArr.map((id, i) => {
         return {
            ...rowAboveClone, id,
            _preRow: i === 0 ? rowAboveClone.id : idsArr[i - 1]
         };
      });

      const rowBelow = rowsAll.find(r => r._preRow === rowAboveClone.id);
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
   const applyFolderOrganizeDataEntry = (drawingTypeTreeNew, mergeList, nodeIsolated) => {

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

      if (allDrawingsParentId.length === 1 && allDrawingsParentId[0] === sheetId) {

         const rowsChildren = rowsAll.filter(row => row._parentRow === sheetId);
         // some folders are added below sheet level => add new folder to contain...
         const nodeParentPrevious = {
            id: sheetId,
            treeLevel: 0,
         };
         const allTreeLevel = [...new Set(drawingTypeTreeUpdate.map(x => x.treeLevel))];
         let arrayNodes = [nodeParentPrevious];

         for (let i = 0; i <= allTreeLevel.length; i++) {
            let arrFilter = drawingTypeTreeUpdate.filter(x => x.treeLevel === allTreeLevel[i] && arrayNodes.find(dt => dt.id === x.parentId));
            arrayNodes = [...arrayNodes, ...arrFilter];
         };
         const lowestLevel = Math.max(...arrayNodes.map(x => x.treeLevel));

         const dwgTypeParentToShiftDrawings = arrayNodes.find(x => x.treeLevel === lowestLevel);

         rowsChildren.forEach(r => {
            r._parentRow = dwgTypeParentToShiftDrawings.id;
            updatePreRowParentRowToState(rowsUpdatePreRowOrParentRow, r);
         });

      } else {

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
      };



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
   const applyDateAutomation = (rowsToAutomation, dataUpdate) => {

      let { rowsAll } = stateRow;
      const rowsUpdate = rowsAll.filter(x => rowsToAutomation.find(r => r.id === x.id));

      rowsUpdate.forEach(r => {
         Object.keys(dataUpdate).forEach(key => {
            const cellTempId = `${r.id}~#&&#~${key}`;
            getCellModifiedTemp({ [cellTempId]: dataUpdate[key] });
            r[key] = dataUpdate[key];
         });
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
               key.includes(`submission-$$$-dwfxLink-${company}`) ||
               key.includes(`submission-$$$-dwfxName-${company}`) ||
               key.includes(`submission-$$$-user-${company}`)
            ) {
               row[key] = '';
            };
         });
         if (rowsUpdateSubmissionOrReplyForNewDrawingRev.indexOf(rowId) === -1) {
            rowsUpdateSubmissionOrReplyForNewDrawingRev = [...rowsUpdateSubmissionOrReplyForNewDrawingRev, rowId];
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
   
   const saveDataToServerDataEntry = async () => {
      const { email, token, role, projectName, projectIsAppliedRfaView, publicSettings, company } = stateProject.allDataOneSheet;
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

         additionalFieldToSave,
      } = stateRow;


      // check new version reply go blank
      const rowsGetNewRev = rowsAll.filter(r => rowsUpdateSubmissionOrReplyForNewDrawingRev.indexOf(r.id) !== -1);


      if (additionalFieldToSave) {
         additionalFieldToSave = additionalFieldToSave.filter(r => !rowsDeleted.find(x => x.id === r.id));
      };



      try {
         setLoading(true);
         commandAction({ type: '' });


         const resDBRaw = await Axios.post(`${SERVER_URL}/row-data-entry/get-row`, { token, projectId: sheetId, email, headers: converHeaderForDataEntryOutput(headers) });
         const resDB = convertDataEntryInput(resDBRaw.data);

         // const resCellsHistory = await Axios.get(`${SERVER_URL}/cell/history/`, { params: { token, projectId } });

         let { publicSettings: publicSettingsFromDB, rows: rowsFromDBInit } = resDB;
         let { drawingTypeTree: drawingTypeTreeFromDB, activityRecorded: activityRecordedFromDB } = publicSettingsFromDB;

         // const headerKeyDrawingNumber = headers.find(hd => hd.text === 'Drawing Number').key;
         // const headerKeyDrawingName = headers.find(hd => hd.text === 'Drawing Name').key;

         const headerKeyDrawingNumber = 'Drawing Number';
         const headerKeyDrawingName = 'Drawing Name';

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
            activityRecordedFromDB.filter(x => x.action === 'Delete Folder'),
         );
         let activityRecordedArr = [];


         // check if row or its parents deleted by other users
         const rowsUpdatePreRowOrParentRowArray = Object.values(rowsUpdatePreRowOrParentRow)
            .filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing') &&
               !activityRecordedFromDB.find(r => r.id === row._parentRow && r.action === 'Delete Folder'));


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
                  title: 'New Folder',
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
                  action: 'Create Folder',
                  [headerKeyDrawingNumber]: 'New Folder',
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
         // let objCellHistory = {};
         // resCellsHistory.data.map(cell => {
         //    const headerFound = headers.find(hd => hd.key === cell.headerKey);
         //    if (headerFound) {
         //       const headerText = headerFound.text;
         //       if (cell.histories.length > 0) {
         //          const latestHistoryText = cell.histories[cell.histories.length - 1].text;
         //          objCellHistory[`${cell.row}-${headerText}`] = latestHistoryText;
         //       };
         //    };
         // });
         // Object.keys(cellsModifiedTemp).forEach(key => {
         //    if (objCellHistory[key] && objCellHistory[key] === cellsModifiedTemp[key]) {
         //       delete cellsModifiedTemp[key];
         //    } else {
         //       let rowId = extractCellInfo(key).rowId;
         //       if (activityRecordedFromDB.find(x => x.id === rowId && x.action === 'Delete Drawing')) {
         //          delete cellsModifiedTemp[key];
         //       };
         //    };
         // });

         // if (Object.keys(cellsModifiedTemp).length > 0) {
         //    await Axios.post(`${SERVER_URL}/cell/history/`, { token, projectId, cellsHistory: convertCellTempToHistory(cellsModifiedTemp, stateProject) });
         // };

         // SAVE DRAWINGS NEW VERSION
         // rowsVersionsToSave = rowsVersionsToSave.filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing'));
         // if (rowsVersionsToSave.length > 0) {
         //    await Axios.post(`${SERVER_URL}/row/history/`, { token, projectId, email, rowsHistory: convertDrawingVersionToHistory(rowsVersionsToSave, stateProject) });
         // };




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
                  rc.action === 'Delete Folder' &&
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
            await Axios.post(`${SERVER_URL}/row-data-entry/delete-rows/`, { token, projectId: sheetId, email, rowIdsArray: rowDeletedFinal.map(r => r.id) });
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
         await Axios.post(`${SERVER_URL}/settings-data-entry/update-setting-public/`, { token, projectId: sheetId, email, publicSettings: publicSettingsUpdated });


         // const userSettingsUpdated = {
         //    headersShown: headersShown.map(hd => headers.find(h => h.text === hd).key),
         //    headersHidden: headersHidden.map(hd => headers.find(h => h.text === hd).key),
         //    nosColumnFixed, colorization, role, viewTemplateNodeId, viewTemplates, modeFilter, modeSort
         // };
         // await Axios.post(`${SERVER_URL}/sheet/update-setting-user/`, { token, projectId, email, userSettings: userSettingsUpdated });



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
               rowsToUpdateFinal.push(rowToSave);
            };
         });

         if (additionalFieldToSave && additionalFieldToSave.length > 0) {
            additionalFieldToSave.forEach(row => {
               const rowFoundToUpdateAdditionalField = rowsToUpdateFinal.find(r => r._id === row._id);
               if (rowFoundToUpdateAdditionalField) {
                  for (const key in row) {
                     if (key !== '_id' && key !== 'preRow' && key !== 'parentRow' && key !== 'data' && key !== 'level') {
                        rowFoundToUpdateAdditionalField[key] = row[key];
                     };
                  };
               } else {
                  let obj = { _id: row._id };
                  for (const key in row) {
                     if (key !== '_id' && key !== 'preRow' && key !== 'parentRow' && key !== 'data' && key !== 'level') {
                        obj[key] = row[key];
                     };
                  };
                  rowsToUpdateFinal.push(obj);
               };
            });
         };



         if (rowsToUpdateFinal.length > 0) {
            await Axios.post(`${SERVER_URL}/row-data-entry/save-rows-data-entry/`, { token, projectId: sheetId, rows: rowsToUpdateFinal });
         };
         commandAction({ type: 'save-data-successfully' });

      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };
   const saveDataToServerAndReloadData = async () => {

      const { projectId, sheetId, token, email, publicSettings } = stateProject.allDataOneSheet;
      const { headers } = publicSettings;

      if (pageSheetTypeName !== 'page-spreadsheet' && pageSheetTypeName !== 'page-data-entry') {
         onClickCancelModal();
         return;
      };

      try {
         if (pageSheetTypeName === 'page-spreadsheet') {

            await saveDataToServer(stateCell, stateRow, stateProject, commandAction, setLoading);

            const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
            commandAction({ type: 'reload-data-from-server', data: res.data });

         } else if (pageSheetTypeName === 'page-data-entry') {

            await saveDataToServerDataEntry();

            const res = await Axios.post(`${SERVER_URL}/row-data-entry/get-row`, { token, projectId: sheetId, email, headers: converHeaderForDataEntryOutput(headers) });
            commandAction({ type: 'reload-data-entry-from-server', data: res.data });
         };


      } catch (err) {
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };


   const onClickApplyAddNewRFA = async (dataRfaForm) => {

      setLoading(true);

      const {
         filesPDF, filesDWFX, type, dwgsToAddNewRFA, trade, rfaToSave, rfaToSaveVersionOrToReply,
         recipient, emailTextTitle, emailTextAdditionalNotes, listConsultantMustReply, requestedBy, dateReplyForsubmitForm, isFormEditting,
         isBothSideActionUserWithNoEmailSent, consultantNameToReplyByBothSideActionUser,
         dateSendThisForm, mepSubTradeInfo
      } = dataRfaForm;

      const { currentRefToAddNewOrReplyOrEdit } = stateRow;
      const { email, projectId, projectName, token, publicSettings, roleTradeCompany: { role, company: companyUser }, isBothSideActionUser } = stateProject.allDataOneSheet;
      const { headers } = publicSettings;

      const rfaRefData = rfaToSaveVersionOrToReply === '-' ? rfaToSave : (rfaToSave + rfaToSaveVersionOrToReply);

      const company = (type === 'form-reply-RFA' && isBothSideActionUser && consultantNameToReplyByBothSideActionUser)
         ? consultantNameToReplyByBothSideActionUser
         : companyUser;

      try {

         // CHECK THE DATABASE FIRST
         const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
         const resRowHistory = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });

         const latestDataFromServer = getInputDataInitially({ sheetData: res.data, rowsHistoryData: resRowHistory.data }, { role, company }, 'page-rfa');
         const { rowsRfaAllInit: rowsRfaAllInitFromDB } = latestDataFromServer;

         let isSubmitActionAllowed = true;
         if (type === 'form-submit-RFA' || type === 'form-resubmit-RFA') {

            if (!isFormEditting || (
               isFormEditting &&
               currentRefToAddNewOrReplyOrEdit.currentRefData &&
               rfaRefData !== currentRefToAddNewOrReplyOrEdit.currentRefData['RFA Ref']
            )) {

               const allRFARefAlreadySubmitted = [...new Set(rowsRfaAllInitFromDB.filter(x => x['RFA Ref']).map(x => x['RFA Ref']))];
               if (allRFARefAlreadySubmitted.indexOf(rfaRefData) !== -1) {
                  isSubmitActionAllowed = false;
               };
            };
            if (type === 'form-submit-RFA' && !isFormEditting) {
               const rowWithRfaFound = dwgsToAddNewRFA.find(row => rowsRfaAllInitFromDB.find(x => x.id === row.id));
               if (rowWithRfaFound) {
                  isSubmitActionAllowed = false;
               };
            } else if (type === 'form-resubmit-RFA' && !isFormEditting) {
               dwgsToAddNewRFA.forEach(r => { // submitted by others.
                  const rowWithRfaFound = rowsRfaAllInitFromDB.find(row => row.id === r.id);
                  if (rowWithRfaFound) {
                     if (getInfoValueFromRfaData(rowWithRfaFound, 'submission', 'drawing')) {
                        isSubmitActionAllowed = false;
                     };
                  };
               });
            };
         } else if (type === 'form-reply-RFA') {
            if (!isFormEditting) {
               dwgsToAddNewRFA.forEach(r => {
                  const rowWithRfaFound = rowsRfaAllInitFromDB.find(row => row.id === r.id);
                  if (rowWithRfaFound) {
                     if (getInfoValueFromRfaData(rowWithRfaFound, 'reply', 'status', company)) {
                        isSubmitActionAllowed = false;
                     };
                  };
               });
            };
         };
         if (!isSubmitActionAllowed) {
            getSheetRows({ ...stateRow, loading: false });
            message.error('This RFA / drawings are already submitted / replied by others, please reload the RFA View');
            return;
         };




         const typeText = type === 'form-reply-RFA' ? 'reply' : 'submission';

         let data;
         if (filesPDF.length > 0) {
            data = new FormData();
            filesPDF.forEach(file => {
               data.append('files', file.originFileObj);
            });
            data.append('projectId', projectId);
            data.append('trade', mepSubTradeInfo ? `${mepSubTradeInfo}_${trade}` : trade);
            data.append('rfa', rfaToSave);
            data.append('rfaNumber', rfaToSaveVersionOrToReply === '-' ? '0' : rfaToSaveVersionOrToReply); // CHECK...
            data.append('type', type.includes('submit') ? 'submit' : 'reply');
         };
         let arrayFileName = [];


         if (filesPDF.length > 0 && data && data !== null) {

            const res = await Axios.post('/api/drawing/set-drawing-files', data);
            const listFileName = res.data;

            arrayFileName = listFileName.map(link => ({
               fileName: getFileNameFromLinkResponse(link),
               fileLink: link
            }));

            dwgsToAddNewRFA.forEach(r => {
               const fileFound = arrayFileName.find(fl => fl.fileName === r[`${typeText}-$$$-drawing-${company}`]);
               if (fileFound) {
                  r[`${typeText}-$$$-drawing-${company}`] = fileFound.fileLink;
               };
            });
         };


         if (filesDWFX.length > 0) {
            const upload3dModel = async () => {
               try {
                  await Promise.all(dwgsToAddNewRFA.map(async (row, i) => {
                     const fileFound = filesDWFX.find(x => x.name === row[`submission-$$$-dwfxName-${company}`]);
                     if (fileFound) {
                        let dataDWFX = new FormData();
                        dataDWFX.append('file', fileFound.originFileObj);
                        dataDWFX.append('projectId', projectId);
                        dataDWFX.append('projectName', projectName);
                        dataDWFX.append('email', email);
                        dataDWFX.append('rfaName', rfaRefData + `_${i}`);

                        let linkDWFX = '';
                        if (dataDWFX && dataDWFX !== null) {
                           const res = await Axios.post('/api/items/add-rfa-item', dataDWFX);
                           linkDWFX = window.location.origin + '/rfa/' + res.data;
                        };
                        row[`submission-$$$-dwfxLink-${company}`] = linkDWFX;
                     };
                  }));
               } catch (err) {
                  console.log(err);
               };
            };
            await upload3dModel();
         };




         let rowsToUpdate = [];

         dwgsToAddNewRFA.forEach((r, i) => {

            const saveToRowOrRowHistory = r.row ? 'history' : 'data';
            let rowOutput = { _id: r.id };

            if (type === 'form-submit-RFA' || type === 'form-resubmit-RFA') {

               rowOutput[saveToRowOrRowHistory] = {};

               headers.forEach(hd => {
                  if (hd.text === 'RFA Ref') {
                     rowOutput[saveToRowOrRowHistory][hd.key] = rfaRefData;
                  } else if (hd.text === 'Status') {
                     rowOutput[saveToRowOrRowHistory][hd.key] = 'Consultant reviewing';
                  } else if (hd.text === 'Drg To Consultant (A)') {

                     if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
                        rowOutput[saveToRowOrRowHistory][hd.key] = moment(dateSendThisForm || new Date()).format('DD/MM/YY');
                     } else {
                        if (!isFormEditting) {
                           rowOutput[saveToRowOrRowHistory][hd.key] = moment(new Date()).format('DD/MM/YY');
                        };
                     };
                  } else if (hd.text === 'Consultant Reply (T)') {
                     rowOutput[saveToRowOrRowHistory][hd.key] = dateReplyForsubmitForm;
                  } else if (hd.text === 'Rev') {
                     rowOutput[saveToRowOrRowHistory][hd.key] = r['Rev'];
                  };
               });

               rowOutput[saveToRowOrRowHistory].rfaNumber = rfaToSave;

               if (filesPDF.length > 0) {
                  rowOutput[saveToRowOrRowHistory][`submission-$$$-drawing-${company}`] = r[`submission-$$$-drawing-${company}`];
               };

               if (filesDWFX.length > 0) {
                  rowOutput[saveToRowOrRowHistory][`submission-$$$-dwfxName-${company}`] = r[`submission-$$$-dwfxName-${company}`];
                  rowOutput[saveToRowOrRowHistory][`submission-$$$-dwfxLink-${company}`] = r[`submission-$$$-dwfxLink-${company}`];
               };


               rowOutput[saveToRowOrRowHistory][`submission-$$$-emailTo-${company}`] = recipient.to;
               rowOutput[saveToRowOrRowHistory][`submission-$$$-emailCc-${company}`] = recipient.cc;
               rowOutput[saveToRowOrRowHistory][`submission-$$$-emailTitle-${company}`] = emailTextTitle;
               rowOutput[saveToRowOrRowHistory][`submission-$$$-emailAdditionalNotes-${company}`] = emailTextAdditionalNotes;
               rowOutput[saveToRowOrRowHistory][`submission-$$$-consultantMustReply-${company}`] = listConsultantMustReply;
               rowOutput[saveToRowOrRowHistory][`submission-$$$-requestedBy-${company}`] = requestedBy;

               rowOutput[saveToRowOrRowHistory][`submission-$$$-trade-${company}`] = trade;
               if (mepSubTradeInfo) {
                  rowOutput[saveToRowOrRowHistory][`submission-$$$-subTradeForMep-${company}`] = mepSubTradeInfo;
               };

               rowOutput[saveToRowOrRowHistory][`submission-$$$-user-${company}`] = email;


               if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
                  rowOutput[saveToRowOrRowHistory][`submission-$$$-date-${company}`] = dateSendThisForm || new Date();
                  if (!isFormEditting) {
                     rowOutput[saveToRowOrRowHistory][`submission-$$$-dateSendNoEmail-${company}`] = new Date();
                  };
               } else {
                  if (!isFormEditting) {
                     rowOutput[saveToRowOrRowHistory][`submission-$$$-date-${company}`] = new Date();
                  };
               };
               rowsToUpdate.push(rowOutput);


            } else if (type === 'form-reply-RFA') {

               rowOutput[saveToRowOrRowHistory] = {};

               const arrayConsultantReply = getInfoValueFromRfaData(r, 'submission', 'consultantMustReply') || [];
               const consultantLeadName = arrayConsultantReply[0];
               if (consultantLeadName === company) {
                  headers.forEach(hd => {
                     if (hd.text === 'Consultant Reply (A)') {
                        if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
                           rowOutput[saveToRowOrRowHistory][hd.key] = moment(dateSendThisForm || new Date()).format('DD/MM/YY');
                        } else {
                           if (!isFormEditting) {
                              rowOutput[saveToRowOrRowHistory][hd.key] = moment(new Date()).format('DD/MM/YY');
                           };
                        };
                     } else if (hd.text === 'Status') {
                        rowOutput[saveToRowOrRowHistory][hd.key] = r[`reply-$$$-status-${company}`];
                     };
                  });
               };


               if (r[`reply-$$$-comment-${company}`]) {
                  rowOutput[saveToRowOrRowHistory][`reply-$$$-comment-${company}`] = r[`reply-$$$-comment-${company}`];
               };
               if (filesPDF.length > 0) {
                  rowOutput[saveToRowOrRowHistory][`reply-$$$-drawing-${company}`] = r[`reply-$$$-drawing-${company}`];
               };

               rowOutput[saveToRowOrRowHistory][`reply-$$$-status-${company}`] = r[`reply-$$$-status-${company}`];


               if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
                  rowOutput[saveToRowOrRowHistory][`reply-$$$-date-${company}`] = dateSendThisForm || new Date();
                  if (!isFormEditting) {
                     rowOutput[saveToRowOrRowHistory][`reply-$$$-dateSendNoEmail-${company}`] = new Date();
                  };
               } else {
                  if (!isFormEditting) {
                     rowOutput[saveToRowOrRowHistory][`reply-$$$-date-${company}`] = new Date();
                  };
               };

               rowOutput[saveToRowOrRowHistory][`reply-$$$-user-${company}`] = email;
               rowOutput[saveToRowOrRowHistory][`reply-$$$-emailTo-${company}`] = recipient.to;
               rowOutput[saveToRowOrRowHistory][`reply-$$$-emailCc-${company}`] = recipient.cc;
               rowOutput[saveToRowOrRowHistory][`reply-$$$-emailTitle-${company}`] = emailTextTitle;
               rowOutput[saveToRowOrRowHistory][`reply-$$$-emailAdditionalNotes-${company}`] = emailTextAdditionalNotes;

               rowsToUpdate.push(rowOutput);
            };
         });


         const rowsToUpdateFinalRow = rowsToUpdate.filter(r => r.data);
         const rowsToUpdateFinalRowHistory = rowsToUpdate.filter(r => r.history);


         if (rowsToUpdateFinalRow.length > 0) {
            await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: rowsToUpdateFinalRow });

            let cellHistoriesToSave = [];
            rowsToUpdate.forEach(row => {
               if (row.data) { // save history for current row only, not row history......
                  if (row.data[`reply-$$$-status-${company}`]) {
                     cellHistoriesToSave.push({
                        rowId: row._id, headerKey: company,
                        history: {
                           text: company + '__' +
                              row.data[`reply-$$$-status-${company}`],
                           email, createdAt: new Date()
                        }
                     });
                  };
                  headers.forEach(hd => {
                     if (row.data[hd.key]) {
                        cellHistoriesToSave.push({
                           rowId: row._id, headerKey: hd.key,
                           history: { email, text: row.data[hd.key], createdAt: new Date() }
                        });
                     };
                  });
               };
            });
            await Axios.post(`${SERVER_URL}/cell/history/`, { token, projectId, cellsHistory: cellHistoriesToSave });
         };
         if (rowsToUpdateFinalRowHistory.length > 0) {
            await Axios.post(`${SERVER_URL}/row/history/update-rows-history/`, { token, projectId, rowsHistory: rowsToUpdateFinalRowHistory });
         };


         if (!isFormEditting && !isBothSideActionUserWithNoEmailSent) {
            const data = {
               projectId, company, projectName,
               formSubmitType: 'rfa',
               type: type === 'form-reply-RFA' ? 'reply' : 'submit',
               rowIds: rowsToUpdate.map(row => row._id),
               emailSender: email,
            };

            await Axios.post('/api/rfa/mail', {
               token, data,
               momentToTriggerEmail: moment().add(moment.duration(EDIT_DURATION_MIN, 'minutes'))
            });
         };

         message.success('Submitted Successfully', 2);

         const resServer = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
         const resRowHistoryServer = await Axios.get(`${SERVER_URL}/row/history/`, { params: { token, projectId } });
         const { rows } = resServer.data;
         const expandedRowsIdArr = [
            'ARCHI', 'C&S', 'M&E', 'PRECAST',
            ...rows.filter(x => x.rfaNumber).map(x => x.rfaNumber)
         ];
         commandAction({
            type: 'reload-data-view-rfa',
            data: {
               dataAllFromServer: resServer.data,
               dataRowsHistoryFromServer: resRowHistoryServer.data,
               expandedRowsIdArr,
            }
         });


      } catch (err) {
         getSheetRows({ ...stateRow, loading: false });
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };


   const onClickApplySendFormToSignature = async (typeButton, dataForm) => {

      setLoading(true);

      const {
         filesPdfDrawing, formReplyUpload, type, dwgsImportFromRFA, trade, refToSave, refToSaveVersionOrToReply,
         recipient, emailTextTitle, description, listConsultantMustReply, requestedBy, recipientName, signaturedBy, dateReplyForSubmitForm, isFormEditting,
         isBothSideActionUserWithNoEmailSent, consultantNameToReplyByBothSideActionUser,
         dateSendThisForm,
         dateConversation, timeConversation,
         conversationAmong,
         isCostImplication, isTimeExtension,
         consultantReplyStatus,
         mepSubTradeFirstTime,

         contractSpecification,
         proposedSpecification,
         submissionType,
         herewithForDt,
         transmittedForDt,
         contractDrawingNo
      } = dataForm;


      const {
         rowsRfamAllInit, rowsRfiAllInit, rowsCviAllInit, rowsDtAllInit, rowsMmAllInit,
         currentRefToAddNewOrReplyOrEdit: { currentRefData }
      } = stateRow;

      const rowsRefAllInit = pageSheetTypeName === 'page-rfam' ? rowsRfamAllInit
         : pageSheetTypeName === 'page-rfi' ? rowsRfiAllInit
            : pageSheetTypeName === 'page-cvi' ? rowsCviAllInit
               : pageSheetTypeName === 'page-dt' ? rowsDtAllInit
                  : pageSheetTypeName === 'page-mm' ? rowsMmAllInit
                     : [];

      const { email, projectId, projectName, companies, token, roleTradeCompany: { role, company: companyUser } } = stateProject.allDataOneSheet;


      const company = (type === 'form-reply-multi-type' && isBothSideActionUser && consultantNameToReplyByBothSideActionUser)
         ? consultantNameToReplyByBothSideActionUser
         : companyUser;

      const refType = getKeyTextForSheet(pageSheetTypeName);
      const refKey = refType + 'Ref';

      const refNumberTextInfo = refToSaveVersionOrToReply === '0' ? refToSave : refToSave + refToSaveVersionOrToReply;

      let formReplyFileName;
      if (formReplyUpload[0]) {
         formReplyFileName = formReplyUpload[0].name;
      };

      try {

         // CHECK SERVER MAKE SURE NO DUPLICATE
         const resDB = await Axios.get(`${SERVER_URL}/row-${refType}/`, { params: { token, projectId, email } });
         const rowsRefFromDB = resDB.data;

         const latestRowsDataFromServer = getInputDataInitially(rowsRefFromDB, { role, company }, pageSheetTypeName);
         const rowsAllFromDB = latestRowsDataFromServer[`rows${refType.charAt(0).toUpperCase() + refType.slice(1)}AllInit`];


         let isSubmitActionAllowed = true;
         const rowFoundToCheck = rowsAllFromDB.find(r => {
            const rowRef = r[refKey] + (r.revision === '0' ? '' : r.revision);
            return rowRef === refNumberTextInfo;
         });
         if (type === 'form-reply-multi-type') {
            if (!isFormEditting && rowFoundToCheck && getInfoValueFromRefDataForm(rowFoundToCheck, 'reply', refType, 'status', company)) {
               isSubmitActionAllowed = false;
            };
         } else {
            if (!isFormEditting && rowFoundToCheck) {
               isSubmitActionAllowed = false;
            };
         };
         if (!isSubmitActionAllowed) {
            getSheetRows({ ...stateRow, loading: false });
            message.error(`This ${refType.toUpperCase()} are already submitted / replied by others, please reload the ${refType.toUpperCase()} View`);
            return;
         };


         let linkFormPdfNoSignature, filePdfBlobOutput, pdfFilesToUpload;

         if (type === 'form-submit-multi-type' || type === 'form-resubmit-multi-type') {

            const outputPdf = (
               <ExportPdf
                  pdfContent={{
                     refNumberText: refNumberTextInfo,
                     isCostImplication, isTimeExtension, projectName, listConsultantMustReply,
                     listRecipientTo: recipient.to, listRecipientCc: recipient.cc,
                     requestedBy, signaturedBy, recipientName, conversationAmong, emailTextTitle,
                     dateConversation, timeConversation, description, dateReplyForSubmitForm,
                     filesPdfDrawing: Object.values(filesPdfDrawing),
                     dwgsImportFromRFA: dwgsImportFromRFA.map(x => ({ ...x })),
                     contractSpecification, proposedSpecification, submissionType, herewithForDt, transmittedForDt, pageSheetTypeName,
                     companies, contractDrawingNo
                  }}
               />
            );

            filePdfBlobOutput = await pdf(outputPdf).toBlob();
            if (filePdfBlobOutput) {

               let blobData = filePdfBlobOutput;
               const pathData = `${refToSave}/${refToSaveVersionOrToReply}/submit`;
               let fileName = `${refToSave}/${refToSaveVersionOrToReply}_FormCoverToSign.pdf`.split('/').join('_');

               let fd = new FormData();
               fd.append('projectId', projectId);
               fd.append('path', pathData);
               fd.append('file', blobData, fileName);

               const resLink = await Axios.post('/api/drawing/set-dms-file', fd);
               linkFormPdfNoSignature = resLink.data;
            };

            pdfFilesToUpload = filesPdfDrawing;
         } else if (type === 'form-reply-multi-type') {
            pdfFilesToUpload = formReplyUpload[0] ? [formReplyUpload[0], ...filesPdfDrawing] : [];
         };


         let arrayFilesPdfUploadLink = [];

         if (pdfFilesToUpload.length > 0) {
            const typeFolder = type.includes('form-reply-multi-') ? 'reply' : 'submit';
            let data = new FormData();
            pdfFilesToUpload.forEach(file => {
               data.append('files', file.originFileObj);
            });
            data.append('projectId', projectId);
            data.append('path', `${refToSave}/${refToSaveVersionOrToReply}/${typeFolder}`);

            if (pdfFilesToUpload.length > 0 && data && data !== null) {

               const res = await Axios.post('/api/drawing/set-dms-files', data);
               const listFileName = res.data;
               arrayFilesPdfUploadLink = listFileName.map(link => ({
                  fileName: getFileNameFromLinkResponse(link),
                  fileLink: link
               })).map(x => x.fileLink);
            };
         };

         let linkRfaDrawingsUploaded = [];
         if (dwgsImportFromRFA.length > 0) {
            linkRfaDrawingsUploaded = dwgsImportFromRFA.map(dwg => {
               const link = getInfoValueFromRfaData(dwg, 'submission', 'drawing');
               return link;
            });
         };
         linkRfaDrawingsUploaded = [...new Set(linkRfaDrawingsUploaded)];

         let rowOutput, rowFound;
         if (isFormEditting || type === 'form-reply-multi-type') {
            rowFound = rowsRefAllInit.find(x => x[refKey] === currentRefData[refKey] && x.revision === currentRefData.revision);
         };

         if (type === 'form-submit-multi-type' || type === 'form-resubmit-multi-type') {

            rowOutput = {
               _id: rowFound ? rowFound.id : mongoObjectId(),
               data: {}
            };

            rowOutput.trade = trade;
            rowOutput[refKey] = refToSave;
            rowOutput.revision = refToSaveVersionOrToReply;

            
            rowOutput.data[`submission-${refType}-emailTo-${company}`] = recipient.to;
            rowOutput.data[`submission-${refType}-emailCc-${company}`] = recipient.cc;
            rowOutput.data[`submission-${refType}-emailTitle-${company}`] = emailTextTitle;
            rowOutput.data[`submission-${refType}-description-${company}`] = description;
            // MM also needs consultantMustReply = [];
            rowOutput.data[`submission-${refType}-consultantMustReply-${company}`] = pageSheetTypeName === 'page-mm' ? [] : listConsultantMustReply;
            rowOutput.data[`submission-${refType}-user-${company}`] = email;
            if (!(isFormEditting && arrayFilesPdfUploadLink.length === 0 && linkRfaDrawingsUploaded.length === 0)) {
               rowOutput.data[`submission-${refType}-linkDrawings-${company}`] = arrayFilesPdfUploadLink;
               rowOutput.data[`submission-${refType}-linkDrawingsRfa-${company}`] = linkRfaDrawingsUploaded;
            };

            if (linkFormPdfNoSignature) rowOutput.data[`submission-${refType}-linkFormNoSignature-${company}`] = linkFormPdfNoSignature;



            if (pageSheetTypeName !== 'page-mm') {
               rowOutput.data[`submission-${refType}-requestedBy-${company}`] = requestedBy;
               rowOutput.data[`submission-${refType}-signaturedBy-${company}`] = signaturedBy;
               rowOutput.data[`submission-${refType}-recipientName-${company}`] = recipientName;
               rowOutput.data[`submission-${refType}-due-${company}`] = dateReplyForSubmitForm;
            };

            
            if (pageSheetTypeName === 'page-rfam') {
               if (contractSpecification) rowOutput.data[`submission-${refType}-contractSpecification-${company}`] = contractSpecification;
               if (proposedSpecification) rowOutput.data[`submission-${refType}-proposedSpecification-${company}`] = proposedSpecification;
               if (submissionType) rowOutput.data[`submission-${refType}-submissionType-${company}`] = submissionType;
               if (contractDrawingNo) rowOutput.data[`submission-${refType}-contractDrawingNo-${company}`] = contractDrawingNo;
            };



            if (pageSheetTypeName === 'page-cvi') {
               rowOutput.data[`submission-${refType}-isCostImplication-${company}`] = isCostImplication;
               rowOutput.data[`submission-${refType}-isTimeExtension-${company}`] = isTimeExtension;
               if (dateConversation) rowOutput.data[`submission-${refType}-dateConversation-${company}`] = dateConversation;
               if (timeConversation) rowOutput.data[`submission-${refType}-timeConversation-${company}`] = timeConversation;
               if (conversationAmong) rowOutput.data[`submission-${refType}-conversationAmong-${company}`] = conversationAmong;
            };

            if (pageSheetTypeName === 'page-dt') {
               if (herewithForDt) rowOutput.data[`submission-${refType}-herewithForDt-${company}`] = herewithForDt;
               if (transmittedForDt) rowOutput.data[`submission-${refType}-transmittedForDt-${company}`] = transmittedForDt;
            };


            if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
               rowOutput.data[`submission-${refType}-date-${company}`] = dateSendThisForm || new Date();
               if (!isFormEditting) {
                  rowOutput.data[`submission-${refType}-dateSendNoEmail-${company}`] = new Date();
               };
            } else {
               if (!isFormEditting) {
                  rowOutput.data[`submission-${refType}-date-${company}`] = new Date();
               };
            };

            if (mepSubTradeFirstTime) {
               rowOutput.data[`submission-${refType}-subTradeForMep-${company}`] = mepSubTradeFirstTime;
            };


         } else if (type === 'form-reply-multi-type') {

            rowOutput = {
               _id: rowFound.id,
               data: {}
            };

            rowOutput.data[`reply-${refType}-emailTo-${company}`] = recipient.to;
            rowOutput.data[`reply-${refType}-emailCc-${company}`] = recipient.cc;
            rowOutput.data[`reply-${refType}-emailTitle-${company}`] = emailTextTitle;
            rowOutput.data[`reply-${refType}-description-${company}`] = description;
            rowOutput.data[`reply-${refType}-user-${company}`] = email;


            if (pageSheetTypeName === 'page-rfam') {
               rowOutput.data[`reply-${refType}-status-${company}`] = consultantReplyStatus;
            } else if (pageSheetTypeName === 'page-rfi' || pageSheetTypeName === 'page-cvi') {
               rowOutput.data[`reply-${refType}-status-${company}`] = 'replied';
            };

            if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
               rowOutput.data[`reply-${refType}-date-${company}`] = dateSendThisForm || new Date();
               if (!isFormEditting) {
                  rowOutput.data[`reply-${refType}-dateSendNoEmail-${company}`] = new Date();
               };
            } else {
               if (!isFormEditting) {
                  rowOutput.data[`reply-${refType}-date-${company}`] = new Date();
               };
            };

            if (!(isFormEditting && arrayFilesPdfUploadLink.length === 0)) {
               rowOutput.data[`reply-${refType}-linkFormReply-${company}`] = arrayFilesPdfUploadLink.find(link => getFileNameFromLinkResponse(link) === formReplyFileName);
               rowOutput.data[`reply-${refType}-linkDocumentsReply-${company}`] = arrayFilesPdfUploadLink.filter(link => getFileNameFromLinkResponse(link) !== formReplyFileName);
            };
         };

         await Axios.post(`${SERVER_URL}/row-${refType}/save-rows-${refType}/`, { token, projectId, rows: [rowOutput] });


         if (typeButton === 'action-multiform-download') {

            const csvURL = window.URL.createObjectURL(filePdfBlobOutput);
            let tempLink = document.createElement('a');
            tempLink.href = csvURL;
            tempLink.setAttribute('download', `${refNumberTextInfo}_cover_form.pdf`);
            tempLink.click();

         } else if (typeButton === 'action-multiform-email') {

            if (!isFormEditting && !isBothSideActionUserWithNoEmailSent) {

               const data = {
                  projectId, company, projectName,
                  formSubmitType: refType,
                  type: type.includes('form-reply-multi-') ? 'reply-signed-off' : (pageSheetTypeName === 'page-mm' ? 'submit-meeting-minutes' : 'submit-request-signature'),
                  rowIds: [rowOutput._id],
                  emailSender: email,
               };

               await Axios.post('/api/rfa/mail', {
                  token, data,
                  momentToTriggerEmail: moment().add(moment.duration(EDIT_DURATION_MIN, 'minutes'))
               });
            };
         };


         message.success('Submitted Successfully', 2);

         const route = pageSheetTypeName === 'page-rfam' ? 'row-rfam'
            : pageSheetTypeName === 'page-cvi' ? 'row-cvi'
               : pageSheetTypeName === 'page-rfi' ? 'row-rfi'
                  : pageSheetTypeName === 'page-dt' ? 'row-dt'
                     : pageSheetTypeName === 'page-mm' ? 'row-mm'
                        : 'n/a';
         
         const resSettings = await Axios.get(`${SERVER_URL}/settings/get-all-settings-this-project/`, { params: { token, projectId } });
         const projectSetting = resSettings.data.find(x => x.headers);
         let projectTree = [];
         if (projectSetting) {
            projectTree = projectSetting.drawingTypeTree;
         };

         const res = await Axios.get(`${SERVER_URL}/${route}/`, { params: { token, projectId, email } });
         const rowsAllMultiForm = res.data;

         const expandedRowsIdArr = [
            ...(pageSheetTypeName === 'page-mm' ? tradeArrayMeetingMinutesForm : tradeArrayForm),
            ...rowsAllMultiForm.filter(x => x[refKey]).map(x => x[refKey])
         ];

         commandAction({
            type: 'reload-data-view-multi-form',
            data: {
               rowsAllMultiForm,
               expandedRowsIdArr,
               projectTree
            }
         });

      } catch (err) {
         getSheetRows({ ...stateRow, loading: false });
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };

   const onClickApplyAddNewRefForm = () => {

   };

   const onClickAcknowledgeForm = async () => {

      setLoading(true);
      try {

         const { email, company, projectId, token } = stateProject.allDataOneSheet;
         const { currentRefToAddNewOrReplyOrEdit, rowsDtAllInit, rowsCviAllInit } = stateRow;

         const { currentRefData } = currentRefToAddNewOrReplyOrEdit;

         const refType = getKeyTextForSheet(pageSheetTypeName);
         const refKey = refType + 'Ref';

         let rowOutput = { _id: currentRefData.id };

         rowOutput.data = {
            [`reply-${refType}-acknowledge-${company}`]: true,
            [`reply-${refType}-user-${company}`]: email,
            [`reply-${refType}-date-${company}`]: new Date()
         };


         await Axios.post(`${SERVER_URL}/row-${refType}/save-rows-${refType}/`, { token, projectId, rows: [rowOutput] });

         message.success('Submitted Successfully', 2);

         const route = pageSheetTypeName === 'page-rfam' ? 'row-rfam'
            : pageSheetTypeName === 'page-cvi' ? 'row-cvi'
               : pageSheetTypeName === 'page-rfi' ? 'row-rfi'
                  : pageSheetTypeName === 'page-dt' ? 'row-dt'
                     : pageSheetTypeName === 'page-mm' ? 'row-mm'
                        : 'n/a';

         const resSettings = await Axios.get(`${SERVER_URL}/settings/get-all-settings-this-project/`, { params: { token, projectId } });
         const projectSetting = resSettings.data.find(x => x.headers);
         let projectTree = [];
         if (projectSetting) {
            projectTree = projectSetting.drawingTypeTree;
         };

         const res = await Axios.get(`${SERVER_URL}/${route}/`, { params: { token, projectId, email } });
         const rowsAllMultiForm = res.data;

         const expandedRowsIdArr = [
            ...(pageSheetTypeName === 'page-mm' ? tradeArrayMeetingMinutesForm : tradeArrayForm),
            ...rowsAllMultiForm.filter(x => x[refKey]).map(x => x[refKey])
         ];

         commandAction({
            type: 'reload-data-view-multi-form',
            data: {
               rowsAllMultiForm,
               expandedRowsIdArr,
               projectTree
            }
         });

      } catch (err) {
         getSheetRows({ ...stateRow, loading: false });
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };




   const onClickApplyAdminActionMultiType = (isNoEmailSent) => {

      const currentRefToAddNewOrReplyOrEdit = stateRow.currentRefToAddNewOrReplyOrEdit || {};
      const { tempRefData, tempConsultantToReply } = currentRefToAddNewOrReplyOrEdit;

      let formRefType;
      let currentRefData = null;
      let objConsultantNameToReply = {};
      if (tempConsultantToReply) {
         formRefType = pageSheetTypeName === 'page-rfa' ? 'form-reply-RFA' : 'form-reply-multi-type';
         currentRefData = tempRefData;
         objConsultantNameToReply = {
            consultantNameToReplyByBothSideActionUser: tempConsultantToReply
         };
      } else {
         if (tempRefData) {
            formRefType = pageSheetTypeName === 'page-rfa' ? 'form-resubmit-RFA' : 'form-resubmit-multi-type';
            currentRefData = tempRefData;
         } else {
            formRefType = pageSheetTypeName === 'page-rfa' ? 'form-submit-RFA' : 'form-submit-multi-type';
         };
      };


      buttonPanelFunction(formRefType);
      getSheetRows({
         ...stateRow,
         currentRefToAddNewOrReplyOrEdit: {
            currentRefData,
            formRefType,
            isFormEditting: false,
            ...objConsultantNameToReply,
            isBothSideActionUserWithNoEmailSent: isNoEmailSent,
         },
      });
   };




   return (
      <>
         {(panelSettingType === 'save-ICON' || panelSettingType === 'save-ICON-data-entry-export') && (
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
               headers={(pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry')
                  ? stateProject.userData.headersShown
                  : (pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')
                     ? (isShowAllConsultant ? [...getHeadersForm(pageSheetTypeName), ...headersConsultantWithNumber] : getHeadersForm(pageSheetTypeName))
                     : (pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-mm')
                        ? getHeadersForm(pageSheetTypeName)
                        : []
               }
               modeFilter={stateRow.modeFilter}
               rowsInputData={
                  (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') ? stateRow.rowsAll
                     : (pageSheetTypeName === 'page-rfa') ? stateRow.rowsRfaAll
                        : (pageSheetTypeName === 'page-rfam') ? stateRow.rowsRfamAll
                           : (pageSheetTypeName === 'page-rfi') ? stateRow.rowsRfiAll
                              : (pageSheetTypeName === 'page-cvi') ? stateRow.rowsCviAll
                                 : (pageSheetTypeName === 'page-dt') ? stateRow.rowsDtAll
                                    : (pageSheetTypeName === 'page-mm') ? stateRow.rowsMmAll
                                       : []
               }
               pageSheetTypeName={pageSheetTypeName}
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
               onClickCancelModal={onClickCancelModal}
               applyResetMode={applyResetMode}
               modeFilter={stateRow.modeFilter}
               modeSort={stateRow.modeSort}
               modeSearch={stateRow.modeSearch}
               pageSheetTypeName={pageSheetTypeName}
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
            <>
               {pageSheetTypeName === 'page-spreadsheet' ? <TableActivityHistory /> : <TableAllFormActivityHistory />}
            </>
         )}

         {panelSettingType === 'color-cell-history-ICON' && (
            <FormCellColorizedCheck setCellHistoryArr={setCellHistoryArr} />
         )}


         {panelSettingType === 'Date Automation' && (
            <FormDateAutomation
               applyDateAutomation={applyDateAutomation}
               onClickCancel={onClickCancelModal}
               rowsToAutomation={rowsSelected.length > 0 ? rowsSelected : [panelType.cellProps.rowData]}
            />
         )}

         {panelSettingType === 'Create New Drawing Revision' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={createNewDrawingRevision}
               content={`Are you sure to create a new revision of this drawing: ${panelType.cellProps.rowData['Drawing Number'] || ' '} - ${panelType.cellProps.rowData['Drawing Name'] || ' '} ?`}
            />
         )}

         {panelSettingType === 'View Drawing Revision' && (
            <TableDrawingDetail
               {...panelType.cellProps}
               onClickCancelModal={onClickCancelModal}
               onClickApply={onClickCancelModal}
            />
         )}

         {panelSettingType === 'addDrawingType-ICON' && pageSheetTypeName === 'page-spreadsheet' && (
            <FormDrawingTypeOrder applyFolderOrganize={applyFolderOrganize} onClickCancelModal={onClickCancelModal} />
         )}
         {panelSettingType === 'addDrawingType-ICON' && pageSheetTypeName === 'page-data-entry' && (
            <FormDrawingTypeOrderDataEntry applyFolderOrganizeDataEntry={applyFolderOrganizeDataEntry} onClickCancelModal={onClickCancelModal} />
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


         {(
            panelSettingType === 'form-submit-RFA' ||
            panelSettingType === 'form-resubmit-RFA' ||
            panelSettingType === 'form-reply-RFA'
         ) && (
               <PanelAddNewRFA
                  onClickCancelModal={onClickCancelModal}
                  onClickApplyAddNewRFA={onClickApplyAddNewRFA}
               />
            )}


         {panelSettingType === 'option-email-or-not-for-admin' && (
            <PanelConfirm
               onClickCancel={() => {
                  onClickCancelModal();
                  onClickApplyAdminActionMultiType(true);
               }}
               onClickApply={() => {
                  onClickCancelModal();
                  onClickApplyAdminActionMultiType(false);
               }}
               newTextBtnApply='Send Email'
               newTextBtnCancel={`Update ${pageSheetTypeName.slice(5, pageSheetTypeName.length).toUpperCase()} Without Sending Email`}
               content={`Do you want to submit/reply ${pageSheetTypeName.slice(5, pageSheetTypeName.length).toUpperCase()} and send an email ? (Not sending email option allows you to migrate ${pageSheetTypeName.slice(5, pageSheetTypeName.length).toUpperCase()} drawings already submitted previously)`}
            />
         )}




         {(
            panelSettingType === 'form-submit-multi-type' ||
            panelSettingType === 'form-resubmit-multi-type' ||
            panelSettingType === 'form-reply-multi-type'
         ) && (
               <PanelAddNewMultiForm
                  onClickCancelModal={onClickCancelModal}
                  onClickApplyAddNewRefForm={onClickApplyAddNewRefForm}
                  onClickApplySendFormToSignature={onClickApplySendFormToSignature}
               />
            )}





         {(panelSettingType === 'acknowledge-form' || panelSettingType === 'acknowledge-or-reply-form') && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={onClickAcknowledgeForm}
               newTextBtnApply={'Acknowledge'}
               content={panelSettingType === 'acknowledge-form' ? 'Do you want to acknowledge this form ?' : 'Do you want to acknowledge or reply this form ?'}

               onClickApplyAdditional01={() => {
                  buttonPanelFunction('form-reply-multi-type');
               }}
               newTextBtnApplyAdditional01={panelSettingType === 'acknowledge-or-reply-form' && 'Reply'}
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
export const _processChainRowsSplitGroupFnc2 = (rows) => {
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
export const getDataForRFASheet = (rows, rowsHistory, role, company) => {

   const nodeTitleArr = ['ARCHI', 'C&S', 'M&E', 'PRECAST'];

   const rowsWithRFA = rows.filter(x => x.rfaNumber);
   const rowsHistoryWithRFA = rowsHistory.filter(x => x.rfaNumber);


   let treeViewRFA = [];

   let noOfRfaOverdue = 0;
   let noOfRfaOverdueNext3Days = 0;
   let noOfRfaOutstanding = 0;


   nodeTitleArr.forEach(title => {

      treeViewRFA.push({
         id: title,
         treeLevel: 2,
         expanded: true,
         title
      });

      const rowsUnderThisTrade = rowsWithRFA.filter(row => {
         const rfaNumber = row['rfaNumber'];
         return convertTradeCodeInverted(rfaNumber.split('/')[2]) === title;
      });

      const rowsHistoryUnderThisTrade = rowsHistoryWithRFA.filter(row => {
         const rfaNumber = row['rfaNumber'];
         return convertTradeCodeInverted(rfaNumber.split('/')[2]) === title;
      });


      const allRfaCode = [...new Set(rowsUnderThisTrade.map(x => x['rfaNumber']))].sort();

      const rfaParentNodeArray = [];


      allRfaCode.forEach(rfaNumb => {


         let allDwgs = [...rowsUnderThisTrade, ...rowsHistoryUnderThisTrade].filter(dwg => dwg['rfaNumber'] === rfaNumb);
         const allRfaRef = [...new Set(allDwgs.map(x => x['RFA Ref'] || ''))];



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

         let objRfaOutput = {};
         allRfaRef.forEach(rfaRef => {

            const oneRowInRFA = allDwgs.find(dwg => dwg['RFA Ref'] === rfaRef);
            let obj = {};
            if (oneRowInRFA) {
               for (const key in oneRowInRFA) {
                  if (
                     (key.includes('submission-$$$-') || key.includes('reply-$$$-')) &&
                     !key.includes('submission-$$$-drawing') &&
                     !key.includes('reply-$$$-drawing-') &&
                     !key.includes('reply-$$$-comment-') &&
                     !key.includes('reply-$$$-status-')
                  ) {
                     obj[key] = oneRowInRFA[key];
                  };
               };
               objRfaOutput[rfaRef] = obj;

               const consultantLeadName = getConsultantLeadName(oneRowInRFA);


               let replyStatusValue;
               if (role === 'Consultant') {
                  replyStatusValue = getInfoValueFromRfaData(oneRowInRFA, 'reply', 'status', company);
                  const consultantMustReply = getInfoValueFromRfaData(oneRowInRFA, 'submission', 'consultantMustReply');
                  if (!replyStatusValue && consultantMustReply.indexOf(company) !== -1) {
                     noOfRfaOutstanding++;
                  };
               } else {
                  replyStatusValue = getInfoValueFromRfaData(oneRowInRFA, 'reply', 'status', consultantLeadName);
                  if (!replyStatusValue) {
                     noOfRfaOutstanding++;
                  };
               };


               let consultantLeadReply;
               if (consultantLeadName) {
                  consultantLeadReply = getInfoValueFromRfaData(oneRowInRFA, 'reply', 'status', consultantLeadName);
               };

               if (!consultantLeadReply) {
                  const nosOfDate = compareDates(oneRowInRFA['Consultant Reply (T)']);
                  if (nosOfDate < 3) {
                     noOfRfaOverdueNext3Days++;
                  };
                  if (nosOfDate < 0) {
                     noOfRfaOverdue++;
                  };
               };
            };
         });
      });
      treeViewRFA = [...treeViewRFA, ...rfaParentNodeArray];
   });

   let allRowsForRFA = [...rowsWithRFA, ...rowsHistoryWithRFA];

   allRowsForRFA = _.sortBy(allRowsForRFA, ['Rev', 'Drawing Number']);


   // allRowsForRFA.sort((a, b) => {
   //    if (a['Drawing Number'] > b['Drawing Number']) return 1;
   //    if (a['Drawing Number'] < b['Drawing Number']) return -1;
   //    if (a['RFA Ref'] > b['RFA Ref']) return 1;
   //    if (a['RFA Ref'] < b['RFA Ref']) return -1;
   // });


   return {
      rowsDataRFA: allRowsForRFA,
      treeViewRFA,
      rfaStatistics: {
         noOfRfaOverdue,
         noOfRfaOverdueNext3Days,
         noOfRfaOutstanding
      }
   };
};
export const getDataForMultiFormSheet = (rows, pageSheetTypeName) => {

   const nodeTitleArr = pageSheetTypeName === 'page-mm' ? tradeArrayMeetingMinutesForm : tradeArrayForm;

   let tree = [];
   let rowsOutput = [];
   nodeTitleArr.forEach(title => {

      tree.push({
         id: title,
         treeLevel: 2,
         expanded: true,
         title
      });

      const refKey = getKeyTextForSheet(pageSheetTypeName) + 'Ref';

      const rowsUnderThisTrade = rows.filter(row => row.trade === title);
      const allRefCode = [...new Set(rowsUnderThisTrade.map(x => x[refKey]))].sort();


      allRefCode.forEach(refText => {

         let allDwgs = rows.filter(row => row[refKey] === refText);
         const btnTextArray = [...new Set(allDwgs.map(x => x['revision']))].sort();
         allDwgs.forEach(row => {
            row.btn = btnTextArray;
            row.parentId = title;
         });
         rowsOutput = [...rowsOutput, ...allDwgs];
      });
   });

   return {
      rowsData: rowsOutput,
      treeView: tree,
   };
};
export const getKeyTextForSheet = (pageSheetTypeName) => {
   return pageSheetTypeName === 'page-rfa' ? 'rfa'
      : pageSheetTypeName === 'page-rfam' ? 'rfam'
         : pageSheetTypeName === 'page-cvi' ? 'cvi'
            : pageSheetTypeName === 'page-rfi' ? 'rfi'
               : pageSheetTypeName === 'page-dt' ? 'dt'
                  : pageSheetTypeName === 'page-mm' ? 'mm'
                     : 'n/a';
};



export const saveDataToServer = async (stateCell, stateRow, stateProject, commandAction, setLoading) => {
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
                     key === `submission-$$$-drawing-${company}` ||
                     key === `submission-$$$-dwfxLink-${company}` ||
                     key === `submission-$$$-dwfxName-${company}` ||
                     key === `submission-$$$-trade-${company}` ||
                     key === `submission-$$$-user-${company}` ||
                     key === `submission-$$$-emailAdditionalNotes-${company}`
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