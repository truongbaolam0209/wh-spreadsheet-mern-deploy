import { Icon } from 'antd';
import React, { useState } from 'react';
// import { SortableTreeWithoutDndContext as SortableTree } from 'react-sortable-tree';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import styled from 'styled-components';
import { colorType } from './constants';



let drawingTypeData = [
   // { key: 'ed8fafcb-4ee4-4139-ad86-153b3a5187e4', 'title': 'ARCHI', _rowLevel: -3, expanded: true },
   { key: '69b3ecf3-40a2-4c4a-a1a5-3c11ff45aa4d', 'title': 'KCDE', _rowLevel: -2, expanded: true },
   { key: '1e8970be-24e4-45fb-a428-37aa6b14dbc6', 'title': 'ARCHI', _rowLevel: -1, expanded: true },
   { key: 'eb768ffe-223f-4685-8c59-8336027c30b1', 'title': 'ARCHI-1', _rowLevel: 0, expanded: true },
   { key: '1cbe678d-12cd-40f0-aaaa-de51129eaec6', 'title': 'ARCHI-2', _rowLevel: 0, expanded: true },
   { key: '24d9b405-cb86-40fb-b423-cedb4a3144a5', 'title': 'ARCHI-3', _rowLevel: 0, expanded: true },
   { key: '7adc4807-8381-4ebe-934f-29bc772f2b67', 'title': 'STRUCTURE', _rowLevel: -1, expanded: true },
   { key: '7adc4807-8381-4ebe-934f-29bc772f2b88', 'title': 'STRUCTURE-1', _rowLevel: 0, expanded: true },

   // { key: 'cf1893fe-5a0a-4552-a975-f394bf2ec617', 'title': 'ARCHI-REVISED', _rowLevel: -2, expanded: true },
   // { key: 'a051062e-f300-458a-9811-495bba0b91e8', 'title': 'ARCHI-REVISED-1', _rowLevel: -1, expanded: true },
   // { key: 'd1acd6e8-3896-4e0b-9f76-c0b16853f190', 'title': 'ARCHI-REVISED-1-A', _rowLevel: 0, expanded: true },

   // { key: '609e2d8f-8a09-40e5-96db-2401eb6094d0', 'title': 'STRUCTURE', _rowLevel: -3, expanded: true },
   // { key: '979fe55a-6e1c-4e75-8fb0-4a82f4bd0b10', 'title': 'STRUCTURE-EXISTING', _rowLevel: -2, expanded: true },
   // { key: '6c555429-a1b6-44f4-b0f7-aa0a4331dde9', 'title': 'STRUCTURE-EXISTING-1', _rowLevel: -1, expanded: true },
   // { key: '8f023830-8554-4cd6-8ce1-061d47173a79', 'title': 'STRUCTURE-EXISTING-1-A', _rowLevel: 0, expanded: true },
   // { key: '4b2e86be-9055-4f77-8ed5-02f4210f8a2e', 'title': 'STRUCTURE-REVISED', _rowLevel: -2, expanded: true },
   // { key: '9da0b1f7-a4f9-421b-a61b-54de8a980442', 'title': 'STRUCTURE-REVISED-1', _rowLevel: -1, expanded: true },
   // { key: '0dada5ae-8978-47ad-a563-0e4b6eaf7e8c', 'title': 'STRUCTURE-REVISED-1-A', _rowLevel: 0, expanded: true },
   // { key: '8a36d798-0aa5-4417-be21-58e0c9b05593', 'title': 'STRUCTURE-REVISED-1-B', _rowLevel: 0, expanded: true },

   // { key: '9ca31c66-66bc-4a83-b118-f2d2bdaa964e', 'title': 'M&E', _rowLevel: -3, expanded: true },
   // { key: '255e8112-4af3-4520-a688-af6b95c3db64', 'title': 'M&E-EXISTING', _rowLevel: -2, expanded: true },
];

const arrangeDrawingType = (xxx) => {

   let data = xxx.map(e => ({ ...e }));

   let levelArray = [...new Set(data.map(r => r._rowLevel))].sort((a, b) => b - a);
   levelArray.forEach(lvl => {
      data.forEach((row, index) => {
         if (row._rowLevel === lvl) {
            let arr = data.filter((r, i) => r._rowLevel === lvl - 1 && i < index);
            let parentRow = arr[arr.length - 1];
            if (parentRow) parentRow.children = [...parentRow.children || [], row];
         };
      });
   });
   return data.filter(r => r._rowLevel === levelArray[levelArray.length - 1]);
};




