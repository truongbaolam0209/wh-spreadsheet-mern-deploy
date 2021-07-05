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


const browserName = detectBrowser();



const App = () => {


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
      // isAdmin: true,
      companies: [
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

         { company: 'TTT', companyType: 'Sub-con', trade: 'PRECAST' },


         { company: 'DCA', companyType: 'Consultant' },
         { company: 'RSP', companyType: 'Consultant' },
         { company: 'HYLA', companyType: 'Consultant' },
         { company: 'K2LD', companyType: 'Consultant' },
         { company: 'ONG & ONG', companyType: 'Consultant' },
         { company: 'Archi Consultant', companyType: 'Consultant' },

      ],
      listUser: [
         'bql@gmail.com',
         'pmq@wohhup.com',
         'tbl_1@gmail.com',
         'manager@wohhup.com',
         'manager1@wohhup.com',
         'tran_dinhbac@wohhup.com',
         'tran_dinhbac444@wohhup.com',
         'coc_coc@wohhup.com',
         'gggggggg@gmail.com',
         'gggggggg_1@gmail.com',
         'gggggggg_2@gmail.com',
         'gggggggg_3@gmail.com',
         'gggggggg_4@gmail.com',
         'gggggggg_5@gmail.com',
         'gggggggg_6@gmail.com',
         'gggggggg_7@gmail.com',
         'gggggggg_8@gmail.com',
         'gggggggg_9@gmail.com',
      ],
      listGroup: [
         // 'DCA',
         'dCA',
         'DCA_%$%_Team1',
         'RSP',
         'RSP_%$%_Team1',
         'rsP_%$%_Team2',
         'onG & ONG',
         'ONG & ONG_%$%_MEP_Team',
         'Group Email A',
         'Team RCP',
         'K2LD',
      ]
   };
   const sheetId = 'XXXYYY-ZZZZ-999-RR-D';
   const token = 'xxx-xxxxx-xx';
   const email = 'michaelsss_llave@wohhup.com';





   const callbackSelectRow = (row) => {
      console.log('row callback selected', row);
   };

   const [dataEntryData, setDataEntryData] = useState(null);

   const saveDataToServerCallback = (dataToSave) => {
      console.log('dataToSave=====Callback', dataToSave);

   };


   useEffect(() => {
      const fetchOneProject = async () => {
         try {

            const res = await Axios.post(`${SERVER_URL}/row-data-entry/get-row`, {
               token,
               projectId: sheetId,
               email,
               headers: sheetDataInput_1.headers
            });

            setDataEntryData(res.data);
            // const allSettingsRes = await Axios.get(`${SERVER_URL}/settings/get-all-settings-collection`, { token });
            // const allPublicSettings = allSettingsRes.data.filter(item => item.headers && item.headers.length > 0);

            // const dataSettingsToUPdate = allPublicSettings.map(st => {
            //    return {
            //       projectId: st.sheet,
            //       headers: st.headers
            //    }
            // });

         } catch (err) {
            console.log(err);
         };
      };
      fetchOneProject();
   }, []);


   const getDataFromOutsideComponent = async () => {
      try {
         const result = await window.triggerFromOutsideComponent();
         console.log('result', result);
      } catch (err) {
         console.log(err);
      };
   };




   return (

      <BrowserRouter>
         <Switch>
            <SheetContext>

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

                     role=
                     // 'Document Controller'
                     // 'WH Archi Coordinator'
                     // 'WH C&S Design Engineer',
                     // 'WH M&E Coordinator',
                     // 'WH PRECAST Coordinator',

                     // 'WH Archi Modeller',
                     // 'WH C&S Modeller',
                     // 'WH M&E Modeller',
                     // 'WH PRECAST Modeller',

                     // 'Production',

                     // 'WH Archi Manager'
                     // 'WH C&S Manager'
                     // 'WH M&E Manager',
                     // 'WH PRECAST Manager',

                     // 'Planning Engineer',
                     // 'QS',
                     'Project Manager'
                  // 'Corporate Manager',
                  // 'QAQC',
                  // 'Safety',
                  // 'Client',

                  // 'Sub-Con',
                  // 'Consultant',
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



export const sheetDataInput_1 = {
   'rows': [],
   'headers': [
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
   ],
   'rowsss': [
      {
         '_id': 'c9841b14-2694-4aa6-a8a1-ee817271d109',
         'level': 1,
         'parentRow': 'XXXYYY-ZZZZ-999-RR',
         'preRow': null,
         'aaaaaaaaaaaaaaaaaa': 'ffff',
         'sheet': 'XXXYYY-ZZZZ-999-RR',
         'data': {
            '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'PB1-0001',
            'db4e97d1-f64b-496b-88e8-05312699d31e': '',
            'fa05281e-b1ba-4829-b3af-4e28b1b35735': ''
         }
      },
      {
         '_id': '5dc9e0a1-32e4-4a27-a20e-5ccb3fd5214b',
         'level': 1,
         'parentRow': 'XXXYYY-ZZZZ-999-RR',
         'preRow': 'ecab613a-455b-4f38-9a80-cf939753d1dd',
         'sheet': 'XXXYYY-ZZZZ-999-RR',
         'data': {
            '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'PB1-0304',
            'db4e97d1-f64b-496b-88e8-05312699d31e': '',
            'fa05281e-b1ba-4829-b3af-4e28b1b35735': ''
         }
      },
      {
         '_id': 'cec19ddd-8f94-4c75-b34d-3c2614250e54',
         'level': 1,
         'parentRow': 'XXXYYY-ZZZZ-999-RR',
         'preRow': '5dc9e0a1-32e4-4a27-a20e-5ccb3fd5214b',
         'sheet': 'XXXYYY-ZZZZ-999-RR',
         'data': {
            '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'PB1-0305',
            'db4e97d1-f64b-496b-88e8-05312699d31e': '',
            'fa05281e-b1ba-4829-b3af-4e28b1b35735': ''
         }
      },
      {
         '_id': 'b0e51a93-84fa-46be-a405-9c6f104eee62',
         'level': 1,
         'parentRow': 'XXXYYY-ZZZZ-999-RR',
         'preRow': 'cec19ddd-8f94-4c75-b34d-3c2614250e54',
         'sheet': 'XXXYYY-ZZZZ-999-RR',
         'data': {
            '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'PB1-0306',
            'db4e97d1-f64b-496b-88e8-05312699d31e': '',
            'fa05281e-b1ba-4829-b3af-4e28b1b35735': ''
         }
      },
      {
         '_id': '804fba89-7ad5-473f-86e1-41523279e3c9',
         'level': 1,
         'parentRow': 'XXXYYY-ZZZZ-999-RR',
         'preRow': 'b0e51a93-84fa-46be-a405-9c6f104eee62',
         'sheet': 'XXXYYY-ZZZZ-999-RR',
         'data': {
            '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'PB1-0307',
            'db4e97d1-f64b-496b-88e8-05312699d31e': '',
            'fa05281e-b1ba-4829-b3af-4e28b1b35735': ''
         }
      },
      {
         '_id': 'e4517bb3-8892-4bb5-b419-644dbdf9bfa1',
         'level': 1,
         'parentRow': 'XXXYYY-ZZZZ-999-RR',
         'preRow': '804fba89-7ad5-473f-86e1-41523279e3c9',
         'sheet': 'XXXYYY-ZZZZ-999-RR',
         'data': {
            '5c5bc3bf-7cef-4326-8ec9-84d8228265c4': 'PB1-0308',
            'db4e97d1-f64b-496b-88e8-05312699d31e': '',
            'fa05281e-b1ba-4829-b3af-4e28b1b35735': ''
         }
      },
   ],
   'publicSettings': {
      'sheetId': 'XXXYYY-ZZZZ-999-RR',
      'headers': [
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
      ],
      'drawingTypeTree': [],
      'activityRecorded': []
   }
};






