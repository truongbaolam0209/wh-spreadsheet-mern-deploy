import { DatePicker } from 'antd';
import React from 'react';
import styled from 'styled-components';

const { RangePicker } = DatePicker;



const PanelCalendarDuration = () => {


   const onChange = (value, dateString) => {
      
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


