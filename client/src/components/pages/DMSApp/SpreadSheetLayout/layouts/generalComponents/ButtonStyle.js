import { Button } from 'antd';
import React from 'react';



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
         disabled={disabled}
      >
         {name}
      </Button>
   );
};

export default ButtonStyle;

