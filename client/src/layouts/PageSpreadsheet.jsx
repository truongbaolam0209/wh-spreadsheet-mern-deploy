import { Divider, Icon, Modal } from 'antd';
import Axios from 'axios';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';
import { colorType, dimension } from '../constants';
import { Context as CellContext } from '../contexts/cellContext';
import { Context as ProjectContext } from '../contexts/projectContext';
import { Context as RowContext } from '../contexts/rowContext';
import { Context as UserContext } from '../contexts/userContext';
import { convertCellTempToHistory, getDataConvertedSmartsheet, getHeadersText, mapSubRows, mongoObjectId, newObj2 } from '../utils';
import makeData from '../utils/makeData';
import Cell from './pageSpreadsheet/Cell';
import CellHeader from './pageSpreadsheet/CellHeader';
import CellIndex from './pageSpreadsheet/CellIndex';
import IconTable from './pageSpreadsheet/IconTable';
import InputSearch from './pageSpreadsheet/InputSearch';
import PanelFunction from './pageSpreadsheet/PanelFunction';
import PanelSetting from './pageSpreadsheet/PanelSetting';
import SideBar from './pageSpreadsheet/SideBar';
const SERVER_URL = 'http://localhost:9000/api';




const Table = forwardRef((props, ref) => {
    return (
        <AutoResizer>
            {() => {
                return (
                    <BaseTable
                        {...props}
                        ref={ref}
                        width={window.innerWidth}
                        height={800 + 15}
                    />
                );
            }}
        </AutoResizer>
    );
});



const dataOrigin = makeData(10);


// const userId = '5fd9b53350d46f91fc93776f';
// const userId = 'baoquylan@gmail.com';
// const projectId = '5fd981dcd843c2728433cc94';
// const projectId = '5fd82a64b57a6c72c48d2352';



