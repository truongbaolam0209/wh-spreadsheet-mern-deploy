import * as FileSaver from 'file-saver';
import React, { useContext } from 'react';
import * as XLSX from 'xlsx';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import IconTable from '../generalComponents/IconTable';
import { convertFlattenArraytoTree1, getTreeFlattenOfNodeInArray } from './FormDrawingTypeOrder';




const ExcelExport = ({ fileName }) => {

   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);


   const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

   const fileExtension = '.xlsx';

   const exportToCSV = (csvData, fileName) => {
      const ws = XLSX.utils.json_to_sheet(csvData);
      const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: fileType });

      FileSaver.saveAs(data, fileName + fileExtension);
   };


   return (
      <IconTable type='export' onClick={() => exportToCSV(prepareDataToExport(stateProject, stateRow), fileName)} />
   );
};

export default ExcelExport;

const prepareDataToExport = (stateProject, stateRow) => {
   const { allDataOneSheet: { publicSettings: { headers } } } = stateProject;
   const { drawingTypeTree, viewTemplateNodeId, rowsAll } = stateRow;
   const nodeParent = drawingTypeTree.find(x => x.id === viewTemplateNodeId);
   let tree;

   if (nodeParent) {
      tree = getTreeFlattenOfNodeInArray(drawingTypeTree.map(x => ({ ...x })), nodeParent);
      if (tree.length > 1) {
         tree = getTreeFlattenOfNodeInArray(drawingTypeTree.map(x => ({ ...x })), nodeParent).filter(x => x.id !== nodeParent.id);
      };
   } else {
      tree = drawingTypeTree.map(x => ({ ...x }));
   };

   const treeArr = convertFlattenArraytoTree1(tree);
   let finalArr = [];

   const getAllChildren = (arr) => {
      arr.forEach(node => {
         let newObj = {};
         newObj['Drawing Number'] = node['Drawing Number'];
         finalArr.push(newObj);
         if (node.children && node.children.length > 0) {
            getAllChildren(node.children);
         } else if (node.children && node.children.length === 0) {
            const rowsChildren = rowsAll.filter(x => x._parentRow === node.id);
            const outputRows = rowsChildren.map(r => {
               let obj = {};
               headers.forEach(hd => {
                  obj[hd.text] = r[hd.text] || '';
               });
               return obj;
            });
            finalArr = [...finalArr, ...outputRows];
         };
      });
   };
   getAllChildren(treeArr);
   return finalArr;
};