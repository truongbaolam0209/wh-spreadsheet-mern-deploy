import { Button } from 'antd';
import React from 'react';

const ButtonStyle = ({
    colorText,
    marginRight,
    borderColor,
    background,
    name,
    onClick
}) => {

    return (
        <Button 
            style={{
                borderRadius: 0,
                background: background,
                color: colorText,
                border: 'none',
                marginRight: marginRight,
                border: `1px solid ${borderColor || background}`
            }}
            onClick={onClick}
        >
            {name}
        </Button>
    );
};

export default ButtonStyle;


