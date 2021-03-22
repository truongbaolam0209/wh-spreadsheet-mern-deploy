import React from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { pieChartColors2 } from '../assets/constantDashboard';
import { ChartPanel } from '../PageDashboard';




const ChartPieDrawing = ({ data, openDrawingTable, projectId, title }) => {

   const { panel, dataInfo: { pieDrawingStatusCount } } = data;

   const dataChart = Object.keys(pieDrawingStatusCount).map(key => {
      return {
         name: key,
         value: pieDrawingStatusCount[key]
      };
   });


   const onClick = (portion) => {
      openDrawingTable({
         projectId,
         panel,
         type: 'Pie Drawing Status',
         category: portion.name,
      });
   };


   const LabelCustom = (props) => {

      const { cx, cy, midAngle, innerRadius, outerRadius, value } = props;
      const RADIAN = Math.PI / 180;
      const radius = 28 + innerRadius + (outerRadius - innerRadius);
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
         <text
            x={x}
            y={y}
            fill='black'
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline='central'
         >
            {value}
         </text>
      );
   };


   return (
      <>
         {dataChart.length > 0 && (
            <ChartPanel title={title} panel={panel}>
               <PieChart width={300} height={300} style={{ margin: '0 auto' }}>
                  <Pie
                     data={dataChart}
                     cx={150}
                     cy={150}
                     dataKey='value'
                     outerRadius={100}
                     onClick={onClick}
                     labelLine
                     label={<LabelCustom />}
                  >
                     {Object.keys(pieDrawingStatusCount).map(item => {
                        return (
                           <Cell
                              key={`cell-${item}`}
                              cursor='pointer'
                              fill={pieChartColors2[item]}
                           />
                        )
                     })}
                  </Pie>
                  <Tooltip />
               </PieChart>
            </ChartPanel>
         )}
      </>
   );
};

export default ChartPieDrawing;







