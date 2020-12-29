import { Select } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';


const { Option } = Select;



const FormSort = ({ applySort, onClickCancel }) => {

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

        let rowsOutput = [];
        if (type === 'Sort Rows In Drawing Type') {

            let rows = stateRow.rowsAll.filter(r => r._rowLevel === 0);

            if (rows.length === 0) {
                let rowArr = stateRow.rowsAll.filter(r => r._rowLevel === 1);
                if (typeSort === 'ascending') {
                    rowsOutput = sortFnc(rowArr, headerSorted, true);
                } else if (typeSort === 'descending') {
                    rowsOutput = sortFnc(rowArr, headerSorted, false);
                };
            } else if (rows.length > 0) {
                rows.forEach(r => {
                    rowsOutput.push(r);

                    let subRows = stateRow.rowsAll.filter(subR => subR._parentRow === r.id);

                    if (typeSort === 'ascending') {
                        subRows = sortFnc(subRows, headerSorted, true);
                    } else if (typeSort === 'descending') {
                        subRows = sortFnc(subRows, headerSorted, false);
                    };
                    rowsOutput = [...rowsOutput, ...subRows];
                });
            };

        } else if (type === 'Sort Rows In Project') {
            let rowArr = stateRow.rowsAll.filter(r => r._rowLevel === 1);
            if (typeSort === 'ascending') {
                rowsOutput = sortFnc(rowArr, headerSorted, true);
            } else if (typeSort === 'descending') {
                rowsOutput = sortFnc(rowArr, headerSorted, false);
            };
        };
        applySort(rowsOutput);
    };


    const sortFnc = (rows, header, ascending) => {
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

    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
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
                    onClickCancel={onClickCancel}
                    onClickApply={onClickApply}
                />
            </div>

        </div>
    );
};
export default FormSort;



const SelectComp = ({ setSortSelect }) => {

    const { state: stateProject } = useContext(ProjectContext);

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
                {stateProject.userData.headersShown.map(hd => (
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