const TestTree = () => {

   const [input, setInput] = useState([
      { id: 'ed8fafcb-4ee4-4139-ad86-153b3a5187e4', 'title': 'KCDE', _rowLevel: -3, expanded: true },
      { id: '69b3ecf3-40a2-4c4a-a1a5-3c11ff45aa4d', 'title': 'EEEE', _rowLevel: -2, expanded: true },
      { id: '1e8970be-24e4-45fb-a428-37aa6b14dbc6', 'title': 'ARCHI', _rowLevel: -1, expanded: true },
      { id: 'eb768ffe-223f-4685-8c59-8336027c30b1', 'title': 'COLUMN AND WALL SETTING OUT', _rowLevel: 0, expanded: true },
      { id: '1cbe678d-12cd-40f0-aaaa-de51129eaec6', 'title': 'UNIT TYPE LAYOUT TSO', _rowLevel: 0, expanded: true },
      { id: '24d9b405-cb86-40fb-b423-cedb4a3144a5', 'title': 'STAIRCASES & LIFT LOBBIES', _rowLevel: 0, expanded: true },
      { id: '24d9b405-cb86-40fb-b423-cedb4a3144a5', 'title': 'ANCILLARY STRUCTURES', _rowLevel: 0, expanded: true },
      { id: '24d9b405-cb86-40fb-b423-cedb4a3144a5', 'title': 'RCP', _rowLevel: 0, expanded: true },
      { id: '7adc4807-8381-4ebe-934f-29bc772f2b67', 'title': 'STRUCTURE', _rowLevel: -1, expanded: true },
      { id: '7adc4807-8381-4ebe-934f-29bc772f2b88', 'title': 'STRUCTURE-1', _rowLevel: 0, expanded: true },
      { id: '69b3ecf3-40a2-4c4a-a1a5-3c11ff45bb4d', 'title': 'GGGG', _rowLevel: -2, expanded: true },
      { id: '1e8970be-24e4-45fb-a428-37aa6b14dbt6', 'title': 'M&E', _rowLevel: -1, expanded: true },
      { id: 'eb768ffe-223f-4688-8c59-8336027c30b1', 'title': 'M&E-1', _rowLevel: 0, expanded: true },
   ]);
   const [data, setData] = useState(arrangeDrawingType(input));


   const addFolderBelow = (node) => {
      let nodeIndex;
      input.forEach((nd, i) => {
         if (nd.id === node.id) nodeIndex = i;
      });

      let newNodeIndex;
      for (let i = 0; i < input.length; i++) {
         if (input[i]._rowLevel === node._rowLevel && i > nodeIndex) {
            newNodeIndex = i;
            return;
         };
      };

      // input.splice(newNodeIndex, 0, { 
      //    id: mongoObjectId(), 
      //    'title': 'NEW DRAWING TYPE', 
      //    _rowLevel: node._rowLevel, 
      //    expanded: true 
      // });
      // console.log(input);
   };

   const deleteFolder = (node) => {

   };

   const fileAdd = (node) => {

   };

   return (
      <div style={{ height: 400 }}>
         <SortableTree
            treeData={data}
            onChange={treeData => setData(treeData)}
            canDrop={(props) => {
               const { nextParent, node } = props;
               return nextParent && nextParent._rowLevel === node._rowLevel - 1;
            }}

            isVirtualized={false}

            generateNodeProps={(props) => {
  
               const { node, parentNode } = props;
               return ({
                  buttons: parentNode === null ? [
                     <IconBtn type='file-add' onClick={() => fileAdd(node)} />,
                     <IconBtn type='plus' onClick={() => addFolderBelow(node)} />,
                     <IconBtn type='delete' onClick={() => deleteFolder(node)} />
                  ] : node._rowLevel !== 0 ? [
                     <IconBtn type='plus' onClick={() => addFolderBelow(node)} />,
                     <IconBtn type='delete' onClick={() => deleteFolder(node)} />
                  ] : [
                           <IconBtn type='delete' onClick={() => deleteFolder(node)} />
                        ]
               })
            }}
         />
      </div>
   );
};
export default TestTree;


const IconBtn = ({ type, onClick }) => {
   return (
      <IconStyle
         type={type}
         onClick={onClick}
      />
   );
};


const IconStyle = styled(Icon)`
   margin: 3px;
   padding: 5px;
   border-radius: 3px;
   border: 1px solid ${colorType.grey0};
   &:hover {
      background-color: ${colorType.grey0};
   }
    
`;