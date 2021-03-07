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

                           // email='asssdmin@wohhup.com'
                           // email='test1@wh5dapp.com'
                           // email='michael_llave@wohhup.com'

                           // projectId='MTYxMDMzOTYwMjQyNS1TdW1hbmc'
                           // projectName='Sumang'

                           // projectId='MTU5MTY3NDI0ODUyMy1IYW5keQ'
                           // projectName='Handy'


                           // projectId='MTYxMjkzMTUwNjM3Ny1UaGUgUmVlZg'
                           // projectName='PDD'


                           // token='xxx-xxxxx-xxx-x-xxxxx'
                           // isAdmin={true}


                           // role='Sub-Con'
                           // role='WH Archi Manager'

                           // role='WH Archi Modeller'
                           // role='Consultant'
                           // role='WH Archi Coordinator'
                           // role='WH C&S Design Engineer'
                           // role='WH C&S Design Engineer'

                           // role='Document Controller'



                           // companies={[
                           //    { company: 'Woh Hup Private Ltd', companyType: 'Main con' },
                           //    { company: 'XXX', companyType: 'Sub-con' },
                           //    { company: 'YYY', companyType: 'Consultant' },
                           //    { company: 'ZZZ', companyType: 'Client' },
                           //    { company: 'MMM', companyType: 'Client' },
                           // ]}

                           // company='Woh Hup Private Ltd'
                        // company='DCA'

                        />
                     </CellProvider>
                  </RowProvider>
               </ProjectProvider>
            </Route>


            <Route path='/dashboard'>
               <PageDashboard
               // projectsArray={[
               //    { name: 'Sumang', id: 'MTYxMDMzOTYwMjQyNS1TdW1hbmc' },
               //    { name: 'Handy', id: 'MTU5MTY3NDI0ODUyMy1IYW5keQ' },
               //    { name: 'Handytgtg', id: 'KFFFFFFFDY1MS10FHANDY' },
               //    { name: 'rrrrrrrrtgtg', id: 'KFFfvfvfvHANDY' },
               // ]}
               // token='XXXTTTYYYIIIKKKLLLFFF'
               />
            </Route>

         </Switch>

      </BrowserRouter>
   );
};


export default App;