import { Button, Input } from 'antd';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertHistoryData, mongoObjectId } from '../../utils';



const Table = (props) => {
    return (
        <AutoResizer>
            {({ width, height }) => {
                return (
                    <BaseTable
                        {...props}
                        width={width}
                        height={height}
                    />
                );
            }}
        </AutoResizer>
    );
};

const panelWidth = window.innerWidth * 0.8;
const panelHeight = window.innerHeight * 0.8;

const TableActivityHistory = (props) => {

    const { rowData } = props;
    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateRow } = useContext(RowContext);

    const projectId = stateProject.allDataOneSheet.projectId;
    const headers = stateProject.allDataOneSheet.publicSettings.headers;

    const [historyAll, setHistoryAll] = useState(null);


    const headersShown = [
        'Drawing Number',
        'Drawing Name',
        'Column',
        'Value',
        'User',
        'Created At',
        'Action'
    ];

    useEffect(() => {
        const fetchRowsAndCellHistory = async () => {
            try {
                const resRows = await Axios.get(`${SERVER_URL}/row/history/${projectId}`);
                const resCells = await Axios.get(`${SERVER_URL}/cell/history/${projectId}`);
                // console.log(resRows.data, resCells.data);

                const rowsOutput = resRows.data.map(row => {
                    const { history } = row;
                    const revKey = headers.find(hd => hd.text === 'Rev').key;
                    const statusKey = headers.find(hd => hd.text === 'Status').key;
                    const dwgNumber = headers.find(hd => hd.text === 'Drawing Number').key;
                    const dwgName = headers.find(hd => hd.text === 'Drawing Name').key;

                    return {
                        'Drawing Number': history[dwgNumber],
                        'Drawing Name': history[dwgName],
                        'Column': 'Rev & Status',
                        'Value': `${history[revKey]} - ${history[statusKey]}`,
                        'User': row.username || 'n/a',
                        'Created At': row.createdAt,
                        'Action': 'Save Drawing Version',
                        id: mongoObjectId()
                    }
                });

                const cellsOutput = convertHistoryData(resCells.data).map(cell => {

                    const row = stateRow.rowsAll.find(r => r.id === cell.row);

                    return {
                        'Drawing Number': row['Drawing Number'],
                        'Drawing Name': row['Drawing Name'],
                        'Column': headers.find(hd => hd.key === cell.headerKey).text,
                        'Value': cell.text,
                        'User': cell.username || 'n/a',
                        'Created At': cell.createdAt,
                        'Action': 'Edit Cell',
                        id: mongoObjectId()
                    };
                });

                const dummy = [
                    {
                        'Drawing Number': 'HAN_WH_A_CS_KP_01S_01',
                        'Drawing Name': 'Level 2 Column and Wall Setting Out Keyplan',
                        'User': 'user...',
                        'Created At': '12/11/2020',
                        'Action': 'Delete Drawing',
                        id: mongoObjectId()
                    },
                    {
                        'Drawing Number': 'HAN_WH_A_CS_KP_01S_34',
                        'Drawing Name': 'Level 8 Column and Wall',
                        'User': 'user...',
                        'Created At': '13/10/2020',
                        'Action': 'Delete Drawing',
                        id: mongoObjectId()
                    },
                ];


                let outputArr = [...rowsOutput, ...dummy, ...cellsOutput].sort((b, a) => a['Created At'] > b['Created At'] ? 1 : b['Created At'] > a['Created At'] ? -1 : 0);

                setHistoryAll(outputArr);

            } catch (err) {
                console.log(err);
            };
        };
        fetchRowsAndCellHistory();
    }, []);


    const [historyData, setHistoryData] = useState([]);

    const [data, setData] = useState([]);

    const [valueStart, setValueStart] = useState('12/01/20');
    const [valueEnd, setValueEnd] = useState('22/05/21');

    const onClick = () => {
        // let start = moment(moment(valueStart,'DD/MM/YY').format('MM/DD/YY')).toDate();
        // let end = moment(moment(valueEnd,'DD/MM/YY').format('MM/DD/YY')).toDate();

        // if (start > end) return;

        // let filterCells = convertHistoryData(historyData).filter(cell => {
        //     let createdAt = moment(cell.createdAt).toDate()
        //     return createdAt >= start && createdAt <= end;
        // });

        // setData(filterCells.map(cell => {
        //     let drawingData = getDrawingName(
        //         stateProject.allDataOneSheet.publicSettings.headers,
        //         stateRow.rowsAll,
        //         cell.row,
        //         cell.headerKey
        //     );
        //     let obj = {
        //         id: mongoObjectId(),
        //         'Drawing Name': drawingData.drawingName,
        //         'Drawing Number': drawingData.drawingNumber,
        //         Column: drawingData.headerText,
        //         Value: cell.text,
        //         'Created At': moment(cell.createdAt).format('DD/MM/YY HH:mm:ss'),
        //         User: cell.username
        //     };
        //     return obj;
        // }));

    };



    return (
        <>
            {historyAll && (
                <div style={{
                    height: panelHeight,
                    background: 'white',
                    padding: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>
                    <div style={{ display: 'flex', marginBottom: 10 }}>
                        <Input
                            placeholder='From Date...'
                            onChange={(e) => setValueStart(e.target.value)}
                            value={valueStart}
                            style={{}}
                        />
                        <Input
                            placeholder='To Date...'
                            onChange={(e) => setValueEnd(e.target.value)}
                            value={valueEnd}
                            style={{}}
                        />
                        <Button type='primary' onClick={onClick}>Check</Button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, width: '35%' }}>
                        <Button>Last 7 Days</Button>
                        <Button>Last 14 Days</Button>
                        <Button>This Month</Button>
                    </div>

                    <div style={{
                        width: panelWidth,
                        height: '100%',
                        margin: '0 auto',
                        textAlign: 'center'
                    }}>
                        <TableStyled
                            fixed
                            columns={generateColumns(headersShown)}
                            data={historyAll}
                            rowHeight={28}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default TableActivityHistory;


const generateColumns = (headers) => headers.map((column, columnIndex) => ({

    key: column,
    dataKey: column,
    title: column,
    resizable: true,
    width: getHeaderWidth2(column),
}));
const getHeaderWidth2 = (header) => {
    if (header === 'Drawing Number') return 300;
    if (header === 'Drawing Name') return 300;
    if (header === 'Column') return 200;
    if (header === 'Value') return 300;
    if (header === 'User') return 200;
    if (header === 'Created At') return 200;
    if (header === 'Action') return 200;
};
const getHeadersText = (headersData) => {
    return headersData.map(hd => {
        return hd.text;
    });
};

const getDrawingName = (headers, rowsAll, rowId, headerId) => {

    let row = rowsAll.find(r => r.id === rowId);
    let headerText = headers.find(hd => hd.key === headerId)['text'];

    return {
        headerText,
        drawingName: row['Drawing Name'],
        drawingNumber: row['Drawing Number'],
    }
};


const TableStyled = styled(Table)`

    .BaseTable__table .BaseTable__body {

        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        ::-webkit-scrollbar {
            -webkit-appearance: none;
            background-color: #e3e3e3;
        }

        ::-webkit-scrollbar:vertical {
            width: 15px;
        }

        ::-webkit-scrollbar:horizontal {
            height: 15px;
        }

        ::-webkit-scrollbar-thumb {
            border-radius: 10px;
            border: 2px solid #e3e3e3;
            background-color: #999;

            &:hover {
                background-color: #666;
            }
        }

        ::-webkit-resizer {
            display: none;
        }

        .BaseTable__row-cell-text {
            color: black
        }
    }

    .BaseTable__header-cell {
        padding: 10px;
        border-right: 1px solid #DCDCDC;

        background: ${colorType.grey1};
        color: black
    }

    .BaseTable__row-cell {
        padding: 10px;
        border-right: 1px solid #DCDCDC;

        overflow: visible !important;
    }




`;




