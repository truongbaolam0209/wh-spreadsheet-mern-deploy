import { DatePicker } from 'antd';
import React from 'react';
import styled from 'styled-components';

const { RangePicker } = DatePicker;



const PanelCalendarDuration = ({ pickRangeDate }) => {


   const onChange = (value, dateString) => {
      pickRangeDate(value);
   };

   const onOk = (value) => {

   };

   return (
      <RangePickerStyle
         // showTime={{ format: 'HH:mm' }}
         format="DD/MM/YY"
         placeholder={['Start Time', 'End Time']}
         onChange={onChange}
         onOk={onOk}
         style={{
            borderRadius: 0
         }}
      />
   );
};

export default PanelCalendarDuration;


const RangePickerStyle = styled(RangePicker)`

   .ant-calendar-picker-input {
      border-radius: 0;
   }

`;


