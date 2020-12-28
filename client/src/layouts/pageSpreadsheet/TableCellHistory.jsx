import { List } from 'antd';
import Axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';


const TableCellHistory = (props) => {
    console.log(props);
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

                console.log('HISTORY...', res.data);
                setHistory(res.data.histories.reverse());


            } catch (err) {
                console.log(err);
            };
        };
        fetchCellHistory();
    }, [])


    return (
        <div style={{ width: '100%', padding: 15 }}>
            <List
                size='small'
                header={null}
                footer={null}
                bordered
                dataSource={history}
                renderItem={item => (
                    <List.Item>
                        <div>
                            <div>{`${item.username}`}</div>
                            <div style={{ fontSize: 12, color: 'grey' }}>{item.createdAt}</div>
                            <div style={{ fontWeight: 'bold' }}>{item.text}</div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default TableCellHistory;
