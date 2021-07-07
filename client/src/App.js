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





   const sheetId = 'XXXYYY-ZZZZ-999-RR-D';
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
            console.log('AAA', res.data);

         } catch (err) {
            console.log(err);
         };
      };
      fetchOneProject();
   }, []);


   const getDataFromOutsideComponent = async () => {
      try {
         const result = await window.getCurrentDataTable();
         console.log('result', result);
      } catch (err) {
         console.log(err);
      };
   };

   const [rowsImportedFromModel, setRowsImportedFromModel] = useState([]);
   const importNewRowsDataFromModel = () => {
      setRowsImportedFromModel([
         {
            data: {
               ggg: 'ddd',
               ttt: '1234-5678',
               'db4e97d1-f64b-496b-88e8-05312699d31e': '12-66',
               '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'T-B-L',
            },
            outS1: 'ssssssssssssssss',
            iiii: '123',
            _id: mongoObjectId(),
         },
         {
            data: {
               rrr: '9999999999999',
               'db4e97d1-f64b-496b-88e8-05312699d31e': 'AA-YYYYY=======TTTT',
               '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'TTTT',
               zzzzz: 'hAY QUA'
            },
            outS2: '9999999999999999999999999999999999999999999999999999999999999999999',
            _id: '60e5619874f494a423054d2a',
         },
         {
            data: {
               '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'KKKKKKKKKKKKKKKKKK',
               llllllllllll: '000000000000000',
            },
            outS3: 'ssssssssssssssss',
            _id: mongoObjectId(),
         },
      ]);
   };



   return (

      <BrowserRouter>
         <Switch>
            <SheetContext>
               <button onClick={importNewRowsDataFromModel}>KKK</button>
               <button onClick={getDataFromOutsideComponent}>MMM</button>
               <Route exact path='/dms-spreadsheet'><PageSpreadsheet {...propsSheet} /></Route>

               <Route exact path='/sheet-data-entry'>
                  {dataEntryData && (
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
   if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
      return 'Opera';
   } else if (navigator.userAgent.indexOf("Chrome") != -1) {
      return 'Chrome';
   } else if (navigator.userAgent.indexOf("Safari") != -1) {
      return 'Safari';
   } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      return 'Firefox';
   } else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) {
      return 'IE';
   } else {
      return 'Unknown';
   };
};


// const consultantCompany = 'DCA';
// const consultantCompany = 'RSP';
// const consultantCompany = 'Archi Consultant';
const consultantCompany = 'ONG & ONG';

const propsSheet = {
   email: browserName === 'Chrome' ? 'tbl@wohhup.com' : 'test@dca.com',
   company: browserName === 'Chrome' ? 'Woh Hup Private Ltd' : consultantCompany,
   // company: browserName === 'Chrome' ? consultantCompany : consultantCompany,
   role: browserName === 'Chrome' ? 'Document Controller' : 'Consultant',
   // role: browserName === 'Chrome' ? 'Consultant' : 'Consultant',


   projectId: 'MTYxMjkzMTUwNjM3Ny1UaGUgUmVlZg',

   projectIsAppliedRfaView: true,
   // projectIsAppliedRfaView: false,
   projectName: 'MMM',
   projectNameShort: 'RKD',
   token: 'xxx-xxxxx-xxx-x-xxxxx',
   isAdmin: true,
   companies: [
      { company: 'Woh Hup Private Ltd', companyType: 'Main con' },
      { company: 'DCA', companyType: 'Consultant' },
      { company: 'RSP', companyType: 'Consultant' },
      { company: 'HYLA', companyType: 'Consultant' },
      { company: 'K2LD', companyType: 'Consultant' },
      { company: 'ONG & ONG', companyType: 'Consultant' },
      { company: 'Archi Consultant', companyType: 'Consultant' },

   ],
   listUser: [
      'bql@gmail.com', 'pmq@wohhup.com', 'tbl_1@gmail.com', 'manager@wohhup.com', 'manager1@wohhup.com', 'tran_dinhbac@wohhup.com',
      'tran_dinhbac444@wohhup.com', 'coc_coc@wohhup.com', 'gggggggg@gmail.com', 'gggggggg_1@gmail.com', 'gggggggg_2@gmail.com', 'gggggggg_3@gmail.com',
      'gggggggg_4@gmail.com', 'gggggggg_5@gmail.com', 'gggggggg_6@gmail.com', 'gggggggg_7@gmail.com', 'gggggggg_8@gmail.com', 'gggggggg_9@gmail.com',
   ],
   listGroup: [
      'dCA', 'DCA_%$%_Team1', 'RSP', 'RSP_%$%_Team1', 'rsP_%$%_Team2', 'onG & ONG',
      'ONG & ONG_%$%_MEP_Team', 'Group Email A', 'Team RCP', 'K2LD',]
};

const sheetHeaders = [
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






