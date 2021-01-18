import { Select } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import ButtonGroupComp from './ButtonGroupComp';

const { Option } = Select;

const ColorizedForm = ({ applyColorization, onClickCancelModal }) => {

    const { state: stateRow } = useContext(RowContext);
    const { state: stateProject } = useContext(ProjectContext);
    let colorization = stateProject.userData.colorization;

    const arr = [
        'No Colorization',
        'Rev',
        'Status',
        'Modeller',
        'Coordinator In Charge'
    ];

    const [arrData, setArrData] = useState(colorization.value || []);

    const onClickBtn = (btn) => {
        if (arrData.indexOf(btn) === -1) {
            setArrData([...arrData, btn]);
        } else {
            setArrData(arrData.filter(r => r !== btn));
        }; 
    };
    
    const [item, setItem] = useState(null);

    return (
        <div style={{ maxWidth: window.innerWidth * 0.8 }}>
            <div style={{
                width: '100%',
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <SelectStyled
                    defaultValue='Select Field...'
                    style={{ minWidth: 100, paddingRight: 10 }}
                    onChange={item => {
                        if (item !== colorization.header) setArrData([]);
                        setItem(item);
                    }}
                >
                    {arr.map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}
                </SelectStyled>
                <div style={{  }}>
                    {getColumnsValueColorization(stateRow.rowsAll, item).map((vl, i) => (
                        <TagBtn key={i} value={vl} onClickBtn={onClickBtn} arrData={arrData} />
                    ))}
                </div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={() => applyColorization({
                        header: item,
                        value: arrData
                    })}
                />
            </div>
        </div>
    );
};
export default ColorizedForm;

const TagBtn = ({ value, onClickBtn, arrData }) => {
    return (
        <div style={{
            padding: 5,
            marginBottom: 5,
            border: `1px solid ${colorType.grey1}`,
            cursor: 'pointer',
            background: arrData.indexOf(value) === -1 ? 'white' : colorType.grey1
        }} onClick={() => onClickBtn(value)}>
            {value}
        </div>
    );
};
const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;

const getColumnsValueColorization = (rows, header) => {
    if (header === 'No Colorization') return [];
    let valueArr = [];
    rows.forEach(row => {
        valueArr.push(row[header] || '');
    });
    valueArr = [...new Set(valueArr)].filter(e => e);
    valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));
    return valueArr;
};





