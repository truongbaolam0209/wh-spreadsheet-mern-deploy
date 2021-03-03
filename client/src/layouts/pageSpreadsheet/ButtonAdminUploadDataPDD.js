import { Icon, message, Tooltip } from 'antd';
import Axios from 'axios';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';


const ButtonAdminUploadDataPDD = () => {

   const { state: stateProject } = useContext(ProjectContext);
   const token = stateProject.allDataOneSheet && stateProject.allDataOneSheet.token;
   const email = stateProject.allDataOneSheet && stateProject.allDataOneSheet.email;


   const [file, setFile] = useState('');

   const handleChange = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = e => {
         // console.log(JSON.parse(e.target.result));
         setFile(JSON.parse(e.target.result));
         // setFile(getDataSumangAndHandy(JSON.parse(e.target.result)));
      };
   };


   const uploadCurrentDataToServer = async () => {
      try {
         await Axios.post(`${SERVER_URL}/sheet/update-rows/`, { token, projectId: file.projectId, rows: file.rowsUpdate });
         await Axios.post(`${SERVER_URL}/row/history/`, { token, projectId: file.projectId, email, rowsHistory: file.rowsHistory });
         await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, { token, projectId: file.projectId, email, publicSettings: file.publicSettings });
         
         message.info('DONE...Save DATA PDD');
      } catch (err) {
         console.log(err);
      };
   };


   return (
      <>
         {file ? (
            <Tooltip title='Upload DATA PDD'>
               <Icon type='fund' onClick={uploadCurrentDataToServer} style={{ marginRight: 10 }} />
            </Tooltip>
         ) : (
               <input style={{ height: 25, fontSize: 8, marginRight: 3 }} type='file' onChange={handleChange} />
            )}
      </>
   );
};

export default ButtonAdminUploadDataPDD;


