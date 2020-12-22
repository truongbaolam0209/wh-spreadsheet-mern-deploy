import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { Context as UserContext } from '../../contexts/userContext';
import PanelCalendar from './PanelCalendar';



const Cell = (props) => {

    const {
        cellData, rowData, column, setPosition, rowIndex, columnIndex,
        updateStatusCell, isScrolling, container, onRightClickCell, colorized,
        cellOnDoubleClickTrigger, mouseDownStartCellsRange, mouseUpEndCellsRange
    } = props;


    const {
        state: stateCell,
        getCellModifiedTemp,
        setCellActive,
    } = useContext(CellContext);

    const { state: stateUser } = useContext(UserContext);

    const { state: stateRow, getSheetRows } = useContext(RowContext);

    
    const inputRef = useRef();
    const cellRef = useRef();
    const panelRef = useRef();
    const buttonRef = useRef();

    const [inputRender, setInputRender] = useState(false);
    const [initValue, setInitValue] = useState(cellData || '');
    const [value, setValue] = useState(cellData || '');



    // after keydown ENTER to show input ...
    useEffect(() => {
        if (
            !inputRender &&
            stateCell.cellActive &&
            stateCell.cellActive.rowIndex === rowIndex &&
            stateCell.cellActive.columnIndex === columnIndex
        ) {
            setInputRender(true);
        };
    }, [stateCell.cellActive]);


    const getCellTempId = () => {
        return `${rowData['id']}-${column.key}`;
    };

    const cellEditDone = (value) => {
        getCellModifiedTemp({ [getCellTempId()]: value });

        if (stateRow.rowsUpdateAndNews) {
            let rowsUpdateAndNews = [...stateRow.rowsUpdateAndNews];
            let rowsUpdate = rowsUpdateAndNews.find(r => r.id === rowData.id);

            if (rowsUpdate) {
                rowsUpdate[column.key] = value;
                getSheetRows({
                    ...stateRow,
                    rowsUpdateAndNews
                });
            } else {
                getSheetRows({
                    ...stateRow,
                    rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews, {...rowData, [column.key]: value}]
                });
            }
        } else {
            getSheetRows({
                ...stateRow,
                rowsUpdateAndNews: [{...rowData, [column.key]: value}]
            });
        };
    };


    const onDoubleClick = () => {
        setInputRender(true);
        cellOnDoubleClickTrigger();
    };
    const onClick = () => {
        setBtnShown(true);
        if (!inputRender) {
            setPosition({
                cell: cellRef.current.parentElement,
                rowIndex,
                columnIndex
            });
        };
    };
    useEffect(() => {
        // FOCUS right after press ENTER...
        if (inputRender) {
            inputRef.current.focus();
        };
    }, [inputRender]);


    useEffect(() => {
        document.addEventListener('click', EventClickToHidePanelAndInput);
        return () => document.removeEventListener('click', EventClickToHidePanelAndInput);
    }, []);
    const EventClickToHidePanelAndInput = (e) => {
        if (e.target !== cellRef.current && inputRef.current && e.target !== inputRef.current) {
            setInputRender(false);
        } else if (e.target !== cellRef.current && e.target !== panelRef.current && e.target !== buttonRef.current) {
            setPanelData(false);
        };
    };

    const [btnShown, setBtnShown] = useState(false);

    const [panelData, setPanelData] = useState(false);

    const onMouseLeave = () => {
        setBtnShown(false);
    };
    const onMouseDown = (e) => {
        if (e.button === 2) { // check mouse RIGHT CLICK ...
            onRightClickCell(e, props);
        } else { // MULTI SELECT CELL RANGES
            if (!inputRender) {
                mouseDownStartCellsRange({ e, rowIndex, columnIndex, cell: cellRef });
            };
        };
    };
    const onMouseUp = (e) => {
        if (e.button !== 2) {
            mouseUpEndCellsRange({ e, rowIndex, columnIndex, cell: cellRef });
        };
    };
    const pickDataSelect = (value) => {
        setValue(value);
        setPanelData(false);
        setBtnShown(false);
        if (initValue !== value) {
            cellEditDone(value);
        } else {
            setInputRender(false);
        };
    };
    const pickDate = (value) => {
        setValue(moment(value).format('DD/MM/YY'));
        setPanelData(false);
        setBtnShown(false);
        if (initValue !== value) {
            cellEditDone(moment(value).format('DD/MM/YY'));
        } else {
            setInputRender(false);
        };
    };



    const onChange = (e) => {
        setValue(e.target.value);
    };
    const onBlur = () => {
        if (initValue !== value) {
            cellEditDone(value);
        };
        setInputRender(false);
    };
    // ENTER to hide input after finishing typing ...
    const onKeyPress = (e) => {
        if (
            e.key === 'Enter' &&
            inputRender &&
            stateCell.cellActive &&
            stateCell.cellActive.rowIndex === rowIndex &&
            stateCell.cellActive.columnIndex === columnIndex
        ) {
            inputRef.current.blur();
            setCellActive(null);
        };
    };


    const cellBackground =
        (
            stateCell.cellsRangeStart &&
            stateCell.cellsRangeEnd &&
            checkIfCellsRangeContainsCell(stateCell.cellsRangeStart, stateCell.cellsRangeEnd, rowIndex, columnIndex)
        )
            ? colorType.cellHighlighted
            // : (
            //     cellSearchFound &&
            //     rowData.id in cellSearchFound &&
            //     cellSearchFound[rowData.id].indexOf(column.key) !== -1
            // )
            //     ? 'green'
            : null;

    const cellFontWeight = (rowData._rowLevel === 0 || rowData._rowLevel === - 1) && 'bold';

    return (
        <>
            <div
                ref={cellRef}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                onMouseLeave={onMouseLeave}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                style={{
                    width: '100%',
                    height: '100%',
                    color: cellLocked(stateUser.role, column) ? '#8FBC8F' : 'black',
                    background: cellBackground,
                    fontWeight: cellFontWeight,
                    padding: 5,
                    position: 'relative',
                    pointerEvents: cellLocked(stateUser.role, column) && 'none'
                }}
            >
                {inputRender ? (
                    <input
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        onKeyPress={onKeyPress}
                        ref={inputRef}
                        style={{
                            outline: 'none',
                            border: 'none',
                            background: 'transparent',
                            width: column.width - 20
                        }}
                    />

                ) : (
                        <span>
                            {
                                stateCell.cellsModifiedTemp[getCellTempId()] ||  // there is modified data
                                (getCellTempId() in stateCell.cellsModifiedTemp && ' ') || // there is modified data === empty
                                cellData // there is no modification
                            }
                        </span>
                    )
                }


                {btnShown && !cellBtnDisabled(column.key) && (
                    <div
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            right: 5,
                            top: 5,
                            height: 17,
                            width: 17,
                            backgroundImage: `url('./img/btn-${checkIconBtn(column.key) ? 'calendar2' : 'down2'}.png')`,
                            backgroundSize: 17
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setPanelData(!panelData);
                        }}
                        ref={buttonRef}
                    />
                )}


                {panelData && (
                    <div
                        style={{
                            position: 'absolute',
                            background: 'white',
                            top: 30,
                            left: 0,
                            minWidth: column.width,
                            zIndex: 999,
                            padding: '3px 5px 3px 7px',
                            boxShadow: 'rgba(0, 0, 0, 0.09) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 16px'
                        }}
                        ref={panelRef}
                    >
                        {checkIconBtn(column.key) ? (
                            <PanelCalendar pickDate={pickDate} />
                        ) : textArr(column.key).map(item => {
                            return (
                                <SelectStyled
                                    key={item}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        pickDataSelect(item);
                                        if (column.key === 'Status' || column.key === 'Rev' ||
                                            column.key === 'Coordinator In Charge' || column.key === 'Modeller') {
                                            updateStatusCell({ [getCellTempId()]: item });
                                        };
                                    }}
                                >{item}</SelectStyled>
                            )
                        })}
                    </div>
                )}

            </div>
        </>
    );
};

