import { Icon, Select } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as RowContext } from '../../contexts/rowContext';
import { Context as UserContext } from '../../contexts/userContext';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';

const { Option } = Select;



const FormFilter = ({ applyFilter, onClickCancelModal }) => {


    const [filterColumn, setFilterColumn] = useState({});
    const { state: stateRow } = useContext(RowContext);

    const setFilterSelect = (dataFilter) => {
        setFilterColumn({ ...filterColumn, ...dataFilter });
    };
    const removeFilterTag = (column) => {
        let xxx = { ...filterColumn };
        delete xxx[column];
        setFilterColumn(xxx);
    };

    const [tags, setTags] = useState([mongoObjectId()]);
    const onClickAddTag = () => {
        setTags([...tags, mongoObjectId()]);
    };

    const onClickApply = () => {

        let rowArr = stateRow.rowsVisible;

        Object.keys(filterColumn).forEach(cl => {
            rowArr = rowArr.filter(r => r[cl] === filterColumn[cl]);
        });

        applyFilter(rowArr);
    };

    return (
        <>
            <div style={{ padding: 20, borderBottom: `1px solid ${colorType.grey4}` }}>
                {Object.keys(filterColumn).map(key => (
                    <div key={key} style={{ display: 'flex' }}>
                        <SelectComp
                            setFilterSelect={setFilterSelect}
                            removeFilterTag={removeFilterTag}
                            filterColumn={filterColumn}
                            headerKey={key}
                            
                        />
                        <IconStyled>
                            <Icon 
                                type='close' 
                                style={{ 
                                    transform: 'translate(0, -3px)',
                                    color: colorType.grey2,
                                    fontSize: 11
                                }}
                                onClick={() => removeFilterTag(key)} 
                            />
                        </IconStyled>
                        
                    </div>
                ))}

                <SelectComp
                    setFilterSelect={setFilterSelect}
                    removeFilterTag={removeFilterTag}
                    filterColumn={filterColumn}
                />

            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={onClickApply}
                />
            </div>
        </>
    );
};
export default FormFilter;


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




const SelectComp = ({ setFilterSelect, removeFilterTag, filterColumn, headerKey }) => {

    const { state: stateUser } = useContext(UserContext);
    const { state: stateRow } = useContext(RowContext);

    let columnsValueArr = getColumnsValue(stateRow.rowsAll, stateUser.headersShown);

    const [column, setColumn] = useState(headerKey);


    return (
        <div style={{ display: 'flex', paddingBottom: 25, width: '90%' }}>

            <SelectStyled
                defaultValue={headerKey === undefined ? 'Select Field...' : headerKey}
                style={{ 
                    marginRight: 13, 
                    width: '47%',
                }}
                onChange={(column) => setColumn(column)}
            
            >
                {getHeadersFilterArr(stateUser.headersShown, columnsValueArr, Object.keys(filterColumn)).map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>


            <SelectStyled
                defaultValue={filterColumn[headerKey] === undefined ? 'Select Value...' : filterColumn[headerKey]}
                style={{ 
                    // background: headerKey === undefined && 'red',
                    width: '47%'
                }}
                onChange={(value) => setFilterSelect({ [column]: value })}
                disabled={!column ? true : false}
            >
                {column && columnsValueArr[column].map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>

        </div>
    );
};


const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;


const getColumnsValue = (rows, headers) => {
    let valueObj = {};
    headers.forEach(hd => {
        let valueArr = [];
        rows.filter(r => r._rowLevel === 1).forEach(row => {
            valueArr.push(row[hd] || '');
        });
        valueArr = [...new Set(valueArr)].filter(e => e);

        if (valueArr.length > 0) valueObj[hd] = valueArr;
    });
    return valueObj;
};


const getHeadersFilterArr = (headers, columnsValueArr, filtered) => {
    let arr = [];
    headers.forEach(hd => {
        if (columnsValueArr[hd] && filtered.indexOf(hd) === -1) arr.push(hd);
    });
    return arr;
};