import React from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { pieChartColors2 } from '../assets/constantDashboard';
import { ChartPanel } from '../PageDashboard';
import { inputStackData } from '../utils/functionDashboard';




const ChartPieDrawing = ({ data, openDrawingTable, projectId, title }) => {

   const { panel, dataInfo: { pieDrawingStatusCount } } = data;

   const getPieChartInput = (inputStackData, pieDrawingStatusCount) => {
      let dataChart = [];
      let statusCount = {};
      inputStackData.forEach(stt => {
         if (pieDrawingStatusCount[stt]) {
            dataChart.push({
               name: stt,
               value: pieDrawingStatusCount[stt]
            });
            statusCount[stt] = pieDrawingStatusCount[stt];
         };
      });
      return {
         dataChart,
         statusCount
      };
   };
   
   const { dataChart, statusCount } = getPieChartInput(inputStackData, pieDrawingStatusCount);

   
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
               <PieChart width={290} height={260} style={{ margin: '0 auto' }}>
                  <Pie
                     data={dataChart}
                     cx={140}
                     cy={130}
                     dataKey='value'
                     outerRadius={90}
                     onClick={onClick}
                     labelLine
                     label={<LabelCustom />}
                  >
                     {Object.keys(statusCount).map(item => {
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