export default Cell;

const SelectStyled = styled.div`
    padding: 4px;

    &:hover {
        background-color: ${colorType.grey4};
        cursor: pointer
    };
    transition: 0.2s;

`;

const checkIconBtn = (header) => {
    return header.includes('(A)') || header.includes('(T)');
};

const cellBtnDisabled = (headerId) => {
    if (headerId === 'Index' || headerId === 'Drawing Number' || headerId === 'Drawing Name') return true;
};


const textArr = (header) => {
    const arr = header === 'Status' ? [
        'Reject And Resubmit',
        'Approved for Construction',
        'Not Started',
        'Consultant reviewing',
        'Approved with comments, to Resubmit',
        'Approved with Comment, no submission Required',
        'Revise In-Progress',
        '1st cut of drawing in-progress',
    ] : header === 'Rev' ? [
        '0', 'A', 'B', 'C'
    ] : header === 'RFA Ref' ? [
        'RFA/HAN/ARC/067', 'RFA/HAN/ARC/056', 'RFA/HAN/ARC/055', 'RFA/HAN/ARC/040', 'RFA/HAN/ARC/042', 'RFA/HAN/ARC/045',
    ] : [];
    return arr;
};


const colors = {
    red: '#FFDAB9',
    blue: '#AFEEEE',
    brown: '#F0E68C',
    green: '#98FB98',
    white: 'white'
};


