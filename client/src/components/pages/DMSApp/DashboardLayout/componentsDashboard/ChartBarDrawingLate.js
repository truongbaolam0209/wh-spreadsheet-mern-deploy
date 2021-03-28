import { Badge, Skeleton } from 'antd';
import React from 'react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import { chartWidth, colorType, sizeType } from '../assets/constantDashboard';
import CardPanel from './CardPanel';


const drawingLateInputChart = (data, title) => {
   if (!data) return {};
   if (title === 'No Of Drawing Late Approval') {
      return data.map(project => {
         return {
            name: project.projectName,
            value: project.compareDrawingsLateApproval
         };
      });
   } else if (title === 'No Of Drawing Late Construction') {
      return data.map(project => {
         return {
            name: project.projectName,
            value: project.compareDrawingsLateConstruction
         };
      });
   };
};


const ChartBarDrawingLate = ({ data, title }) => {


   const inputData = drawingLateInputChart(data, title);

   const LabelCustomStackedTotal = (props) => {
      const { x, y, value } = props;
      return (
         <>
            <text
               style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}
               x={x - 2}
               y={y - 10}
               fill='black'
               dominantBaseline='central'
            >
               {value}
            </text>
         </>
      );
   };

   const totalHeight = 552;
   const chartHeight = 320;


   return (

      <CardPanel
         title={title}
         headColor={colorType.red}
      >
         {data ? (
            <>
               <BarChart
                  data={inputData}
                  width={chartWidth}
                  height={chartHeight}
                  margin={{ top: 35, right: 20, left: 15, bottom: 60 }}
                  padding={{ top: 10 }}
                  barSize={17}
               >
                  <XAxis dataKey='name' textAnchor='end' angle={-25} interval={0} scale='point' padding={{ left: 50, right: 50 }} />
                  <YAxis />
                  <Tooltip />
                  <CartesianGrid strokeDasharray='3 3' />
                  <Bar
                     dataKey='value'
                     fill={colorType.red}
                     background={{ fill: '#eee' }}
                     isAnimationActive={false}
                     label={<LabelCustomStackedTotal />}
                  />
               </BarChart>

               <div style={{ paddingLeft: 20, height: window.innerWidth >= sizeType.xl && (totalHeight - chartHeight) }}>
                  {inputData.map(item => (
                     <div key={item.name} style={{ display: 'flex' }}>
                        <StyledBadge
                           size='small'
                           color={colorType.red}
                           text={item.name}
                        />
                        <span style={{ paddingLeft: 5 }}>{`- (${item.value})`}</span>
                     </div>
                  ))}
               </div>



            </>
         ) : (
            <div style={{ padding: '0 20px' }}>
               <Skeleton paragraph={{ rows: 14 }} active />
            </div>
         )
         }

      </CardPanel>
   );
};

export default ChartBarDrawingLate;


const StyledBadge = styled(Badge)`
    .ant-badge-status-dot {
        width: 15px;
        height: 15px;
        border-radius: 0;
    }
`;


