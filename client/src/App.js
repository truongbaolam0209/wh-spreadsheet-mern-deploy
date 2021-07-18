import 'antd/dist/antd.css';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import PageDashboard from './components/pages/DMSApp/DashboardLayout/PageDashboard';
import { SERVER_URL } from './components/pages/DMSApp/SpreadSheetLayout/constants';
import SheetContext from './components/pages/DMSApp/SpreadSheetLayout/contexts/sheetContextProvider';
import PageCVI from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageCVI';
import PageDataEntrySheet from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageDataEntrySheet';
import PageDT from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageDT';
import PageMM from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageMM';
import PageRFA from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageRFA';
import PageRFAM from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageRFAM';
import PageRFI from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageRFI';
import PageSpreadsheet from './components/pages/DMSApp/SpreadSheetLayout/layouts/PageSpreadsheet';
import { mongoObjectId } from './components/pages/DMSApp/SpreadSheetLayout/utils';


const browserName = detectBrowser();



const App = () => {





   const sheetId = 'XXXYYY-ZZZZ-999-RR-DT';
   const token = 'xxx-xxxxx-xx';
   const email = 'michaelsss_llave@wohhup.com';





   const callbackSelectRow = (row) => {
      console.log('row callback selected', row);
   };



   const saveDataToServerCallback = (dataToSave) => {
      console.log('dataToSave=====Callback', dataToSave);

   };

   const [dataEntryData, setDataEntryData] = useState(null);
   useEffect(() => {
      const fetchOneProject = async () => {
         try {

            const res = await Axios.post(`${SERVER_URL}/row-data-entry/get-row`, {
               token,
               projectId: sheetId,
               email,
               headers: sheetHeaders
            });

            setDataEntryData(res.data);


         } catch (err) {
            console.log(err);
         };
      };
      fetchOneProject();
   }, []);


   const getDataFromOutsideComponent = async () => {
      try {
         const result = await window.getCurrentDataTable();

      } catch (err) {
         console.log(err);
      };
   };

   const [rowsImportedFromModel, setRowsImportedFromModel] = useState([]);
   const importNewRowsDataFromModel = () => {
      setRowsImportedFromModel([
         {
            data: {
               'Pile marking': 'DEATHHHHHHHHHHHHHH',
               'Sizes': 205
            },
            outS1: '909-WWWWWWW',
            iiii: 'COCCOCCOC',
            lll: 'LAM-LAM777777777777777777777777777777777777777777777777777777777777777777777777777777',
            oxo: 'fff',
            _id: '60e8694840b005b34dc2d3b3'
         },
         {
            data: {
               'Pile marking': '16 x 32',
               'Sizes': 7.16
            },
            outS2: '9999999999999999999999999999999999999999999999999999999999999999999',

         },
         {
            data: {
               '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'KKKKKKKKKKKKKKKKKK',
               llllllllllll: '000000000000000',
            },
            outS3: 'ssssssssssssssss',
            _id: mongoObjectId(),
         },
         {
            data: {
               '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'RRRRRRRRRRRRRRR',
               iii: '000000000000000',
               'Sizes': 777
            },
            GGG: 'ssssssssssssssss',
            lam_lam_k: 'r',
            _id: '60e8691fea719169a634cfd6',
         },
         {
            data: {
               '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': '4444ERROR===',
               iii: 'XXCXX',
               'Sizes': 888,
               'Pile marking': '111',
            },
            GGG: 'ssssssssssssssss',
            _id: mongoObjectId(),
         },
      ]);
   };


   const [openPanel, setOpenPanel] = useState(false);
   const onClickOpenPanel = () => {
      setOpenPanel(!openPanel);
   };

   return (

      <BrowserRouter>
         <Switch>

            <SheetContext>
               {/* <button onClick={importNewRowsDataFromModel}>KKK</button> */}
               {/* <button onClick={getDataFromOutsideComponent}>MMM</button> */}
               {/* <button onClick={onClickOpenPanel}>MMM</button> */}

               <Route exact path='/dms-spreadsheet'><PageSpreadsheet {...propsSheet} /></Route>

               <Route exact path='/sheet-data-entry'>
                  {dataEntryData && (
                     <div style={{ display: 'flex' }}>
                        <PageDataEntrySheet
                           {...propsSheet}
                           isAdmin={true}
                           email={email}
                           role={{
                              name: 'Document Controller',
                              canEditParent: true
                           }}
                           sheetDataInput={dataEntryData}
                           sheetId={sheetId}
                           sheetName='Sheet 1'
                           saveDataToServerCallback={saveDataToServerCallback}
                           callbackSelectRow={callbackSelectRow}
                           rowsImportedFromModel={rowsImportedFromModel}
                        />
                        {openPanel && (
                           <div style={{
                              width: 500,
                              height: 700,
                              background: 'red',
                              zIndex: 100
                           }}>RRR</div>
                        )}

                     </div>
                  )}
               </Route>

               <Route exact path='/dms-rfa'><PageRFA {...propsSheet} /></Route>
               <Route exact path='/dms-rfam'><PageRFAM {...propsSheet} /></Route>
               <Route exact path='/dms-rfi'><PageRFI {...propsSheet} /></Route>
               <Route exact path='/dms-cvi'><PageCVI {...propsSheet} /></Route>
               <Route exact path='/dms-dt'><PageDT {...propsSheet} /></Route>
               <Route exact path='/dms-mm'><PageMM {...propsSheet} /></Route>


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
                     company='Woh Hup Private Ltd'
                  // role='WH Archi Modeller'
                  // role='WH Archi Coordinator'
                  // role='Project Manager'
                  />
               </Route>

            </SheetContext>

         </Switch>
      </BrowserRouter>
   );
};

