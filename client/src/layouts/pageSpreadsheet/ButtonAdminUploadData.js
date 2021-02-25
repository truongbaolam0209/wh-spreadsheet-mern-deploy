import { message } from 'antd';
import Axios from 'axios';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { mongoObjectId } from '../../utils';
import IconTable from './IconTable';


const ButtonAdminUploadData = () => {

   const { state: stateProject } = useContext(ProjectContext);
   const token = stateProject.allDataOneSheet && stateProject.allDataOneSheet.token;

   const [file, setFile] = useState('');

   const handleChange = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = e => {
         setFile(getDataSumangAndHandy(JSON.parse(e.target.result)));
      };
   };


   const uploadCurrentDataToServer = async () => {
      try {
         await Axios.post(`${SERVER_URL}/row/history/save-all-data-row-history`, { token, dataToSave: file.rowHistories });
         await Axios.post(`${SERVER_URL}/cell/history/save-all-data-cell-history`, { token, dataToSave: file.cellHistories });
         await Axios.post(`${SERVER_URL}/sheet/save-all-data-settings`, { token, dataToSave: file.settings });
         await Axios.post(`${SERVER_URL}/sheet/save-all-data-rows`, { token, dataToSave: file.rows });
         message.info('DONE...Save DATA ROW HISTORY');
      } catch (err) {
         console.log(err);
      };
   };


   return (
      <>
         {file ? (
            <IconTable type='upload' onClick={uploadCurrentDataToServer} />
         ) : (
               <input style={{ padding: 3, height: 25 }} type='file' onChange={handleChange} />
            )}


      </>
   );
};

export default ButtonAdminUploadData;



const getDataSumangAndHandy = ({ rows: rowsRaw, settings: settingsRaw, cellHistories, rowHistories }) => {

   let settings = [];
   settingsRaw.forEach(st => {
      let { sheet, headers, projectName, drawingTypeTree, user } = st;
      if (sheet === 'MTYxMDMzOTYwMjQyNS1TdW1hbmc' && headers) { // SUMANG
         const dwgNumberId = headers.find(x => x.text === 'Drawing Number').key;
         const wohhupId = mongoObjectId();
         const archiId = mongoObjectId();
         const wsoId = mongoObjectId();

         const wso = drawingTypeTree.filter(x => x[dwgNumberId].includes('WSO (WALL SETTING-OUT PLANS)'));
         drawingTypeTree = drawingTypeTree.filter(x => !x[dwgNumberId].includes('WSO (WALL SETTING-OUT PLANS)'));


         const treeToSave = [
            {
               id: wohhupId,
               parentId: projectName,
               treeLevel: 1,
               expanded: true,
               [dwgNumberId]: 'Woh Hup Private Ltd'
            },
            ...['ARCHI', 'C&S', 'M&E', 'PRECAST'].map(trade => {
               return {
                  id: trade === 'ARCHI' ? archiId : mongoObjectId(),
                  parentId: wohhupId,
                  treeLevel: 2,
                  expanded: true,
                  [dwgNumberId]: trade
               }
            }),
            ...drawingTypeTree.map(node => {
               let obj = {};
               obj.id = node.id;
               obj[dwgNumberId] = node[dwgNumberId];
               return {
                  ...obj,
                  parentId: archiId,
                  treeLevel: 3,
                  expanded: true,
               };
            }),
            {
               id: wsoId,
               parentId: archiId,
               treeLevel: 3,
               expanded: true,
               [dwgNumberId]: 'WSO (WALL SETTING-OUT PLANS)'
            },
            ...wso.map(node => {
               let obj = {};
               obj.id = node.id;
               obj[dwgNumberId] = node[dwgNumberId];
               return {
                  ...obj,
                  parentId: wsoId,
                  treeLevel: 4,
                  expanded: true,
                  [dwgNumberId]: node[dwgNumberId].slice(31, node[dwgNumberId].length)
               };
            })
         ];
         settings.push({
            ...st,
            drawingTypeTree: treeToSave
         })

      } else if (sheet === 'MTU5MTY3NDI0ODUyMy1IYW5keQ' && headers) { // HANDY

         const dwgNumberId = headers.find(x => x.text === 'Drawing Number').key;
         const wohhupId = mongoObjectId();
         const archiId = mongoObjectId();

         const treeToSave = [
            {
               id: wohhupId,
               parentId: projectName,
               treeLevel: 1,
               expanded: true,
               [dwgNumberId]: 'Woh Hup Private Ltd'
            },
            ...['ARCHI', 'C&S', 'M&E', 'PRECAST'].map(trade => {
               return {
                  id: trade === 'ARCHI' ? archiId : mongoObjectId(),
                  parentId: wohhupId,
                  treeLevel: 2,
                  expanded: true,
                  [dwgNumberId]: trade
               }
            }),
            ...drawingTypeTree.map(node => {
               let obj = {};
               obj.id = node.id;
               obj[dwgNumberId] = node[dwgNumberId];
               return {
                  ...obj,
                  parentId: archiId,
                  treeLevel: 3,
                  expanded: true,
               };
            }),
         ];
         settings.push({
            ...st,
            drawingTypeTree: treeToSave
         })
      } else if (user) {
         settings.push(st);
      };
   });

   const rowsSumang = rowsRaw.filter(x => x.sheet === 'MTYxMDMzOTYwMjQyNS1TdW1hbmc');
   const rowsHandy = rowsRaw.filter(x => x.sheet === 'MTU5MTY3NDI0ODUyMy1IYW5keQ');
   const rows = [...rowsSumang, ...rowsHandy];

   return {
      rows, settings, cellHistories, rowHistories
   };
};
