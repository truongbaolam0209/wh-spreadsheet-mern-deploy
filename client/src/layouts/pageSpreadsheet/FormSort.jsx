import { Select } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as RowContext } from '../../contexts/rowContext';
import { Context as UserContext } from '../../contexts/userContext';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';


const { Option } = Select;



const FormSort = ({ applySort, onClickCancelModal }) => {

    const { state: stateRow } = useContext(RowContext);


    const setSortSelect = (dataSort) => {
        setSortColumn(dataSort);
    };


    const [sortColumn, setSortColumn] = useState({});
    const [type, setType] = useState('Sort Rows In Project');
    const [backgroundSortDrawingType, setBackgroundSortDrawingType] = useState('white');
    const [backgroundSortInProject, setBackgroundSortInProject] = useState(colorType.grey1);
    const selectTypeClick = (e) => {
        if (e.target.textContent === 'Sort Rows In Drawing Type') {
            setBackgroundSortDrawingType(colorType.grey1);
            setBackgroundSortInProject('white');
        } else {
            setBackgroundSortDrawingType('white');
            setBackgroundSortInProject(colorType.grey1);
        };
        setType(e.target.textContent);
    };



    const onClickApply = () => {

        const headerSorted = Object.keys(sortColumn)[0];

        const typeSort = sortColumn[headerSorted].toLowerCase();

        let rowArr = [];

        if (type === 'Sort Rows In Drawing Type') {

            let rows = stateRow.rowsVisible.filter(r => r._rowLevel === 0);

            if (rows.length === 0) {

                rowArr = stateRow.rowsVisible.filter(r => r._rowLevel === 1);

                if (typeSort.toLowerCase() === 'ascending') {
                    rowArr.sort((a, b) => (a[headerSorted].toLowerCase() > b[headerSorted].toLowerCase()) ? 1 : ((b[headerSorted].toLowerCase() > a[headerSorted].toLowerCase()) ? -1 : 0));
                } else if (typeSort.toLowerCase() === 'descending') {
                    rowArr.sort((b, a) => (a[headerSorted].toLowerCase() > b[headerSorted].toLowerCase()) ? 1 : ((b[headerSorted].toLowerCase() > a[headerSorted].toLowerCase()) ? -1 : 0));
                };

            } else {
                rows.forEach(r => {
                    rowArr.push(r);

                    let subRows = stateRow.rowsVisible.filter(subR => subR._parentRow === r.id);

                    if (typeSort.toLowerCase() === 'ascending') {
                        subRows.sort((a, b) => (a[headerSorted].toLowerCase() > b[headerSorted].toLowerCase()) ? 1 : ((b[headerSorted].toLowerCase() > a[headerSorted].toLowerCase()) ? -1 : 0));
                    } else if (typeSort.toLowerCase() === 'descending') {
                        subRows.sort((b, a) => (a[headerSorted].toLowerCase() > b[headerSorted].toLowerCase()) ? 1 : ((b[headerSorted].toLowerCase() > a[headerSorted].toLowerCase()) ? -1 : 0));
                    };
                    rowArr = [...rowArr, ...subRows];
                });
            };

        } else if (type === 'Sort Rows In Project') {
            rowArr = stateRow.rowsVisible.filter(r => r._rowLevel === 1);
            if (typeSort.toLowerCase() === 'ascending') {
                rowArr.sort((a, b) => (a[headerSorted].toLowerCase() > b[headerSorted].toLowerCase()) ? 1 : ((b[headerSorted].toLowerCase() > a[headerSorted].toLowerCase()) ? -1 : 0));
            } else if (typeSort.toLowerCase() === 'descending') {
                rowArr.sort((b, a) => (a[headerSorted].toLowerCase() > b[headerSorted].toLowerCase()) ? 1 : ((b[headerSorted].toLowerCase() > a[headerSorted].toLowerCase()) ? -1 : 0));
            };
        };

        applySort(rowArr);
    };


    return (
        <>
            <div style={{
                padding: 20,
                borderBottom: `1px solid ${colorType.grey4}`
            }}>
                <div style={{ display: 'flex', marginBottom: 20 }}>
                    <ButtonStyle
                        onClick={selectTypeClick}
                        marginright={15}
                        background={backgroundSortDrawingType}
                        bordercolor={colorType.grey4}
                        name='Sort Rows In Drawing Type'
                    />
                    <ButtonStyle
                        onClick={selectTypeClick}
                        marginright={15}
                        background={backgroundSortInProject}
                        bordercolor={colorType.grey4}
                        name='Sort Rows In Project'
                    />
                </div>

                <SelectComp setSortSelect={setSortSelect} />
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
export default FormSort;



const SelectComp = ({ setSortSelect }) => {

    const { state: stateUser } = useContext(UserContext);

    const [column, setColumn] = useState(null);

    return (
        <div style={{ display: 'flex', paddingBottom: 20, width: '100%' }}>
            <SelectStyled
                defaultValue='Select Field...'
                style={{ width: '50%', marginRight: 20 }}
                onChange={(column) => {
                    setColumn(column);
                    setSortSelect({ [column]: 'Ascending' })
                }}
            >
                {stateUser.headersShown.map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>

            <SelectStyled
                defaultValue='Ascending'
                style={{ width: '50%' }}
                onChange={(value) => setSortSelect({ [column]: value })}
                disabled={column === null ? true : false}
            >
                <Option key='Ascending' value='Ascending'>Ascending</Option>
                <Option key='Descending' value='Descending'>Descending</Option>
            </SelectStyled>
        </div>
    );
};

const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;