import { Checkbox, DatePicker, Input } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';



const FormDateAutomation = ({ applyDateAutomation, rowsToAutomation, onClickCancel }) => {

   const rowsWithConstructionStart = rowsToAutomation.filter(x => x['Construction Start']);


   const [dateConstructionStartInit, setDateConstructionStartInit] = useState(rowsWithConstructionStart[0] && rowsWithConstructionStart[0]['Construction Start']);
   const [offset, setOffset] = useState([
      7, 0, 8, 9, 3, 6, 9, 3
   ]);

   const [itemsLocked, setItemsLocked] = useState(['Get Approval (T)']);


   const updateCheckList = (isChecked, header, index) => {
      if (isChecked) {
         setItemsLocked(itemsLocked.filter(x => x !== header));
      } else {
         setItemsLocked([...itemsLocked, header]);
         offset[index] = 0;
         setOffset([...offset]);
      };
   };

   const onChangeNosOfDays = (index, e) => {
      offset[index] = parseInt(e);
      setOffset([...offset]);
   };

   const onChangePickdate = (index, e) => {
      if (index === -1) {
         setDateConstructionStartInit(moment(e).format('DD/MM/YY'));
      } else {
         const distance = moment(e).diff(moment(dateConstructionStartInit, 'DD/MM/YY'), 'days');
         const nosOfDaysToOffset = offset.filter((x, i) => i < index).reduce((a, b) => a + b, 0);
         offset[index] = distance - nosOfDaysToOffset;
         setOffset([...offset]);
      };
   };


   const onClickApply = () => {

      let dataUpdate = {};
      arrHeaders.forEach((hd, i) => {
         if (!itemsLocked.find(x => hd === x)) {
            const date = moment(dateConstructionStartInit, 'DD/MM/YY');
            const nosOfDaysToOffset = offset.filter((x, j) => j < i).reduce((a, b) => a + b, 0);
            dataUpdate[hd] = moment(date.add(nosOfDaysToOffset, 'days').format('DD/MM/YY'), 'DD/MM/YY').format('DD/MM/YY');
         };
      });
      applyDateAutomation(rowsToAutomation, dataUpdate);
   };


   return (
      <div style={{ width: '100%', height: '100%', padding: 20 }}>
         {arrHeaders.map((hd, i) => (
            <DatePickerComp
               key={hd}
               header={hd}
               itemIndex={i}
               dateConstructionStartInit={dateConstructionStartInit}
               updateCheckList={updateCheckList}
               itemsLocked={itemsLocked}
               onChangeNosOfDays={onChangeNosOfDays}
               onChangePickdate={onChangePickdate}
               offset={offset}
            />
         ))}
         <div style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'row-reverse'
         }}>
            <ButtonGroupComp
               onClickCancel={onClickCancel}
               onClickApply={onClickApply}
            />
         </div>
      </div>
   );
};


export default FormDateAutomation;






const DatePickerComp = ({
   header,
   onChangeNosOfDays,
   onChangePickdate,
   updateCheckList,
   itemsLocked,
   offset,
   itemIndex,
   dateConstructionStartInit
}) => {


   const [isChecked, setIsChecked] = useState(itemsLocked.indexOf(header) !== -1 ? false : true);

   const onChangeBox = () => {
      updateCheckList(!isChecked, header, itemIndex - 1);
      setIsChecked(!isChecked);
   };

   const nosOfDaysToOffset = offset.filter((x, i) => i < itemIndex).reduce((a, b) => a + b, 0);


   const constructionDateFormat = dateConstructionStartInit ? moment(dateConstructionStartInit, 'DD/MM/YY') : moment();

   const dateValue = moment(constructionDateFormat.add(nosOfDaysToOffset, 'days').format('DD/MM/YY'), 'DD/MM/YY');


   return (
      <div style={{
         display: 'flex',
         marginBottom: 10,
         color: 'black'
      }}>
         <DatePickerStyled
            onChange={(e) => {
               if (e) {
                  onChangePickdate(itemIndex - 1, e);
               };
            }}
            format='DD/MM/YY'
            value={itemIndex === 0 ? constructionDateFormat : dateValue}
            style={{ marginRight: 10, width: header === 'Construction Start' ? 205 : 100 }}
            disabled={itemsLocked.indexOf(header) !== -1}
         />
         {itemIndex !== 0 && (
            <InputStyled
               style={{ width: 70 }}
               type='number' min='1'
               value={offset[itemIndex - 1]}
               disabled={itemsLocked.indexOf(header) !== -1}
               onChange={(e) => onChangeNosOfDays(itemIndex - 1, e.target.value)}
            />
         )}



         {itemIndex !== 0 && (
            <CheckboxStyled
               onChange={onChangeBox}
               checked={isChecked}
               style={{ padding: '0px 10px' }}
            />
         )}
         <div>{header}</div>


         
      </div>
   );
};

const CheckboxStyled = styled(Checkbox)`
   .ant-checkbox-inner {
      border-radius: 0;
      border: none;
      background: ${colorType.primary}
   }
`;


export const arrHeaders = [
   'Model Start (T)',
   'Model Finish (T)',
   'Drawing Start (T)',
   'Drawing Finish (T)',
   'Drg To Consultant (T)',
   'Consultant Reply (T)',
   'Get Approval (T)',
   'Construction Issuance Date',
   'Construction Start',
].reverse();

const DatePickerStyled = styled(DatePicker)`
   .ant-calendar-picker-input {
      border-radius: 0;
   }
`;

const InputStyled = styled(Input)`
   border-radius: 0;
`;