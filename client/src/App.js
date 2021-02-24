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

         <Switch>

            <Route path='/sheet'>
               <ProjectProvider>
                  <RowProvider>
                     <CellProvider>
                        <PageSpreadsheet

                           email='admin@wohhup.com'

                           // projectId='MTYxMDMzOTYwMjQyNS1TdW1hbmc'
                           // projectName='Sumang'
                           
                           projectId='MTU5MTY3NDI0ODUyMy1IYW5keQ'
                           projectName='Handy'
                           
                           token='xxx-xxxxx-xxx-x-xxxxx'
                           isAdmin={true}

                           role='Document Controller'
                           companies={[
                              'Woh Hup Private Ltd',
                              'Jianho',
                              'Ultracon'
                           ]}
                           company='Woh Hup Private Ltd'

                        />
                     </CellProvider>
                  </RowProvider>
               </ProjectProvider>
            </Route>


            <Route path='/dashboard'>
               <PageDashboard
                  projectsArray={[
                     { name: 'Sumang', id: 'MTYxMDMzOTYwMjQyNS1TdW1hbmc' },
                     { name: 'Handy', id: 'MTU5MTY3NDI0ODUyMy1IYW5keQ' },
                     { name: 'Handytgtg', id: 'KFFFFFFFDY1MS10FHANDY' },
                     { name: 'rrrrrrrrtgtg', id: 'KFFfvfvfvHANDY' },
                  ]}
                  token='XXXTTTYYYIIIKKKLLLFFF'
               />
            </Route>

         </Switch>

      </BrowserRouter>
   );
};


export default App;