export default App;


function detectBrowser() {
   if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) != -1) {
      return 'Opera';
   } else if (navigator.userAgent.indexOf('Chrome') != -1) {
      return 'Chrome';
   } else if (navigator.userAgent.indexOf('Safari') != -1) {
      return 'Safari';
   } else if (navigator.userAgent.indexOf('Firefox') != -1) {
      return 'Firefox';
   } else if ((navigator.userAgent.indexOf('MSIE') != -1) || (!!document.documentMode == true)) {
      return 'IE';
   } else {
      return 'Unknown';
   };
};


// const consultantCompany = 'DCA';
// const consultantCompany = 'RSP';
const consultantCompany = 'Index';
// const consultantCompany = 'Alpha';
// const consultantCompany = 'Archi Consultant';
// const consultantCompany = 'ONG & ONG';

const propsSheet = {
   email: browserName === 'Chrome' ? 'mmmoooJ@wohhup.com' : 'test@dca.com',
   company: browserName === 'Chrome' ? 'Woh Hup Private Ltd' : consultantCompany,
   // company: browserName === 'Chrome' ? consultantCompany : consultantCompany,
   role: browserName === 'Chrome' ? 'Document Controller' : 'Consultant',
   // role: browserName === 'Chrome' ? 'Consultant' : 'Consultant',


   projectId: 'MTYxMjkzMTUwNjM3Ny1UaGUgUmVlZg',
   // projectId: 'MTU3NDgyNTcyMzUwNC1UZXN0',

   projectIsAppliedRfaView: true,
   // projectIsAppliedRfaView: false,
   projectName: 'The Reef',
   projectNameShort: 'RKD',
   token: 'xxx-xxxxx-xxx-x-xxxxx',
   // isAdmin: true,
   companies: [
      { company: 'Woh Hup Private Ltd', companyType: 'Main con' },
      { company: 'DCA', companyType: 'Consultant', fullName: 'DCA Architects' },
      { company: 'RSP', companyType: 'Consultant' },
      { company: 'HYLA', companyType: 'Consultant' },
      { company: 'K2LD', companyType: 'Consultant' },
      { company: 'ONG & ONG', companyType: 'Consultant' },
      { company: 'Archi Consultant', companyType: 'Consultant' },
      { company: 'Index', companyType: 'Consultant' },
      { company: 'Alpha', companyType: 'Consultant' },
      { company: 'XXXX', companyType: 'Sub-con', trade: 'ARCHI' },
      { company: 'Archi Consultant', companyType: 'Consultant' },
      { company: 'ID Consultants', companyType: 'Consultant' },
      { company: 'Test', companyType: 'Consultant' },
   ],
   listUser: [
      'bql@gmail.com', 'pmq@wohhup.com', 'tbl_1@gmail.com', 'manager@wohhup.com', 'manager1@wohhup.com', 'tran_dinhbac@wohhup.com',
      'tran_dinhbac444@wohhup.com', 'coc_coc@wohhup.com', 'gggggggg@gmail.com', 'gggggggg_1@gmail.com', 'gggggggg_2@gmail.com', 'gggggggg_3@gmail.com',
      'gggggggg_4@gmail.com', 'gggggggg_5@gmail.com', 'gggggggg_6@gmail.com', 'gggggggg_7@gmail.com', 'gggggggg_8@gmail.com', 'gggggggg_9@gmail.com',
   ],
   listGroup: [
      'dCA', 'DCA_%$%_Team1', 'RSP', 'RSP_%$%_Team1', 'rsP_%$%_Team2', 'onG & ONG',
      'ONG & ONG_%$%_MEP_Team', 'Group Email A', 'Team RCP', 'K2LD',
      'Index_%$%_Team', 'Alpha_%$%_',
      'Archi Consultant_%$%_Archi', 'ID Consultants_%$%_ID',
      'Alpha_%$%_M&E Engineer', 'DCA_%$%_Architect', 'Index_%$%_ID Consultant', 'Aurecon_%$%_Structural Engineer',
      'DCA_%$%_Architect', 'Test_%$%_',


      'Alpha_%$%_',
      'WH_Archi Tech',
      'WH_QS',
      'WH_M&E Tech',
   ]
};


