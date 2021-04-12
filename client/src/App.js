import 'antd/dist/antd.css';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import PageDashboard from './components/pages/DMSApp/DashboardLayout/PageDashboard';
import SheetContext from './components/pages/DMSApp/SpreadSheetLayout/contexts/sheetContextProvider';
import PageDataEntrySheet from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageDataEntrySheet';
import PageSpreadsheet from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageSpreadsheet';


const browserName = detectBrowser();

const App = () => {

   const saveDataToServerCallback = (dataToSave) => {
      console.log('dataToSave', dataToSave);
   };


   return (
      <BrowserRouter>
         <Switch>

            <SheetContext>
               <Route path='/sheet'>

                  <PageSpreadsheet


                     email={browserName === 'Chrome' ? 'judy@wohhup.com' : 'consultant_user_@wohhup.com'}
                     company={browserName === 'Chrome' ? 'Woh Hup Private Ltd' : consultantCompany}
                     role={browserName === 'Chrome' ? 'Document Controller' : 'Consultant'}



                     // email='judy@wohhup.com'
                     // company='Woh Hup Private Ltd'
                     // role='Document Controller'


                     // email='consultant_DCA_@wohhup.com'
                     // company='DCA'
                     // role='Consultant'


                     // email='emmylou_lopez@wohhup.com'

                     // projectId='MTYxMjkzMTUwNjM3Ny1UaGUgUmVlZg'
                     projectId='MTU3NzA2Njg5MTczOC1QdW5nZ29sIERpZ2l0YWwgRGlzdHJpY3Q'
                     // projectId='MTU3NzA2Njg5MTczOC1QdW5nZ29sIERpZ2l0YWwgRGlzdHJpY3Q'

                     projectIsAppliedRfaView={true}

                     projectName='PDD'
                     token='xxx-xxxxx-xxx-x-xxxxx'
                     isAdmin={true}
                     // role='WH C&S Design Engineer'
                     // role='WH Archi Coordinator'
                     // role='WH Archi Modeller'

                     // role='Sub-Con'
                     companies={[
                        { company: 'Woh Hup Private Ltd', companyType: 'Main con' },

                        { company: 'XXX', companyType: 'Sub-con', trade: 'ARCHI' },
                        { company: 'PLAYWKZ CULTURE', companyType: 'Sub-con', trade: 'ARCHI' },
                        { company: 'MAXBOND', companyType: 'Sub-con', trade: 'ARCHI' },
                        { company: 'HI SERVICES', companyType: 'Sub-con', trade: 'ARCHI' },

                        { company: 'YYY', companyType: 'Sub-con', trade: 'C&S' },
                        { company: 'TYLIN', companyType: 'Sub-con', trade: 'C&S' },
                        { company: '123', companyType: 'Sub-con', trade: 'C&S' },

                        { company: 'ZZZ-ME-1', companyType: 'Sub-con', trade: 'M&E' },
                        { company: 'ZZZ-ME-2', companyType: 'Sub-con', trade: 'M&E' },
                        { company: 'AECOM', companyType: 'Sub-con', trade: 'M&E' },
                        { company: 'HHH ME', companyType: 'Sub-con', trade: 'M&E' },


                        { company: 'DCA', companyType: 'Consultant', isLeadConsultant: true },
                        { company: 'RSP', companyType: 'Consultant' },
                        { company: 'HYLA', companyType: 'Consultant' },
                        { company: 'K2LD', companyType: 'Consultant' },
                        { company: 'ONG & ONG', companyType: 'Consultant' },
                     ]}



                     listUser={[
                        'bql@gmail.com',
                        'pmq@wohhup.com',
                        'tbl_1@gmail.com'
                     ]}
                     listGroup={[
                        'Group 1',
                        'Group 2',
                        'WH Group 2',
                        'Sumang Email Group',
                     ]}



                  />
               </Route>

               <Route path='/sheet-data-entry'>
                  <PageDataEntrySheet
                     isAdmin={true}
                     email='michaelsss_llave@wohhup.com'
                     role={{
                        name: 'Document Controller',
                        canEditParent: true
                     }}
                     canSaveUserSettings={false}
                     token={'xxx-xxxxx-xx'}
                     sheetDataInput={sheetDataInput}
                     sheetName='Sheet 1'
                     sheetId='e4ac39e4-3f5f-46bd-adc1-912a14efe801'

                     cellsHistoryInCurrentSheet={''}
                     cellOneHistory={''}
                     saveDataToServerCallback={saveDataToServerCallback}
                  />
               </Route>





            </SheetContext>

            <Route path='/dashboard'>
               <PageDashboard
                  projectsArray={[
                     { name: 'Handy', id: 'MTU5MTY3NDI0ODUyMy1IYW5keQ' },
                     { name: 'Punggol Digital District', id: 'MTU3NzA2Njg5MTczOC1QdW5nZ29sIERpZ2l0YWwgRGlzdHJpY3Q' },
                     { name: 'Sumang', id: 'MTYxMDMzOTYwMjQyNS1TdW1hbmc' },
                     { name: 'The Reef', id: 'MTYxMjkzMTUwNjM3Ny1UaGUgUmVlZg' },
                     { name: 'Kim Chuan Depot', id: 'MTU3NDgyNTY5OTYwMi1LaW0gQ2h1YW4gRGVwb3Q' },
                     { name: 'Test', id: 'ETU3NDgyNTY5cTYwMi1LaW0gQ2h1YW4gRGVwb3F' },
                     { name: 'Test-2', id: 'MTU3NzA2Njg5MTczOTEST' },
                     { name: 'Test-3', id: 'MTU3NzA2Njg5MTczOC1QdW5nZ29sIERpZ2l0YWwgRGlzdHJpY3Q5' },
                  ]}
               />
            </Route>

         </Switch>
      </BrowserRouter>
   );
};


export default App;


