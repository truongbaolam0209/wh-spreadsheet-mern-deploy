import React, { useContext } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as RowContext } from '../../contexts/rowContext';

const PanelFunction = (props) => {

    const { buttonPanelFunction, panelType } = props;

    const { state: stateRow } = useContext(RowContext);

    const { rowsToMoveId } = stateRow;


    const listButton = panelType.type === 'cell' && [
        'View Drawing Revision',
        'Create New Drawing Revision',
        'Date Automation',
        'View Cell History',
        'Insert Drawings Below',
        'Insert Drawings Above',
        'Move Drawing',
        'Paste Drawing',
        'Delete Drawing',
        'Insert Drawings By Type'
    ];

    return (
        <div
            style={{
                border: `1px solid ${colorType.grey1}`,
                background: 'white',
            }}
        >
            {listButton.map(btn => (
                <Container
                    key={btn}
                    onMouseDown={() => buttonPanelFunction(btn)}
                    style={disabledBtn(props, btn, rowsToMoveId)}
                >
                    {btn}
                </Container>

            ))}
        </div>
    );
};

export default PanelFunction;

const Container = styled.div`
    padding: 7px;
    padding-left: 25px;
    
    cursor: pointer;
    color: black;
    &:hover {
        background: ${colorType.grey0};
    };

`;


const disabledBtn = ({ panelType }, btn, rowsToMoveId) => {
    if (!rowsToMoveId && btn === 'Paste Drawing') {
        return { pointerEvents: 'none', color: 'grey' };
    };

    const { _rowLevel } = panelType.cellProps.rowData;

    if (_rowLevel === 1 && btn === 'Insert Drawings By Type') return {
        pointerEvents: 'none',
        color: 'grey'
    };
    if (_rowLevel !== 1 && btn !== 'Insert Drawings By Type') return {
        pointerEvents: 'none',
        color: 'grey'
    };
    
};


