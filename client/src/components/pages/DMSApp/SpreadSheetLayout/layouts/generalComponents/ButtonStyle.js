import { Button } from 'antd';
import React, { useContext } from 'react';
import { Context as RowContext } from '../../contexts/rowContext';




const ButtonStyle = ({
   colorText,
   marginRight,
   marginLeft,
   borderColor,
   borderOverwritten,
   marginBottom,
   background,
   name,
   onClick,
   disabled
}) => {

   const { state: stateRow } = useContext(RowContext);
   const { loading } = stateRow;

   return (
      <Button
         style={{
            borderRadius: 0,
            background: background,
            color: colorText,
            border: 'none',
            marginRight,
            marginBottom,
            marginLeft,
            border: `1px solid ${borderOverwritten ? borderColor : (borderColor || background)}`,
         }}
         onClick={onClick}
         disabled={disabled || (loading && name !== 'Yes')}
         loading={loading && name === 'Yes'}
      >
         {name}
      </Button>
   );
};

export default ButtonStyle;


