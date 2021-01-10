import 'antd/dist/antd.css';
import React from 'react';
import { Provider as CellProvider } from './contexts/cellContext';
import { Provider as ProjectProvider } from './contexts/projectContext';
import { Provider as RowProvider } from './contexts/rowContext';
import PageSpreadsheet from './layouts/PageSpreadsheet';
// import PageDashboard from './_dashboardComp/PageDashboard';


const App = () => {


   return (

      <ProjectProvider>
         <RowProvider>
            <CellProvider>
               <PageSpreadsheet
                  email='truongbaolam@wohhup.com'
                  // projectId='FYGwMzc6RGG5NDY1MS10SUMANG'
                  projectId='KKGwMzc6RGG5NDY1MS10FHANDY'
                  projectName='HANDDD'
                  role='coordinator'
                  isAdmin={true}
                  // modeller, coordinator, manager, viewer, production, document controller 
               />
               {/* <PageDashboard 
                  projectsArray={[
                     { name: 'Sumang', id: 'FYGwMzc6RGG5NDY1MS10SUMANG'},
                     { name: 'Handy', id: 'KKGwMzc6RGG5NDY1MS10FHANDY'},
                     { name: 'Handytgtg', id: 'KFFFFFFFDY1MS10FHANDY'},
                     { name: 'rrrrrrrrtgtg', id: 'KFFfvfvfvHANDY'},
                  ]}
               /> */}

            
            </CellProvider>
         </RowProvider>
      </ProjectProvider>

   );
};


export default App;