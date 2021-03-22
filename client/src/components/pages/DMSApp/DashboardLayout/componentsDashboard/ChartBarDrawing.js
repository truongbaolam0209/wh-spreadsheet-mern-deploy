import { Badge } from 'antd';
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import { pieChartColors2 } from '../assets/constantDashboard';
import { converToInputStack, sortStatusOrder } from '../utils/functionDashboard';




const ChartBarDrawing = ({ type, data, openDrawingTable, projectId }) => {

   const { panel, dataInfo } = data;

   const {
      barDrawingRevCount,
      barDrawingModellerCount,
      barDrawingCoordinatorCount,
      barDrawingResubmitCount,
      barDrawingTradeCount
   } = dataInfo;


   const barDrawingCount = type === 'rev' ? barDrawingRevCount :
      type === 'modeller' ? barDrawingModellerCount :
         type === 'coordinator' ? barDrawingCoordinatorCount :
            type === 'resubmit' ? barDrawingResubmitCount :
               type === 'trade' ? barDrawingTradeCount :
                  [];


   const inputStack = converToInputStack(barDrawingCount);

   const onClick = (portion, status) => {
      openDrawingTable({
         projectId,
         panel,
         type: type === 'rev' ? 'Bar Drawing Rev' :
            type === 'modeller' ? 'Bar Drawing Modeller' :
               type === 'coordinator' ? 'Bar Drawing Coordinator' :
                  type === 'resubmit' ? 'Bar Drawing Resubmit' :
                     type === 'trade' ? 'Bar Drawing Trade' : null,
         category: portion.name,
         categorySub1: status
      });
   };


   const onClickXAxis = ({ value }) => {
      openDrawingTable({
         projectId,
         panel,
         type: type === 'rev' ? 'Bar Drawing Rev' :
            type === 'modeller' ? 'Bar Drawing Modeller' :
               type === 'coordinator' ? 'Bar Drawing Coordinator' :
                  type === 'resubmit' ? 'Bar Drawing Resubmit' :
                     type === 'trade' ? 'Bar Drawing Trade' : null,
         category: value,
      });
   };


   const LabelCustomStacked = (props) => {
      const { x, y, value, height } = props;
      const fontSize = 13;
      return (
         <text
            style={{ fontSize: fontSize, boxShadow: '5px 15px 24px 5px black' }}
            x={x + 24}
            y={y + height / 2}
            fill='#2c3e50'
            dominantBaseline='central'
         >
            {/* {height + 3 < fontSize ? null : value} */}
            {null}
         </text>
      );
   };

   const LabelCustomStackedTotal = (props) => {
      const { x, y, value, topBar } = props;
      return (
         <>
            <text
               style={{ fontSize: 13, fontWeight: 'bold' }}
               x={x - 2}
               y={y - 10}
               fill='black'
               dominantBaseline='central'
            >
               {topBar ? value : null}
            </text>
         </>
      );
   };


   const [tooltip, setTooltip] = useState(false);
   const TooltipCustom = (props) => {
      const { active, payload } = props;
      if (!active || !tooltip) return null;
      for (const bar of payload)
         if (bar.dataKey === tooltip) {
            return (
               <div style={{
                  backgroundColor: 'white',
                  color: bar.fill,
                  fontSize: 14,
                  border: `1px solid ${bar.fill}`,
                  padding: '3px',
                  maxWidth: '170px'
               }}>
                  {bar.name}
                  <br />
                  <mark style={{ backgroundColor: bar.fill }}>({bar.value})</mark>
               </div>
            );
         };
      return null;
   };


   return (
      <div style={{
         margin: '0 auto', overflow: 'auto'
         // display: 'table', 
      }}>
         <BarChart
            width={type === 'resubmit' ? 400 : 480}
            height={type === 'resubmit' ? 300 : 350}
            data={barDrawingCount}
            margin={{ top: 35, right: 15, left: 0, bottom: 20 }}
            padding={{ top: 5 }}
            barSize={20}
         >
            <CartesianGrid strokeDasharray='3 3' />
            {type === 'rev' || type === 'resubmit' ? (
               <XAxis
                  style={{ cursor: 'pointer' }}
                  onClick={onClickXAxis}
                  tickSize={3} dataKey='name' textAnchor='middle' interval={0} scale='point'
                  padding={{ left: 20, right: 20 }}
               />
            ) : (
               <XAxis
                  style={{ cursor: 'pointer' }}
                  onClick={onClickXAxis}
                  fontSize={11} tickSize={3} dataKey='name' textAnchor='end' angle={-25} interval={0} scale='point'
                  padding={{ left: 20, right: 20 }}
               />
            )}

            <YAxis />
            <Tooltip content={<TooltipCustom />} />

            {sortStatusOrder(inputStack).reverse().map((item, i) => {
               return (
                  <Bar
                     style={{ cursor: 'pointer' }}
                     key={item}
                     dataKey={item}
                     stackId='a'
                     fill={pieChartColors2[item]}
                     isAnimationActive={false}
                     onClick={(e) => onClick(e, item)}
                     onMouseOver={() => setTooltip(item)}
                     label={<LabelCustomStackedTotal topBar={i === inputStack.length - 1} />}
                  >
                     <LabelList dataKey={item} position='left' content={<LabelCustomStacked item={item} />} />
                  </Bar>
               )
            })}

         </BarChart>

         {type === 'resubmit' && (
            <div style={{ transform: 'translateY(-15px)', display: 'flex' }}>
               <div style={{ marginRight: 10 }}>
                  <StyledBadge
                     size='small'
                     color={pieChartColors2['Reject, to resubmit']}
                     text={'Reject, to resubmit'}
                  />
               </div>

               <StyledBadge
                  size='small'
                  color={pieChartColors2['Approved in previous version but need resubmit']}
                  text={'Approved in previous version but need resubmit'}
               />
            </div>
         )}

      </div>
   );
};

export default ChartBarDrawing;

const StyledBadge = styled(Badge)`
    .ant-badge-status-dot {
        width: 15px;
        height: 15px;
        border-radius: 0;
    }
`;


