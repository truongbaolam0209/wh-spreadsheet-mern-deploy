import { Table } from 'antd';
import React from 'react';
import styled from 'styled-components';


const TableDrawingDetail = (props) => {

    console.log(props);


    const { rowData } = props;

    let data = [];
    for (let key = 0; key < 3; key++) {
        data.push({ 
            ...rowData, 
            key,
            Rev: key === 0 ? '0' : key === 1 ? 'A' : 'B',
            ...oldRevisionDrawingData
        });
    };



    const convertColumns = (data) => {
        const dt = data[0];
        let columns = [];
        Object.keys(dt).forEach(key => {
            columns.push({
                title: key,
                dataIndex: key,
                render: args => (
                    <span>
                        {args}
                    </span>
                )
            });
        });
        return columns;
    };

    return (
        <div>
            <div style={{ overflow: 'auto' }}>
                <div style={{ width: 5000, padding: 0 }}>
                    <TableStyled
                        columns={convertColumns(data)}
                        dataSource={data} 
                        size='small'
                        bordered={true}
                    />
                </div>
            </div>

            <div style={{ width: '100%' }}>
                <img src='./img/timeline.JPG' alt='visualize' height='430' />
            </div>

        </div>

    );
};

export default TableDrawingDetail;


const TableStyled = styled(Table)`

   td {
      /* height: 15px; */
      padding: 0px;
      margin: 0px;
      /* background-color: red; */
   }


`;



const oldRevisionDrawingData = {
    'Model Start (A)': '02/12/20',
    'Model Finish (T)': '05/10/20',
    'Model Finish (A)': '06/12/20',
    'Model Progress': '',
    'Drawing Start (T)': '02/10/20',
    'Drawing Start (A)': '05/12/20',
    'Drawing Finish (T)': '13/12/20',
    'Drawing Finish (A)': '04/10/20',
    'Drawing Progress': '',
    'Drg To Consultant (T)': '11/10/20',
    'Drg To Consultant (A)': '12/06/20',
    'Consultant Reply (T)': '28/07/20',
    'Consultant Reply (A)': '11/09/20',
    'Get Approval (T)': '11/08/20',
    'Get Approval (A)': '15/09/20',
    'Construction Issuance Date': '12/12/20',
    'Construction Start': '02/12/20',
}