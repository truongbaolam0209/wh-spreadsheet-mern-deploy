import { Button } from 'antd';
import React from 'react';

const ButtonStyle = ({
    colorText,
    marginRight,
    marginLeft,
    borderColor,
    marginBottom,
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
                marginRight,
                marginBottom,
                marginLeft,
                border: `1px solid ${borderColor || background}`
            }}
            onClick={onClick}
        >
            {name}
        </Button>
    );
};

export default ButtonStyle;


