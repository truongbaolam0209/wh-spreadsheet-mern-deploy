import { Tooltip } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';



const IconSidePanel = (props) => {

   const { type, onClick } = props;

   return (
      <Tooltip placement={'right'} title={toolTipBtn(type)}>
         <IconSide onClick={onClick}>{type.slice(5, type.length).toUpperCase()}</IconSide>
      </Tooltip>
   );
};

export default IconSidePanel;


const toolTipBtn = (type) => {
   return type === 'side-dms' ? 'Drawing Management System' :
      type === 'side-rfa' ? 'Request For Approval' :
         type === 'side-rfam' ? 'Request For Approval Of Material' :
            type === 'side-rfi' ? 'Request For Information' :
               type === 'side-cvi' ? 'Confirmation Of Verbal Instruction' :
                  type === 'side-dt' ? 'Document Transmittal' :
                     type === 'side-mm' ? 'Meeting Minutes' :
                        'No Title';
};


const IconSide = styled.div`
   &:hover {
      cursor: pointer;
      background-color: ${colorType.grey1};
      transition: 0.2s;
      border-radius: 5px;
   };
   border: ${props => props.disabled ? '1px solid grey' : '1px solid black'};
   padding: 3px;
   font-size: 11.5px;
   margin: 6px;
   border-radius: 5px;
   color: white;
   pointer-events: ${props => props.disabled && 'none'};
   text-align: center;
`;