const PageSpreadsheet = ({ email, projectIdForge, role }) => {

    const tableRef = useRef();

    let previousDOMCell = null;
    let currentDOMCell = null;
    let isTyping = false;
    const setPosition = (e) => {
        refCellsRange.current.style = null;
        refCellsRange.current.style.position = 'fixed';
        refCellsRange.current.style.zIndex = '999';
        cellsRangeStartCell = null;
        cellsRangeEndCell = null;

        if (previousDOMCell) {
            previousDOMCell.cell.classList.remove('cell-current');
        };
        currentDOMCell = e;
        currentDOMCell.cell.classList.add('cell-current');
        previousDOMCell = e;
        isTyping = false;
    };

    const cellOnDoubleClickTrigger = () => {
        // setCellActive(currentDOMCell);
        // isTyping = true;
    };

    const refCellsRange = useRef();
    let cellsRangeStartCell = null;
    let cellsRangeEndCell = null;

    const mouseDownStartCellsRange = ({ e, rowIndex, columnIndex, cell }) => {
        // if (currentDOMCell) {
        //     currentDOMCell.cell.classList.remove('cell-current');
        //     previousDOMCell = null;
        //     currentDOMCell = null;
        // };

        // setCellsRangeStart(null);
        // setCellsRangeEnd(null);

        // cellsRangeStartCell = ({
        //     x: e.clientX,
        //     y: e.clientY,
        //     rowIndex,
        //     columnIndex
        // });
        // refCellsRange.current.style.position = 'fixed';
        // refCellsRange.current.style.zIndex = '999';
    };
    const mouseUpEndCellsRange = ({ e, rowIndex, columnIndex, cell }) => {
        // refCellsRange.current.style = null;
        // refCellsRange.current.style.position = 'fixed';
        // refCellsRange.current.style.zIndex = '999';

        // if (!cellsRangeStartCell) return;
        // if (
        //     cellsRangeStartCell.rowIndex === rowIndex &&
        //     cellsRangeStartCell.columnIndex === columnIndex
        // ) {
        //     cellsRangeStartCell = null;
        //     return;
        // };

        // cellsRangeEndCell = ({
        //     x: e.clientX,
        //     y: e.clientY,
        //     rowIndex,
        //     columnIndex
        // });

        // setCellsRangeStart({
        //     rowIndex: cellsRangeStartCell.rowIndex,
        //     columnIndex: cellsRangeStartCell.columnIndex,
        // });
        // setCellsRangeEnd({
        //     rowIndex: cellsRangeEndCell.rowIndex,
        //     columnIndex: cellsRangeEndCell.columnIndex,
        // });

        // cellsRangeStartCell = null;
        // cellsRangeEndCell = null;
    };
    const EventMouseMove = (e) => {
        // cellsRangeEndCell = ({
        //     x: e.clientX,
        //     y: e.clientY,
        // });
        // if (cellsRangeStartCell) {
        //     const pos = getCellRangeRectangular(cellsRangeStartCell, cellsRangeEndCell);
        //     refCellsRange.current.style.position = 'fixed';
        //     refCellsRange.current.style.zIndex = '999';
        //     refCellsRange.current.style.top = pos.top + 'px';
        //     refCellsRange.current.style.left = pos.left + 'px';
        //     refCellsRange.current.style.width = pos.width + 'px';
        //     refCellsRange.current.style.height = pos.height + 'px';
        //     refCellsRange.current.style.border = '1px dashed black';
        // };
    };
    useEffect(() => {
        window.addEventListener('keydown', EventKeyDown);
        window.addEventListener('mousemove', EventMouseMove);
        return () => {
            window.removeEventListener('keydown', EventKeyDown);
            window.removeEventListener('mousemove', EventMouseMove);
        };
    }, []);
    const EventKeyDown = (e) => {

        if (e.key === 'ArrowUp') {
            if (isTyping) return;

            let cellTop = currentDOMCell.cell.parentElement.offsetTop;
            if (currentDOMCell.rowIndex === 0) return;

            currentDOMCell.cell.classList.remove('cell-current');
            let index;
            currentDOMCell.cell.parentElement.childNodes.forEach((dv, i) => {
                if (dv === currentDOMCell.cell) index = i;
            });
            currentDOMCell.cell = currentDOMCell.cell.parentElement.previousSibling.childNodes[index];
            currentDOMCell.cell.classList.add('cell-current');
            currentDOMCell.rowIndex = currentDOMCell.rowIndex - 1;


            e.preventDefault();
            if (cellTop <= tableRef.current._scroll.scrollTop) {
                tableRef.current.scrollToTop(currentDOMCell.cell.parentElement.offsetTop);
            };

        } else if (e.key === 'ArrowRight') {
            if (isTyping) return;

            if (currentDOMCell.columnIndex < tableRef.current.leftTable.props.columns.length - 1) {
                currentDOMCell.cell.classList.remove('cell-current');
                currentDOMCell.cell = currentDOMCell.cell.nextSibling;
                currentDOMCell.cell.classList.add('cell-current');
                currentDOMCell.columnIndex = currentDOMCell.columnIndex + 1;

            } else if (
                currentDOMCell.columnIndex >= tableRef.current.leftTable.props.columns.length &&
                currentDOMCell.columnIndex < tableRef.current.columnManager._columns.length - 1
            ) {
                let cellRight = currentDOMCell.cell.offsetLeft + currentDOMCell.cell.offsetWidth;
                let innerTableWidth = window.innerWidth - 15;

                e.preventDefault();
                if (cellRight > innerTableWidth - 100) {
                    tableRef.current.scrollToLeft(cellRight - innerTableWidth + 100);
                };

                currentDOMCell.cell.classList.remove('cell-current');
                currentDOMCell.cell = currentDOMCell.cell.nextSibling;
                currentDOMCell.cell.classList.add('cell-current');
                currentDOMCell.columnIndex = currentDOMCell.columnIndex + 1;
            };


        } else if (e.key === 'ArrowDown') {

            if (isTyping) return;

            if (currentDOMCell.rowIndex >= Object.keys(tableRef.current._depthMap).length - 1) return;
            let cellTop = currentDOMCell.cell.parentElement.offsetTop;

            currentDOMCell.cell.classList.remove('cell-current');
            let index;
            currentDOMCell.cell.parentElement.childNodes.forEach((dv, i) => {
                if (dv === currentDOMCell.cell) index = i;
            });
            currentDOMCell.cell = currentDOMCell.cell.parentElement.nextSibling.childNodes[index];
            currentDOMCell.cell.classList.add('cell-current');
            currentDOMCell.rowIndex = currentDOMCell.rowIndex + 1;

            e.preventDefault();
            if (
                cellTop < tableRef.current._scroll.scrollTop ||
                cellTop > tableRef.current._scroll.scrollTop + 690
            ) {
                tableRef.current.scrollToTop(currentDOMCell.cell.parentElement.offsetTop - 720);
            };

        } else if (e.key === 'ArrowLeft') {

            if (isTyping) return;

            if (currentDOMCell.columnIndex > 1 &&
                currentDOMCell.columnIndex < tableRef.current.leftTable.props.columns.length
            ) {
                currentDOMCell.cell.classList.remove('cell-current');
                currentDOMCell.cell = currentDOMCell.cell.previousSibling;
                currentDOMCell.cell.classList.add('cell-current');
                currentDOMCell.columnIndex = currentDOMCell.columnIndex - 1;

            } else if (
                currentDOMCell.columnIndex > tableRef.current.leftTable.props.columns.length &&
                currentDOMCell.columnIndex < tableRef.current.columnManager._columns.length
            ) {
                let cellLeft = currentDOMCell.cell.offsetLeft;
                let innerTableWidth = window.innerWidth - 15;

                currentDOMCell.cell.classList.remove('cell-current');
                currentDOMCell.cell = currentDOMCell.cell.previousSibling;
                currentDOMCell.cell.classList.add('cell-current');;
                currentDOMCell.columnIndex = currentDOMCell.columnIndex - 1;

                e.preventDefault();

                if (cellLeft <= tableRef.current.columnManager._cached.columnsWidth - innerTableWidth + 820) {
                    tableRef.current.scrollToLeft(cellLeft - 820 - currentDOMCell.cell.offsetWidth);
                };
            };

        } else if (e.key === 'Enter') {
            if (isTyping) {
                isTyping = false;
            } else {
                isTyping = true;
                setCellActive(currentDOMCell);
            };
        };
    };




    const onScroll = () => {
        if (stateCell.cellActive) setCellActive(null);
    };


    const [cursor, setCursor] = useState(null);
    const [panelType, setPanelType] = useState(null);
    const [panelSettingType, setPanelSettingType] = useState(null);
    const [panelFunctionVisible, setPanelFunctionVisible] = useState(false);
    const [panelSettingVisible, setPanelSettingVisible] = useState(false);


    const buttonPanelFunction = (btn) => {
        setPanelFunctionVisible(false);
        setPanelSettingType(btn);
        setPanelSettingVisible(true);
    };
    const onMouseDownColumnHeader = (e, header) => {
        setCursor({ x: e.clientX, y: e.clientY });
        setPanelType({
            type: 'column',
            header
        });
        setPanelFunctionVisible(true);
    };
    const onRightClickCell = (e, cellProps) => {
        setCursor({ x: e.clientX, y: e.clientY });
        setPanelType({
            type: 'cell',
            cellProps
        });
        setPanelFunctionVisible(true);
    };
    const xxxxx = (update) => {

        if (update.type === 'sort-data') {

            getSheetRows({ ...stateRow, rowsVisible: update.data });

        } else if (update.type === 'filter-by-columns') {

            getSheetRows({ ...stateRow, rowsVisible: update.data });

        } else if (update.type === 'reset-filter-sort') {

            getSheetRows({
                ...stateRow,
                rowsVisible: stateRow.rowsVisibleInit
            });


        } else if (update.type === 'reorder-columns') {

            setSettings({
                headersHidden: update.reorderColumns.headersHidden,
                headersShown: update.reorderColumns.headersShown,
                headersOrder: update.reorderColumns.headersOrder,
                nosColumnFixed: update.reorderColumns.nosColumnFixed,
            });

        } else if (update.type === 'unhide-all-rows') {

            getSheetRows({
                ...stateRow,
                rowsVisible: stateRow.rowsAll,
                rowsVisibleInit: stateRow.rowsAll,
            });


        } else if (
            update.type === 'insert-drawings' ||
            update.type === 'drawing-data-automation' ||
            update.type === 'create-new-drawing-revisions'
        ) {
            getSheetRows({
                ...stateRow,
                rowsVisible: update.data.rowsVisible,
                rowsVisibleInit: update.data.rowsVisibleInit,
                rowsAll: update.data.rowsAll,
                rowsUpdateAndNews: update.data.rowsUpdateAndNews,
                rowsVersionsToSave: update.data.rowsVersionsToSave
            });

        } else if (update.type === 'group-columns') {

            getSheetRows({
                ...stateRow,
                rowsVisible: update.data,
            });

        } else if (update.type === 'colorized') {
            if (update.colorized) {
                // setSettings({ ...update.settings, colorized: update.colorized });
                // setColorized(update.colorized);
                // setInputData([...inputData]);
            };
        } else if (update.type === 'create-new-drawing-version') {
            // setInputData(update.data);

        } else if (update.type === 'highlight-cell-history') {
            setCellHistoryFound(update.data);
            setSettings({ ...stateUser, nosColumnFixed: 6 }); // force columns rerender
            setSettings({ ...stateUser, nosColumnFixed: stateUser.nosColumnFixed });
        }


        setPanelSettingVisible(false);
        setPanelSettingType(null);
        setPanelType(null);
    };


    const [statusCellAction, setStatusCellAction] = useState(null);
    const updateStatusCell = (obj) => {
        // setStatusCellAction(obj);
    };


    // useEffect(() => {
    //     let cells = { ...stateCell.getCellModifiedTemp, ...statusCellAction };
    //     if (stateRow.sheetRows) {
    //         let arr = [...stateRow.sheetRows];
    //         for (const key in cells) {
    //             const { rowId, headerName } = extractCellInfo(key);
    //             arr.forEach(r => {
    //                 if (r.id === rowId) {
    //                     r[headerName] = cells[key];
    //                 };
    //             });
    //         };
    //         setInputData(unflatten(arr));
    //     };
    // }, [statusCellAction]);





    const {
        state: stateCell,
        setCellActive,
        setCellsRangeStart,
        setCellsRangeEnd
    } = useContext(CellContext);


    const {
        state: stateRow, getSheetRows
    } = useContext(RowContext);



    const {
        state: stateUser, setSettings
    } = useContext(UserContext);


    const {
        state: stateProject, fetchDataOneSheet
    } = useContext(ProjectContext);

    // console.log('STATE-ROW...', stateRow, 'STATE-CELL...', stateCell, stateUser);

    const [projectId, setProjectId] = useState('5fd981dcd843c2728433cc94');
    // const [projectId, setProjectId] = useState('5fd82a64b57a6c72c48d2352');

    const [sidePanelshown, setSidePanelshown] = useState(false);
    const [sheetLoading, setSheetLoading] = useState(false);

    const projectOnClick = (project) => {
        // setSheetLoading(true);
        // if (project === 'KCDE') {
        //     setProjectId('5fd981dcd843c2728433cc94')
        // } else if (project === 'Sumang') {
        //     setProjectId('5fd82a64b57a6c72c48d2352')
        // } else if (project === 'Funan') {
        //     setProjectId('5fde198438ef177f80e8b3d5');
        // } else if (project === 'Handy') {
        //     setProjectId('5fded5bb61ea7bb4a4bfddcf');
        // }

        setSidePanelshown(false);
        // setSheetLoading(false);
    };

    const [state, setstate] = useState(null);


    const saveSmartSheetData = async () => {
        try {
            let rowsToSave = stateRow.rowsAll.map(row => {
                
                let rowDataObj = {};
                Object.keys(row).forEach(key => {
                    if (key === 'id') rowDataObj._id = row[key];
                    if (key === '_parentRow') rowDataObj.parentRow = row[key];
                    if (key === '_preRow') rowDataObj.preRow = row[key];
                    if (key === '_rowLevel') rowDataObj.level = row[key];
                });
                stateProject.allDataOneSheet.publicSettings.headers.forEach(hd => {
                    if (row[hd.text]) rowDataObj.data = { ...rowDataObj.data || {}, [hd.key]: row[hd.text] };
                });
     
                return rowDataObj;
            });
    
            // await Axios.post(
            //     `${SERVER_URL}/sheet/update-rows/${projectIdForge}`,
            //     { rows: rowsToSave }
            // );
        } catch (err) {
            console.log(err);
        };
    };

    
    const saveRandomRows = async () => {
        try {
            let arrrows = [];
            for (let i = 0; i < 20000; i++) {
                const data = newObj2(stateProject.allDataOneSheet.publicSettings.headers);
                const row = {
                    data,
                    parentRow: '5fd981dcd843c2728433cc94',
                    preRow: '5fd82a64b57a6c72c48d2352',
                    level: 1
                };
                arrrows.push(row);
            };
            
            // await Axios.post(
            //     `${SERVER_URL}/sheet/update-rows/ZHNwMzc0LOA5NDY1MS10ZXN0DP`,
            //     { rows: arrrows }
            // );

        } catch (err) {
            console.log(err);
        };
    };

    
    useEffect(() => {

        const fetchOneProject = async () => {
            try {
                setSheetLoading(true);

                const res = await Axios.get(`${SERVER_URL}/sheet/${projectIdForge}?userId=${email}`);
                console.log('MONGO ...', res.data);


                const resultSmartsheet = await Axios.post(
                    'https://bim.wohhup.com/api/smartsheet/get-sheets-dashboard',
                    {
                        listSheetId: [
                            4758181617395588,
                            8919906142971780,
                        ]
                    }
                );
                console.log('SMART SHEET ...', resultSmartsheet.data);
                const rowsAllSmartSheet = getDataConvertedSmartsheet(resultSmartsheet.data);
                const dataSmartSheet = smartSheetAddParent(rowsAllSmartSheet).Handy;


                

                // const res = await Axios.get(`${SERVER_URL}/sheet/${projectId}`);
                setSheetLoading(false);
                // const res = await Axios.get(`${SERVER_URL}/sheet/5fdc6c51c77e8e1f788bed99?userId=5fdc6c06c77e8e1f788bed98`);
                // const res = await Axios.get(`${SERVER_URL}/sheet/${projectId}`);

                // console.log('ALL ROWS...', res.data);
                fetchDataOneSheet(res.data);
                let headersArray = getHeadersArray(res.data);

                setSettings({
                    headersAll: headersArray.headersAll,
                    headersLocked: headersArray.headersLocked,
                    headersDisabled: headersArray.headersDisabled,
                    headersHidden: headersArray.headersHidden,
                    headersOrder: headersArray.headersOrder,
                    headersShown: headersArray.headersShown,
                    colorized: res.data.userSettings.colorization,
                    nosColumnFixed: res.data.userSettings.headersUser.nosColumnFixed,
                });
                getSheetRows({
                    rowsAll: dataSmartSheet.rowsAll,
                    rowsVisibleInit: dataSmartSheet.rowsAll,
                    rowsVisible: dataSmartSheet.rowsAll,
                    // rowsFolded: smartSheetAddParent(rowsAllSmartSheet),
                    // rowsUnfolded: getRowsSettings(rowsAllSmartSheet).rowsUnfolded,
                    // rowsHidden: getRowsSettings(rowsAllSmartSheet).rowsHidden,

                    // rowsAll: getRowsSettings(res.data).rowsAll,
                    // rowsVisibleInit: getRowsSettings(res.data).rowsVisible,
                    // rowsVisible: getRowsSettings(res.data).rowsVisible,
                    // rowsFolded: getRowsSettings(res.data).rowsFolded,
                    // rowsUnfolded: getRowsSettings(res.data).rowsUnfolded,
                    // rowsHidden: getRowsSettings(res.data).rowsHidden,
                });


                // setColumns(renderColumns(
                //     headersArray.headersShown,
                //     res.data.userSettings.headersUser.nosColumnFixed,
                // ))
   
                setExpandedRows(dataSmartSheet.rowsUnfold);

            } catch (err) {
                console.log(err);
            };
        };
        fetchOneProject();
    }, [projectId]);





    const renderColumns = (arr, nosColumnFixed) => {
        let headersObj = [
            {
                key: 'Index',
                dataKey: 'Index',
                title: '',
                width: 50,
                frozen: Column.FrozenDirection.LEFT,
                cellRenderer: <CellIndex />,
                style: { padding: 0, margin: 0 }
            }
        ];

        arr.forEach((hd, index) => {
            headersObj.push({
                key: hd,
                dataKey: hd,
                title: hd,
                width: getHeaderWidth(hd),
                resizable: true,
                frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
                headerRenderer: (
                    <CellHeader
                        onMouseDownColumnHeader={onMouseDownColumnHeader}
                    />
                ),
                cellRenderer: (
                    <Cell
                        setPosition={setPosition}
                        updateStatusCell={updateStatusCell}
                        onRightClickCell={onRightClickCell}
                        // colorized={stateUser.colorized}

                        cellOnDoubleClickTrigger={cellOnDoubleClickTrigger}
                        mouseDownStartCellsRange={mouseDownStartCellsRange}
                        mouseUpEndCellsRange={mouseUpEndCellsRange}
                    />
                ),
                className: (props) => {
                    const { rowData: { id }, column: { key } } = props;
                    return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                        ? 'cell-found'
                        : (cellHistoryFound && checkCellIsHighlightHistory(cellHistoryFound, id, key))
                            ? 'cell-history-highlight'
                            : ''
                }
            });
        });
        return headersObj;
    };


    const checkCellIsHighlightHistory = (arr, rowId, header) => {

        let xxx = arr.find(dt => dt.rowId === rowId && dt.header === header);
        // console.log(xxx);
        return xxx && true;
    };


    // const [columns, setColumns] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);

    const [expandColumnKey, setExpandColumnKey] = useState('Drawing Number');
    const [cellSearchFound, setCellSearchFound] = useState(null);
    const [cellHistoryFound, setCellHistoryFound] = useState(null);
    // console.log(cellHistoryFound);
    const onRowExpand = (props) => {
        const { rowKey, expanded } = props;
        let arr = [...expandedRows];
        if (expanded) arr.push(rowKey);
        else arr.splice(arr.indexOf(rowKey), 1);
        setExpandedRows(arr);
    };


    const ExpandIcon = (props) => {
        
        const { expanding, expandable, onExpand, depth } = props;

        const indent = (depth * 20).toString() + 'px';
        if (!expandable) return null;
        return (
            <div style={{
                marginLeft: indent,
                paddingLeft: 10,
                paddingRight: 10,
                background: 'transparent'
            }}>
                <Icon
                    type={expanding ? 'plus-square' : 'minus-square'}
                    onClick={() => onExpand(expanding)}
                    style={{
                        color: 'black',
                        transform: 'translate(0, -1px)'
                    }}
                />
            </div>
        );
    };
    const expandIconProps = (props) => {
        return ({
            expanding: !props.expanded,
        });
    };
    const rowProps = (props) => {
        const { rowData } = props;
        return {
            tagName: rowData.children && rowData.children.length > 0
                ? RowStyled
                : undefined
        };
    };
    const rowClassName = (props) => {
        const { rowData } = props;
        if (rowData.Status === 'Reject And Resubmit') return 'row-color-categorized';
    };

    const onColumnResize = (props) => {

    };

    const searchGlobal = (rowsFound) => {
        // let rows = [];
        // Object.keys(rowsFound).map(rowId => {
        //     rows.push(stateRow.rowsVisible.find(r => r.id === rowId));
        // });
        setCellSearchFound(rowsFound);
        setSettings({ ...stateUser, nosColumnFixed: 1 }); // force columns rerender
        setSettings({ ...stateUser, nosColumnFixed: stateUser.nosColumnFixed });
        // getSheetRows({ ...stateRow, rowsVisible: stateRow.rowsVisible });
    };





    const saveDataToServer = async () => {

        try {



            await Axios.post(
                `${SERVER_URL}/cell/history/`,
                convertCellTempToHistory(
                    stateCell.cellsModifiedTemp,
                    projectIdForge,
                    email,
                    stateProject.allDataOneSheet.publicSettings.headers
                )
            );


            let { rowsUpdateAndNews } = stateRow;
            if (!rowsUpdateAndNews) return;

            let rowsToSave = rowsUpdateAndNews.map(row => {
                let rowDataObj = {};
                Object.keys(row).forEach(key => {
                    if (key === 'id') rowDataObj._id = row[key];
                    if (key === '_parentRow') rowDataObj.parentRow = row[key];
                    if (key === '_preRow') rowDataObj.preRow = row[key];
                    if (key === '_rowLevel') rowDataObj.level = row[key];
                });
                stateProject.allDataOneSheet.publicSettings.headers.forEach(hd => {
                    if (row[hd.text]) rowDataObj.data = { ...rowDataObj.data || {}, [hd.key]: row[hd.text] };
                });
                return rowDataObj;
            });

            await Axios.post(
                `${SERVER_URL}/sheet/update-rows/${projectId}`,
                { rows: rowsToSave }
            );





            // INIT ADD ROWS WITH PREROWS
            // await Axios.post(
            //     `${SERVER_URL}/sheet/update-rows/${projectId}`,
            //     { rows: [
            //         { 
            //             data: { 'd4401720-3e83-11eb-ad1f-3133a2b7edbc': '44CBP DRAWINGS' }, 
            //             preRow: '5fdcdd6b3ed42b6e809b5c7e' 
            //         }
            //     ] }
            // );


            // INIT ADD ROWS
            // await Axios.post(
            //     `${SERVER_URL}/sheet/add-rows/${projectId}`,
            //     { data: [
            //         { '8d13c9f0-3f50-11eb-9305-f1d6f0973410': '1 CBP DRAWINGS' },
            //         { '8d13c9f0-3f50-11eb-9305-f1d6f0973410': '2 STAIRCASES' },

            //     ] }
            // );

            // INIT ADD SUB ROWS

            // await Axios.post(
            //     `${SERVER_URL}/sheet/add-rows/${projectId}`,
            //     { 
            //         parentRow: '5fdd735431e993196827be76',
            //         data: [
            //             newObj2(stateProject.allDataOneSheet.headers),
            //             newObj2(stateProject.allDataOneSheet.headers),

            //             newObj2(stateProject.allDataOneSheet.headers),
            //             newObj2(stateProject.allDataOneSheet.headers),




            //         ] 
            //     }
            // );

        } catch (err) {
            console.log(err);
        }


        // try {
        //     await Axios.post(
        //         `${SERVER_URL}/sheet/update-rows/${projectId}`,
        //         { rows: [
        //             {
        //                 _id: "5fd8cb65c3d7e3d0118c328b",  
        //                 parentRow: "5fd8cb65c9f7f9d6254752f3",
        //                 preRow: "5fd8cb65c67d4337cb37060a",
        //                 data: {
        //                     '': ''
        //                 },
        //                 level: 1
        //             }
        //         ] }
        //     );
        // } catch (err) {
        //     console.log(err);
        // }
    };
    const saveSettingsPublic = async () => {
        try {
            await Axios.post(
                `${SERVER_URL}/sheet/update-setting/${projectId}`,
                {
                    // users: [
                    //     { id: '5fd9d3ad11af6af79c7a05fc', role: 'modeller'},
                    //     { id: '5fd9b53350d46f91fc93776f', role: 'modeller'},
                    // ], 
                    // sheetSettings: {
                    //     usersAuthorization: {
                    //         modeller: {
                    //             locked: [

                    //             ],
                    //             disabled: [

                    //             ]
                    //         }
                    //     },
                    // }
                    // headers: stateProject.allDataOneSheet.headers
                }
            );
        } catch (err) {
            console.log(err);
        }
    };
    const saveSettingsUser = async () => {
        // console.log(stateUser.headersOrder);
        try {
            await Axios.post(
                `${SERVER_URL}/sheet/update-setting/${projectIdForge}?userId=${email}`,
                {
                    headersUser: {
                        nosColumnFixed: stateUser.nosColumnFixed,
                        headersOrder: convertHeadersTextToKeyArray(
                            stateUser.headersOrder,
                            stateProject.allDataOneSheet.publicSettings.headers
                        ),
                        headersHidden: [

                        ]
                    },
                    // rowsUser: {
                    //     rowsFolded: [

                    //     ],
                    //     rowsHidden: [

                    //     ]
                    // }
                }
            );
        } catch (err) {
            console.log(err);
        };
    };




    const [searchInputShown, setSearchInputShown] = useState(false);




    return (
        <PageSpreadsheetStyled>

            {sidePanelshown && (
                <SideBar
                    closeSideBar={() => setSidePanelshown(false)}
                    projectOnClick={projectOnClick}
                    sheetLoading={sheetLoading}
                />
            )}


            <div style={{
                display: 'flex',
                paddingTop: 7,
                paddingBottom: 7,
                paddingLeft: 7,
                background: colorType.grey4
            }}>
                <IconTable type='menu' onClick={() => setSidePanelshown(!sidePanelshown)} />
                {/* <IconTable type='save' onClick={() => save()} /> */}
                <DividerRibbon />
                <IconTable type='save' onClick={saveDataToServer} />
                <DividerRibbon />
                <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} />
                <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
                <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
                <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />

                {searchInputShown ? (
                    <InputSearch
                        searchGlobal={searchGlobal}
                        closeSearchInput={() => setSearchInputShown(false)}
                    />
                ) : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

                <IconTable type='rollback' onClick={() => buttonPanelFunction('rollback-ICON')} />

                <DividerRibbon />
                <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />
                <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
                <IconTable type='eye' onClick={() => buttonPanelFunction('eye-ICON')} />
                <DividerRibbon />

                <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
                <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />

                <DividerRibbon />
                <IconTable type='border-outer' onClick={saveSettingsPublic} />
                <IconTable type='radius-upright' onClick={saveSettingsUser} />

                <DividerRibbon />
                <IconTable type='fullscreen-exit' onClick={saveSmartSheetData} />
                <IconTable type='pic-center' onClick={saveRandomRows} />
            </div>

            <div ref={refCellsRange}></div>

            {stateProject.allDataOneSheet && stateUser && stateRow && (

                <TableStyled
                    ref={tableRef}
                    fixed

                    columns={renderColumns(
                        stateUser.headersShown,
                        stateUser.nosColumnFixed,
                    )}
                    // columns={columns}

                    data={mapSubRows(stateRow.rowsVisible)}


                    // data={stateRow.rowsVisible.filter(r => r.Status === '0' && r._rowLevel === 1)}



                    expandedRowKeys={expandedRows}


                    expandColumnKey={expandColumnKey}

                    expandIconProps={expandIconProps}
                    components={{ ExpandIcon }}
                    rowHeight={30}
                    overscanRowCount={0}
                    onScroll={onScroll}
                    rowProps={rowProps}
                    rowClassName={rowClassName}

                    onColumnResize={onColumnResize}
                    onRowExpand={onRowExpand}

                />
            )}


            <ModalStyleFunction
                visible={panelFunctionVisible}
                footer={null}
                onCancel={() => setPanelFunctionVisible(false)}
                destroyOnClose={true}
                style={{
                    position: 'fixed',
                    left: cursor && cursor.x,
                    top: cursor && cursor.y,
                }}
                mask={false}
                width={250}
            >
                <PanelFunction
                    panelType={panelType}
                    buttonPanelFunction={buttonPanelFunction}
                />
            </ModalStyleFunction>


            <ModalStyledSetting
                title={getActionName(panelSettingType)}
                visible={panelSettingVisible}
                footer={null}
                onCancel={() => {
                    setPanelSettingVisible(false);
                    setPanelSettingType(null);
                    setPanelType(null);
                }}
                destroyOnClose={true}

                // width={getPanelWidthHeight(panelSettingType).width}
                // height={getPanelWidthHeight(panelSettingType).height}
            >
                <PanelSetting
                    panelType={panelType}
                    panelSettingType={panelSettingType}
                    xxxxx={xxxxx}
                    onClickCancelModal={() => {
                        setPanelSettingVisible(false);
                        setPanelSettingType(null);
                        setPanelType(null);
                    }}
                />
            </ModalStyledSetting>




        </PageSpreadsheetStyled>
    );
};
export default PageSpreadsheet;


