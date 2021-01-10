import { Col, Divider, Modal, Row, Skeleton } from 'antd';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SERVER_URL } from './assets/constantDashboard';
import CardPanelProject from './componentsDashboard/CardPanelProject';
import _ChartBarDrawing from './componentsDashboard/_ChartBarDrawing';
import _ChartBarDrawingLate from './componentsDashboard/_ChartBarDrawingLate';
import _ChartBarStack from './componentsDashboard/_ChartBarStack';
import _ChartPieDrawing from './componentsDashboard/_ChartPieDrawing';
import _ChartProgress from './componentsDashboard/_ChartProgress';
import _FormPivot from './componentsDashboard/_FormPivot';
import _TableDrawingList from './componentsDashboard/_TableDrawingList';




const convertDataFromDB = (data, projectsArray) => {
    
    let output = {};

    data.forEach(projectData => {
        const { publicSettings: { headers }, rows, _id } = projectData;
        if (rows.length <= 20) return;
        
        let projectName = projectsArray.find(dt => dt.id === _id).name;

        let headersArr = headers.map(hd => hd.text);

        rows.forEach(r => {
            if (!r.Rev) r.Rev = '0';
            if (!r.Status) r.Status = 'Not Started';
        });

        const getUniqueValueByColumns = (rows, header) => {
            let valueArr = [];
            rows.forEach(row => valueArr.push(row[header]));
            return [...new Set(valueArr)];
        };
        let revArr = getUniqueValueByColumns(rows, 'Rev');
        let inputStack = getUniqueValueByColumns(rows, 'Status');
        let drawingCountSubStatus = [];
        let drawingListSubStatus = {};
        revArr.forEach(rev => {
            let rowsFilter = rows.filter(r => r['Rev'] === rev);
            let obj = {};
            let objDwgs = {};
            rowsFilter.forEach(r => {
                obj[r.Status] = (obj[r.Status] || 0) + 1;
                objDwgs[r.Status] = [...objDwgs[r.Status] || [], r];
            });
            obj.name = rev;
            drawingCountSubStatus.push(obj);
            drawingListSubStatus[rev] = objDwgs;
        });


        let drawingCountStatus = {};
        let drawingsListStatus = {};
        inputStack.forEach(stt => {
            let rrrArr = rows.filter(r => r.Status === stt);
            rrrArr.forEach(r => {
                drawingCountStatus[stt] = (drawingCountStatus[stt] || 0) + 1;
            });
            drawingsListStatus[stt] = rrrArr;
        });
        const dataPieChartStatus = Object.keys(drawingCountStatus).map(key => ({ name: key, value: drawingCountStatus[key] }));

        output[projectName] = {
            rowsAll: rows,
            drawingCountSubStatus,
            drawingListSubStatus,
            inputStack,
            headers: headersArr,
            drawingCountStatus,
            drawingsListStatus,
            dataPieChartStatus,
            projectsCount: data.length
        };
    });
    console.log(output);
    return output;
};


