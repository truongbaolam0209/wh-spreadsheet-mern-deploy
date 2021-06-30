import { Select } from 'antd';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';



const ViewTemplateSelect = ({ updateExpandedRowIdsArray }) => {



   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject, setUserData } = useContext(ProjectContext);

   let listArrayStringFolder, drawingTypeTree, viewTemplates;

   if (stateRow) {
      drawingTypeTree = stateRow.drawingTypeTree;
      viewTemplates = stateRow.viewTemplates;
      listArrayStringFolder = getListOfStringFolder(drawingTypeTree, viewTemplates);
   };

   
   const selectViewTemplate = (value) => {
      const { allDataOneSheet: { publicSettings: { headers } } } = stateProject;
      const nodeId = listArrayStringFolder.find(x => x.text === value).treeNodeId;
      const templateSaved = viewTemplates.find(x => x.id === nodeId);

      let dataObj = {};

      if (templateSaved) {
         setUserData({
            ...stateProject.userData,
            headersShown: templateSaved.headersShown.map(hd => headers.find(x => x.key === hd).text),
            headersHidden: templateSaved.headersHidden.map(hd => headers.find(x => x.key === hd).text),
            nosColumnFixed: templateSaved.nosColumnFixed,
            colorization: templateSaved.colorization,
         });
         dataObj.viewTemplateNodeId = templateSaved.viewTemplateNodeId;
         dataObj.modeFilter = templateSaved.modeFilter;
         dataObj.modeSort = templateSaved.modeSort;
      } else {
         dataObj.viewTemplateNodeId = nodeId;
      };
      getSheetRows({
         ...stateRow,
         ...dataObj,
      });
      updateExpandedRowIdsArray(dataObj.viewTemplateNodeId);
   };


   return (

      <div style={{ padding: 0 }}>

         {listArrayStringFolder && (
            <SelectStyled
               defaultValue='Select View Template'
               style={{ width: 200, padding: 3, height: 25 }}
               onChange={(value) => selectViewTemplate(value)}
               disabled={stateRow.modeGroup.length > 0}

               // dropdownMenuStyle={{
               //    width: 500,
               // }}
               
               // dropdownStyle={{
               //    overflowX: 'visible',
               // }}
            >
               {listArrayStringFolder.map(node => {
                  return (
                     <Select.Option key={node.treeNodeId} value={node.text}>{node.text}</Select.Option>
               )})}
            </SelectStyled>
         )}

      </div>
   );
};

export default ViewTemplateSelect;


const SelectStyled = styled(Select)`
   .ant-select-selection {
      border-radius: 5;
      border: 1px solid black;
      height: 25px;
      background: transparent;
   };

   .ant-select-selection-selected-value {
      transform: translateY(-3.5px);
   };
   .ant-select-dropdown {
      width: 500px;
   }
`;

const getListOfStringFolder = (tree, viewTemplates) => {
   
   const wohhup = tree.find(x => x.treeLevel === 1 && x.title === 'Woh Hup Private Ltd');
   if (!wohhup) return [];

   const wohhupId = wohhup.id;

   const treeLevel2AndAbove = tree.filter(x => x.treeLevel === 1 || (x.treeLevel === 2 && x.parentId === wohhupId));
   let arr = [{
      text: 'Show All',
      treeNodeId: null,
   }];
   viewTemplates.forEach(tmp => {
      arr.push({
         text: tmp.name,
         treeNodeId: tmp.id
      });
   });
   arr = [...arr, ...treeLevel2AndAbove.map(treeNode => getStringFolder(treeLevel2AndAbove, treeNode))];
   return arr;
};

export const getStringFolder = (drawingTypeTree, treeNode) => {
   const dwgTypeTree = drawingTypeTree.map(x => ({ ...x }));
   const node = { ...treeNode };
   let text = node.title;
   const findParent = (tree, node) => {
      const parent = tree.find(x => x.id === node.parentId);
      if (parent) {
         text = parent.title + ' / ' + text;
         findParent(tree, parent);
      };
   };
   findParent(dwgTypeTree, node);
   return {
      text,
      treeNodeId: treeNode.id
   };
};


