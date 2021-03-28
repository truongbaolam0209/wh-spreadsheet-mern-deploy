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
      drawingsLateConstruction
   } = dataInfo;


   const dataInput = [
      {
         name: `Drawing late start`,
         value: drawingsLateStart.length
      },
      {
         name: `Drawing late submission`,
         value: drawingsLateSubmission.length
      },
      {
         name: `Drawing late approval`,
         value: drawingsLateApproval.length
      },
      {
         name: `Late for construction`,
         value: drawingsLateConstruction.length
      }
   ];


   const progressBarClick = (name) => {
      let category;
      let progressRows;
      if (name.includes('Drawing late start')) {
         category = 'Drawing late start';
         progressRows = drawingsLateStart;
      } else if (name.includes('Drawing late submission')) {
         category = 'Drawing late submission';
         progressRows = drawingsLateSubmission;
      } else if (name.includes('Drawing late approval')) {
         category = 'Drawing late approval';
         progressRows = drawingsLateApproval;
      } else if (name.includes('Late for construction')) {
         category = 'Late for construction';
         progressRows = drawingsLateConstruction;
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
         <div style={{ width: '100%', margin: '20px auto' }}>

            {dataInput.map(item => (
               <Container key={item.name} onClick={() => progressBarClick(item.name)}>
                  <span>{item.name}: </span><span style={{ fontWeight: 'bold', color: '#b33939' }}>{item.value}</span><span>{`/${rows.length}`}</span>
                  <Progress
                     trailColor='#eee'
                     strokeColor={colorType.red}
                     percent={Math.round(item.value / rows.length * 100)}
                     style={{ paddingBottom: 15, paddingRight: 30 }}
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