const colorizedRows = (colorized, rowData) => {
    if (colorized === 'Rev') {
        return rowData[colorized] === '0' ? colors.red :
            rowData[colorized] === 'A' ? colors.blue :
                rowData[colorized] === 'B' ? colors.brown : colors.white
    } else if (colorized === 'Status') {
        return rowData[colorized] === 'Reject And Resubmit' ? colors.red :
            rowData[colorized] === 'Approved for Construction' ? colors.blue :
                rowData[colorized] === 'Not Started' ? colors.white : colors.green
    } else if (colorized === 'Modeller') {
        return rowData[colorized] === 'Anne' ? colors.red :
            rowData[colorized] === 'Judy' ? colors.blue :
                rowData[colorized] === 'Thomas' ? colors.white : colors.green
    } else if (colorized === 'Coordinator In Charge') {
        return rowData[colorized] === 'Hannah' ? colors.red : colors.white
    };
};


const cellLocked = (title, column) => {
    const ColumnsLocked = [
        'Model Start (T)',
        'Model Start (A)',
        'Model Finish (T)',
        'Model Finish (A)',
        'Model Progress',
        'Drawing Start (T)',
        'Drawing Start (A)',
        'Drawing Finish (T)',
        'Drawing Finish (A)',
    ];
    if (title === 'modeller' && ColumnsLocked.includes(column.key)) return true;
};


const checkIfCellsRangeContainsCell = (cellsRangeStart, cellsRangeEnd, rowIndex, columnIndex) => {

    let rowMin = cellsRangeStart.rowIndex <= cellsRangeEnd.rowIndex ? cellsRangeStart.rowIndex : cellsRangeEnd.rowIndex;
    let rowMax = cellsRangeStart.rowIndex > cellsRangeEnd.rowIndex ? cellsRangeStart.rowIndex : cellsRangeEnd.rowIndex;

    let columnMin = cellsRangeStart.columnIndex <= cellsRangeEnd.columnIndex ? cellsRangeStart.columnIndex : cellsRangeEnd.columnIndex;
    let columnMax = cellsRangeStart.columnIndex > cellsRangeEnd.columnIndex ? cellsRangeStart.columnIndex : cellsRangeEnd.columnIndex;

    return (
        rowIndex >= rowMin &&
        rowIndex <= rowMax &&
        columnIndex >= columnMin &&
        columnIndex <= columnMax
    );
};