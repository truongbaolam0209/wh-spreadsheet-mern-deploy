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

                  email='tblgb4g@gmail.com'
                  username='Truongt Bao Lam'
                  isAdmin={true}
                  projectId='GGPwMzc6GGG5NDY1MS10ZXN4GF'
                  projectName='HANDYT'
                  role='manager'
                  // modeller coordinator manager viewer production

               />
            </CellProvider>
         </RowProvider>
      </ProjectProvider>

   );
};


export default App;