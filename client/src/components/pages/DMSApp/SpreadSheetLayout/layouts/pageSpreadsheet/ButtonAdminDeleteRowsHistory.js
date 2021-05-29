import { Icon, message, Tooltip } from 'antd';
import Axios from 'axios';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';


const ButtonAdminDeleteRowsHistory = () => {

   const { state: stateProject } = useContext(ProjectContext);
   const token = stateProject.allDataOneSheet && stateProject.allDataOneSheet.token;
   const email = stateProject.allDataOneSheet && stateProject.allDataOneSheet.email;
   const projectId = stateProject.allDataOneSheet && stateProject.allDataOneSheet.projectId;

   const [file, setFile] = useState('');

   const handleChange = e => {
      const fileReader = new FileReader();
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = e => {
         setFile(JSON.parse(e.target.result));
      };
   };


   const deleteRowsHistory = async () => {
      try {
         await Axios.post(`${SERVER_URL}/row/history/delete-rows-history/`, { token, projectId, email, rowsHistoryIdsArray: file });
         message.info('DONE...');
      } catch (err) {
         console.log(err);
      };
   };


   return (
      <Tooltip title='Delete Rows History'>
         {file ? (
            <Icon type='pie-chart' onClick={deleteRowsHistory} style={{ marginRight: 10 }} />
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
               <input style={{ height: 25, fontSize: 8, marginRight: 6, display: 'none' }} type='file' onChange={handleChange} />
               <div style={{ transform: 'translateX(-2px) translateY(-5px)' }}>(4)</div>
            </label>
         )}
      </Tooltip>
   );
};

export default ButtonAdminDeleteRowsHistory;


