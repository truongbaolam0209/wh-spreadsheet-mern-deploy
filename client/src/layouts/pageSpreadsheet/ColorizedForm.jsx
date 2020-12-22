import { Button, Select } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

const ColorizedForm = ({ applyColorization }) => {


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
                marginBottom: 20

            }}>
                <Select
                    defaultValue='Select Field...'
                    style={{ width: 250, paddingRight: 20 }}
                    onChange={item => setItem(item)}
                >
                    {arr.map(item => (
                        <Option key={item} value={item}>{item}</Option>
                    ))}
                </Select>

            </div>
            <Button type='primary' onClick={() => applyColorization(item)}>Apply</Button>
        </div>
    );
};
export default ColorizedForm;







