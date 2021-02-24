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

   const roleInit = stateProject.allDataOneSheet && stateProject.allDataOneSheet.role;
   const showDrawingsOnly = stateRow && stateRow.showDrawingsOnly;

   let disabled = false;
   if (showDrawingsOnly === 'group-columns' && type !== 'swap' && type !== 'save') {
      disabled = true;
   };


   return (
      <Tooltip placement={type === 'menu' ? 'topLeft' : 'top'} title={toolTipBtn(type)}>
         <DivStyled>
            {type === 'rfa-button' ? (
               <IconRFA>RFA</IconRFA>
            ) : (
                  <IconStyled
                     type={type}
                     onClick={onClick}
                     disabled={disabled}
                  />
               )}

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
                              type === 'swap' ? 'Clear Filter/Sort/Group/Search' :
                                 type === 'history' ? 'Activity History' :
                                    type === 'border-outer' ? 'PUBLIC' :
                                       type === 'radius-upright' ? 'USER' :
                                          type === 'save' ? 'Save' :
                                             type === 'fullscreen-exit' ? 'Save SMARTSHEET To Server SUMANG' :
                                                type === 'fall' ? 'Save SMARTSHEET To Server HANDY' :
                                                   type === 'delete' ? 'Delete All Data In Every DB Collections' :
                                                      type === 'pic-center' ? 'Save Random Rows To Server' :
                                                         type === 'folder-add' ? 'Drawing Type Organization' :
                                                            type === 'heat-map' ? 'Highlight Data Changed' :
                                                               type === 'export' ? 'Export To Excel' :
                                                                  type === 'plus' ? 'Save View Template' :
                                                                     type === 'edit' ? 'Change User Name To Check Multi-User' :
                                                                        type === 'upload' ? 'Upload Data To Server' :
                                                                           type === 'rfa-button' ? 'Go To RFA View' :
                                                                           'xxx';
};

const DivStyled = styled.div`
    &:hover {
        background-color: ${colorType.grey1}
    }
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

const IconRFA = styled.div`
   &:hover {
      cursor: pointer;
   }
   border: ${props => props.disabled ? '1px solid grey' : '1px solid black'};
   padding: 3px;
   font-size: 11.5px;
   margin: 3px;
   border-radius: 5px;
   color: ${props => props.disabled ? 'grey' : 'black'};
   pointer-events: ${props => props.disabled && 'none'};
`;