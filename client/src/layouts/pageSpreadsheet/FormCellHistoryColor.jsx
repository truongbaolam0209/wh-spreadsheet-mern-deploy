import { Button, DatePicker } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertHistoryData } from '../../utils';
const SERVER_URL = 'http://localhost:9000/api';


const FormCellHistoryColor = ({setCellHistoryArr}) => {

    const {
        state: stateProject
    } = useContext(ProjectContext);

    const {
        state: stateRow
    } = useContext(RowContext);

    const projectId = stateProject.allDataOneSheet._id;
    const headersArr = stateProject.allDataOneSheet.publicSettings.headers;

    useEffect(() => {

        const fetchProjectHistory = async () => {
            try {

                const res = await Axios.get(`${SERVER_URL}/cell/history/${projectId}`);

                console.log('HISTORY...', res.data);
                console.log(convertHistoryData(res.data));
                setHistoryData(res.data);


            } catch (err) {
                console.log(err);
            };
        };
        fetchProjectHistory();
    }, []);

    const [historyData, setHistoryData] = useState([]);
    const [start, setStart] = useState(null);
    const [end, setEnd] = useState(null);


    const onClick = () => {
        let startDate = start.toDate();
        let endDate = end.toDate();

        if (startDate > endDate) return;

        let filterCells = convertHistoryData(historyData).filter(cell => {

            let createdAt = moment(cell.createdAt).toDate();
            return createdAt >= startDate && createdAt <= endDate;
        });



        const cellArr = filterCells.map(ch => {
            const { row: rowId, headerKey } = ch;
            let headerText = headersArr.find(hd => hd.key === headerKey).text;
            return {
                rowId,
                header: headerText
            }
        });

        let unique = cellArr.reduce((res, itm) => {
            let result = res.find(item => JSON.stringify(item) == JSON.stringify(itm));
            if(!result) return res.concat(itm);
            return res;
        }, []);
        setCellHistoryArr(unique);
    };

    return (
        <div>
            <div style={{ display: 'flex', marginBottom: 20 }}>
                <DatePicker onChange={e => setStart(e)} />
                <DatePicker onChange={e => setEnd(e)} />
            </div>
            <Button type='primary' onClick={onClick}>Check</Button>
        </div>
    );
};

export default FormCellHistoryColor;