const PageDashboard = ({ projectsArray }) => {

    const [dataDB, setDataDB] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dummy, setDummy] = useState({});


    useEffect(() => {

        const loadData = async () => {
            setLoading(true);
            try {
                // const result = await Axios.post('https://bim.wohhup.com/api/smartsheet/get-sheets-dashboard', { listSheetId: [] });
                setDummy(dummyData);

                const resDB = await Axios.post(`${SERVER_URL}/sheet/find-many`, { sheetIds: projectsArray.map(x => x.id) });
                setDataDB(convertDataFromDB(resDB.data, projectsArray));

                setLoading(false);

            } catch (err) {
                console.log(err);
                setLoading(false);
            };
        };
        loadData();
        // loadRecords();

    }, []);



    const [_drawingTableVisible, set_DrawingTableVisible] = useState(false);
    const [_drawingTableData, set_DrawingTableData] = useState(null);
    const _openDrawingTable = (projectName, title, drawings, headers, columnsHeaderSorted, isSelectedShownOnly) => {
        set_DrawingTableData({ projectName, title, drawings, headers, columnsHeaderSorted, isSelectedShownOnly });
        set_DrawingTableVisible(true);
    };
    const _closeTableAndReset = () => {
        set_DrawingTableVisible(false);
        set_DrawingTableData(null);
    };



    return (

        <div style={{ marginTop: 60 }}>
            
            <Row justify='space-around' style={{ margin: '25px 0 5px 0' }}>
                {dataDB && Object.keys(dataDB).length > 1 && (
                    <>
                        <_ChartBarDrawingLate data={dummy.dummyLateConstruction} title='No Of Drawing Late Construction' />
                        <_ChartBarDrawingLate data={dataDB} title='No Of Drawing Late Approval' />
                        <_ChartBarStack data={dataDB} title='Drawing Status' />
                        <_ChartBarStack data={dummy.productivityDummy} title='Productivity - (days per drawing)' />
                    </>
                )}
            </Row>

            {!loading && dataDB ? (
                <div style={{ padding: '0 12px' }}>
                    {Object.keys(dataDB).map(projectName => {
                        return (
                            <CardPanelProject
                                title={projectName.toUpperCase()}
                                key={projectName}
                                projectsCount={dataDB[projectName].projectsCount}
                            >
                                <ChartPanel title='Overdue submissions'>
                                    <_ChartProgress
                                        data={dataDB[projectName]}
                                        openDrawingTable={_openDrawingTable}
                                        projectName={projectName}

                                    />
                                </ChartPanel>

                                <ChartPanel title='Drawing Status'>
                                    <_ChartPieDrawing
                                        data={dataDB[projectName]}
                                        openDrawingTable={_openDrawingTable}
                                        projectName={projectName}
                                    />
                                </ChartPanel>

                                <ChartPanel title='Nos of drawing per revision'>
                                    <_ChartBarDrawing
                                        data={dataDB[projectName]}
                                        openDrawingTable={_openDrawingTable}
                                        projectName={projectName}
                                    />
                                </ChartPanel>

                                <ChartPanel title='Sorted table by category'>
                                    <_FormPivot
                                        data={dataDB[projectName]}
                                        openDrawingTable={_openDrawingTable}
                                        projectName={projectName}
                                    />
                                </ChartPanel>

                            </CardPanelProject>
                        )
                    })}

                </div>
            ) : <SkeletonCard />}


            {_drawingTableData && (
                <Modal
                    title={_drawingTableData.projectName}
                    visible={_drawingTableVisible}
                    footer={false}
                    onCancel={_closeTableAndReset}
                    width={0.9 * window.innerWidth}
                    height={0.7 * window.innerHeight}
                    // centered={true}
                    style={{
                        // justifyContent: 'center',
                        // alignItems: 'center'
                    }}
                    bodyStyle={{
                        paddingTop: 10
                    }}
                >
                    <div style={{ display: 'flex' }}>
                        <h3 style={{ padding: '0 0 10px 0' }}>{_drawingTableData.title.type}</h3>
                        <Divider type='vertical' style={{ height: 25 }} />
                        <h3 style={{ padding: '0 10px' }}>{_drawingTableData.title.category}</h3>
                        <Divider type='vertical' style={{ height: 25 }} />
                        <h3 style={{ padding: '0 10px' }}>{_drawingTableData.drawings.length + ' drawings'}</h3>
                    </div>

                    <_TableDrawingList
                        data={_drawingTableData}
                        title={_drawingTableData.title}
                    />

                </Modal>
            )}


        </div>

    );
};

export default PageDashboard;




const ChartPanel = ({ title, children }) => {
    return (
        <Col style={{ marginBottom: 10 }} xs={24} md={12} xl={6}>
            <div style={{ fontSize: '18px', textAlign: 'center', fontWeight: 'bold' }}>{title}</div>
            {children}
        </Col>
    );
};


const SkeletonCard = () => {
    return (
        <div style={{ padding: '0 12px' }}>
            <CardPanelProject title='Project loading ...'>
                <div style={{ padding: '0 3px' }}>
                    <Skeleton paragraph={{ rows: 14 }} active />
                </div>
            </CardPanelProject>
        </div>
    );
};



const dummyData = {
    productivityDummy: {
        inputData: [
            {
                // 'Consultant review and reply': 4,
                // 'Create update drawing': 3,
                // 'Create update model': 7,
                // 'name': 'Sumang',
                'Consultant review and reply': 0,
                'Create update drawing': 0,
                'Create update model': 0,
                'name': '..'
            },
            {
                // 'Consultant review and reply': 5,
                // 'Create update drawing': 4,
                // 'Create update model': 6,
                // 'name': 'Handy',
                'Consultant review and reply': 0,
                'Create update drawing': 0,
                'Create update model': 0,
                'name': '.',
            }
        ],
        inputStack: ['Consultant review and reply', 'Create update drawing', 'Create update model']
    },
    dummyLateConstruction: [
        // { name: 'Handy', value: 6 },
        // { name: 'Sumang', value: 15 },
        { name: '.', value: 0 },
        { name: '..', value: 0 },
    ]
};