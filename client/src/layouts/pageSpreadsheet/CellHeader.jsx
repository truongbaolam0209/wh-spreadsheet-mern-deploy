import React, { useContext } from 'react';
import { Context as CellContext } from '../../contexts/cellContext';


const CellHeader = (props) => {

    const { className, column, columns, columnIndex, onMouseDownColumnHeader, headerIndex, container } = props;

    const {
        state: stateCell, getCellModifiedTemp, clearCellModifiedTemp, setCellActive
    } = useContext(CellContext);


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
