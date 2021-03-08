import { Icon, message, Tooltip } from 'antd';
import Axios from 'axios';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';


const ButtonAdminUploadData = () => {

   const { state: stateProject } = useContext(ProjectContext);
   const token = stateProject.allDataOneSheet && stateProject.allDataOneSheet.token;

   const [file, setFile] = useState('');

   const handleChange = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = e => {
         setFile(JSON.parse(e.target.result));
         // setFile(getDataSumangAndHandy(JSON.parse(e.target.result)));
      };
   };


   const uploadCurrentDataToServer = async () => {
      try {
         await Axios.post(`${SERVER_URL}/row/history/save-all-data-row-history`, { token, dataToSave: file.rowHistories });
         await Axios.post(`${SERVER_URL}/cell/history/save-all-data-cell-history`, { token, dataToSave: file.cellHistories });
         await Axios.post(`${SERVER_URL}/sheet/save-all-data-settings`, { token, dataToSave: file.settings });
         await Axios.post(`${SERVER_URL}/sheet/save-all-data-rows`, { token, dataToSave: file.rows });
         message.info('DONE...');
      } catch (err) {
         console.log(err);
      };
   };


   return (
      <>
         <Tooltip title='Upload Data All'>
            {file ? (
               <Icon type='upload' onClick={uploadCurrentDataToServer} style={{ marginRight: 10 }} />
            ) : (
               <label style={{
                  border: '1px solid black',
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  padding: 3,
                  margin: 3,
                  cursor: 'pointer'
               }}>
                  <input
                     style={{ height: 25, fontSize: 8, marginRight: 6, display: 'none' }}
                     type='file'
                     onChange={handleChange}
                  />
                  <div style={{ transform: 'translateX(-2px) translateY(-5px)' }}>(1)</div>
               </label>
            )}
         </Tooltip>

      </>
   );
};

export default ButtonAdminUploadData;


