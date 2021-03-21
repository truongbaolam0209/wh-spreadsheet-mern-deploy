import React, { useContext } from 'react';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertCellTempToHistory, debounceFnc, genId, mongoObjectId } from '../../utils';
import FormFilter from '../generalComponents/FormFilter';
import FormGroup from '../generalComponents/FormGroup';
import FormSort from '../generalComponents/FormSort';
import PanelConfirm from '../generalComponents/PanelConfirm';
import PanelConfirmResetMode from '../generalComponents/PanelConfirmResetMode';
import PanelPickNumber from '../generalComponents/PanelPickNumber';
import ReorderColumnForm from '../generalComponents/ReorderColumnForm';
import { getOutputRowsAllSorted } from '../PageDataEntrySheet';
import ColorizedForm2 from './ColorizedForm2';
import FormCellColorizedCheck2 from './FormCellColorizedCheck2';
import FormDrawingTypeOrder, { flattenAllTreeChildNode1, getTreeFlattenOfNodeInArray } from './FormDrawingTypeOrder2';
import TableActivityHistory2 from './TableActivityHistory2';
import TableCellHistory2 from './TableCellHistory2';



const PanelSetting2 = (props) => {

   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateCell, OverwriteCellsModified } = useContext(CellContext);

   const {
      panelType, panelSettingType, commandAction, onClickCancelModal, setLoading,
      cellsHistoryInCurrentSheet, cellOneHistory, saveDataToServerCallback
   } = props;

   const { projectId } = stateProject.allDataOneSheet;


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
               cellsModifiedTempObj[`${row.id}-${hd.text}`] = row[hd.text];
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
         if (key.slice(0, 24) === rowId) {  // deleted cells modified temporary...
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


      if (allDrawingsParentId.length === 1 && allDrawingsParentId[0] === projectId) {
         const rowsChildren = rowsAll.filter(row => row._parentRow === projectId);
         // some folders are added below sheet level => add new folder to contain...
         const nodeParentPrevious = {
            id: projectId,
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
                     if (key.slice(0, 24) === rrr.id) {  // deleted cells modified temporary...
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


   const saveData = () => {
      const {
         drawingTypeTree,
         rowsAll,
         drawingsTypeDeleted,
         rowsDeleted,
      } = stateRow;
      const { cellsModifiedTemp } = stateCell;
      const { headers } = stateProject.allDataOneSheet.publicSettings;

      const rowToSaveArr = rowsAll.map(row => {
         let rowToSave = { _id: row.id, parentRow: row._parentRow, preRow: row._preRow };
         headers.forEach(hd => {
            if (row[hd.text] || row[hd.text] === '') {
               rowToSave.data = { ...rowToSave.data || {}, [hd.key]: row[hd.text] };
            };
         });
         return rowToSave;
      });


      saveDataToServerCallback({
         drawingTypeTree,
         rowsAll: rowToSaveArr,
         drawingsTypeDeleted,
         rowsDeleted,
         cellHistory: convertCellTempToHistory(cellsModifiedTemp, stateProject)
      });
   };


   // const saveDataToServer = async () => {
   //    const { email, projectId, token, role, projectName } = stateProject.allDataOneSheet;
   //    const { headersShown, headersHidden, nosColumnFixed, colorization } = stateProject.userData;
   //    const { headers } = stateProject.allDataOneSheet.publicSettings;
   //    let { cellsModifiedTemp } = stateCell;
   //    let {
   //       rowsUpdatePreRowOrParentRow,
   //       drawingTypeTreeInit,
   //       drawingTypeTree,
   //       drawingsTypeDeleted,
   //       rowsDeleted,

   //       viewTemplateNodeId,
   //       viewTemplates,
   //       modeFilter,
   //       modeSort,
   //    } = stateRow;

   //    try {
   //       setLoading(true);
   //       commandAction({ type: '' });

   //       const resDB = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
   //       const resCellsHistory = await Axios.get(`${SERVER_URL}/cell/history/`, { params: { token, projectId } });

   //       let { publicSettings: publicSettingsFromDB, rows: rowsFromDBInit } = resolveDataFromProps(resDB);
   //       let { drawingTypeTree: drawingTypeTreeFromDB, activityRecorded: activityRecordedFromDB } = publicSettingsFromDB;

   //       let rowsFromDB = rowsFromDBInit.map(row => ({ ...row }));

   //       let {
   //          needToSaveTree,
   //          treeDBModifiedToSave,
   //          nodesToAddToDB,
   //          nodesToRemoveFromDB
   //       } = compareCurrentTreeAndTreeFromDB(
   //          drawingTypeTreeInit,
   //          drawingTypeTree,
   //          drawingsTypeDeleted,
   //          drawingTypeTreeFromDB,
   //          activityRecordedFromDB.filter(x => x.action === 'Delete Drawing Type'),
   //       );

   //       let activityRecordedArr = [];
   //       treeDBModifiedToSave = [
   //          {
   //             title: projectName,
   //             id: projectId,
   //             treeLevel: 0,
   //             expanded: true,
   //          },
   //          ...treeDBModifiedToSave
   //       ];



   //       const rowsUpdatePreRowOrParentRowArray = Object.values(rowsUpdatePreRowOrParentRow) // check if row or its parents deleted by other users
   //          .filter(row => !activityRecordedFromDB.find(r => r.id === row.id && r.action === 'Delete Drawing') &&
   //             !activityRecordedFromDB.find(r => r.id === row._parentRow && r.action === 'Delete Drawing Type'));


   //       if (rowsUpdatePreRowOrParentRowArray.length > 0) {

   //          let arrID = [];
   //          rowsFromDB.forEach(r => { // take out temporarily all rowsUpdatePreRowOrParentRowArray from DB
   //             if (rowsUpdatePreRowOrParentRowArray.find(row => row.id === r.id)) {
   //                arrID.push(r.id);
   //                const rowBelow = rowsFromDB.find(rrr => rrr._preRow === r.id);
   //                if (rowBelow) rowBelow._preRow = r._preRow;
   //             };
   //          });
   //          rowsFromDB = rowsFromDB.filter(r => arrID.indexOf(r.id) === -1);


   //          const rowsInOldParent = rowsUpdatePreRowOrParentRowArray.filter(r => {
   //             return treeDBModifiedToSave.find(tr => tr.id === r._parentRow && !treeDBModifiedToSave.find(x => x.parentId === tr.id));
   //          });
   //          const rowsInOldParentDivertBranches = rowsUpdatePreRowOrParentRowArray.filter(r => {
   //             return treeDBModifiedToSave.find(tr => tr.id === r._parentRow && treeDBModifiedToSave.find(x => x.parentId === tr.id));
   //          });
   //          const rowsInNewParent = rowsUpdatePreRowOrParentRowArray.filter(r => {
   //             return !treeDBModifiedToSave.find(tr => tr.id === r._parentRow);
   //          });



   //          const rowsInOldParentOutput = _processChainRowsSplitGroupFnc2([...rowsInOldParent]);
   //          rowsInOldParentOutput.forEach(arrChain => {
   //             const rowFirst = arrChain[0];
   //             const parentRowInDB = treeDBModifiedToSave.find(tr => tr.id === rowFirst._parentRow);
   //             const rowAbove = rowsFromDB.find(r => r.id === rowFirst._preRow);
   //             if (rowAbove) {
   //                if (rowAbove._parentRow !== rowFirst._parentRow) { // rowAbove move to other parent by other user
   //                   const lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
   //                   rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
   //                } else { // rowAbove is still in the same parent
   //                   const rowBelowRowAbove = rowsFromDB.find(r => r._preRow === rowAbove.id);
   //                   if (rowBelowRowAbove) rowBelowRowAbove._preRow = arrChain[arrChain.length - 1].id;
   //                   rowFirst._preRow = rowAbove.id;
   //                };
   //             } else {
   //                if (rowFirst._preRow === null) {
   //                   const firstRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && r._preRow === null);
   //                   if (firstRowInParent) { // if firstRowInParent undefined means Drawing type has 0 drawing currently...
   //                      firstRowInParent._preRow = arrChain[arrChain.length - 1].id;
   //                   };
   //                } else {
   //                   const lastRowInParent = rowsFromDB.find(r => r._parentRow === parentRowInDB.id && !rowsFromDB.find(x => x._preRow === r.id));
   //                   rowFirst._preRow = lastRowInParent ? lastRowInParent.id : null;
   //                };
   //             };
   //             rowsFromDB = [...rowsFromDB, ...arrChain];
   //          });


   //          let idsOldParentDivertBranches = [...new Set(rowsInOldParentDivertBranches.map(r => r._parentRow))];
   //          idsOldParentDivertBranches.forEach(idP => {
   //             let arrInput = rowsInOldParentDivertBranches.filter(r => r._parentRow === idP);
   //             let rowsChildren = _processRowsChainNoGroupFnc1([...arrInput]);

   //             const treeNode = treeDBModifiedToSave.find(x => x.id === idP);
   //             const newIdParent = mongoObjectId();
   //             treeDBModifiedToSave.push({
   //                title: 'New Folder',
   //                id: newIdParent,
   //                parentId: treeNode.id,
   //                treeLevel: treeNode.treeLevel + 1,
   //                expanded: true,
   //             });
   //             needToSaveTree = true;

   //             activityRecordedArr.push({
   //                title: 'New Folder',
   //                id: newIdParent,
   //                email,
   //                createdAt: new Date(),
   //                action: 'Create Folder',
   //             });

   //             rowsChildren.forEach((r, i) => {
   //                r._preRow = i === 0 ? null : rowsChildren[i - 1].id;
   //                r._parentRow = newIdParent;
   //             });
   //             rowsFromDB = [...rowsFromDB, ...rowsChildren];
   //          });



   //          let idsNewParentArray = [...new Set(rowsInNewParent.map(r => r._parentRow))];
   //          idsNewParentArray.forEach(idP => {
   //             let arrInput = rowsInNewParent.filter(r => r._parentRow === idP);
   //             let rowsChildren = _processRowsChainNoGroupFnc1([...arrInput]);
   //             rowsChildren.forEach((r, i) => {
   //                r._preRow = i === 0 ? null : rowsChildren[i - 1].id;
   //             });
   //             rowsFromDB = [...rowsFromDB, ...rowsChildren];
   //          });
   //       };


   //       let objCellHistory = {}; // SAVE CELL HISTORY
   //       resCellsHistory.data.map(cell => {
   //          const headerText = headers.find(hd => hd.key === cell.headerKey).text;
   //          if (cell.histories.length > 0) {
   //             const latestHistoryText = cell.histories[cell.histories.length - 1].text;
   //             objCellHistory[`${cell.row}-${headerText}`] = latestHistoryText;
   //          };
   //       });
   //       Object.keys(cellsModifiedTemp).forEach(key => {
   //          if (objCellHistory[key] && objCellHistory[key] === cellsModifiedTemp[key]) {
   //             delete cellsModifiedTemp[key];
   //          } else {
   //             let rowId = key.slice(0, 24);
   //             if (activityRecordedFromDB.find(x => x.id === rowId && x.action === 'Delete Drawing')) {
   //                delete cellsModifiedTemp[key];
   //             };
   //          };
   //       });

   //       if (Object.keys(cellsModifiedTemp).length > 0) {
   //          await Axios.post(`${SERVER_URL}/cell/history/`, { token, projectId, cellsHistory: convertCellTempToHistory(cellsModifiedTemp, stateProject) });
   //       };




   //       let rowDeletedFinal = []; // DELETE ROWS
   //       rowsDeleted.forEach(row => { // some rows already deleted by previous user => no need to delete anymore
   //          const rowInDB = rowsFromDB.find(r => r.id === row.id);
   //          if (rowInDB) {
   //             const rowBelow = rowsFromDB.find(r => r._preRow === rowInDB.id);
   //             if (rowBelow) {
   //                rowBelow._preRow = rowInDB._preRow;
   //             };
   //             rowsFromDB = rowsFromDB.filter(r => r.id !== rowInDB.id); // FIXEDDDDDDDDDDDDDDDDDDD
   //             rowDeletedFinal.push(row);
   //          };
   //       });


   //       if (nodesToRemoveFromDB.length > 0) {
   //          nodesToRemoveFromDB.forEach(fd => {
   //             activityRecordedArr.push({
   //                id: fd.id, email, createdAt: new Date(), action: 'Delete Folder',
   //                title: fd.title,
   //             });
   //          });
   //       };
   //       if (nodesToAddToDB.length > 0) {
   //          nodesToAddToDB.forEach(fd => {
   //             activityRecordedArr.push({
   //                id: fd.id, email, createdAt: new Date(), action: 'Create Folder',
   //                title: fd.title,
   //             });
   //          });
   //       };


   //       activityRecordedArr.forEach(rc => { // SAVE PUBLIC SETTINGS RECORDED
   //          const newRowsAddedByPreviousUserButParentDeletedByCurrentUser = rowsFromDB.filter(e => {
   //             return e._parentRow === rc.id &&
   //                rc.action === 'Delete Folder' &&
   //                !rowDeletedFinal.find(x => x.id === e.id);
   //          });
   //          rowDeletedFinal = [...rowDeletedFinal, ...newRowsAddedByPreviousUserButParentDeletedByCurrentUser];
   //       });

   //       rowDeletedFinal.forEach(r => {
   //          activityRecordedArr.push({
   //             id: r.id, email, createdAt: new Date(), action: 'Delete Drawing',
   //          });
   //       });


   //       rowsFromDB = rowsFromDB.filter(r => !rowDeletedFinal.find(x => x.id === r.id));

   //       if (rowDeletedFinal.length > 0) {  // DELETE ...
   //          await Axios.post(`${SERVER_URL}/sheet/delete-rows/`, { token, projectId, email, rowIdsArray: rowDeletedFinal.map(r => r.id) });
   //       };



   //       treeDBModifiedToSave = treeDBModifiedToSave.filter(node => node.treeLevel !== 0);
   //       let publicSettingsUpdated = { projectName };
   //       if (needToSaveTree) {
   //          publicSettingsUpdated = { ...publicSettingsUpdated, drawingTypeTree: treeDBModifiedToSave };
   //       };
   //       if (activityRecordedArr.length > 0) {
   //          publicSettingsUpdated = { ...publicSettingsUpdated, activityRecorded: [...activityRecordedFromDB, ...activityRecordedArr] };
   //       };
   //       await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, { token, projectId, email, publicSettings: publicSettingsUpdated });


   //       const userSettingsUpdated = {
   //          headersShown: headersShown.map(hd => headers.find(h => h.text === hd).key),
   //          headersHidden: headersHidden.map(hd => headers.find(h => h.text === hd).key),
   //          nosColumnFixed, colorization, role, viewTemplateNodeId, viewTemplates, modeFilter, modeSort
   //       };

   //       await Axios.post(`${SERVER_URL}/sheet/update-setting-user/`, { token, projectId, email, userSettings: userSettingsUpdated });




   //       let rowsToUpdateFinal = []; // FILTER FINAL ROW TO UPDATE......
   //       rowsFromDB.map(row => {
   //          Object.keys(cellsModifiedTemp).forEach(key => {
   //             const { rowId, headerName } = extractCellInfo(key);
   //             if (rowId === row.id) row[headerName] = cellsModifiedTemp[key];
   //          });
   //          let rowOutput;
   //          const found = rowsFromDBInit.find(r => r.id === row.id);
   //          if (found) {
   //             let toUpdate = false;
   //             Object.keys(row).forEach(key => {
   //                if (found[key] !== row[key]) toUpdate = true;
   //             });
   //             if (toUpdate) rowOutput = { ...row };
   //          } else {
   //             rowOutput = { ...row };
   //          };
   //          if (rowOutput) {
   //             let rowToSave = { _id: rowOutput.id, parentRow: rowOutput._parentRow, preRow: rowOutput._preRow };
   //             headers.forEach(hd => {
   //                if (rowOutput[hd.text] || rowOutput[hd.text] === '') {
   //                   rowToSave.data = { ...rowToSave.data || {}, [hd.key]: rowOutput[hd.text] };
   //                };
   //             });
   //             rowsToUpdateFinal.push(rowToSave);
   //          };
   //       });
   //       if (rowsToUpdateFinal.length > 0) {
   //          await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId, rows: rowsToUpdateFinal });
   //       };


   //       commandAction({ type: 'save-data-successfully' });

   //    } catch (err) {
   //       commandAction({ type: 'save-data-failure' });
   //       console.log(err);
   //    };
   // };

   // const saveDataToServerAndReloadData = async () => {
   //    const { projectId, token, email } = stateProject.allDataOneSheet;
   //    try {
   //       await saveDataToServer();
   //       const res = await Axios.get(`${SERVER_URL}/sheet/`, { params: { token, projectId, email } });
   //       commandAction({ type: 'reload-data-from-server', data: resolveDataFromProps(res) });

   //    } catch (err) {
   //       commandAction({ type: 'save-data-failure' });
   //       console.log(err);
   //    };
   // };



   return (
      <>
         {panelSettingType === 'save-ICON' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={saveData}
               content='Do you want to save ?'
            />
         )}

         {panelSettingType === 'filter-ICON' && (
            <FormFilter
               applyFilter={applyFilter}
               onClickCancelModal={onClickCancelModal}
               headers={stateProject.userData.headersShown}
               modeFilter={stateRow.modeFilter}
               rowsAll={stateRow.rowsAll}
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
            <TableActivityHistory2
               cellsHistoryInCurrentSheet={cellsHistoryInCurrentSheet}
            />
         )}

         {panelSettingType === 'color-cell-history-ICON' && (
            <FormCellColorizedCheck2
               setCellHistoryArr={setCellHistoryArr}
               cellsHistoryInCurrentSheet={cellsHistoryInCurrentSheet}
            />
         )}

         {panelSettingType === 'View Cell History' && (
            <TableCellHistory2 {...panelType.cellProps} cellOneHistory={cellOneHistory} />
         )}


         {panelSettingType === 'addDrawingType-ICON' && (
            <FormDrawingTypeOrder applyFolderOrganize={applyFolderOrganize} onClickCancelModal={onClickCancelModal} />
         )}




         {panelSettingType === 'Delete Drawing' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={deleteDrawing}
               content={`Are you sure to delete the: ${panelType.cellProps.rowData['Drawing Number'] || ' '} - ${panelType.cellProps.rowData['Drawing Name'] || ' '} ?`}
            />
         )}

         {panelSettingType === 'colorized-ICON' && (
            <ColorizedForm2 applyColorization={applyColorization} onClickCancelModal={onClickCancelModal} />
         )}

         {panelSettingType === 'Insert Drawings By Type' && (
            <PanelPickNumber onClickCancelModal={onClickCancelModal} onClickApply={onClickFolderInsertSubRows} />
         )}



      </>
   );
};

export default PanelSetting2;








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