const getActionName = (type) => {

    if (type === 'filter-ICON') return 'Create New Filter';
    if (type === 'reorderColumn-ICON') return 'Columns Layout';
    if (type === 'group-ICON') return 'Group Data';
    if (type === 'sort-ICON') return 'Sort Data';
    if (type === 'rollback-ICON') return 'Clear Filter/Sort/Group/Search';
    else return '';
}



export const getPanelWidthHeight = (typeSettings) => {

    let width = typeSettings === 'history-ICON' ? '70vw' : '30vw';
    let height = typeSettings === 'history-ICON' ? '70vh' : '30vh';

    return { width, height };
};

const DividerRibbon = () => {
    return (
        <Divider type='vertical' style={{
            height: 32,
            marginLeft: 8,
            marginRight: 8,
            background: 'white'
        }} />
    );
};

const RowStyled = styled.a`
    background-color: ${colorType.grey3};
    cursor: default;
    &:hover {
        background-color: ${colorType.grey3};
    }
`;

const PageSpreadsheetStyled = styled.div`
    padding-top: ${dimension.navBarHeight};
`;

const TableStyled = styled(Table)`

    .cell-found {
        background-color: red;
    }
    .cell-history-highlight {
        background-color: yellow;
    }
    .row-color-categorized {
        background-color: #9ACD32;
    }
    .cell-current {
        background-color: ${colorType.cellHighlighted}
    }




    .BaseTable__table .BaseTable__body {

        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        ::-webkit-scrollbar {
            -webkit-appearance: none;
            background-color: #e3e3e3;
        }

        ::-webkit-scrollbar:vertical {
            width: 15px;
        }

        ::-webkit-scrollbar:horizontal {
            height: 15px;
        }

        ::-webkit-scrollbar-thumb {
            border-radius: 10px;
            border: 2px solid #e3e3e3;
            background-color: #999;

            &:hover {
                background-color: #666;
            }
        }

        ::-webkit-resizer {
            display: none;
        }
    }

    .BaseTable__header-cell {
        padding: 5px;
        border-right: 1px solid #DCDCDC;

        background: ${colorType.primary};
        color: white
    }

    .BaseTable__row-cell {
        padding: 0;
        border-right: 1px solid #DCDCDC;

        overflow: visible !important;
    }

    .BaseTable__table-frozen-left {
        /* border-right: 2px solid #46607a; */
        border-right: 4px solid #DCDCDC;
        /* box-shadow: 2px solid black !important; */
        box-shadow: none;
    }

`;

