import { Select } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import ButtonGroupComp from './ButtonGroupComp';

const { Option } = Select;

const ColorizedForm = ({ applyColorization, onClickCancelModal }) => {


    const arr = [
        'No colorization',
        'Rev',
        'Status',
        'Modeller',
        'Coordinator In Charge'
    ];

    const [item, setItem] = useState(null);

    return (
        <div>
            <div style={{
                height: '10vh',
                width: 450,
                padding: 20
            }}>
                <SelectStyled
                    defaultValue='Select Field...'
                    style={{ width: 250, paddingRight: 20 }}
                    onChange={item => setItem(item)}
                >
                    {arr.map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}
                </SelectStyled>

            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={() => applyColorization(item)}
                />
            </div>
        </div>
    );
};
export default ColorizedForm;


const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;





