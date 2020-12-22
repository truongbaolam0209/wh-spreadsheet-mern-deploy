import { Calendar, Radio } from 'antd';
import React from 'react';


const { Group, Button } = Radio;


const PanelCalendar = ({ pickDate }) => {

    return (
        <div style={{ width: 300 }}>
            <Calendar
                fullscreen={false}
                onSelect={pickDate}
            />
        </div>
    );
};

export default PanelCalendar;