const ModalStyleFunction = styled(Modal)`
   .ant-modal-close, .ant-modal-header {
      display: none;
   }
   .ant-modal-body {
      padding: 0;
   }
`;

const ModalStyledSetting = styled(Modal)`
    .ant-modal-content {
        border-radius: 0;
    }
   .ant-modal-close {
      display: none;
   }
   .ant-modal-header {
      padding: 10px;
      
   }
   .ant-modal-title {
        padding-left: 10px;
        font-size: 20px;
        font-weight: bold;
     
   }
   .ant-modal-body {
      padding: 0;
   }
`;



const convertHeadersTextToKeyArray = (headersText, headers) => {

    return headersText.map(hdText => {
        let hdObj = headers.find(hd => hd.text === hdText);
        console.log(hdObj);
        return hdObj.key
    });
};



export const headersInit = [
    'Drawing Number',
    'Drawing Name',
    'RFA Ref',
    'Block/Zone',
    'Level',
    'Unit/CJ',
    'Drg Type',
    'Use For',
    'Coordinator In Charge',
    'Modeller',
    'Model Start (T)',
    'Model Start (A)',
    'Model Finish (T)',
    'Model Finish (A)',
    'Model Progress',
    'Drawing Start (T)',
    'Drawing Start (A)',
    'Drawing Finish (T)',
    'Drawing Finish (A)',
    'Drawing Progress',
    'Drg To Consultant (T)',
    'Drg To Consultant (A)',
    'Consultant Reply (T)',
    'Consultant Reply (A)',
    'Get Approval (T)',
    'Get Approval (A)',
    'Construction Issuance Date',
    'Construction Start',
    'Rev',
    'Status',
    'Remark',
];







