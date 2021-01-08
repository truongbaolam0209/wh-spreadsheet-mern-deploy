import 'antd/dist/antd.css';
import React from 'react';
import { Provider as CellProvider } from './contexts/cellContext';
import { Provider as ProjectProvider } from './contexts/projectContext';
import { Provider as RowProvider } from './contexts/rowContext';
// import TestTree from './TestTree';
import PageSpreadsheet from './layouts/PageSpreadsheet';


const App = () => {


   


   return (

      <ProjectProvider>
         <RowProvider>
            <CellProvider>
               <PageSpreadsheet
                  email='l66nfdSM@wohhup.com'
                  projectId='FYGwMzc6RGG5NDY1MS10SUMANG'
                  // projectId='FYGwMzc6RGG5NDY1MS104HANDY'
                  projectName='HANDDD'
                  role='coordinator'
                  isAdmin={true}
                  // modeller, coordinator, manager, viewer, production, document controller 
               />

               
 
            </CellProvider>
         </RowProvider>
      </ProjectProvider>

   );
};


export default App;