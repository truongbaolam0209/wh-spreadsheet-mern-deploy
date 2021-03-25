import { Badge, Col, Modal, Row, Skeleton, Tabs } from 'antd';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { pieChartColors2, SERVER_URL } from './assets/constantDashboard';
import CardPanelProject from './componentsDashboard/CardPanelProject';
import ChartBarDrawing from './componentsDashboard/ChartBarDrawing';
import ChartBarDrawingLate from './componentsDashboard/ChartBarDrawingLate';
import ChartBarStack from './componentsDashboard/ChartBarStack';
import ChartPieDrawing from './componentsDashboard/ChartPieDrawing';
import ChartProgress from './componentsDashboard/ChartProgress';
import FormPivot from './componentsDashboard/FormPivot';
import TableDrawingList from './componentsDashboard/TableDrawingList';
import { convertDataFromDB, createDummyRecords, getRandomIntInclusive, inputStackData } from './utils/functionDashboard';


const { TabPane } = Tabs;



const createDummyProductivity = () => {
   const arr = Array.from(Array(20).keys());
   let obj = {};
   arr.forEach((item, i) => {
      obj[i] = {
         'Consultant review and reply': getRandomIntInclusive(3, 7),
         'Create update drawing': getRandomIntInclusive(3, 5),
         'Create update model': getRandomIntInclusive(2, 5),
      };
   });
   return obj;
};

