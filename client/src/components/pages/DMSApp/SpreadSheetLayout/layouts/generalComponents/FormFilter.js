import { Checkbox, Icon, Select, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { mongoObjectId } from '../../utils/index';
import { getConsultantReplyData, getInfoValueFromRfaData, isColumnWithReplyData } from '../pageSpreadsheet/CellRFA';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';


const { Option } = Select;


const FormFilter = ({ applyFilter, onClickCancelModal, headers, rowsAll, modeFilter, pageSheetTypeName, rowsRfaAll, companies }) => {


   const isSpreadsheetOrDataEntry = pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry';


   const [filterColumn, setFilterColumn] = useState(
      isSpreadsheetOrDataEntry
         ? (modeFilter.length > 1
            ? modeFilter.map(item => ({...item}))
            : [
               {
                  id: mongoObjectId(),
                  header: 'Status',
                  value: 'Select Value...'
               },
               {
                  isIncludedParent: 'included'
               }
            ])
         : (modeFilter.length > 1
            ? modeFilter.map(item => ({...item}))
            : [
               {
                  id: mongoObjectId(),
                  header: 'Overdue RFA',
                  value: 'Select Value...'
               },
               {
                  isIncludedParent: 'included'
               }
            ])
   );

   const setFilterSelect = (dataFilter) => {
      let found = filterColumn.find(x => x.id === dataFilter.id);
      found.header = dataFilter.header;
      found.value = dataFilter.value;
      setFilterColumn([...filterColumn]);
   };


   const onClickAddField = () => {
      setFilterColumn([
         ...filterColumn,
         { id: mongoObjectId(), header: 'Select Field...', value: 'Select Value...' }
      ]);
   };

   const removeFilterTag = (id) => {
      const arr = filterColumn.filter(x => x.id !== id);
      setFilterColumn([...arr]);
   };

   const filterObj = modeFilter.find(x => x.isIncludedParent);

   const [isChecked, setIsChecked] = useState(
      filterObj && filterObj.isIncludedParent === 'included' ? true :
         filterObj && filterObj.isIncludedParent === 'not included' ? false :
            true);



   const onChangeBox = () => {

      setIsChecked(!isChecked);
      const found = filterColumn.find(x => x.isIncludedParent);

      if (found) {
         found.isIncludedParent = isChecked ? 'not included' : 'included';
         setFilterColumn(filterColumn);
      } else {
         let arr = [...filterColumn, { isIncludedParent: isChecked ? 'not included' : 'included' }];
         setFilterColumn(arr);
      };
   };

   const onClickApply = () => {

      const output = filterColumn.filter(x => {
         return (x.header !== 'Select Field...' && x.value !== 'Select Value...') || x.isIncludedParent;
      });

      if (!filterColumn.find(item => item.isIncludedParent)) {
         output.push({ isIncludedParent: 'not included' });
      };

      if (output.length === 1 && output[0].isIncludedParent === 'included') {
         applyFilter([]);
      } else {
         applyFilter(output);
      };
   };


   return (
      <div style={{ width: '100%', height: '100%' }}>
         <div style={{ padding: 20, borderBottom: `1px solid ${colorType.grey4}` }}>

            <ButtonStyle
               colorText='black'
               marginRight={10}
               borderColor={colorType.grey1}
               background={colorType.grey4}
               onClick={onClickAddField}
               name='Add Field'
               marginBottom={10}
            />

            {filterColumn.filter(x => x.id).map(item => (
               <SelectComp
                  key={item.id}
                  id={item.id}
                  data={item}
                  setFilterSelect={setFilterSelect}
                  removeFilterTag={removeFilterTag}
                  headers={headers}
                  rows={isSpreadsheetOrDataEntry ? rowsAll : rowsRfaAll}
                  isSpreadsheetOrDataEntry={isSpreadsheetOrDataEntry}
                  companies={companies}
               />
            ))}

            {isSpreadsheetOrDataEntry && (
               <div>
                  <CheckboxStyled
                     onChange={onChangeBox}
                     checked={isChecked}
                  >
                     Include Parent Rows
                  </CheckboxStyled>
               </div>
            )}

         </div>

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={onClickApply}
            />
         </div>
      </div>
   );
};
export default FormFilter;


const CheckboxStyled = styled(Checkbox)`
   .ant-checkbox-inner {
      border-radius: 0;
      border: none;
      background: ${colorType.primary}
   }
`;


const IconStyled = styled.div`
    margin-left: 7px;
    width: 18px; 
    height: 18px; 
    border: 1px solid ${colorType.grey1};
    text-align: center;
    &:hover {
        background-color: ${colorType.grey4};
        cursor: pointer;
    };
`;



const SelectComp = ({ setFilterSelect, data, id, removeFilterTag, headers, rows, isSpreadsheetOrDataEntry, companies }) => {

   const columnsValueArr = getColumnsValue(rows, headers, isSpreadsheetOrDataEntry, companies);

   const [column, setColumn] = useState(data.header);

   const [value, setValue] = useState(null);

   useEffect(() => {
      if (column) {
         setValue(data.value || 'Select Value...');
         setFilterSelect({ id, header: column, value: data.value || 'Select Value...' });
      };
   }, [column]);

   return (
      <div style={{ display: 'flex', paddingBottom: 10, width: '100%' }}>

         <SelectStyled
            defaultValue='Select Field...'
            value={column}
            style={{ marginRight: 13, width: '47%' }}
            onChange={(column) => setColumn(column)}
         >
            {headers.map(hd => (
               <Option key={hd} value={hd}>{hd}</Option>
            ))}
         </SelectStyled>


         <SelectStyled
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) => {
               let stringArray = input.split(/(\s+)/).filter(str => str !== ' ');
               let isFound = true;
               stringArray.forEach(str => {
                  if (option.props.children.toLowerCase().indexOf(str.toLowerCase()) === -1) {
                     isFound = false;
                  };
               });
               return isFound;
            }}

            style={{ width: '47%' }}
            onChange={(value) => {
               setFilterSelect({ id, header: column, value });
               setValue(value);
            }}
            disabled={!column ? true : false}
            value={value}
         >
            {column && columnsValueArr[column] && columnsValueArr[column].map(hd => (
               <Option key={hd} value={hd}>{hd}</Option>
            ))}
         </SelectStyled>


         <Tooltip title='Remove Field'>
            <IconStyled>
               <Icon
                  type='delete'
                  style={{ transform: 'translate(0, -3px)', color: colorType.grey2, fontSize: 12 }}
                  onClick={() => removeFilterTag(id)}
               />
            </IconStyled>
         </Tooltip>

      </div>
   );
};


