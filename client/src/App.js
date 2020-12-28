import 'antd/dist/antd.css';
import React from 'react';
import { Provider as CellProvider } from './contexts/cellContext';
import { Provider as ProjectProvider } from './contexts/projectContext';
import { Provider as RowProvider } from './contexts/rowContext';
import PageSpreadsheet from './layouts/PageSpreadsheet';



const App = () => {


   return (

      <ProjectProvider>
         <RowProvider>
            <CellProvider>
               <PageSpreadsheet
                  userData={{
                     email: 'tblggmail.com',
                     role: 'modeller',
                     username: 'Truongt Bao Lam',
                     isAdmin: true
                  }}
                  projectData={{
                     projectId: 'TGPwMzc6GGG5NDY1MS10ZXN4GG',
                     projectName: 'HANDY'
                  }}
               />
            </CellProvider>
         </RowProvider>
      </ProjectProvider>

   );
};


export default App;