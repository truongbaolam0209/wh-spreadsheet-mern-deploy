import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import PanelCalendar from './PanelCalendar';



const Cell = (props) => {

    const {
        rowData, column, rowIndex, columnIndex,
        onRightClickCell, setPosition, getCurrentDOMCell
    } = props;

    let cellData = props.cellData;
    
    if ((column.key.includes('(A)') || 
        column.key.includes('(T)') || 
        column.key === 'Construction Issuance Date' ||
        column.key === 'Construction Start') && cellData && cellData.length === 10 && cellData.includes('-')) {
            cellData = moment(cellData, 'YYYY-MM-DD').format('DD/MM/YY');
    };



    const { state: stateCell, getCellModifiedTemp, setCellActive } = useContext(CellContext);
    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateRow, getSheetRows } = useContext(RowContext);

    const inputRef = useRef();
    const cellRef = useRef();
    const panelRef = useRef();
    const buttonRef = useRef();


 

    const [inputRender, setInputRender] = useState(false);
    const [initValue, setInitValue] = useState(cellData || '');
    const [value, setValue] = useState(cellData || '');
    const [btnShown, setBtnShown] = useState(false);
    const [panelData, setPanelData] = useState(false);


    // after keydown ENTER to show input ...
    useEffect(() => {
        if (
            !inputRender &&
            stateCell.cellActive &&
            stateCell.cellActive.rowIndex === rowIndex &&
            stateCell.cellActive.columnIndex === columnIndex &&
            !cellLocked(stateProject.allDataOneSheet.role, column)
        ) {
            setInputRender(true);
        };
    }, [stateCell.cellActive]);


    const getCellTempId = () => {
        return `${rowData['id']}-${column.key}`;
    };
    const cellEditDone = (value) => {
        getCellModifiedTemp({ [getCellTempId()]: value });

        if (stateRow.rowsUpdateAndNews.length > 0) {
            let { rowsUpdateAndNews } = stateRow;
            let rowsUpdate = rowsUpdateAndNews.find(r => r.id === rowData.id);
            if (rowsUpdate) {
                rowsUpdate[column.key] = value;
                getSheetRows({ ...stateRow, rowsUpdateAndNews });
            } else {
                getSheetRows({
                    ...stateRow,
                    rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews, { ...rowData, [column.key]: value }]
                });
            };
        } else {
            getSheetRows({
                ...stateRow,
                rowsUpdateAndNews: [{ ...rowData, [column.key]: value }]
            });
        };
    };


    const onDoubleClick = () => {
        setInputRender(true);
        getCurrentDOMCell();
    };
    const onClick = () => {
        setBtnShown(true);
        if (!inputRender) {
            setPosition({ cell: cellRef.current.parentElement, rowIndex, columnIndex });
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



    const onMouseLeave = () => {
        setBtnShown(false);
    };
    const onMouseDown = (e) => {
        if (e.button === 2) { // check mouse RIGHT CLICK ...
            onRightClickCell(e, props);
        };
    };
    const pickDataSelect = (value) => {
        setBtnShown(false);
        setPanelData(false);
        setValue(value);
        if (initValue !== value) {
            cellEditDone(value);
        } else {
            setInputRender(false);
        };
    };
    const pickDate = (value) => {
        setBtnShown(false);
        setPanelData(false);
        setValue(moment(value).format('DD/MM/YY'));
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
            stateCell.cellActive.columnIndex === columnIndex &&
            !cellLocked(stateProject.allDataOneSheet.role, column)
        ) {
            inputRef.current.blur();
            setCellActive(null);
        };
    };



    return (
        <>
            <div
                ref={cellRef}
                onDoubleClick={onDoubleClick}
                onClick={onClick}
                onMouseLeave={onMouseLeave}
                onMouseDown={onMouseDown}
                style={{
                    width: '100%',
                    height: '100%',
                    color: cellLocked(stateProject.userData.role, column) ? '#8FBC8F' : 'black',
                    padding: 5,
                    position: 'relative',
                    pointerEvents: cellLocked(stateProject.allDataOneSheet.role, column) && 'none',
                    color: cellLocked(stateProject.allDataOneSheet.role, column) ? '#979797' : 'black',
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
                            width: column.width - 30
                        }}
                    />

                ) : (
                        <div style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            width: column.width - 30
                        }}>
                            {
                                stateCell.cellsModifiedTemp[getCellTempId()] ||  // there is modified data
                                (getCellTempId() in stateCell.cellsModifiedTemp && ' ') || // there is modified data === empty
                                cellData // there is no modification
                            }
                        </div>
                    )
                }


                {btnShown && !cellBtnDisabled(column.key) && (
                    <div style={{
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
                    <div style={{
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
                                    }}
                                >{item}</SelectStyled>
                            );
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
        cursor: pointer;
    };
    transition: 0.2s;
`;

const checkIconBtn = (header) => {
    return header.includes('(A)') || 
        header.includes('(T)') || 
        header === 'Construction Issuance Date' ||
        header === 'Construction Start';
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
    const ColumnsLockedModeller = [
        'Drg To Consultant (T)',
        'Drg To Consultant (A)',
        'Consultant Reply (T)',
        'Consultant Reply (A)',
        'Get Approval (T)',
        'Get Approval (A)',
        'Construction Issuance Date',
        'Construction Start',
    ];
    if (title === 'modeller' && ColumnsLockedModeller.includes(column.key)) return true;
    if (title === 'coordinator') return false;
    if (title === 'manager' || title === 'viewer') return true;
    if (title === 'production' && column === 'Construction Start') return false;
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