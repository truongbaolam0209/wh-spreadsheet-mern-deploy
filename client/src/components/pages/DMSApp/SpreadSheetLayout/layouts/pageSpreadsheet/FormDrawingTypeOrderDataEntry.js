import { Icon, Input, Modal, Tooltip } from 'antd';
import React, { useContext, useState } from 'react';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';




const FormDrawingTypeOrderDataEntry = ({ onClickCancelModal, applyFolderOrganizeDataEntry }) => {

   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);

   const { rowsAll } = stateRow;

   const { sheetName, sheetId, role } = stateProject.allDataOneSheet;
   const { drawingTypeTree, viewTemplateNodeId } = stateRow;


   const [input, setInput] = useState(addProjectHeaderToTree(drawingTypeTree, sheetName, sheetId));

   const [modalTitle, setModalTitle] = useState(null);
   const [itemNode, setItemNode] = useState(null);
   const [mergeList, setMergeList] = useState([]);

   const addFolderBelow = (node) => {
      node.children.push({
         title: 'New Folder',
         id: mongoObjectId(),
         parentId: node.id,
         treeLevel: node.treeLevel + 1,
         expanded: true,
         children: []
      });
      setInput(addProjectHeaderToTree(flattenAllTreeChildNode1(input[0].children), sheetName, sheetId));

   };
   const deleteFolder = (node) => {
      setItemNode(node);
      setModalTitle('Delete Folder');
   };
   const editFolderName = (node) => {
      setItemNode(node);
      setModalTitle('Edit Folder Name');
   };
   const mergeChildDrawings = (node) => {
      setItemNode(node);
      setModalTitle('Merge All Child Drawings');
   };
   const confirmAction = (modalTitle, text) => {
      if (modalTitle === 'Delete Folder') {
         let idsToDelete = flattenAllTreeChildNode1(itemNode.children).map(x => x.id);
         idsToDelete.push(itemNode.id);

         let currentNodeFlatten = flattenAllTreeChildNode1(input[0].children);
         let outputArray = currentNodeFlatten.filter(x => idsToDelete.indexOf(x.id) === -1);
         setInput(addProjectHeaderToTree(outputArray, sheetName, sheetId));

      } else if (modalTitle === 'Merge All Child Drawings') {
         let idsToMerge = flattenAllTreeChildNode1(itemNode.children).map(x => x.id);
         let mergeListUpdate = [...mergeList];
         idsToMerge.forEach(id => {
            if (mergeList.indexOf(id) !== -1) {
               mergeListUpdate = mergeListUpdate.filter(x => x !== id);
            };
         });

         setMergeList([...mergeListUpdate, itemNode.id]);

         let currentNodeFlatten = flattenAllTreeChildNode1(input[0].children);
         let outputArray = currentNodeFlatten.filter(x => idsToMerge.indexOf(x.id) === -1);

         setInput(addProjectHeaderToTree(outputArray, sheetName, sheetId));

      } else if (modalTitle === 'Edit Folder Name') {
         itemNode.title = text;
         setInput(addProjectHeaderToTree(flattenAllTreeChildNode1(input[0].children), sheetName, sheetId));
      };

      setModalTitle(null);
   };

   const treeFlatten = flattenAllTreeChildNode1(input);

   let eyeShownInit;
   if (viewTemplateNodeId) {
      const nodeTreeFound = treeFlatten.find(x => x.id === viewTemplateNodeId);
      if (nodeTreeFound) {
         const br = getTreeFlattenOfNodeInArray(treeFlatten, nodeTreeFound);
         eyeShownInit = br.map(x => x.id);
      };
   };
   const [iconBtnEyeShownArr, setIconBtnEyeShownArr] = useState(eyeShownInit || []);
   const [nodeIsolated, setNodeIsolated] = useState(viewTemplateNodeId || null);
   const isolateView = (node) => {
      setNodeIsolated(node.id);
      const nodeFound = treeFlatten.find(x => x.id === node.id);
      const branch = getTreeFlattenOfNodeInArray(treeFlatten, nodeFound);
      setIconBtnEyeShownArr(branch.map(x => x.id));
   };

   return (
      <Container>
         <PanelStyled>
            <SortableTreeStyled
               treeData={input}
               onChange={treeData => setInput(treeData)}
               canDrag={({ node }) => {
                  if (node.treeLevel === 0) return false;
                  if (!role.canEditParent) return false;
                  return true;
               }}
               canDrop={({ prevParent, nextParent, node }) => {
                  if (node.treeLevel === 0 || !nextParent || !prevParent ||
                     (nextParent && nextParent.treeLevel !== node.treeLevel - 1)
                  ) {
                     return false;
                  };
                  return true;
               }}
               onMoveNode={({ nextParentNode, node }) => {
                  updateChildrenNode([node], nextParentNode.treeLevel + 1 - node.treeLevel);
               }}
               isVirtualized={false}

               generateNodeProps={({ node }) => {

                  const isEyeShownColor = iconBtnEyeShownArr.indexOf(node.id) !== -1 ? 'black' : '#DCDCDC';
                  const isEyeShownType = iconBtnEyeShownArr.indexOf(node.id) !== -1 ? 'eye' : 'eye-invisible';

                  return ({
                     className: 'parent-tags',
                     buttons:
                        node.treeLevel === 0 ? [
                           <IconBtn type='plus' onClick={() => addFolderBelow(node)} />,
                           node.children.length > 0 && <IconBtn type='shrink' onClick={() => mergeChildDrawings(node)} />,
                           <IconBtn type={isEyeShownType} onClick={() => isolateView(node)} color={isEyeShownColor} />

                        ] : [
                           <IconBtn type='plus' onClick={() => addFolderBelow(node)} />,
                           <IconBtn type='edit' onClick={() => editFolderName(node)} />,
                           <IconBtn type='delete' onClick={() => deleteFolder(node)} />,
                           node.children.length > 0 && <IconBtn type='shrink' onClick={() => mergeChildDrawings(node)} />,
                           <IconBtn type={isEyeShownType} onClick={() => isolateView(node)} color={isEyeShownColor} />
                        ]
                  });
               }}
            />
         </PanelStyled>

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={() => applyFolderOrganizeDataEntry(input[0].children, mergeList, nodeIsolated)} // remove sheetName item before apply...
            />
         </div>


         {modalTitle && (
            <ModalStyledSetting
               title={modalTitle}
               visible={modalTitle !== null ? true : false}
               footer={null}
               onCancel={() => setModalTitle(null)}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.6}
            >
               <ConfirmOrEditNameModal
                  modalTitle={modalTitle}
                  confirmAction={confirmAction}
                  itemNode={itemNode}
                  input={input}
                  rowsAll={rowsAll}
               />
            </ModalStyledSetting>
         )}

      </Container>
   );
};

