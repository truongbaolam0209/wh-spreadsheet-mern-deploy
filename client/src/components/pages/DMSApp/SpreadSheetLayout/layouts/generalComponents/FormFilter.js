import { Checkbox, Icon, Select, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { mongoObjectId } from '../../utils/index';
import { getInfoValueFromRefDataForm } from '../pageSpreadsheet/CellForm';
import { getConsultantReplyData, getInfoValueFromRfaData, isColumnWithReplyData } from '../pageSpreadsheet/CellRFA';
import { getKeyTextForSheet } from '../pageSpreadsheet/PanelSetting';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';

const { Option } = Select;


const FormFilter = ({ applyFilter, onClickCancelModal, headers, rowsInputData, modeFilter, pageSheetTypeName, companies }) => {

   const refType = getKeyTextForSheet(pageSheetTypeName);

   const [filterColumn, setFilterColumn] = useState(
      (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry')
         ? (modeFilter.length > 1 ? modeFilter.map(item => ({ ...item })) : [
            { id: mongoObjectId(), header: 'Status', value: 'Select Value...' },
            { isIncludedParent: 'included' }
         ])
         : (pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')
            ? (modeFilter.length > 1 ? modeFilter.map(item => ({ ...item })) : [
               { id: mongoObjectId(), header: `Overdue ${refType.toUpperCase()}`, value: 'Select Value...' },
               { isIncludedParent: 'included' }
            ])
            : (modeFilter.length > 1 ? modeFilter.map(item => ({ ...item })) : [
               { id: mongoObjectId(), header: 'Select Field', value: 'Select Value...' },
               { isIncludedParent: 'included' }
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
                  headers={
                     (pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam')
                        ? [...headers, 'Status']
                        : headers
                  }
                  rows={rowsInputData}
                  pageSheetTypeName={pageSheetTypeName}
                  companies={companies}
               />
            ))}

            {/* {(pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') && ( */}
            <div>
               <CheckboxStyled
                  onChange={onChangeBox}
                  checked={isChecked}
               >
                  Include Parent Rows
               </CheckboxStyled>
            </div>
            {/* )} */}

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


const fieldNoFilter = [
   'Description',
   'Contract Specification',
   'Proposed Specification',
   'Conversation Among',
   'Received By'
];



const SelectComp = ({ setFilterSelect, data, id, removeFilterTag, headers, rows, pageSheetTypeName, companies }) => {

   const columnsValueArr = getColumnsValue(rows, headers, pageSheetTypeName, companies);

   const [column, setColumn] = useState(data.header);

   const [value, setValue] = useState(null);

   useEffect(() => {
      if (column) {
         setValue(data.value || 'Select Value...');
         setFilterSelect({ id, header: column, value: data.value || 'Select Value...' });
      };
   }, [column]);

   const refType = getKeyTextForSheet(pageSheetTypeName);
   const headersFilter = (pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')
      ? [...headers, `Overdue ${refType.toUpperCase()}`]
      : headers;

   return (
      <div style={{ display: 'flex', paddingBottom: 10, width: '100%' }}>

         <SelectStyled
            defaultValue='Select Field...'
            value={column}
            style={{ marginRight: 13, width: '47%' }}
            onChange={(column) => setColumn(column)}
         >
            {headersFilter.filter(hd => fieldNoFilter.indexOf(hd) === -1).map(hd => (
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


const getColumnsValue = (rows, headers, pageSheetTypeName, companies) => {

   let valueObj = {};

   const refType = getKeyTextForSheet(pageSheetTypeName);


   const arrayHeaderAdditional = (
      pageSheetTypeName === 'page-rfa' ||
      pageSheetTypeName === 'page-rfam' ||
      pageSheetTypeName === 'page-rfi'
   ) ? [`Overdue ${refType.toUpperCase()}`] : [];


   [...headers, ...arrayHeaderAdditional]
      .filter(hd => fieldNoFilter.indexOf(hd) === -1)
      .forEach(hd => {
         let valueArr = [];
         rows.forEach(row => {
            if (pageSheetTypeName === 'page-rfa') {
               if (isColumnWithReplyData(hd)) {
                  const { replyCompany } = getConsultantReplyData(row, hd, companies);
                  valueArr.push(replyCompany || '');
               } else if (hd === 'Overdue RFA') {
                  valueArr = [...valueArr, 'Overdue', 'Due in 3 days', 'RFA outstanding'];
               } else if (hd === 'Due Date') {
                  const dueDate = row['Consultant Reply (T)'];
                  valueArr.push(dueDate || '');
               } else if (hd === 'Requested By') {
                  const requestedBy = getInfoValueFromRfaData(row, 'submission', 'requestedBy');
                  valueArr.push(requestedBy || '');
               } else if (hd === 'Submission Date') {
                  const submissionDate = row['Drg To Consultant (A)'];
                  valueArr.push(submissionDate || '');
               };

            } else if (
               pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi' ||
               pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt' || pageSheetTypeName === 'page-mm'
            ) {
               if (hd === 'Requested By') {
                  const requestedBy = getInfoValueFromRefDataForm(row, 'submission', refType, 'requestedBy');
                  valueArr.push(requestedBy || '');
               } else if (hd === 'Signatured By') {
                  const signaturedBy = getInfoValueFromRefDataForm(row, 'submission', refType, 'signaturedBy');
                  valueArr.push(signaturedBy || '');
               } else if (hd === 'Submission Date') {
                  const date = getInfoValueFromRefDataForm(row, 'submission', refType, 'date');
                  valueArr.push(date ? moment(date).format('DD/MM/YY') : '');
               } else if (hd === 'Submission Type') {
                  const submissionType = getInfoValueFromRefDataForm(row, 'submission', refType, 'submissionType');
                  valueArr.push(submissionType || '');
               } else if (hd === 'Due Date') {
                  const dateDue = getInfoValueFromRefDataForm(row, 'submission', refType, 'due');
                  valueArr.push(dateDue ? moment(dateDue).format('DD/MM/YY') : '');

               } else if (hd === `Overdue ${refType.toUpperCase()}`) {
                  valueArr = [...valueArr, 'Overdue', 'Due in 3 days', `${refType.toUpperCase()} outstanding`];
               } else if (hd === 'Cost Implication') {
                  valueArr = ['True', 'False'];
               } else if (hd === 'Time Extension') {
                  valueArr = ['True', 'False'];

               } else if (hd === 'Attachment Type') {
                  const herewithForDt = getInfoValueFromRefDataForm(row, 'submission', refType, 'herewithForDt');
                  valueArr.push(herewithForDt || '');

               } else if (hd === 'Transmitted For') {
                  const transmittedForDt = getInfoValueFromRefDataForm(row, 'submission', refType, 'transmittedForDt');
                  valueArr.push(transmittedForDt || '');
               } else if (hd === 'Conversation Date') {
                  const dateConversation = getInfoValueFromRefDataForm(row, 'submission', refType, 'dateConversation');
                  valueArr.push(dateConversation ? moment(dateConversation).format('DD/MM/YY') : '');
               }




            } else if (pageSheetTypeName === 'page-spreadsheet' || pageSheetTypeName === 'page-data-entry') {
               valueArr.push(row[hd] || '');
            };
         });
         valueArr = [...new Set(valueArr)].filter(e => e);
         valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));
         if (valueArr.length > 0) valueObj[hd] = valueArr;
      });

   if (pageSheetTypeName === 'page-rfa' || pageSheetTypeName === 'page-rfam') {
      valueObj['Status'] = 'page-rfa' ? [
         'Approved with comments, to Resubmit',
         'Approved with Comment, no submission Required',
         'Approved for Construction',
         'Reject and resubmit',
         'Consultant reviewing'
      ] : [
         'Approved with comments, to Resubmit',
         'Approved with Comment, no submission Required',
         'Approved for Construction',
         'Reject and resubmit',
      ];
   };

   return valueObj;
};