const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;


const getColumnsValue = (rows, headers, isSpreadsheetOrDataEntry, companies) => {

   let valueObj = {};

   const arrayHeaderRFA = [
      'Requested By',
      'Submission Date',
      'Overdue RFA'
   ];

   [...headers, ...arrayHeaderRFA].forEach(hd => {
      let valueArr = [];
      rows.forEach(row => {
         if (!isSpreadsheetOrDataEntry && isColumnWithReplyData(hd)) {
            const { replyCompany } = getConsultantReplyData(row, hd, companies);
            valueArr.push(replyCompany || '');

         } else if (!isSpreadsheetOrDataEntry && hd === 'Overdue RFA') {
            valueArr = [...valueArr, 'Overdue', 'Due in 3 days', 'RFA outstanding'];

         } else if (!isSpreadsheetOrDataEntry && hd === 'Due Date') {
            const dueDate = row['Consultant Reply (T)'];
            valueArr.push(dueDate || '');

         } else if (!isSpreadsheetOrDataEntry && hd === 'Requested By') {
            const requestedBy = getInfoValueFromRfaData(row, 'submission', 'requestedBy');
            valueArr.push(requestedBy || '');

         } else if (!isSpreadsheetOrDataEntry && hd === 'Submission Date') {
            const submissionDate = row['Drg To Consultant (A)'];
            valueArr.push(submissionDate || '');
            
         } else {
            valueArr.push(row[hd] || '');
         };
      });
      valueArr = [...new Set(valueArr)].filter(e => e);
      valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));
      if (valueArr.length > 0) valueObj[hd] = valueArr;
   });
   return valueObj;
};
