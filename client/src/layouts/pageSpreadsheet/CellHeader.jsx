import React from 'react';


const CellHeader = (props) => {

    const { className, column, columns, columnIndex, onMouseDownColumnHeader, headerIndex, container } = props;


    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                verticalAlign: 'middle',
            }}
            onMouseDown={(e) => onMouseDownColumnHeader(e, column.title)}
        >
            {column.title}
        </div>
    );
};

export default CellHeader;