const addZero = (num) => {
    if (num < 10) return '0' + num;
    return num;
};




const getHeaderWidth = (header) => {

    if (header === 'RFA Ref') return 170;
    else if (
        header === 'Block/Zone' ||
        header === 'Level' || header === 'Unit/CJ' ||
        header === 'Drg Type' || header === 'Use For' ||
        header === 'Coordinator In Charge' || header === 'Modeller' ||
        header === 'Model Progress' || header === 'Drawing Progress' ||
        header === 'Construction Issuance Date' || header === 'Construction Start'
    ) return 100;
    else if (header.includes('(A)') || header.includes('(T)')) return 90;
    else if (header === 'Rev') return 50;
    else if (header === 'Status') return 280;
    else if (header === 'Remark') return 120;
    else if (header === 'Drawing Number') return 300;
    else if (header === 'Drawing Name') return 500;
    else return 300;

};

const getCellRangeRectangular = (cellsRangeStart, cellsRangeEnd) => {

    let xMin = cellsRangeStart.x <= cellsRangeEnd.x ? cellsRangeStart.x : cellsRangeEnd.x;
    let xMax = cellsRangeStart.x > cellsRangeEnd.x ? cellsRangeStart.x : cellsRangeEnd.x;

    let yMin = cellsRangeStart.y <= cellsRangeEnd.y ? cellsRangeStart.y : cellsRangeEnd.y;
    let yMax = cellsRangeStart.y > cellsRangeEnd.y ? cellsRangeStart.y : cellsRangeEnd.y;

    return {
        top: yMin,
        left: xMin,
        width: xMax - xMin,
        height: yMax - yMin
    };
};




