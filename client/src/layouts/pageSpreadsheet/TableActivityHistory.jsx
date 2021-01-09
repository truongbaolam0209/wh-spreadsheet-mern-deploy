import { Modal } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType, SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertHistoryData, mongoObjectId } from '../../utils';
import ButtonStyle from './ButtonStyle';
import FormFilterActivityHistory from './FormFilterActivityHistory';
import IconTable from './IconTable';
import PanelCalendarDuration from './PanelCalendarDuration';

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

    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateRow } = useContext(RowContext);
    const { allDataOneSheet: { publicSettings: { activityRecorded } } } = stateProject;



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

    const revKey = headers.find(hd => hd.text === 'Rev').key;
    const statusKey = headers.find(hd => hd.text === 'Status').key;
    const dwgNumber = headers.find(hd => hd.text === 'Drawing Number').key;
    const dwgName = headers.find(hd => hd.text === 'Drawing Name').key;

    useEffect(() => {
        const fetchRowsAndCellHistory = async () => {
            try {
                const resRows = await Axios.get(`${SERVER_URL}/row/history/${projectId}`);
                const resCells = await Axios.get(`${SERVER_URL}/cell/history/${projectId}`);

                let rowsOutput = [];
                resRows.data.forEach(row => {
                    const { history } = row;
                    if (history) rowsOutput.push({
                        'Drawing Number': history[dwgNumber],
                        'Drawing Name': history[dwgName],
                        'Column': 'Rev & Status',
                        'Value': `${history[revKey]} - ${history[statusKey]}`,
                        'User': row.userId || 'n/a',
                        'Created At': moment(row.createdAt).format('DD/MM/YY - HH:mm'),
                        'Action': 'Save Drawing Version',
                        id: mongoObjectId()
                    });
                });

                let cellsOutput = [];
                convertHistoryData(resCells.data).forEach(cell => {
                    const row = stateRow.rowsAll.find(r => r.id === cell.row);
                    if (row) cellsOutput.push({
                        'Drawing Number': row['Drawing Number'],
                        'Drawing Name': row['Drawing Name'],
                        'Column': headers.find(hd => hd.key === cell.headerKey).text,
                        'Value': cell.text,
                        'User': cell.userId || 'n/a',
                        'Created At': moment(cell.createdAt).format('DD/MM/YY - HH:mm'),
                        'Action': 'Edit Cell',
                        id: mongoObjectId()
                    });
                });

                const activityRecordedData = activityRecorded.map(r => {
                    return {
                        'Drawing Number': r[dwgNumber],
                        'Drawing Name': r[dwgName],
                        'Column': undefined,
                        'Value': undefined,
                        'User': r.email || 'n/a',
                        'Created At': moment(r.createdAt).format('DD/MM/YY - HH:mm'),
                        'Action': r.action,
                        id: mongoObjectId()
                    };
                });
                let outputArr = [...rowsOutput, ...cellsOutput, ...activityRecordedData].sort((b, a) => a['Created At'] > b['Created At'] ? 1 : b['Created At'] > a['Created At'] ? -1 : 0);

                setHistoryAll(outputArr);

            } catch (err) {
                console.log(err);
            };
        };
        fetchRowsAndCellHistory();
    }, []);



    const [modalFilter, setModalFilter] = useState(false);

    const applyFilter = (data) => {
        setHistoryAll(data);
        setModalFilter(false);
    };


    const onClick = () => {
  

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
                        <PanelCalendarDuration />
                        <ButtonStyle
                            onClick={onClick}
                            marginLeft={5}
                            name='Check History'
                        />
                    </div>
                    <div style={{ display: 'flex', marginBottom: 10 }}>
                        <div style={{ marginRight: 10, display: 'flex' }}>
                            <IconTable type='filter' onClick={() => setModalFilter(true)} />
                            <IconTable type='rollback' onClick={() => {}} />
                        </div>

                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='Last 7 Days'
                        />
                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='Last 14 Days'
                        />
                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='This Month'
                        />
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

            {modalFilter && (
                <ModalStyledSetting
                    title='Filter Data Activity History'
                    visible={modalFilter}
                    footer={null}
                    onCancel={() => {
                        setModalFilter(false);
                    }}
                    destroyOnClose={true}
                    centered={true}
                >
                    <FormFilterActivityHistory
                        applyFilter={applyFilter}
                        onClickCancelModal={() => setModalFilter(false)}
                        rowsAll={historyAll}
                        headers={headersShown}
                    />
                </ModalStyledSetting>
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

const ModalStyledSetting = styled(Modal)`
    .ant-modal-content {
        border-radius: 0;
    }
   .ant-modal-close {
      display: none;
   }
   .ant-modal-header {
      padding: 10px;
   }
   .ant-modal-title {
        padding-left: 10px;
        font-size: 20px;
        font-weight: bold;
   }
   .ant-modal-body {
      padding: 0;
      display: flex;
      justify-content: center;
   }
`;
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