export default FormDrawingTypeOrderDataEntry;


const SortableTreeStyled = styled(SortableTree)`
   .rst__node {
      height: 45px !important;
   }
   .rst__rowContents {
      min-width: fit-content;
      background-color: transparent !important;
   }
`;
const IconStyle = styled(Icon)`
   font-size: 14px;
   margin: 2px;
   padding: 4px;
   &:hover {
      background-color: ${colorType.grey0};
   };
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
const Container = styled.div`
   height: ${`${window.innerHeight * 0.8}` + 'px'};
   width: 100%;
   display: flex;
   flex-direction: column;
`;
const PanelStyled = styled.div`
   width: 100%;
   float: right;
   overflow-x: hidden;
   border-bottom: 1px solid ${colorType.grey4};
`;
const IconBtn = ({ type, onClick, color }) => {
   const text = type === 'plus' ? 'Add Sub Folder'
      : type === 'delete' ? 'Delete Folder'
         : type === 'edit' ? 'Edit Name'
            : type === 'eye' ? 'Isolate View'
               : type === 'eye-invisible' ? 'Isolate View'
                  : 'Merge All Sub Folders'

   return (
      <Tooltip title={text}>
         <IconStyle type={type} onClick={onClick} style={{ color: color || 'black' }} />
      </Tooltip>
   );
};


const ConfirmOrEditNameModal = ({ modalTitle, confirmAction, itemNode, input, rowsAll }) => {

   let dwgsToWarn = [];
   if (modalTitle === 'Delete Folder') {
      const currentTree = flattenAllTreeChildNode1(input[0].children);
      const currentTreeNode = currentTree.find(x => x.id === itemNode.id);
      const nodeArray = getTreeFlattenOfNodeInArray(currentTree, currentTreeNode);
      nodeArray.forEach(nd => {
         dwgsToWarn = [...dwgsToWarn, ...rowsAll.filter(x => x._parentRow === nd.id)];
      });
   };


   const [value, setValue] = useState(null);
   const onClickApplyModal = () => {
      if (modalTitle === 'Delete Folder') {
         confirmAction(modalTitle);
      } else if (modalTitle === 'Edit Folder Name') {
         confirmAction(modalTitle, value);
      } else if (modalTitle === 'Merge All Child Drawings') {
         confirmAction(modalTitle);
      };
   };
   return (
      <div style={{ padding: 20, width: '100%', maxHeight: window.innerHeight * 0.7 }}>
         {modalTitle === 'Delete Folder' ? (
            <div>
               <div>Are you sure to delete the folder <span style={{ fontWeight: 'bold' }}>{itemNode.title}</span>?</div>
               <div>All the <span style={{ fontWeight: 'bold' }}>{dwgsToWarn.length}</span> following drawings will be deleted accordingly</div>
            </div>
         ) : modalTitle === 'Merge All Child Drawings' ? (
            <div>Are you sure to delete all sub folders and retains all drawings</div>
         ) : (
            <Input
               style={{ width: '100%' }}
               value={value || itemNode.title}
               onChange={(e) => setValue(e.target.value)}
            />
         )}

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={() => { }}
               onClickApply={onClickApplyModal}
            />
         </div>
      </div>
   );
};



export const flattenAllTreeChildNode1 = (root) => {
   let temp = [];
   let queue = [...root];
   while (queue.length > 0) {
      let node = queue.shift();
      if (node.children) {
         let childNode = [];
         node.children.forEach(nd => {
            childNode.push({ ...nd, parentId: node.id });
         });
         queue = [...queue, ...childNode];
         let nodeObj = { ...node };
         delete nodeObj.children;
         temp.push(nodeObj);
      } else {
         let nodeObj = { ...node };
         delete nodeObj.children;
         temp.push(nodeObj);
      };
   };
   return temp;
};
export const convertFlattenArraytoTree1 = (list) => {
   let map = {}, node, roots = [], i;
   for (i = 0; i < list.length; i += 1) {
      map[list[i].id] = i;
      if (list[i]._rowLevel !== 1) {
         list[i].children = list[i].children || [];
      };
   };

   let arrayOfTreeLevel = [];
   list.forEach(tr => {
      arrayOfTreeLevel.push(tr.treeLevel);
   });
   const treeLevelOfTopTree = Math.min(...arrayOfTreeLevel);

   for (i = 0; i < list.length; i++) {
      node = list[i];
      if (node.treeLevel > treeLevelOfTopTree) {
         list[map[node.parentId]].children.push(node);
      } else {
         roots.push(node);
      };
   };
   return roots;
};
const addProjectHeaderToTree = (tree, sheetName, sheetId) => {
   return [{
      title: sheetName,
      id: sheetId,
      treeLevel: 0,
      expanded: true,
      children: convertFlattenArraytoTree1(tree.map(x => ({ ...x })))
   }];
};
const updateChildrenNode = (arr, n) => {
   arr.forEach(i => {
      i.treeLevel = i.treeLevel + n;
      if (i.children.length > 0) {
         updateChildrenNode(i.children, n);
      };
   });
};
const updateChildrenNodeTreeLevel = (arr) => {
   arr.forEach(i => {
      let childrenArr = i.children;
      if (childrenArr && childrenArr.length > 0) {
         childrenArr.forEach(ch => {
            ch.treeLevel = i.treeLevel + 1;
         });
         updateChildrenNodeTreeLevel(childrenArr);
      };
   });
};
const getListOfBranchesTree = (inputArr) => {
   const arr = inputArr.map(x => ({ ...x }));
   arr.sort((a, b) => { return b.treeLevel - a.treeLevel });

   const parentArrIds = [];
   arr.forEach(x => {
      let item = arr.find(fld => fld.id === x.parentId);
      if (item) {
         item.children = [...item.children || [], x];
      } else {
         parentArrIds.push(x.id);
      };
   });
   return arr.filter(x => parentArrIds.indexOf(x.id) !== -1);
};
export const getTreeFlattenOfNodeInArray = (treeArray, node) => {
   let obj = { ...node };
   let arrayTree = treeArray.map(x => ({ ...x })).filter(x => x.treeLevel > obj.treeLevel);
   arrayTree = [...arrayTree, obj];
   const treeOfFound = getListOfBranchesTree(arrayTree).find(x => x.id === obj.id);
   return flattenAllTreeChildNode1([treeOfFound]);
};
export const compareCurrentTreeAndTreeFromDB = (treeFromCurrentInit, treeFromCurrentInput, treeDeletedFromCurrent, treeFromDBInput, treeDeletedFromDB) => {

   let treeFromCurrent = treeFromCurrentInput.map(i => ({ ...i }));
   let treeFromDB = treeFromDBInput.map(i => ({ ...i }));

   // check if need to save tree or not
   if (treeFromCurrent.length === treeFromCurrentInit.length) {
      const stringTreeCurrent = treeFromCurrent.reduce((acc, current) => acc + `${current.id}-${current.parentId}-${current.title}-`, '');
      const stringTreeInit = treeFromCurrentInit.reduce((acc, current) => acc + `${current.id}-${current.parentId}-${current.title}-`, '');
      if (stringTreeCurrent === stringTreeInit) {
         return {
            needToSaveTree: false,
            treeDBModifiedToSave: treeFromDB,
            nodesToAddToDB: [],
            nodesToRemoveFromDB: [],
         };
      };
   };

   let treeCurrentModified = removeNodesDeletedByOtherUsersFromTreeCurrent(treeFromCurrent, treeDeletedFromDB);

   let { nodesToRemoveFromDB, treeFromDB: treeFromDBModified, nodesIdNoNeedToAddNew } = removeNodesDeletedByCurrentUserFromTreeDB(treeFromDB, treeDeletedFromCurrent, treeCurrentModified);

   let { nodesToAddToDB, treeDBModifiedToSave: treeDBModified } = haveChangedNodesInDBAndNewNodesInCurrentBackToDB(treeFromDBModified, treeCurrentModified, treeFromCurrentInit, nodesIdNoNeedToAddNew);



   // reorder item follow new order...
   let treeDBModifiedToSave = [];
   treeFromCurrentInput.forEach(item => {
      const found = treeDBModified.find(x => x.id === item.id);
      if (found) {
         treeDBModifiedToSave.push(found);
         treeDBModified = treeDBModified.filter(x => x.id !== found.id);
      };
   });
   treeDBModifiedToSave = [...treeDBModifiedToSave, ...treeDBModified].sort((a, b) => { return a.treeLevel - b.treeLevel });

   return {
      needToSaveTree: true,
      treeDBModifiedToSave,
      nodesToAddToDB,
      nodesToRemoveFromDB,
   };
};
const removeNodesDeletedByOtherUsersFromTreeCurrent = (treeCurrent, treeDeletedFromDB) => {
   let idsToCheckCurrent = [];
   treeDeletedFromDB.forEach(item => {
      const found = treeCurrent.find(x => x.id === item.id);
      if (found) {
         idsToCheckCurrent = [
            ...idsToCheckCurrent,
            ...getTreeFlattenOfNodeInArray(treeCurrent, found).map(x => x.id)
         ];
      };
   });
   idsToCheckCurrent = [...new Set(idsToCheckCurrent)];

   const nodesArray = treeCurrent.filter(x => idsToCheckCurrent.indexOf(x.id) !== -1);

   const branchTrees = getListOfBranchesTree(nodesArray);

   const newIdObj = {};
   treeDeletedFromDB.forEach(item => {
      newIdObj[item.id] = mongoObjectId();
   });

   branchTrees.forEach(tree => {
      let flattenArray = flattenAllTreeChildNode1([tree]);
      let isAbleToDelete = true;

      flattenArray.forEach(item => {
         if (!treeDeletedFromDB.find(x => x.id === item.id)) isAbleToDelete = false;
      });

      if (isAbleToDelete) {
         treeCurrent = treeCurrent.filter(x => !flattenArray.find(item => item.id === x.id));
      } else {
         const arrayToModify = treeCurrent.filter(item => flattenArray.find(x => x.id === item.id));
         treeDeletedFromDB.forEach(item => {
            const found = arrayToModify.find(x => x.id === item.id);
            if (found) {
               found.id = newIdObj[item.id];
            };
            const childrenFound = arrayToModify.filter(x => x.parentId === item.id);
            if (childrenFound.length > 0) {
               childrenFound.forEach(child => {
                  child.parentId = newIdObj[item.id];
               });
            };
         });
      };
   });
   return treeCurrent;
};
const removeNodesDeletedByCurrentUserFromTreeDB = (treeFromDB, treeDeletedFromCurrent, treeCurrent) => {
   let listIdToRemoveFromDB = [];
   treeDeletedFromCurrent.forEach(item => {
      const found = treeFromDB.find(x => x.id === item.id);
      if (found) {
         listIdToRemoveFromDB = [
            ...listIdToRemoveFromDB,
            ...getTreeFlattenOfNodeInArray(treeFromDB, found).map(x => x.id)
         ];
      };
   });

   const nodesToRemoveFromDB = treeFromDB.filter(x => {
      return listIdToRemoveFromDB.indexOf(x.id) !== -1 && !treeCurrent.find(item => item.id === x.id);
   });
   const nodesIdNoNeedToAddNew = listIdToRemoveFromDB.filter(id => treeCurrent.find(item => item.id === id))

   treeFromDB = treeFromDB.filter(x => listIdToRemoveFromDB.indexOf(x.id) === -1);

   return {
      nodesToRemoveFromDB,
      nodesIdNoNeedToAddNew,
      treeFromDB
   };
};
const haveChangedNodesInDBAndNewNodesInCurrentBackToDB = (treeFromDB, treeCurrent, treeCurrentInit, nodesIdNoNeedToAddNew) => {
   let nodesToAddToDB = [];
   treeCurrent.forEach(item => {
      if (!treeFromDB.find(x => x.id === item.id)) {
         nodesToAddToDB.push(item);
      };
   });

   let dwgTypeExistedInDBButLevelOrParentChangesArr = [];
   let childrenIdsToWithdrawFromDB = [];
   treeFromDB.forEach(item => {
      const found = treeCurrent.find(r => r.id === item.id);
      const foundInit = treeCurrentInit.find(r => r.id === item.id);
      if (found && foundInit) {
         if (found.title !== foundInit.title) item.title = found.title;

         if (found.parentId !== item.parentId && found.parentId !== foundInit.parentId) {
            dwgTypeExistedInDBButLevelOrParentChangesArr.push({ ...found, title: item.title });

            const arrIdsChildrenInDB = getTreeFlattenOfNodeInArray(treeFromDB, item).filter((x, i) => i !== 0).map(x => x.id);

            childrenIdsToWithdrawFromDB = [...childrenIdsToWithdrawFromDB, ...arrIdsChildrenInDB];
         };
      };
   });
   childrenIdsToWithdrawFromDB = [...new Set(childrenIdsToWithdrawFromDB)];

   const dwgTypeToWithdrawFromDB = treeFromDB.filter(x => childrenIdsToWithdrawFromDB.indexOf(x.id) !== -1);

   treeFromDB = treeFromDB.filter(item => {
      return childrenIdsToWithdrawFromDB.indexOf(item.id) === -1 && !dwgTypeExistedInDBButLevelOrParentChangesArr.find(x => x.id === item.id)
   });


   const listBranchesTreeToPushToDB = getListOfBranchesTree([
      ...nodesToAddToDB,
      ...dwgTypeExistedInDBButLevelOrParentChangesArr,
      ...dwgTypeToWithdrawFromDB
   ]);

   listBranchesTreeToPushToDB.forEach(itemTree => {
      treeFromDB = [...treeFromDB, ...flattenAllTreeChildNode1([itemTree])];
   });

   const treeDBModifiedToSave = convertFlattenArraytoTree1(treeFromDB);
   updateChildrenNodeTreeLevel(treeDBModifiedToSave);

   return {
      nodesToAddToDB: nodesToAddToDB.filter(item => nodesIdNoNeedToAddNew.indexOf(item.id) === -1),
      treeDBModifiedToSave: flattenAllTreeChildNode1(treeDBModifiedToSave)
   };
};







