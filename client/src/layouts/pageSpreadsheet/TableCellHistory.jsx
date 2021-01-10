import { List } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';



const TableCellHistory = (props) => {

    const { rowData, column } = props;

    const {
        state: stateProject
    } = useContext(ProjectContext);

    const {
        state: stateRow
    } = useContext(RowContext);

    const projectId = stateProject.allDataOneSheet.projectId;
    const headers = stateProject.allDataOneSheet.publicSettings.headers;
    const headerKey = headers.find(hd => hd.text === column.key).key;


    const [history, setHistory] = useState()

    useEffect(() => {
        const fetchCellHistory = async () => {
            try {

                const res = await Axios.get(`${SERVER_URL}/cell/history/${projectId}/${rowData.id}/${headerKey}`);

                setHistory(res.data.histories.reverse());

            } catch (err) {
                console.log(err);
            };
        };
        fetchCellHistory();
    }, [])


    return (
        <div style={{ width: '100%', padding: 15, maxHeight: window.innerHeight * 0.7, overflowY: 'scroll' }}>
            <List
                size='small'
                header={null}
                footer={null}
                bordered
                dataSource={history}
                renderItem={item => (
                    <List.Item>
                        <div>
                            <div>{`${item.email}`}</div>
                            <div style={{ fontSize: 12, color: 'grey' }}>{moment(item.createdAt).format('DD/MM/YY - HH:mm')}</div>
                            <div style={{ fontWeight: 'bold' }}>{item.text}</div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TableCellHistory;