const getUserRole = (sheetData) => {
    let usersArr = sheetData.publicSettings.users;
    let userId = sheetData.userSettings.user;
    return usersArr.find(user => user.id === userId).role;
};

// const getHeadersUserFromHeadersPublic = (headersPublic, headersUser) => {



//     // let headersCanView = headersPublic.filter(x => headersDisabled.indexOf(x) === -1);

//     // let founds = headersCanView.filter(x => headersUser.indexOf(x) === -1);

//     return headersUser;
// };



const getRowsSettings = (sheetData) => {

    const rowsAll = sheetData.rows;
    const { rowsFolded, rowsHidden } = sheetData.userSettings.rowsUser;

    let rowsVisible = rowsAll.filter(row => rowsHidden.indexOf(row.id) === -1 && rowsHidden.indexOf(row._parentRow) === -1);

    let rowsVisibleIds = [];
    rowsVisible.forEach(r => {
        if (!r._parentRow) rowsVisibleIds.push(r.id);
    });

    const rowsUnfolded = rowsVisibleIds.filter(x => !rowsFolded.includes(x));

    return {
        rowsAll,
        rowsVisible,
        rowsFolded,
        rowsUnfolded,
        rowsHidden
    }
};

const getHeadersArray = (projectData) => {

    // let userAuthorization = projectData.publicSettings.sheetSettings.usersAuthorization[role];
    const headers = projectData.publicSettings.headers;

    // let headersArr = headers.filter(hd => userAuthorization.disabled.indexOf(hd.key) === -1);
    // let headersLocked = headers.filter(hd => userAuthorization.locked.indexOf(hd.key) !== -1);
    // let headersDisabled = headers.filter(hd => userAuthorization.disabled.indexOf(hd.key) !== -1);

    const headersOrderDB = projectData.userSettings.headersUser.headersOrder;
    const headersOrder = headersOrderDB && headers.filter(hd => headersOrderDB.indexOf(hd.key) !== -1) || headers;

    const headersHiddenDB = projectData.userSettings.headersUser.headersOrder;
    const headersHidden = headersHiddenDB && headers.filter(hd => headersHiddenDB.indexOf(hd.key) !== -1) || [];

    const headersShown = headersHiddenDB && headersOrder.filter(hd => headersHiddenDB.indexOf(hd.key) === -1) || headers;

    
    return {
        headersAll: getHeadersText(headers),
        headersLocked: getHeadersText(headers),
        headersDisabled: getHeadersText(headers),
        headersOrder: getHeadersText(headersOrder),
        headersHidden: getHeadersText(headersHidden),
        headersShown: getHeadersText(headersShown)
    };
};




