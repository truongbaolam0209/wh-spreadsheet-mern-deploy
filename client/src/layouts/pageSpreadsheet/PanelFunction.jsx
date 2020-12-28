import React from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';


const PanelFunction = (props) => {

    const { buttonPanelFunction, panelType } = props;



    const listButton = panelType.type === 'column' ? [
        'Insert Column Left',
        'Insert Column Right',
        'Delete Column',
        'Filter',
        'Sort Rows Drawing Type',
        'Sort All Rows',
        'Manage Column Value',
        'Group This Column'

    ] : [
            'View Drawing Revision',
            'Create New Drawing Revision',
            'Date Automation',
            'View Cell History',
            'Insert Drawings Below',
            'Insert Drawings Above',
            'Move Drawing',
            'Paste Drawing',
            'Delete Drawing',
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
                    style={disabledBtn(props, btn)}
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


const disabledBtn = ({ panelType }, btn) => {

    if (panelType.type === 'cell') {
        const { _rowLevel } = panelType.cellProps.rowData;

        if (_rowLevel === 0 && btn !== 'View Cell History') return {
            pointerEvents: 'none',
            color: 'grey'
        };
    };
};


