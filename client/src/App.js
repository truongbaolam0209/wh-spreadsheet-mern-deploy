import 'antd/dist/antd.css';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider as CellProvider } from './contexts/cellContext';
import { Provider as ProjectProvider } from './contexts/projectContext';
import { Provider as RowProvider } from './contexts/rowContext';
import PageDataEntrySheet from './layouts/PageDataEntrySheet';
import PageSpreadsheet from './layouts/PageSpreadsheet';
import PageDashboard from './_dashboardComp/PageDashboard';




const App = () => {


   const saveDataToServerCallback = (dataToSave) => {
      console.log('dataToSave', dataToSave);
   };


   return (
      <BrowserRouter>

         <Switch>

            <ProjectProvider>
               <RowProvider>
                  <CellProvider>

                     <Route path='/sheet'>
                        <PageSpreadsheet
                           email='test1@wh5dapp.com'
                           projectId='MTU3NzA2Njg5MTczOC1QdW5nZ29sIERpZ2l0YWwgRGlzdHJpY3Q'
                           projectName='PDD'
                           token='xxx-xxxxx-xxx-x-xxxxx'
                           isAdmin={true}
                           role='Document Controller'
                           companies={[
                              { company: 'Woh Hup Private Ltd', companyType: 'Main con' },
                              { company: 'XXX', companyType: 'Sub-con' },
                              { company: 'YYY', companyType: 'Consultant' },
                              { company: 'ZZZ', companyType: 'Client' },
                              { company: 'MMM', companyType: 'Client' },
                           ]}
                           company='Woh Hup Private Ltd'
                        />
                     </Route>
                     <Route path='/sheet-data-entry'>
                        <PageDataEntrySheet
                           isAdmin={true}
                           email='michaelsss_llave@wohhup.com'
                           role={{
                              name: 'Coordinator',
                              canEditParent: true
                           }}
                           canSaveUserSettings={false}
                           token={'xxx-xxxxx-xx'}
                           sheetDataInput={sheetDataInput}
                           sheetName='Sheet 1'
                           sheetId='603c5a72ac0af84337dee4f6'

                           cellsHistoryInCurrentSheet={''}
                           cellOneHistory={''}
                           saveDataToServerCallback={saveDataToServerCallback}
                        />
                     </Route>


                  </CellProvider>
               </RowProvider>
            </ProjectProvider>



            <Route path='/dashboard'>
               <PageDashboard
               // projectsArray={[
               //    { name: 'Sumang', id: 'MTYxMDMzOTYwMjQyNS1TdW1hbmc' },
               //    { name: 'Handy', id: 'MTU5MTY3NDI0ODUyMy1IYW5keQ' },
               //    { name: 'Handytgtg', id: 'KFFFFFFFDY1MS10FHANDY' },
               //    { name: 'rrrrrrrrtgtg', id: 'KFFfvfvfvHANDY' },
               // ]}
               />
            </Route>

         </Switch>

      </BrowserRouter>
   );
};


export default App;


