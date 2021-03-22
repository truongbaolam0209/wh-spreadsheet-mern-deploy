import { List } from 'antd';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';



const TableCellHistory2 = (props) => {

    const { rowData: { id: rowId }, column, cellOneHistory } = props;

    const {
        state: stateProject
    } = useContext(ProjectContext);

    const { state: stateRow } = useContext(RowContext);

    const { projectId, token } = stateProject.allDataOneSheet;
    const headers = stateProject.allDataOneSheet.publicSettings.headers;
    const headerKey = headers.find(hd => hd.text === column.key).key;


    const [history, setHistory] = useState(cellOneHistory);

    // useEffect(() => {
    //    const fetchCellHistory = async () => {
    //       try {
    //          const res = await Axios.get(`${SERVER_URL}/cell/history/one-cell/`, { params: { token, projectId, rowId, headerKey } });
    //          setHistory(res.data.histories.reverse());
    //       } catch (err) {
    //          console.log(err);
    //       };
    //    };
    //    fetchCellHistory();
    // }, [])


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

export default TableCellHistory2;
