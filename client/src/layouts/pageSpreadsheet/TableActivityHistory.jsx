import { Button, Input } from 'antd';
import Axios from 'axios';
// import moment from 'moment';
import moment from 'moment';
import namor from 'namor';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertHistoryData, mongoObjectId } from '../../utils';
const SERVER_URL = 'http://localhost:9000/api';





const getRndDate = () => {
    let min = 0;
    let max = 1000000;
    return Math.floor(Math.random() * (max - min)) + min;
};



const Table = (props) => {
    return (
        <AutoResizer>
            {({ width, height }) => {
                return (
                    <BaseTable {...props} width={width - 100} height={height - 100} />
                );
            }}
        </AutoResizer>
    );
};



const TableActivityHistory = ({ width, height }) => {


    const {
        state: stateProject
    } = useContext(ProjectContext);

    const {
        state: stateRow
    } = useContext(RowContext);

    const projectId = stateProject.allDataOneSheet._id

    const headers = [
        'Drawing Number',
        'Drawing Name',
        'Column',
        'Value',
        'User',
        'Created At',
    ];


    useEffect(() => {

        const fetchProjectHistory = async () => {
            try {

                const res = await Axios.get(`${SERVER_URL}/cell/history/${projectId}`);

                console.log('HISTORY...', res.data);
                setHistoryData(res.data);
                

            } catch (err) {
                console.log(err);
            };
        };
        fetchProjectHistory();
    }, []);


    const [historyData, setHistoryData] = useState([]);
    
    const [data, setData] = useState([]);

    const [valueStart, setValueStart] = useState('12/01/20');
    const [valueEnd, setValueEnd] = useState('22/05/21');

    const onClick = () => {
        let start = moment(moment(valueStart,'DD/MM/YY').format('MM/DD/YY')).toDate();
        let end = moment(moment(valueEnd,'DD/MM/YY').format('MM/DD/YY')).toDate();

        if (start > end) return;

        let filterCells = convertHistoryData(historyData).filter(cell => {
            let createdAt = moment(cell.createdAt).toDate()
            return createdAt >= start && createdAt <= end;
        });
   
        setData(filterCells.map(cell => {
            let drawingData = getDrawingName(
                stateProject.allDataOneSheet.publicSettings.headers,
                stateRow.rowsAll,
                cell.row,
                cell.headerKey
            );
            let obj = {
                id: mongoObjectId(),
                'Drawing Name': drawingData.drawingName,
                'Drawing Number': drawingData.drawingNumber,
                Column: drawingData.headerText,
                Value: cell.text,
                'Created At': moment(cell.createdAt).format('DD/MM/YY HH:mm:ss'),
                User: cell.username
            };
            return obj;
        }));
        
    };


    return (
        <div style={{
            width,
            height,
        }}>
            <div style={{ display: 'flex' }}>
                <Input 
                    placeholder='From Date...' 
                    onChange={(e) => setValueStart(e.target.value)} 
                    value={valueStart} 
                    style={{width: 200}}
                />
                <Input 
                    placeholder='To Date...' 
                    onChange={(e) => setValueEnd(e.target.value)} 
                    value={valueEnd} 
                    style={{width: 200}}
                />
                <Button type='primary' onClick={onClick}>Check</Button>
            </div>
            <Table
                fixed
                columns={generateColumns(headers)}
                data={data}
                rowHeight={28}
            />
        </div>

    );
};

export default TableActivityHistory;


const getDrawingName = (headers, rowsAll, rowId, headerId) => {

    let row = rowsAll.find(r => r.id === rowId);
    let headerText = headers.find(hd => hd.key === headerId)['text'];

    return {
        headerText,
        drawingName: row['Drawing Name'],
        drawingNumber: row['Drawing Number'],
    }
};







const generateColumns = (headers) => headers.map((column, columnIndex) => ({

    key: column,
    dataKey: column,
    title: column,
    resizable: true,
    width: 150,
}));

const dummy = [
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'C', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Status', Value: 'Finish', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'A', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '20/01/20', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '19/09/20', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '20/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Start', Value: '20/06/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Finish', Value: '11/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Drawing', Value: '15/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: '0', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'C', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Status', Value: 'Finish', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'A', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '20/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Start', Value: '20/06/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Finish', Value: '11/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Drawing', Value: '15/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: '0', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'C', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Status', Value: 'Finish', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'A', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '20/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Start', Value: '20/06/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Finish', Value: '11/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Drawing', Value: '15/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: '0', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'C', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Status', Value: 'Finish', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: 'A', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '20/01/20', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '19/09/20', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Start', Value: '20/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Start', Value: '20/06/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Model Finish', Value: '11/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Drawing', Value: '15/05/21', 'Created At': getRndDate() },
    { id: mongoObjectId(), 'Drawing Number': namor.generate({ words: 0, numbers: 0 }), 'Column': 'Rev', Value: '0', 'Created At': getRndDate() },
];