const sheetHeaders = [
   {
      'id': 'Pile marking',
      'name': 'Pile marking',
      'type': 'text',
   },
   {
      'id': 'Sizes',
      'name': 'Sizes',
      'type': 'text',
   },
   {
      'id': '5c5bc3bf-7cef-4326-8ec9-84d8228265c4',
      'name': 'Code',
      'type': 'text',
      'roleCanEdit': [
         'Document Controller'
      ],
      'roleCanView': [
         'Document Controller'
      ]
   },
   {
      'id': 'db4e97d1-f64b-496b-88e8-05312699d31e',
      'name': 'New Code',
      'type': 'text',
      'roleCanEdit': [
         'Document Controller'
      ],
      'roleCanView': [
         'Document Controller'
      ]
   },
   {
      'id': 'fa05281e-b1ba-4829-b3af-4e28b1b35735',
      'name': 'Date',
      'type': 'date',
      'roleCanEdit': [
         'Document Controller'
      ],
      'roleCanView': [
         'Document Controller'
      ]
   },
   {
      'id': 'gt05281e-b1ba-4829-b3af-4e28b1b35766',
      'name': 'Form Type',
      'type': 'dropdown',
      'valueArray': [
         'Document',
         'CD',
         'Paper'
      ],
      'roleCanEdit': [
         'Document Controller'
      ],
      'roleCanView': [
         'Document Controller'
      ]
   },
   {
      'id': 'uj05281e-b1ba-4829-b3af-4e28b1b35444',
      'name': 'Finished',
      'type': 'checkbox',
      'roleCanEdit': [
         'Document Controller'
      ],
      'roleCanView': [
         'Document Controller'
      ]
   },
];






