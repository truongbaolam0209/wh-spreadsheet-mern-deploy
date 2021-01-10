import React, { useContext } from 'react';
import styled from 'styled-components';
import { Context as RowContext } from '../../contexts/rowContext';
import { addZero } from '../../utils';

const CellIndex = (props) => {

    const { state: stateRow } = useContext(RowContext);
    const { rowsAll } = stateRow;
    const { rowData } = props;
    


    return (
        <Styled>
            {rowData._rowLevel === 1 ? addZero(rowsAll.indexOf(rowsAll.find(r => r.id === rowData.id)) + 1) : ''}
        </Styled>
    );
};

export default CellIndex;



const Styled = styled.div`
    color: grey;
    font-size: 12px;

    width: 100%;
    height: 100%;
    padding: 5px;
    padding-right: 8px;
    text-align: right

`;
