import { Modal, Progress } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../assets/constantDashboard';


const ChartProgress = ({ data, openDrawingTable, projectId }) => {

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
         name: `Drawing late start ${drawingsLateStart.length}/${rows.length}`,
         value: drawingsLateStart.length
      },
      {
         name: `Drawing late submission ${drawingsLateSubmission.length}/${rows.length}`,
         value: drawingsLateSubmission.length
      },
      {
         name: `Drawing late approval ${drawingsLateApproval.length}/${rows.length}`,
         value: drawingsLateApproval.length
      },
      {
         name: `Late for construction ${drawingsLateConstruction.length}/${rows.length}`,
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
      <>
         <div style={{ width: '80%', margin: '25px auto' }}>

            {dataInput.map(item => (
               <Container key={item.name} onClick={() => progressBarClick(item.name)}>
                  <span>{item.name}</span>
                  <Progress
                     trailColor='#eee'
                     strokeColor={colorType.red}
                     percent={Math.round(item.value / rows.length * 100)}
                     style={{ paddingBottom: 29 }}
                     format={e => `${e}%`}
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
      </>

   );
};

export default ChartProgress;

const Container = styled.div`
   :hover {
      cursor: pointer;
      span {
         color: #b33939;
         font-weight: bold;
      }
   }
`;



