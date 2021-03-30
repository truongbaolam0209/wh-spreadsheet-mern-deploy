import { Modal, Progress } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../assets/constantDashboard';
import { ChartPanel } from '../PageDashboard';


const ChartProgress = ({ data, openDrawingTable, projectId, title }) => {

   const { panel, dataInfo } = data;

   const {
      rows,
      drawingsLateSubmission,
      drawingsLateApproval,
      drawingsLateStart,
      drawingsLateConstruction,
      rowsToSubmitTargetWeek,
      rowsToSubmitActualWeek,
      rowsToSubmitTargetMonth,
      rowsToSubmitActualMonth,
   } = dataInfo;


   const dataInput = [
      {
         name: 'Drawings to submit (week)',
         value: rowsToSubmitActualWeek.length
      },
      {
         name: 'Drawings to submit (month)',
         value: rowsToSubmitActualMonth.length
      },
      // {
      //    name: 'Drawings late start',
      //    value: drawingsLateStart.length
      // },
      {
         name: 'Late submission',
         value: drawingsLateSubmission.length
      },
      {
         name: 'Late approval',
         value: drawingsLateApproval.length
      },
      {
         name: 'Late for construction',
         value: drawingsLateConstruction.length
      }
   ];


   const progressBarClick = (name) => {
      let category;
      let progressRows;
      if (name.includes('Drawings late start')) {
         category = 'Drawings late start';
         progressRows = drawingsLateStart;
      } else if (name.includes('Late submission')) {
         category = 'Late submission';
         progressRows = drawingsLateSubmission;
      } else if (name.includes('Late approval')) {
         category = 'Late approval';
         progressRows = drawingsLateApproval;
      } else if (name.includes('Late for construction')) {
         category = 'Late for construction';
         progressRows = drawingsLateConstruction;
      } else if (name.includes('Drawings to submit (week)')) {
         category = 'Drawings to submit (week)';
         progressRows = rowsToSubmitTargetWeek;
      } else if (name.includes('Drawings to submit (month)')) {
         category = 'Drawings to submit (month)';
         progressRows = rowsToSubmitTargetMonth;
      };

      openDrawingTable({
         projectId,
         type: 'Progress Late',
         panel,
         category,
         progressRows
      });
   };

   const [modalShown, setModalShown] = useState(false);
   const drawingStatusTableOnClose = () => {
      setModalShown(false);
   };



   return (
      <ChartPanel title={title} panel={panel}>
         <div style={{ width: '100%', margin: '5px auto' }}>

            {dataInput.map(item => (
               <Container key={item.name} onClick={() => progressBarClick(item.name)}>

                  <span>{item.name} : </span>
                  <span style={{ fontWeight: 'bold', color: '#b33939' }}>{item.value}</span>
                  <span>/</span>
                  <span style={{ fontWeight: 'bold' }}>
                     {`${item.name === 'Drawings to submit (week)'
                        ? rowsToSubmitTargetWeek.length
                        : item.name === 'Drawings to submit (month)'
                           ? rowsToSubmitTargetMonth.length
                           : rows.length}`}
                  </span>

                  <ProgressStyled
                     trailColor='#eee'
                     strokeColor={colorType.red}
                     style={{ paddingBottom: 10, paddingRight: 30 }}
                     percent={Math.round(
                        item.value /
                        (item.name === 'Drawings to submit (week)'
                           ? rowsToSubmitTargetWeek.length
                           : item.name === 'Drawings to submit (month)'
                              ? rowsToSubmitTargetMonth.length
                              : rows.length)
                        * 100)}
                     // format={e => `${e}%`}
                     format={e => null}
                  />
               </Container>
            ))}
         </div>


         <Modal
            title={'xxx'}
            centered
            visible={modalShown}
            onOk={drawingStatusTableOnClose}
            onCancel={drawingStatusTableOnClose}
         >
            <h1>{`Total drawing x}`}</h1>
            <h2>{`Overdue date of approval x`}</h2>
         </Modal>
      </ChartPanel>

   );
};

export default ChartProgress;

const Container = styled.div`
   :hover {
      cursor: pointer;
      /* span {
         color: #b33939;
         font-weight: bold;
      } */
   }
   padding-left: 0;
`;

const ProgressStyled = styled(Progress)`
   .ant-progress .ant-progress-line .ant-progress-status-normal .ant-progress-show-info {
      padding-bottom: 0;
      margin: 0;
   }

`;


