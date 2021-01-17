import { Icon, Select, Tooltip } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';

const { Option } = Select;



const FormFilter = ({ applyFilter, onClickCancelModal }) => {


    const { state: stateRow } = useContext(RowContext);

    let { rowsAll } = stateRow;

    const [filterColumn, setFilterColumn] = useState({});

    const setFilterSelect = (dataFilter) => {
        setFilterColumn({ ...filterColumn, ...dataFilter });
    };



    const onClickApply = () => {
        Object.keys(filterColumn).forEach(cl => {
            rowsAll = rowsAll.filter(r => r[cl] === filterColumn[cl]);
        });
        applyFilter(rowsAll);
    };

    const [idArr, setIdArr] = useState([]);
    const onClickAddField = () => {
        if (idArr.length <= Object.keys(filterColumn).length) {
            setIdArr([
                ...idArr,
                mongoObjectId()
            ]);
        };
    };
    const removeFilterTag = (id, column) => {
        idArr.splice(idArr.indexOf(id), 1);
        setIdArr([...idArr]);

        delete filterColumn[column];
        setFilterColumn({ ...filterColumn });
    };



    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
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

                {idArr.map(key => (
                    <SelectComp
                        key={key}
                        id={key}
                        setFilterSelect={setFilterSelect}
                        filterColumn={filterColumn}
                        removeFilterTag={removeFilterTag}
                    />
                ))}

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



const SelectComp = ({ setFilterSelect, filterColumn, headerKey, id, removeFilterTag }) => {

    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateRow } = useContext(RowContext);
    const { rowsAll } = stateRow;
    const { headersShown } = stateProject.userData;

    let columnsValueArr = getColumnsValue(rowsAll, headersShown);
    const [column, setColumn] = useState(headerKey);


    return (
        <div style={{ display: 'flex', paddingBottom: 10, width: '100%' }}>

            <SelectStyled
                defaultValue='Select Field...'
                style={{ marginRight: 13, width: '47%' }}
                onChange={(column) => setColumn(column)}
            >
                {getHeadersFilterArr(
                    headersShown,
                    columnsValueArr,
                    Object.keys(filterColumn)
                ).map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>


            <SelectStyled
                defaultValue='Select Value...'
                style={{ width: '47%' }}
                onChange={(value) => setFilterSelect({ [column]: value })}
                disabled={!column ? true : false}
            >
                {column && columnsValueArr[column].map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>

            <Tooltip title='Remove Field'>
                <IconStyled>
                    <Icon
                        type='delete'
                        style={{ transform: 'translate(0, -3px)', color: colorType.grey2, fontSize: 12 }}
                        onClick={() => removeFilterTag(id, column)}
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


const getColumnsValue = (rows, headers) => {
    let valueObj = {};
    headers.forEach(hd => {
        let valueArr = [];
        rows.filter(r => r._rowLevel === 1).forEach(row => {
            valueArr.push(row[hd] || '');
        });
        valueArr = [...new Set(valueArr)].filter(e => e);
        valueArr.sort((a, b) => a > b ? 1 : (b > a ? -1 : 0));
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