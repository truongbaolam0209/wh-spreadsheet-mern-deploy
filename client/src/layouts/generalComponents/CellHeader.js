import { Tooltip } from 'antd';
import React from 'react';


const CellHeader = (props) => {

   const { column } = props;

   return (
      <Tooltip title={column.title} placement='bottom'>
         <div
            style={{
               height: '100%',
               width: '100%',
               verticalAlign: 'middle',
            }}
         >
            {column.title}
         </div>
      </Tooltip>
   );
};

export default CellHeader;
