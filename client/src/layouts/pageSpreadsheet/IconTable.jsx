import { Icon, Tooltip } from 'antd';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';



const IconTable = (props) => {

    const { type, onClick } = props;

    const { state: stateRow } = useContext(RowContext);
    const { state: stateProject } = useContext(ProjectContext);

    const role = stateProject.allDataOneSheet && stateProject.allDataOneSheet.role;
    const showDrawingsOnly = stateRow && stateRow.showDrawingsOnly;

    let disabled;
    disabled = showDrawingsOnly === 'group-columns' && type !== 'rollback';
    disabled = (role === 'modeller' || role === 'manager' || role === 'viewer' || role === 'production') && type === 'folder-add';

    return (
        <Tooltip placement={type === 'menu' ? 'topLeft' : 'top'} title={toolTipBtn(type)}>
            <DivStyled>
                <IconStyled
                    type={type}
                    onClick={onClick}
                    disabled={disabled}
                />
            </DivStyled>
        </Tooltip>
    );
};

export default IconTable;


const toolTipBtn = (type) => {
    return type === 'filter' ? 'Filter Data' : 
    type === 'apartment' ? 'Grouping Data' :
    type === 'layout' ? 'Reorder Columns' :
    type === 'sort-ascending' ? 'Sort Rows' :
    type === 'search' ? 'Search' :
    type === 'save' ? 'Save' :
    type === 'highlight' ? 'Colorized Rows' :
    type === 'eye' ? 'Rows Hide/Unhide' :
    type === 'menu' ? 'Projects List' :
    type === 'rollback' ? 'Clear Filter/Sort/Group/Search' :
    type === 'history' ? 'Activity History' :
    type === 'border-outer' ? 'PUBLIC' :
    type === 'radius-upright' ? 'USER' :
    type === 'save' ? 'Save' :
    type === 'fullscreen-exit' ? 'Save SMARTSHEET To Server SUMANG' :
    type === 'fall' ? 'Save SMARTSHEET To Server HANDY' :
    type === 'delete' ? 'Delete Rows In Current Project' :
    type === 'stock' ? 'Delete All Data In Every DB Collections' :
    type === 'pic-center' ? 'Save Random Rows To Server' :
    type === 'folder-add' ? 'Drawing Type Organization' :
    type === 'heat-map' ? 'Highlight Data Changed' :
    'xxx';
};

const DivStyled = styled.div`
    &:hover {
        background-color: ${colorType.grey1}
    }
    /* padding: 3px; */
    transition: 0.2s;
    border-radius: 5px;
`;


const IconStyled = styled(Icon)`
    border: ${props => props.disabled ? '1px solid grey' : '1px solid black'};
    padding: 3px;
    font-size: 17px;
    margin: 3px;
    border-radius: 5px;
    color: ${props => props.disabled ? 'grey' : 'black'};
    pointer-events: ${props => props.disabled && 'none'};
`;