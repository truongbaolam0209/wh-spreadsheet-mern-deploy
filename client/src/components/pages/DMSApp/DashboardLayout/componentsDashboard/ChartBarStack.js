import { Badge, Skeleton } from 'antd';
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import { chartWidth, colorType, pieChartColors2 } from '../assets/constantDashboard';
import { inputStackData } from '../utils/functionDashboard';
import CardPanel from './CardPanel';



const getInputData = (data, title, dummyProductivity) => {
   if (!data) return {};
   if (title === 'Drawing Status') {
      return data.map(project => {
         return {
            name: project.projectName,
            ...project.compareDrawingStatus
         };
      })
   } else if (title === 'Productivity - (days per drawing)' && dummyProductivity) {

      return data.map((project, i) => {
         return {
            name: project.projectName,
            'Consultant review and reply': dummyProductivity[i]['Consultant review and reply'],
            'Create update drawing': dummyProductivity[i]['Create update drawing'],
            'Create update model': dummyProductivity[i]['Create update model'],
         };
      })
   };
};

const ChartBarStack = ({ data, title, dummyProductivity }) => {

   let inputData = getInputData(data, title, dummyProductivity);

   let inputStack = title === 'Drawing Status' ? inputStackData :
      title === 'Productivity - (days per drawing)' ? [
         'Consultant review and reply',
         'Create update drawing',
         'Create update model'
      ] : null;



   const LabelCustomStacked = (props) => {

      const { x, y, value, height, title } = props;
      const fontSize = 13;
      return (
         <text
            style={{
               fontSize,
               boxShadow: '5px 15px 24px 5px black',
               fontWeight: title === 'Drawing Status' ? 'normal' : 'bold'
            }}
            x={title === 'Drawing Status' ? (x + 32) : x + 4}
            y={title === 'Drawing Status' ? (y + height / 2) : (y - 8)}
            fill='#2c3e50'
            dominantBaseline='central'
         >
            {/* {title === 'Drawing Status' ? (height + 3 < fontSize ? null : value) : value} */}
            {title === 'Drawing Status' ? null : value}
         </text>
      );
   };

   const LabelCustomStackedTotal = (props) => {
      const { x, y, value, topBar, title } = props;

      return (
         <text
            style={{ fontSize: 13, fontWeight: 'bold' }}
            x={x}
            y={y - 10}
            fill='black'
            dominantBaseline='central'
         >
            {title !== 'Drawing Status' ? null : (topBar ? value : null)}
         </text>
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
                  <mark style={{ backgroundColor: bar.fill }}>
                     ({bar.value})
                        </mark>
               </div>
            );
         };
      return null;
   };


   const totalHeight = 552;
   const chartHeight = 320;


   return (
      <CardPanel
         title={title}
         headColor={colorType.orange}
      >
         {data ? (
            <>
               <BarChart
                  data={inputData}
                  width={chartWidth}
                  height={chartHeight}
                  margin={{ top: 35, right: 20, left: 15, bottom: 60 }}
                  padding={{ top: 10 }}
                  barSize={title === 'Drawing Status' ? 17 : 9}
               >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis tickSize={3} dataKey='name' textAnchor='end' angle={-25} interval={0} scale='point' padding={{ left: 50, right: 50 }} />
                  <YAxis />
                  <Tooltip content={<TooltipCustom />} />

                  {inputStack.reverse().map((item, i) => {
                     return (
                        <Bar
                           key={item}
                           dataKey={item}
                           stackId={title === 'Drawing Status' ? 'a' : null}
                           fill={pieChartColors2[item]}
                           isAnimationActive={false}
                           onMouseOver={() => setTooltip(item)}
                           label={<LabelCustomStackedTotal topBar={i === inputStack.length - 1} title={title} />}
                        >
                           <LabelList dataKey={item} position='left' content={<LabelCustomStacked item={item} title={title} />} />
                        </Bar>
                     );
                  })}

               </BarChart>

               <div style={{ paddingLeft: 20, height: totalHeight - chartHeight }}>

                  {inputStack.reverse().map((key, i) => (
                     <div key={key} style={{ display: 'flex' }}>
                        <StyledBadge
                           size='small'
                           color={pieChartColors2[key]}
                           text={key}
                        />
                     </div>
                  ))}

               </div>
            </>
         ) : (
            <div style={{ padding: '0 20px' }}>
               <Skeleton paragraph={{ rows: 14 }} active />
            </div>
         )}

      </CardPanel>
   );
};

export default ChartBarStack;


const StyledBadge = styled(Badge)`
    .ant-badge-status-dot {
        width: 15px;
        height: 15px;
        border-radius: 0;
    }
`;