import React from 'react';


const CellHeader = (props) => {

   const { column } = props;

   return (
      <div
         style={{
            height: '100%',
            width: '100%',
            verticalAlign: 'middle',
         }}
      >
         {column.title}
      </div>
   );
};

export default CellHeader;
