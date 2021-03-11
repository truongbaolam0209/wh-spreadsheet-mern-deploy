import React, { useContext } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';




const PanelFunction2 = (props) => {

    const { buttonPanelFunction, panelType } = props;

    const { state: stateRow } = useContext(RowContext);
    const { state: stateProject } = useContext(ProjectContext);

    const { role, publicSettings } = stateProject.allDataOneSheet;

    const { rowsSelectedToMove, rowsSelected, drawingTypeTree } = stateRow;

    const { rowData, column } = panelType.cellProps;

    const headerData = publicSettings.headers.find(hd => hd.text === column.key);
    const isLockedColumn = headerData.roleCanEdit.indexOf(role.name) === -1;



    const listButton = (rowData._rowLevel && rowData._rowLevel === 1 && !isLockedColumn) ? [
        'View Cell History',
        'Duplicate Drawings',
        'Insert Drawings Below',
        'Insert Drawings Above',
        'Move Drawings',
        'Paste Drawings',
        'Delete Drawing'

    ] : (rowData._rowLevel && rowData._rowLevel === 1 && isLockedColumn) ? [
        'View Cell History',
    ] : (rowData.treeLevel) ? [
        'Paste Drawings',
        'Insert Drawings By Type'
    ] : [];


    const onClickBtn = (btn) => {
        buttonPanelFunction(btn);
    };


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
                    onMouseDown={() => onClickBtn(btn)}
                    style={disabledBtn(
                        props,
                        btn,
                        rowsSelectedToMove,
                        rowsSelected,
                        drawingTypeTree
                    )}
                >
                    {btn}
                </Container>

            ))}
        </div>
    );
};

export default PanelFunction2;

const Container = styled.div`
    padding: 7px;
    padding-left: 25px;
    
    cursor: pointer;
    color: black;
    &:hover {
        background: ${colorType.grey0};
    };

`;


const disabledBtn = ({ panelType }, btn, rowsSelectedToMove, rowsSelected, drawingTypeTree) => {
    const { rowData } = panelType.cellProps;
    const { _rowLevel, treeLevel, id } = rowData;


    if (
        (rowsSelectedToMove.length === 0 && btn === 'Paste Drawings') ||
        (_rowLevel === 1 && rowsSelected.length > 0 && rowsSelectedToMove.length === 0 && btn !== 'Move Drawings') ||
        (_rowLevel === 1 && rowsSelected.length > 0 && rowsSelectedToMove.length > 0 && btn !== 'Paste Drawings') ||

        (treeLevel && drawingTypeTree.find(x => x.parentId === id) && (btn === 'Paste Drawings' || btn === 'Insert Drawings By Type')) ||
        (treeLevel && !drawingTypeTree.find(x => x.parentId === id) && rowsSelectedToMove.length === 0 && btn === 'Paste Drawings')

    ) return {
        pointerEvents: 'none',
        color: 'grey'
    };
};


export const getPanelPosition = ({ x: clickX, y: clickY }) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const right = (screenW - clickX) < 200;
    const left = clickX < 200;
    const top = clickY < 200;
    const bottom = (screenH - clickY) < 200;

    return {
        x: right && top ? clickX - 250 :
            right && bottom ? clickX - 250 :
                left && bottom ? clickX :
                    left && top ? clickX :
                        right ? clickX - 250 : clickX,
        y: right && top ? clickY :
            right && bottom ? clickY - 300 :
                left && bottom ? clickY - 300 :
                    left && top ? clickY :
                        bottom ? clickY - 300 : clickY
    };
};