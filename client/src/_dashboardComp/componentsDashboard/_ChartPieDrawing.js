import { Badge } from 'antd';
import React from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import styled from 'styled-components';
import { pieChartColors2 } from '../assets/constantDashboard';
import { sortStatusOrder } from '../utils/functionDashboard';




const _ChartPieDrawing = ({ data, openDrawingTable, projectName }) => {

    const { 
        drawingCountStatus: drawingCount, 
        drawingsListStatus: drawingList, 
        dataPieChartStatus: dataChart,
        headers
    } = data;
    

    const onClick = (portion) => {
        openDrawingTable(
            projectName,
            { type: 'Drawing Status', category: portion.name },
            drawingList[portion.name],
            headers
        );
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
                    {Object.keys(drawingCount).map(item => (
                        <Cell
                            key={`cell-${item}`}
                            cursor='pointer'
                            fill={pieChartColors2[item]}
                        />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>

            <div style={{ margin: '0 auto', display: 'table' }}>
                {sortStatusOrder(Object.keys(drawingCount)).reverse().map(item => (
                    <div key={item} style={{ display: 'flex' }}>
                        <StyledBadge
                            size='small'
                            color={pieChartColors2[item]}
                            text={item}
                        />
                    </div>
                ))}
            </div>
        </>
    );
};

export default _ChartPieDrawing;



const StyledBadge = styled(Badge)`
    .ant-badge-status-dot {
        width: 15px;
        height: 15px;
        border-radius: 0;
    }
`;




