import { Badge, Divider, Icon } from 'antd';
import React from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import { colorType } from '../assets/constantDashboard';
import { recordDataToChartDaily, recordDataToChartMonthly, recordDataToChartWeekly } from '../utils/functionDashboard';


const ChartBarRecord = ({ data, category, closeChart, reportType, month }) => {


   return (
      <div style={{ position: 'relative' }}>

         <Icon
            style={{ position: 'absolute', right: 20, top: 10, fontSize: 20, cursor: 'pointer', color: colorType.grey1 }}
            type='close-circle'
            onClick={() => closeChart(category)}
         />

         <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{category}</div>

         <BarChart
            width={0.8 * window.innerWidth}
            height={200}
            data={
               reportType === 'Daily report' ? recordDataToChartDaily(data, category, month) :
                  reportType === 'Weekly report' ? recordDataToChartWeekly(data, category) :
                     recordDataToChartMonthly(data, category)
            }
            margin={{ top: 35, right: 30, left: 30, bottom: 50 }}
            padding={{ top: 15, right: 15, left: 15, bottom: 15 }}
            barSize={category === 'Drawing Approved For Construction' ? 0.6 * window.innerWidth / 70 : 0.9 * window.innerWidth / 70}
         >
            <XAxis
               textAnchor='end' angle={-45} interval={0} scale='point' padding={{ left: 30, right: 30 }}
               dataKey={
                  reportType === 'Daily report' ? 'date' :
                     reportType === 'Weekly report' ? 'week' :
                        'month'
               }
            />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray='3 3' />

            <Bar dataKey='value' fill={colorType.grey2} background={{ fill: '#eee' }} >
               <LabelList dataKey='value' position='top' />
            </Bar>

            {category === 'Drawing Approved For Construction' && (
               <Bar dataKey='target' fill={colorType.blue} background={{ fill: '#eee' }} >
                  <LabelList dataKey='target' position='top' />
               </Bar>
            )}
         </BarChart>
         {category === 'Drawing Approved For Construction' && (
            <div style={{ paddingLeft: 20, paddingBottom: 10 }}>
               <StyledBadge
                  size='small'
                  color={colorType.grey2}
                  text={'Actual'}
                  style={{ paddingRight: 20 }}
               />
               <StyledBadge
                  size='small'
                  color={colorType.blue}
                  text={'Target'}
               />
            </div>
         )}


         <Divider style={{ marginTop: 0 }} />
      </div>
   );
};

export default ChartBarRecord;


const StyledBadge = styled(Badge)`
   .ant-badge-status-dot {
      width: 15px;
      height: 15px;
      border-radius: 0;
   }
`;