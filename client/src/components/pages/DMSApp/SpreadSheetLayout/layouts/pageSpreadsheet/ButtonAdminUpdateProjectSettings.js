import { Icon, message, Tooltip } from 'antd';
import Axios from 'axios';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';


const ButtonAdminUpdateProjectSettings = () => {

   const { state: stateProject } = useContext(ProjectContext);
   const token = stateProject.allDataOneSheet && stateProject.allDataOneSheet.token;
   const projectId = stateProject.allDataOneSheet && stateProject.allDataOneSheet.projectId;
   const email = stateProject.allDataOneSheet && stateProject.allDataOneSheet.email;
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
         await Promise.all(file.map(async setting => {
            await Axios.post(`${SERVER_URL}/sheet/update-setting-public/`, {
               token,
               email,
               projectId: setting.sheetId,
               publicSettings: { drawingTypeTree: setting.drawingTypeTree }
            });
         }));
         message.info('DONE...');
      } catch (err) {
         console.log(err);
      };
   };


   return (
      <Tooltip title='Update Project Settings'>
         {file ? (
            <Icon type='align-center' onClick={uploadCurrentDataToServer} style={{ marginRight: 10 }} />
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
               <div style={{ transform: 'translateX(-2px) translateY(-5px)' }}>(6)</div>
            </label>
         )}
      </Tooltip>
   );
};

export default ButtonAdminUpdateProjectSettings;


