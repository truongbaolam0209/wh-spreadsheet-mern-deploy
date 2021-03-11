import React, { useContext } from 'react';
import styled from 'styled-components';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { addZero } from '../../utils';


const CellIndex2 = ({ rowData }) => {

    const { state: stateRow, getSheetRows } = useContext(RowContext);
    const { state: stateCell, setCellActive } = useContext(CellContext);

    const { rowsAll, rowsSelected } = stateRow;



    const onClickCellIndex = () => {
        setCellActive(null);
        const row = rowsAll.find(x => x.id === rowData.id);
        if (!rowsSelected.find(x => x.id === rowData.id) && rowData._rowLevel === 1) {
            getSheetRows({
                ...stateRow,
                rowsSelected: [...rowsSelected, row],
                rowsSelectedToMove: []
            });
        };
    };

    return (
        <Styled onClick={onClickCellIndex}>
            {rowData._rowLevel === 1 ? addZero(rowsAll.indexOf(rowsAll.find(r => r.id === rowData.id)) + 1) : ''}
        </Styled>
    );
};

export default CellIndex2;



const Styled = styled.div`
    color: grey;
    font-size: 12px;

    width: 100%;
    height: 100%;
    padding: 5px;
    padding-right: 8px;
    text-align: right

`;

