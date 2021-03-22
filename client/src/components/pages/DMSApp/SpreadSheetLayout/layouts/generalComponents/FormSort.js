import { Checkbox, Select } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import ButtonGroupComp from './ButtonGroupComp';

const { Option } = Select;



const FormSort = ({ applySort, onClickCancel, modeSort, headers }) => {

    
    const [column, setColumn] = useState(Object.keys(modeSort).length === 3 ? modeSort.column : 'Select Field...');
    const [value, setValue] = useState(Object.keys(modeSort).length === 3 ? (modeSort.type === 'ascending' ? 'Ascending' : 'Descending') : 'Ascending');
    const [isChecked, setIsChecked] = useState(Object.keys(modeSort).length === 3 ? (modeSort.isIncludedParent === 'included' ? true : false) : true);

    const onClickApply = () => {
        if (column) {
            applySort({
                isIncludedParent: isChecked ? 'included' : 'not included',
                column,
                type: value.toLowerCase()
            });
        } else {
            applySort({});
        };
    };



    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{
                padding: 20,
                borderBottom: `1px solid ${colorType.grey4}`
            }}>
                <div style={{ display: 'flex', paddingBottom: 20, width: '100%' }}>

                    <SelectStyled
                        style={{ width: '50%', marginRight: 20 }}
                        onChange={(column) => setColumn(column)}
                        value={column}
                    >
                        {headers.map(hd => (
                            <Option key={hd} value={hd}>{hd}</Option>
                        ))}
                    </SelectStyled>

                    <SelectStyled
                        style={{ width: '50%' }}
                        onChange={(value) => setValue(value)}
                        disabled={column === 'Select Field...' ? true : false}
                        value={value}
                    >
                        <Option key='Ascending' value='Ascending'>Ascending</Option>
                        <Option key='Descending' value='Descending'>Descending</Option>
                    </SelectStyled>

                </div>
                <div>
                    <CheckboxStyled onChange={() => setIsChecked(!isChecked)} checked={isChecked}>Include Parent Rows</CheckboxStyled>
                </div>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancel}
                    onClickApply={onClickApply}
                />
            </div>

        </div>
    );
};
export default FormSort;




const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;

const CheckboxStyled = styled(Checkbox)`
   .ant-checkbox-inner {
      border-radius: 0;
      border: none;
      background: ${colorType.primary}
   }
`;

export const sortFnc = (rows, header, ascending) => {
    if (ascending) {
        rows.sort((a, b) => (a[header] || '').toLowerCase() > (b[header] || '').toLowerCase() ?
            1 :
            ((b[header] || '').toLowerCase() > (a[header] || '').toLowerCase()) ? -1 : 0);
    } else {
        return rows.sort((b, a) => (a[header] || '').toLowerCase() > (b[header] || '').toLowerCase() ?
            1 :
            ((b[header] || '').toLowerCase() > (a[header] || '').toLowerCase()) ? -1 : 0);
    };
    return rows;
};



