import { Icon, Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';

const IconTable = (props) => {
    const { type, onClick } = props;
    return (
        <Tooltip placement={type === 'menu' ? 'topLeft' : 'top'} title={toolTipBtn(type)}>
            <DivStyled>
                <IconStyled
                    type={type}
                    onClick={onClick}
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
    type === 'fullscreen-exit' ? 'Save Rows To Server' :
    type === 'pic-center' ? 'Save Random Rows To Server' :
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

    border: 1px solid black;
    /* color: grey; */
    padding: 3px;
    font-size: 17px;
    margin: 3px;
    border-radius: 5px;

    
`;