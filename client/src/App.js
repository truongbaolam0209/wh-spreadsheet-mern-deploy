import 'antd/dist/antd.css';
import React, { useEffect } from 'react';
import { Provider as CellProvider } from './contexts/cellContext';
import { Provider as ProjectProvider } from './contexts/projectContext';
import { Provider as RowProvider } from './contexts/rowContext';
import { Provider as UserProvider } from './contexts/userContext';
import PageSpreadsheet from './layouts/PageSpreadsheet';
// import TableRowSelection from './layouts/TableRowSelection';



const App = () => {


   useEffect(() => {
      document.addEventListener('contextmenu', event => event.preventDefault());
      return () => document.addEventListener('contextmenu', event => event.preventDefault());
   }, []);


   return (
      <UserProvider>
         <ProjectProvider>
            <RowProvider>
               <CellProvider>


                  <PageSpreadsheet
                     email='baoquylan@gmail.com'
                     projectIdForge='MTYwMzc3MDA5NDY1MS10ZXN0NA'
                     role='modeller'
                  />
                  {/* <TableRowSelection /> */}


               </CellProvider>
            </RowProvider>
         </ProjectProvider>
      </UserProvider>
   );
};


export default App;