import { Icon, Input, Tooltip } from 'antd';
import _, { debounce } from 'lodash';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as RowContext } from '../../contexts/rowContext';

const { Search } = Input;


const InputSearch = ({ searchGlobal, closeSearchInput }) => {

    const { state: stateRow } = useContext(RowContext);

    const onChange = debounce((e) => {
        let search = e.target.value;
        let rows = [...stateRow.rowsVisible];
        let rowsFound = {};
        rows.forEach(row => {
            let obj = {};
            Object.keys(row).forEach(key => {

                if (row[key] && row[key].toString().toLowerCase().includes(search.toLowerCase())) {
                    obj[row.id] = [...obj[row.id] || [], key];
                };
            });
            if (!_.isEmpty(obj)) rowsFound = { ...rowsFound, [row.id]: obj[row.id] };
        });
        searchGlobal(rowsFound);
    }, 500);

    return (
        <InputStyled>
            <input
                placeholder='Input search text...'
                onChange={onChange}
                style={{
                    border: 'none',
                    outline: 'none',
                    height: 21,
                    background: 'transparent'
                }}
            />
            <div style={{ float: 'right' }}>
                <Tooltip title='Show Searched Row Only'>
                    <IconStyled
                        type='right-circle'
                        onClick={closeSearchInput}
                    />
                </Tooltip>
                <Tooltip title='Quit Search'>
                    <IconStyled
                        type='close-circle'
                        onClick={closeSearchInput}
                    />
                </Tooltip>

            </div>

        </InputStyled>
    );
};

export default InputSearch;


const IconStyled = styled(Icon)`
    font-size: 15px;
    margin-right: 2px;
    margin-top: 3px;
    padding: 3px;
    border-radius: 50%;
    &:hover {
        background-color: ${colorType.grey1}
    }
    transform: translate(0, -3px);
`;

const InputStyled = styled.div`

    margin: 3px;
    padding-top: 1px;
    padding-left: 3px;
    height: 25px;
    width: 250px;
    border: 1px solid black;
    border-radius: 5px;
    background-color: ${colorType.grey4}
`;