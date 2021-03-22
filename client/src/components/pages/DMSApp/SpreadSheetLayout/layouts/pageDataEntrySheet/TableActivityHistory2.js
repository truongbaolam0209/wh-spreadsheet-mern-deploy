import { Modal } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertHistoryData, mongoObjectId } from '../../utils';
import ButtonStyle from '../generalComponents/ButtonStyle';
import FormFilterActivityHistory from '../generalComponents/FormFilterActivityHistory';
import IconTable from '../generalComponents/IconTable';
import PanelCalendarDuration from '../generalComponents/PanelCalendarDuration';





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

const TableActivityHistory2 = ({ cellsHistoryInCurrentSheet }) => {

    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateRow } = useContext(RowContext);
    const { allDataOneSheet: { publicSettings: { activityRecorded } } } = stateProject;


    const { projectId, token } = stateProject.allDataOneSheet;
    const { headers } = stateProject.allDataOneSheet.publicSettings;

    const [historyAll, setHistoryAll] = useState(null);
    const [historyAllInit, setHistoryAllInit] = useState(null);

    const headersShown = [
        'Column',
        'Value',
        'User',
        'Created At',
        'Action'
    ];


    // useEffect(() => {
    //    const fetchRowsAndCellHistory = async () => {
    //       try {
    //          const res = await Axios.get(`${SERVER_URL}/cell/history/`, { params: { token, projectId } });

    //          let cellsOutput = [];
    //          convertHistoryData(res.data).forEach(cell => {
    //             const row = stateRow.rowsAll.find(r => r.id === cell.row);
    //             if (row) cellsOutput.push({
    //                'Column': headers.find(hd => hd.key === cell.headerKey).text,
    //                'Value': cell.text || '',
    //                'User': cell.email || 'n/a',
    //                'Created At': moment(cell.createdAt).format('DD/MM/YY - HH:mm'),
    //                'Action': 'Edit Cell',
    //                id: mongoObjectId()
    //             });
    //          });
    //          const activityRecordedData = activityRecorded.map(r => {
    //             return {
    //                'Column': undefined,
    //                'Value': undefined,
    //                'User': r.email || 'n/a',
    //                'Created At': moment(r.createdAt).format('DD/MM/YY - HH:mm'),
    //                'Action': r.action,
    //                id: mongoObjectId()
    //             };
    //          });
    //          let outputArr = [...cellsOutput, ...activityRecordedData];

    //          setHistoryAll(sortDataBeforePrint(outputArr));
    //          setHistoryAllInit(sortDataBeforePrint(outputArr));

    //       } catch (err) {
    //          console.log(err);
    //       };
    //    };
    //    fetchRowsAndCellHistory();
    // }, []);



    useEffect(() => {
        let cellsOutput = [];
        convertHistoryData(cellsHistoryInCurrentSheet).forEach(cell => {
            const row = stateRow.rowsAll.find(r => r.id === cell.row);
            if (row) cellsOutput.push({
                'Column': headers.find(hd => hd.key === cell.headerKey).text,
                'Value': cell.text || '',
                'User': cell.email || 'n/a',
                'Created At': moment(cell.createdAt).format('DD/MM/YY - HH:mm'),
                'Action': 'Edit Cell',
                id: mongoObjectId()
            });
        });
        const activityRecordedData = activityRecorded.map(r => {
            return {
                'Column': undefined,
                'Value': undefined,
                'User': r.email || 'n/a',
                'Created At': moment(r.createdAt).format('DD/MM/YY - HH:mm'),
                'Action': r.action,
                id: mongoObjectId()
            };
        });
        let outputArr = [...cellsOutput, ...activityRecordedData];

        setHistoryAll(sortDataBeforePrint(outputArr));
        setHistoryAllInit(sortDataBeforePrint(outputArr));
    }, []);





    const [modalFilter, setModalFilter] = useState(false);

    const applyFilter = (data) => {
        setHistoryAll(data);
        setModalFilter(false);
    };

    const sortDataBeforePrint = (data) => {
        data.sort((b, a) => {
            let aa = moment(a['Created At'], 'DD/MM/YY - HH:mm').toDate();
            let bb = moment(b['Created At'], 'DD/MM/YY - HH:mm').toDate();
            return aa > bb ? 1 : bb > aa ? -1 : 0
        });

        data.forEach((dt, i) => {
            dt.index = i + 1;
        });

        return data;
    };


    const [dateRange, setDateRange] = useState(null);
    const onClick = () => {
        if (!dateRange) return;
        let newData = historyAll.filter(r => {
            let xxx = moment(r['Created At'], 'DD/MM/YY - HH:mm').toDate();
            return xxx <= dateRange[1] && xxx >= dateRange[0];
        });
        setHistoryAll(sortDataBeforePrint(newData));
    };
    const resetDataFilter = () => {
        setHistoryAll(sortDataBeforePrint(historyAllInit));
    };

    const checkDataWithinDays = (nos) => {
        const addDays = (date, days) => {
            let result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        let today = new Date();
        let dateBefore = addDays(today, nos);
        let newData = historyAllInit.filter(r => {
            let xxx = moment(r['Created At'], 'DD/MM/YY - HH:mm').toDate();
            return xxx <= today && xxx >= dateBefore;
        });
        setHistoryAll(sortDataBeforePrint(newData));
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
                    <div style={{ paddingBottom: 10, fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>ACTIVITY HISTORY</div>
                    <div style={{ display: 'flex', marginBottom: 10 }}>
                        <PanelCalendarDuration pickRangeDate={(e) => setDateRange(e)} />
                        <ButtonStyle
                            onClick={onClick}
                            marginLeft={5}
                            name='Check History'
                        />
                    </div>
                    <div style={{ display: 'flex', marginBottom: 10 }}>
                        <div style={{ marginRight: 10, display: 'flex' }}>
                            <IconTable type='filter' onClick={() => setModalFilter(true)} />
                            <IconTable type='swap' onClick={resetDataFilter} />
                        </div>

                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='Today'
                            onClick={() => checkDataWithinDays(-1)}
                        />
                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='Last 3 Days'
                            onClick={() => checkDataWithinDays(-3)}
                        />

                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='Last 7 Days'
                            onClick={() => checkDataWithinDays(-7)}
                        />
                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='Last 14 Days'
                            onClick={() => checkDataWithinDays(-14)}
                        />
                        <ButtonStyle
                            onClick={() => { }}
                            marginRight={5}
                            name='This Month'
                            onClick={() => checkDataWithinDays(-31)}
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

export default TableActivityHistory2;


const generateColumns = (headers) => {

    return [
        {
            key: 'index',
            dataKey: 'index',
            title: '',
            width: 70,
        },
        ...headers.map((column) => ({
            key: column,
            dataKey: column,
            title: column,
            resizable: true,
            width: 300,
        }))
    ];
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


   .BaseTable__row-cell-text {
      color: black
   }

   .BaseTable__table .BaseTable__body {
      /* -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none; */
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