const createParentRows = (arr) => {
    let newRows = [];
    arr.forEach((title, i) => {
        newRows.push({
            id: mongoObjectId(),
            _rowLevel: 0,
            _parentRow: null,
            _preRow: i === 0 ? null : newRows[i - 1].id,
            'Drawing Number': title
        });
    });
    return newRows;
};
const addPreRowsParentRowsLevelToSubArr = (arr, parentId) => {

    let newSubRows = [];
    arr.forEach((row, i) => {
        row.id = mongoObjectId();
        row._rowLevel = 1;
        row._parentRow = parentId;
        row._preRow = i === 0 ? null : newSubRows[i - 1].id;

        newSubRows.push(row);
    });
    return newSubRows;
};


const smartSheetAddParent = (data) => {
    let output = {};
    Object.keys(data).map(key => {
        const { allDrawingsSorted } = data[key];
        if (key === 'Handy') {

            let arrParentTitle = [
                'COLUMN AND WALL SETTING OUT Keyplan',
                'UNIT TYPE LAYOUT TSO Plan',
                'STAIRCASES and LIFT LOBBIES',
                'ANCILLARY STRUCTURES',
                'No Name 1',
                'No Name 2',
                'PBU Tile layout',
                'Tile layout',
                'Clubhouse',
                'RCP',
                'RCP Unit type',
                'RCP Clubhouse',
                'Swimming Pool',
                'External Sections/ Elevations',
                'Driveway/ Pavement',
                'No Name 3',
                'No Name 4',
                'Carpark Details',
                'M&E Details',
                'FAÇADE Maintenance',
                'No Name 5',
                'TOILETS Details',
            ];
            let rows = createParentRows(arrParentTitle);

            const getRange = (i) => {
                if (i === 0) return { from: 1, to: 41 };
                if (i === 1) return { from: 41, to: 96 };
                if (i === 2) return { from: 96, to: 144 };
                if (i === 3) return { from: 144, to: 158 };
                if (i === 4) return { from: 158, to: 163 };
                if (i === 5) return { from: 163, to: 169 };
                if (i === 6) return { from: 169, to: 183 };
                if (i === 7) return { from: 183, to: 193 };
                if (i === 8) return { from: 193, to: 196 };
                if (i === 9) return { from: 196, to: 210 };
                if (i === 10) return { from: 210, to: 231 };

                if (i === 11) return { from: 231, to: 234 };
                if (i === 12) return { from: 234, to: 239 };
                if (i === 13) return { from: 239, to: 243 };
                if (i === 14) return { from: 243, to: 247 };

                if (i === 15) return { from: 247, to: 251 };
                if (i === 16) return { from: 251, to: 255 };
                if (i === 17) return { from: 255, to: 258 };
                if (i === 18) return { from: 258, to: 263 };
                if (i === 19) return { from: 263, to: 265 };

                if (i === 20) return { from: 265, to: 268 };
                if (i === 21) return { from: 268, to: 277 };

                return { from: 0, to: 1 }
            };
            let rowsAll = [];
            let rowsUnfold = [];
            rows.forEach((row, i) => {
                rowsUnfold.push(row.id);
                

                rowsAll.push(row);

                let rowsSub = allDrawingsSorted.filter((r, index) => index >= getRange(i).from && index < getRange(i).to);
                rowsSub = addPreRowsParentRowsLevelToSubArr(rowsSub, row.id);

                rowsAll = [...rowsAll, ...rowsSub];
            });

            output[key] = { rowsAll, rowsUnfold };


        } else if (key === 'Sumang') {

        }
        
    });

    return output;
};

