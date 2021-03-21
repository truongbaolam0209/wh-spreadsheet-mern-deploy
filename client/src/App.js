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
        // console.log('dataToSave', dataToSave);
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



                            <Route path='/dashboard'>
                                <PageDashboard
                                    projectsArray={[
                                        { name: 'Handy', id: 'MTU5MTY3NDI0ODUyMy1IYW5keQ' },
                                        { name: 'Punggol Digital District', id: 'MTU3NzA2Njg5MTczOC1QdW5nZ29sIERpZ2l0YWwgRGlzdHJpY3Q' },
                                        { name: 'Sumang', id: 'MTYxMDMzOTYwMjQyNS1TdW1hbmc' },
                                        { name: 'The Reef', id: 'MTYxMjkzMTUwNjM3Ny1UaGUgUmVlZg' },
                                        { name: 'Kim Chuan Depot', id: 'MTU3NDgyNTY5OTYwMi1LaW0gQ2h1YW4gRGVwb3Q' },
                                        { name: 'Test', id: 'ETU3NDgyNTY5cTYwMi1LaW0gQ2h1YW4gRGVwb3F' },
                                    ]}
                                />
                            </Route>


                        </CellProvider>
                    </RowProvider>
                </ProjectProvider>





            </Switch>

        </BrowserRouter>
    );
};


export default App;