const sheetDataInput = {
   'rows': [
      {
         '_id': '6049f12a0e422df9b2d460e7',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': null,
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f12a8544ec216f4a2fcc',
         'level': 1,
         'parentRow': '6049f1565559aeb56333f1e9',
         'preRow': null,
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '17/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Approved with comments, to Resubmit',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked',
            '9a572110-7845-11eb-86fb-5732a9ac9b80': 'vvvvvvvvvvvvv'
         }
      },
      {
         '_id': '6049f12a2d875e47e1546540',
         'level': 1,
         'parentRow': '6049f2e8eb60b45eb29c5441',
         'preRow': null,
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '27/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Approved with comments, to Resubmit',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f12a3aae0bf8fe809c80',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f19e2d4a75b2ec6d8cce',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '30/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Approved with comments, to Resubmit',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f12a16a29f0058f2ec6f',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f12a3aae0bf8fe809c80',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '22/03/21',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f173e2afee3c76b53787',
         'level': 1,
         'parentRow': '6049f2eafdbcf5afc357fb4b',
         'preRow': null,
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f1730dc9e0c5701faf18',
         'level': 1,
         'parentRow': '6049f2eafdbcf5afc357fb4b',
         'preRow': '6049f173e2afee3c76b53787',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f173ea9992ee88a9889a',
         'level': 1,
         'parentRow': '6049f2eafdbcf5afc357fb4b',
         'preRow': '6049f1730dc9e0c5701faf18',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f19e2d4a75b2ec6d8cce',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b02e3a9b03508aee76f',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '06/03/21',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '6049f19ed6682b46f688f2e7',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f19e3b385859bbfd5ae7',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Approved with comments, to Resubmit',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f19e3b385859bbfd5ae7',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f12a16a29f0058f2ec6f',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f19ee1a764097481c9be',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f19ed6682b46f688f2e7',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '6049f19eb7d7f56584be42b8',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b02dc15c05dc5d27d38',
         'sheet': '603c5a72ac0af84337dee4f6',
         'data': {
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Approved with comments, to Resubmit',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         }
      },
      {
         '_id': '604a2b02dc15c05dc5d27d38',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f12a0e422df9b2d460e7',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b0226002c3f532921b7',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '6049f19eb7d7f56584be42b8',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b02a1ebcae7196835a6',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b0226002c3f532921b7',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b02959923cf9be9ec80',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b02a1ebcae7196835a6',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b027b1e763098ba84f2',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b02959923cf9be9ec80',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b0252a0db0fefbf0852',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b027b1e763098ba84f2',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b0206852992f9da9dca',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b0252a0db0fefbf0852',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b0291b37e71de885612',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b0206852992f9da9dca',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b027ad01711173f83ee',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b0291b37e71de885612',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      },
      {
         '_id': '604a2b02e3a9b03508aee76f',
         'level': 1,
         'parentRow': '6049f2c8b0a8517e208cef11',
         'preRow': '604a2b027ad01711173f83ee',
         'data': {
            '9a572113-7845-11eb-86fb-5732a9ac9b80': '01/03/21',
            '9a572115-7845-11eb-86fb-5732a9ac9b80': 'Not Started',
            '9a572117-7845-11eb-86fb-5732a9ac9b80': 'checked'
         },
         'sheet': '603c5a72ac0af84337dee4f6',
      }
   ],
   'publicSettings': {
      'sheetId': '603c5a72ac0af84337dee4f6',
      'headers': [
         {
            'id': '9a572110-7845-11eb-86fb-5732a9ac9b80',
            'name': 'Drawing Number',
            'type': 'text',
            'roleCanEdit': [
               'Coordinator'
            ],
            'roleCanView': [
               'Modeller',
               'Coordinator'
            ]
         },
         {
            'id': '9a572113-7845-11eb-86fb-5732a9ac9b80',
            'name': 'Drg To Consultant',
            'type': 'date',
            'roleCanEdit': [
               'Coordinator'
            ],
            'roleCanView': [
               'Modeller',
               'Coordinator'
            ]
         },
         {
            'id': '9a572115-7845-11eb-86fb-5732a9ac9b80',
            'name': 'Status',
            'type': 'dropdown',
            'roleCanEdit': [
               'Modeller',
               'Coordinator'
            ],
            'roleCanView': [
               'Modeller',
               'Coordinator'
            ],
            'valueArray': [
               'Not Started',
               'Approved For Construction',
               'Approved with comments, to Resubmit',
               'Approved with Comment, no submission Required',
               'Consultant reviewing',
               'Revise In-Progress'
            ]
         },
         {
            'id': '9a572117-7845-11eb-86fb-5732a9ac9b80',
            'name': 'Header Check Box 01',
            'type': 'checkbox',
            'roleCanEdit': [
               'Modeller',
               'Coordinator'
            ],
            'roleCanView': [
               'Modeller',
               'Coordinator'
            ]
         }
      ],
      'drawingTypeTree': [
         {
            'title': 'SSS',
            'id': '6049f1565559aeb56333f1e9',
            'parentId': '603c5a72ac0af84337dee4f6',
            'treeLevel': 1,
            'expanded': true
         },
         {
            'title': 'New Folder',
            'id': '6049f1e3187b13ba6fac6d94',
            'parentId': '603c5a72ac0af84337dee4f6',
            'treeLevel': 1,
            'expanded': true
         },
         {
            'title': '00000000000',
            'id': '6049f190e81a1e0d085e80a5',
            'parentId': '603c5a72ac0af84337dee4f6',
            'treeLevel': 1,
            'expanded': true
         },
         {
            'title': 'New Folder',
            'id': '6049f1750590bc77875fcd08',
            'parentId': '603c5a72ac0af84337dee4f6',
            'treeLevel': 1,
            'expanded': true
         },
         {
            'title': '111111',
            'id': '6049f1914774ec0df48eccb6',
            'parentId': '6049f1e3187b13ba6fac6d94',
            'treeLevel': 2,
            'expanded': true
         },
         {
            'title': 'New Folder',
            'id': '6049f2dea8f4c4ae69637878',
            'parentId': '6049f1750590bc77875fcd08',
            'treeLevel': 2,
            'expanded': true
         },
         {
            'title': '222222222222',
            'id': '6049f1ae60422739f43a93a1',
            'parentId': '6049f2dea8f4c4ae69637878',
            'treeLevel': 3,
            'expanded': true
         },
         {
            'title': '333333333',
            'id': '6049f2c8b0a8517e208cef11',
            'parentId': '6049f1ae60422739f43a93a1',
            'treeLevel': 4,
            'expanded': true
         },
         {
            'title': 'New Folder',
            'id': '6049f2e8eb60b45eb29c5441',
            'parentId': '6049f1ae60422739f43a93a1',
            'treeLevel': 4,
            'expanded': true
         },
         {
            'title': 'New Folder',
            'id': '6049f2eafdbcf5afc357fb4b',
            'parentId': '6049f1ae60422739f43a93a1',
            'treeLevel': 4,
            'expanded': true
         },
         {
            'title': 'New Folder',
            'id': '6049f2ebb57a8d34a39cc251',
            'parentId': '6049f1ae60422739f43a93a1',
            'treeLevel': 4,
            'expanded': true
         }
      ],
      'activityRecorded': [
         {
            'id': '6049f1565559aeb56333f1e9',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:31:04.843Z',
            'action': 'Create Folder',
            'title': 'SSS'
         },
         {
            'title': 'New Folder',
            'id': '6049f1750590bc77875fcd08',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:31:17.313Z',
            'action': 'Create Folder'
         },
         {
            'id': '6049f190e81a1e0d085e80a5',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:32:19.849Z',
            'action': 'Create Folder',
            'title': '00000000000'
         },
         {
            'id': '6049f1914774ec0df48eccb6',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:32:19.849Z',
            'action': 'Create Folder',
            'title': '111111'
         },
         {
            'id': '6049f1ae60422739f43a93a1',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:32:19.849Z',
            'action': 'Create Folder',
            'title': '222222222222'
         },
         {
            'id': '6049f1e3187b13ba6fac6d94',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:33:25.140Z',
            'action': 'Create Folder',
            'title': 'New Folder'
         },
         {
            'id': '6049f2c8b0a8517e208cef11',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:37:28.725Z',
            'action': 'Create Folder',
            'title': '333333333'
         },
         {
            'title': 'New Folder',
            'id': '6049f2eafdbcf5afc357fb4b',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:37:30.968Z',
            'action': 'Create Folder'
         },
         {
            'id': '6049f2dea8f4c4ae69637878',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:37:30.969Z',
            'action': 'Create Folder',
            'title': 'New Folder'
         },
         {
            'id': '6049f2ebb57a8d34a39cc251',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:37:44.815Z',
            'action': 'Create Folder',
            'title': 'New Folder'
         },
         {
            'id': '6049f2e8eb60b45eb29c5441',
            'email': 'michaelsss_llave@wohhup.com',
            'createdAt': '2021-03-11T10:38:06.005Z',
            'action': 'Create Folder',
            'title': 'New Folder'
         }
      ],
   },
   'userSettings': {
      'modeFilter': [],
      '_id': '6049f14cf370d01cf0957ad6',
      'sheet': '603c5a72ac0af84337dee4f6',
      'user': 'michaelsss_llave@wohhup.com',
      'headersShown': [
         '9a572110-7845-11eb-86fb-5732a9ac9b80',
         '9a572113-7845-11eb-86fb-5732a9ac9b80',
         '9a572115-7845-11eb-86fb-5732a9ac9b80',
         '9a572117-7845-11eb-86fb-5732a9ac9b80'
      ],
      'headersHidden': [],
      'nosColumnFixed': 0,
      'colorization': {},
      'role': {
         'name': 'Coordinator',
         'canEditParent': true
      },
      'viewTemplateNodeId': null,
      'viewTemplates': [],
      'modeSort': {},
   }
}