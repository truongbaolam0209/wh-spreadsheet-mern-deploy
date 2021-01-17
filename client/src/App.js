import 'antd/dist/antd.css';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider as CellProvider } from './contexts/cellContext';
import { Provider as ProjectProvider } from './contexts/projectContext';
import { Provider as RowProvider } from './contexts/rowContext';
import PageSpreadsheet from './layouts/PageSpreadsheet';
import PageDashboard from './_dashboardComp/PageDashboard';


const App = () => {


   return (
      <BrowserRouter>
         <ProjectProvider>
            <RowProvider>
               <CellProvider>

                  <Switch>

                     <Route path='/sheet'>
                     
                        <PageSpreadsheet
                           email='truongbaolam3333@wohhup.com'
                           projectId='KKGwMzc6RGG5NDY1MS10FSUMANGGGG'
                           // projectId='KKGwMzc6RGG5NDY1MS10FHANDYFFF'
                           projectName='SM'
                           role='coordinator'
                           token='XXXTTTYYYIIIKKKLLLFFF'
                           isAdmin={true}
                           // modeller, coordinator, manager, viewer, production, document controller 
                        />
                     </Route>

                     <Route path='/dashboard'>
                        <PageDashboard
                           projectsArray={[
                              { name: 'Sumang', id: 'KKGwMzc6RGG5NDY1MS10FSUMANGGGG' },
                              { name: 'Handy', id: 'KKGwMzc6RGG5NDY1MS10FHANDYFFF' },
                              { name: 'Handytgtg', id: 'KFFFFFFFDY1MS10FHANDY' },
                              { name: 'rrrrrrrrtgtg', id: 'KFFfvfvfvHANDY' },
                           ]}
                           token='XXXTTTYYYIIIKKKLLLFFF'
                        />
                     </Route>

                  </Switch>

               </CellProvider>
            </RowProvider>
         </ProjectProvider>
      </BrowserRouter>
   );
};


export default App;