const PageDashboard = ({ projectsArray, token }) => {

   const [dataDB, setDataDB] = useState(null);
   const [loading, setLoading] = useState(false);


   const dummyProductivity = createDummyProductivity();


   useEffect(() => {
      const loadData = async () => {
         setLoading(true);
         try {

            const resRows = await Axios.post(`${SERVER_URL}/row/history/find-row-histories-many-project`, { token, sheetIds: projectsArray.map(x => x.id) });
            const resDB = await Axios.post(`${SERVER_URL}/sheet/find-many`, { token, sheetIds: projectsArray.map(x => x.id) });


            setDataDB(convertDataFromDB(resDB.data, resRows.data, projectsArray));


            setLoading(false);
         } catch (err) {
            console.log(err);
            setLoading(false);
         };
      };
      loadData();
   }, []);


   const [drawingTableData, setDrawingTableData] = useState(null);
   const openDrawingTable = ({
      projectId,
      panel,
      type,
      category,
      categorySub1,
      isShowSelectedOnly,
      headersGroup,
      progressRows
   }) => {


      const project = dataDB.projectSplit.find(x => x.projectId === projectId);
      const { dataProject } = project;

      const { dataInfo } = dataProject.find(x => x.panel === panel);
      const { headers } = dataInfo;

      let dataTable;
      if (
         type === 'Bar Drawing Rev' ||
         type === 'Bar Drawing Modeller' ||
         type === 'Bar Drawing Coordinator' ||
         type === 'Bar Drawing Resubmit' ||
         type === 'Bar Drawing Trade'
      ) {
         if (categorySub1) {
            dataTable = dataInfo[type][category][categorySub1];
         } else {
            const allDrawingsInCategory = dataInfo[type][category];
            let arr = [];
            Object.keys(allDrawingsInCategory).forEach(stt => {
               arr = [...arr, ...allDrawingsInCategory[stt]];
            });
            dataTable = arr;
         };
      } else if (type === 'Pie Drawing Status') {
         dataTable = dataInfo[type][category];
      } else if (type === 'Pivot Table All') {
         dataTable = dataInfo.rows;
      } else if (type === 'Pivot Table Group') {
         dataTable = dataInfo.rows;
      } else if (type === 'Progress Late') {
         dataTable = progressRows;
      };


      setDrawingTableData({
         dataTable,
         headers,
         headersGroup: headersGroup || [],
         isShowSelectedOnly,
         tableInfo: {
            panel,
            type,
            category,
            categorySub1
         }
      });
   };

   const arrBreak = Array.from(Array(17).keys());

   return (
      <div style={{ marginTop: 10 }}>
         <Row justify='space-around' style={{ margin: '10px 0 5px 0' }}>
            {dataDB && dataDB.projectSplit.length > 1 && (
               <div style={{
                  padding: 15,
                  margin: 12,
                  boxShadow: '5px 15px 24px 5px #d2dae2',
                  border: 'none',
                  marginBottom: 15,
                  borderRadius: 20, overflow: 'hidden',
               }}>
                  <Tabs onChange={() => { }} type='card'>
                     {dataDB.projectComparison.map((item, i) => {
                        return (
                           <TabPane tab={item.name} key={item.name}>
                              <ChartBarDrawingLate data={item.data} title='No Of Drawing Late Construction' />
                              <ChartBarDrawingLate data={item.data} title='No Of Drawing Late Approval' />
                              <ChartBarStack data={item.data} title='Drawing Status' />
                              <ChartBarStack data={item.data} title='Productivity - (days per drawing)' dummyProductivity={dummyProductivity} />
                           </TabPane>
                        );
                     })}
                  </Tabs>
               </div>
            )}
         </Row>

         {!loading && dataDB ? (
            <div style={{ padding: '0 12px' }}>
               {dataDB.projectSplit.map(project => {
                  const { dataProject, projectName, projectId } = project;

                  let isProjectEmpty = false;
                  const overallFound = dataProject.find(x => x.panel === 'OVERALL');
                  const { dataInfo } = overallFound;
                  const rows = dataInfo && dataInfo.rows;
                  if (rows && rows.length === 0) isProjectEmpty = true;

                  return !isProjectEmpty && (

                     <CardPanelProject
                        title={projectName.toUpperCase()}
                        key={projectName}
                        projectsCount={dataDB.projectSplit.length}
                     >
                        <TabsStyled type='card'>
                           {dataProject.map(item => {

                              return (
                                 <TabPane tab={item.panel} key={item.panel}>

                                    <ChartProgress
                                       title='Overdue submissions'
                                       data={item}
                                       openDrawingTable={openDrawingTable}
                                       projectId={projectId}
                                    />

                                    <ChartBarDrawing
                                       title='No of drawing to resubmit'
                                       type='resubmit'
                                       data={item}
                                       openDrawingTable={openDrawingTable}
                                       projectId={projectId}
                                    />

                                    {window.innerWidth < 1200 && arrBreak.map((n, i) => <br key={i} />)}

                                    <ChartPieDrawing
                                       title='Drawing Status'
                                       data={item}
                                       openDrawingTable={openDrawingTable}
                                       projectId={projectId}
                                    />

                                    <ChartPanel title='Status Legend' panel={item.panel}>
                                       <div style={{ paddingTop: 25 }}>
                                          {inputStackData.map(item => (
                                             <div key={item} style={{ display: 'flex' }}>
                                                <StyledBadge
                                                   size='small'
                                                   color={pieChartColors2[item]}
                                                   text={item}
                                                />
                                             </div>
                                          ))}
                                       </div>
                                    </ChartPanel>


                                    {item.panel === 'OVERALL' && (
                                       <>
                                          {arrBreak.map((n, i) => <br key={i} />)}
                                          <ChartBarDrawing
                                             title='Status of drawing per trade'
                                             type='trade'
                                             data={item}
                                             openDrawingTable={openDrawingTable}
                                             projectId={projectId}
                                          />
                                       </>
                                    )}

                                    {(window.innerWidth < 1200 && item.panel !== 'OVERALL') && arrBreak.map((n, i) => <br key={i} />)}
                                    <ChartPanel title='Sorted table by category' panel={item.panel}>
                                       <FormPivot
                                          data={item}
                                          openDrawingTable={openDrawingTable}
                                          projectName={projectName}
                                          projectId={projectId}
                                          dataRecordedDummy={createDummyRecords()}
                                       />
                                    </ChartPanel>


                                    {item.panel !== 'OVERALL' && (
                                       <>
                                          {arrBreak.map((n, i) => <br key={i} />)}

                                          <ChartBarDrawing
                                             title='Status of drawing per revision'
                                             type='rev'
                                             data={item}
                                             openDrawingTable={openDrawingTable}
                                             projectId={projectId}
                                          />

                                          <ChartBarDrawing
                                             title='Drawing by modeller'
                                             type='modeller'
                                             data={item}
                                             openDrawingTable={openDrawingTable}
                                             projectId={projectId}
                                          />

                                          <ChartBarDrawing
                                             title='Drawing by coordinator'
                                             type='coordinator'
                                             data={item}
                                             openDrawingTable={openDrawingTable}
                                             projectId={projectId}
                                          />
                                       </>
                                    )}
                                 </TabPane>
                              )
                           })}
                        </TabsStyled>
                     </CardPanelProject>

                  );
               })}
            </div>

         ) : <SkeletonCard />}


         {drawingTableData && (
            <Modal
               title={'Drawing List'}
               visible={drawingTableData ? true : false}
               footer={false}
               onCancel={() => setDrawingTableData(null)}
               width={0.9 * window.innerWidth}
               // height={0.7 * window.innerHeight}
               bodyStyle={{ paddingTop: 0 }}
               style={{ paddingTop: 0, top: 30 }}
            >
               <TableDrawingList
                  data={drawingTableData}
               />
            </Modal>
         )}
      </div>
   );
};

export default PageDashboard;


const TabsStyled = styled(Tabs)`
   .ant-tabs-top-bar {
      margin-bottom: 5px;
   }
`;


export const ChartPanel = ({ title, children, panel }) => {

   const xl = panel !== 'OVERALL' ? (
      title === 'Overdue submissions'
         ? 4
         : title === 'Status Legend'
            ? 4
            : title === 'Sorted table by category' || title === 'Drawing Status'
               ? 5
               : title === 'No of drawing to resubmit'
                  ? 6
                  : 8
   ) : (
      title === 'Overdue submissions' ||
         title === 'Drawing Status' ||
         title === 'Status Legend' ||
         title === 'No of drawing to resubmit'
         ? 6
         : title === 'Status of drawing per trade'
            ? 10
            : 5
   );


   return (
      <Col style={{ marginBottom: 10, padding: 5 }} xs={24} md={12} xl={xl}>
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
const StyledBadge = styled(Badge)`
   .ant-badge-status-dot {
      width: 15px;
      height: 15px;
      border-radius: 0;
   }
`;








