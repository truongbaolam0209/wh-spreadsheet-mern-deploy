import { Divider, Icon, message, Modal } from 'antd';
import Axios from 'axios';
import { debounce } from 'lodash';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';
import { colorType, dimension, SERVER_URL } from '../constants';
import { Context as CellContext } from '../contexts/cellContext';
import { Context as ProjectContext } from '../contexts/projectContext';
import { Context as RowContext } from '../contexts/rowContext';
import { extractCellInfo, getActionName, getCurrentAndHistoryDrawings, getDataConvertedSmartsheet, getHeaderWidth, mapSubRows, sortRowsReorder } from '../utils';
import Cell from './pageSpreadsheet/Cell';
import CellHeader from './pageSpreadsheet/CellHeader';
import CellIndex from './pageSpreadsheet/CellIndex';
import IconTable from './pageSpreadsheet/IconTable';
import InputSearch from './pageSpreadsheet/InputSearch';
import PanelFunction from './pageSpreadsheet/PanelFunction';
import PanelSetting from './pageSpreadsheet/PanelSetting';




const Table = forwardRef((props, ref) => {
    return (
        <AutoResizer>
            {() => <BaseTable
                {...props}
                ref={ref}
                width={window.innerWidth}
                height={window.innerHeight - 99.78}
            />}
        </AutoResizer>
    );
});
let previousDOMCell = null;
let currentDOMCell = null;
let isTyping = false;



const PageSpreadsheet = (props) => {

    const { email, role, username, isAdmin, projectId, projectName } = props;
    const tableRef = useRef();

    const getCurrentDOMCell = () => {
        if (isTyping) {
            isTyping = false;
        } else {
            isTyping = true;
            setCellActive(currentDOMCell);
        };
    };
    const setPosition = (e) => {
        if (previousDOMCell) {
            previousDOMCell.cell.classList.remove('cell-current');
        };
        currentDOMCell = e;
        currentDOMCell.cell.classList.add('cell-current');
        previousDOMCell = e;
        isTyping = false;
    };
    useEffect(() => {
        window.addEventListener('keydown', EventKeyDown);
        return () => {
            window.removeEventListener('keydown', EventKeyDown);
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
            if (!currentDOMCell.cell.parentElement.previousSibling) return; // Scroll out of sight of cell selected
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
            if (!currentDOMCell.cell.parentElement.nextSibling) return; // Scroll out of sight of cell selected
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




    const { state: stateCell, setCellActive, getCellModifiedTemp } = useContext(CellContext);
    const { state: stateRow, getSheetRows } = useContext(RowContext);
    const { state: stateProject, fetchDataOneSheet, setUserData } = useContext(ProjectContext);

    // useEffect(() => console.log('STATE-CELL...', stateCell), [stateCell]);
    // useEffect(() => console.log('STATE-ROW...', stateRow), [stateRow]);
    // useEffect(() => console.log('STATE-PROJECT...', stateProject), [stateProject]);

    const [cursor, setCursor] = useState(null);
    const [panelType, setPanelType] = useState(null);
    const [panelSettingType, setPanelSettingType] = useState(null);
    const [panelFunctionVisible, setPanelFunctionVisible] = useState(false);
    const [panelSettingVisible, setPanelSettingVisible] = useState(false);

    const buttonPanelFunction = (btn) => {

        // Load latest input data table before any function
        Object.keys(stateCell.cellsModifiedTemp).forEach(key => {
            const { rowId, headerName } = extractCellInfo(key);
            let row = stateRow.rowsAll.find(r => r.id === rowId);
            row[headerName] = stateCell.cellsModifiedTemp[key];
        });
        getSheetRows({
            ...stateRow,
            rowsAll: stateRow.rowsAll
        });



        setPanelFunctionVisible(false);
        if (btn === 'Move Drawing') {
            getSheetRows({
                ...stateRow,
                rowsToMoveId: panelType.cellProps.rowData.id,
            });
        } else if (btn === 'Paste Drawing') {
            const { rowsAll } = stateRow;
            const rowToMove = rowsAll.find(r => r.id === stateRow.rowsToMoveId);
            let rowsUpdate = [];
            const rowBelowPrevious = rowsAll.find(r => r._preRow === stateRow.rowsToMoveId);
            if (rowBelowPrevious) {
                rowBelowPrevious._preRow = rowToMove._preRow;
                rowsUpdate.push(rowBelowPrevious);
            };
            const rowBelowNext = rowsAll.find(r => r._preRow === panelType.cellProps.rowData.id);
            if (rowBelowNext) {
                rowBelowNext._preRow = stateRow.rowsToMoveId;
                rowsUpdate.push(rowBelowNext);
            };
            rowToMove._preRow = panelType.cellProps.rowData.id;
            rowToMove._parentRow = panelType.cellProps.rowData._parentRow;
            rowsUpdate.push(rowToMove);

            let rowsUpdateAndNews = stateRow.rowsUpdateAndNews || [];
            let output;
            if (rowsUpdateAndNews.length === 0) {
                output = [...rowsUpdate];
            } else {
                let rowsNewUpdate = [];
                rowsUpdate.forEach(row => {
                    let found = rowsUpdateAndNews.find(r => r.id === row.id);
                    if (found) {
                        found._preRow = row._preRow;
                        found._parentRow = row._parentRow;
                    } else {
                        rowsNewUpdate.push(row);
                    };
                });
                output = [...rowsUpdateAndNews, ...rowsNewUpdate];
            };

            getSheetRows({
                ...stateRow,
                rowsAll: sortRowsReorder(rowsAll),
                rowsAllInit: sortRowsReorder(rowsAll),
                rowsUpdateAndNews: output,
                rowsToMoveId: null
            });

        } else {
            setPanelSettingType(btn);
            setPanelSettingVisible(true);
        };
    };
    const onMouseDownColumnHeader = (e, header) => {
        setCursor({ x: e.clientX, y: e.clientY });
        setPanelType({ type: 'column', header });
        setPanelFunctionVisible(true);
    };
    const onRightClickCell = (e, cellProps) => {
        setCursor({ x: e.clientX, y: e.clientY });
        setPanelType({ type: 'cell', cellProps });
        setPanelFunctionVisible(true);
    };
    const commandAction = (update) => {

        if (update.type === 'sort-data') {
            getSheetRows({ ...stateRow, rowsAll: update.data });

        } else if (update.type === 'filter-by-columns') {
            if (update.data.length > 0) {
                getSheetRows({ ...stateRow, rowsAll: update.data });
            } else {
                message.info('There is no drawing found', 1.5);
            };
        } else if (update.type === 'reset-filter-sort') {
            getSheetRows({ ...stateRow, rowsAll: stateRow.rowsAllInit });
            setExpandedRows(stateRow.rowsAllInit.filter(r => r._rowLevel === 0).map(r => r.id));
            setSearchInputShown(false);
            setCellSearchFound(null);
            setCellHistoryFound(null);
            setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
            setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });
        } else if (update.type === 'reorder-columns') {
            setUserData({
                ...stateProject.userData,
                headersHidden: update.data.headersHidden,
                headersShown: update.data.headersShown,
                nosColumnFixed: update.data.nosColumnFixed,
            });

        } else if (update.type === 'unhide-all-rows') {

        } else if (update.type === 'insert-drawings' || update.type === 'drawing-data-automation') {
            getSheetRows({
                ...stateRow,
                rowsAll: update.data.rowsAll,
                rowsAllInit: update.data.rowsAll,
                rowsUpdateAndNews: update.data.rowsUpdateAndNews,
            });

        } else if (update.type === 'create-new-drawing-revisions') {
            getSheetRows({
                ...stateRow,
                rowsAll: update.data.rowsAll,
                rowsAllInit: update.data.rowsAll,
                rowsUpdateAndNews: update.data.rowsUpdateAndNews,
                rowsVersionsToSave: update.data.rowsVersionsToSave
            });

        } else if (update.type === 'group-columns') {
            getSheetRows({ ...stateRow, rowsAll: update.data.rows });
            setExpandedRows(update.data.expandedRows);

        } else if (update.type === 'colorized') {

        } else if (update.type === 'highlight-cell-history') {
            setCellHistoryFound(update.data);
            setUserData({ ...stateProject.userData, nosColumnFixed: 1 });
            setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });

        } else if (update.type === 'drawing-folder-organization') {
            getSheetRows({
                ...stateRow,
                rowsAll: update.data.rowsAll,
                rowsAllInit: update.data.rowsAll,
                rowsUpdateAndNews: update.data.rowsUpdateAndNews
            });
            setExpandedRows([...expandedRows, ...update.data.unfoldIdsArrayNew]);
        } else if (update.type === 'confirm-save-data') {

        } else if (update.type === 'save-data-successfully') {
            message.success('Save Data Successfully');

        } else if (update.type === 'get-data-from-server') {

            fetchDataOneSheet({
                ...update.data,
                email, projectId, projectName, role, username
            });
            setUserData(getHeadersData(update.data, role));
            getSheetRows(getInputDataInitially(update.data));
            setExpandedRows(getRowsData(getInputDataInitially(update.data)).rowsUnfoldIds);
            getCellModifiedTemp({});
            setCellActive(null);

            setLoading(false);
        };
        setPanelSettingVisible(false);
        setPanelSettingType(null);
        setPanelType(null);
    };
    const onScroll = () => {
        if (stateCell.cellActive) setCellActive(null);
    };





    // SAVE DATA TO SMART SHEET
    const [state, setstate] = useState(null);
    const saveSmartSheetData = async () => {
        try {
            await Axios.post(  // SAVE ROWS TO SERVER ...
                `${SERVER_URL}/sheet/update-rows/${projectId}`,
                { rows: state.rows }
            );
            await Axios.post(  // SAVE ROWS HISTORY TO SERVER ...
                `${SERVER_URL}/row/history/${projectId}?username=${username}`,
                state.historyRows
            );
        } catch (err) {
            console.log(err);
        };
    };

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchOneProject = async () => {

            try {
                setLoading(true);
                const res = await Axios.get(`${SERVER_URL}/sheet/${projectId}?userId=${email}`);
                console.log('MONGO ...', res.data);




                const resultSmartsheet = await Axios.post( // SMART SHEETTTTTTTTTTTTTTTT
                    'https://bim.wohhup.com/api/smartsheet/get-sheets-dashboard',
                    { listSheetId: [4758181617395588, 8919906142971780] }
                );
                console.log('SMARTSHEET...', resultSmartsheet.data);
                const rowsAllSmartSheet = getDataConvertedSmartsheet(resultSmartsheet.data);
                const dataToSave = getCurrentAndHistoryDrawings(rowsAllSmartSheet.Handy.allDrawingsSorted, res.data.publicSettings.headers);
                setstate(dataToSave);




                fetchDataOneSheet({
                    ...res.data,
                    email, projectId, projectName, role, username
                });
                setUserData(getHeadersData(res.data, role));
                getSheetRows(getInputDataInitially(res.data));

                setExpandedRows(getRowsData(getInputDataInitially(res.data)).rowsUnfoldIds);

                setLoading(false);
            } catch (err) {
                console.log(err);
            };
        };
        fetchOneProject();
    }, []);




    // const [columns, setColumns] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);
    const [expandColumnKey, setExpandColumnKey] = useState('Drawing Number');
    const [cellSearchFound, setCellSearchFound] = useState(null);
    const [cellHistoryFound, setCellHistoryFound] = useState(null);

    const [rowFoldedIds, setRowFoldedIds] = useState([]);
    const onRowExpand = (props) => {
        const { rowKey, expanded } = props;
        let arr = [...expandedRows];
        let foldedRowsSettings = stateRow.rowsFolded;
        if (expanded) {
            arr.push(rowKey);
        } else {
            arr.splice(arr.indexOf(rowKey), 1);
        };
        console.log(arr);
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
    const onColumnResize = () => {

    };

    // console.log(cellSearchFound, cellHistoryFound);

    const [searchInputShown, setSearchInputShown] = useState(false);
    const searchGlobal = (found) => {
        setCellSearchFound(found);
        setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
        setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });
    };
    const closeSearchInput = debounce(() => {
        setSearchInputShown(false);
        setCellSearchFound(null);
        setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed + 1 });
        setUserData({ ...stateProject.userData, nosColumnFixed: stateProject.userData.nosColumnFixed });
    }, 7);


    const renderColumns = (arr, nosColumnFixed) => {

        let headersObj = [{
            key: 'Index',
            dataKey: 'Index',
            title: '',
            width: 50,
            frozen: Column.FrozenDirection.LEFT,
            cellRenderer: <CellIndex />,
            style: { padding: 0, margin: 0 }
        }];
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
                        onRightClickCell={onRightClickCell}
                        getCurrentDOMCell={getCurrentDOMCell}
                    />
                ),
                className: (props) => {
                    const { rowData: { id }, column: { key } } = props;
                    return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                        ? 'cell-found'
                        : (cellHistoryFound && cellHistoryFound.find(cell => cell.rowId === id && cell.header === key))
                            ? 'cell-history-highlight'
                            : ''
                }
            });
        });
        return headersObj;
    };


    return (
        <PageSpreadsheetStyled
            onContextMenu={(e) => e.preventDefault()}
        >

            <ButtonBox>
                <IconTable type='save' onClick={() => buttonPanelFunction('save-ICON')} />
                <DividerRibbon />
                <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} />
                <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
                <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
                <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />

                {searchInputShown ? (
                    <InputSearch
                        searchGlobal={searchGlobal}
                        closeSearchInput={closeSearchInput}
                    />
                ) : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

                <IconTable type='rollback' onClick={() => buttonPanelFunction('rollback-ICON')} />
                <DividerRibbon />
                <IconTable type='folder-add' onClick={() => buttonPanelFunction('addDrawingType-ICON')} />

                {/* <IconTable type='highlight' onClick={() => buttonPanelFunction('colorized-ICON')} />
                <IconTable type='eye' onClick={() => buttonPanelFunction('eye-ICON')} /> */}
                <IconTable type='highlight' disabled={true} />
                <IconTable type='eye' disabled={true} />
                <DividerRibbon />
                <IconTable type='history' onClick={() => buttonPanelFunction('history-ICON')} />
                <IconTable type='heat-map' onClick={() => buttonPanelFunction('color-cell-history-ICON')} />

                <DividerRibbon />
                {isAdmin && (
                    <div style={{ float: 'right' }}>
                        <IconTable type='fullscreen-exit' onClick={saveSmartSheetData} />
                        {/* <IconTable type='pic-center' onClick={saveRandomRows} /> */}
                    </div>
                )}
            </ButtonBox>


            {!loading ? (
                <TableStyled
                    ref={tableRef}
                    fixed
                    columns={renderColumns(
                        stateProject.userData.headersShown,
                        stateProject.userData.nosColumnFixed
                    )}
                    // columns={columns}
                    data={mapSubRows(getRowsData(stateRow).rowsDisplay)}

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
            ) : <LoadingIcon />}

            <ModalStyleFunction
                visible={panelFunctionVisible}
                footer={null}
                onCancel={() => setPanelFunctionVisible(false)}
                destroyOnClose={true}
                style={{ position: 'fixed', left: cursor && cursor.x, top: cursor && cursor.y }}
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
                centered={true}
            >
                <PanelSetting
                    panelType={panelType}
                    panelSettingType={panelSettingType}
                    commandAction={commandAction}
                    onClickCancelModal={() => {
                        setPanelSettingVisible(false);
                        setPanelSettingType(null);
                        setPanelType(null);
                    }}
                    setLoading={setLoading}
                />
            </ModalStyledSetting>

        </PageSpreadsheetStyled>
    );
};
export default PageSpreadsheet;




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
    font-weight: bold;
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
        background-color: #7bed9f;
    }
    .cell-history-highlight {
        background-color: #f6e58d;
    }
    .row-color-categorized {
        /* background-color: #9ACD32; */
    }
    .cell-current {
        background-color: ${colorType.cellHighlighted}
    };

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
        border-right: 4px solid #DCDCDC;
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
      display: flex;
      justify-content: center;
   }
`;
const ButtonBox = styled.div`
    width: ${`${window.innerWidth}px`};
    display: flex;
    padding-top: 7px;
    padding-bottom: 7px;
    padding-left: 7px;
    background: ${colorType.grey4};
`;
const LoadingIcon = () => {
    return (
        <SpinStyled>
            <Icon type='loading' style={{ fontSize: 40, textAlign: 'center', margin: 'auto' }} />
        </SpinStyled>
    );
};
const SpinStyled = styled.div`
    background: rgba(0, 0, 0, 0.05);
    opacity: 0.7;
    position: fixed;
    top: 0;
    left: 0;
    width: ${`${window.innerWidth}px`};
    height: ${`${window.innerHeight}px`};
    display: flex;
    justify-content: center;
    z-index: 1000;
`;


const getRowsData = ({ rowsAll, rowsAllInit, rowsFolded, rowsHidden }) => {

    let rowsUnfoldIds = rowsAll
        .filter(r => r._rowLevel === 0 && rowsFolded.indexOf(r.id) === -1)
        .map(r => r.id);

    // LOGIC ROWS HIDDEN

    return {
        rowsDisplay: rowsAll,
        rowsUnfoldIds
    };
};
const getInputDataInitially = (data) => {
    return {
        rowsAll: data.rows,
        rowsAllInit: data.rows,
        rowsFolded: data.userSettings ? data.userSettings.rowsFolded : [],
        rowsHidden: data.userSettings ? data.userSettings.rowsHidden : [],
        rowsUpdateAndNews: [],
        rowsVersionsToSave: []
    }
};
const getHeadersData = (projectData, role) => {

    const { publicSettings, userSettings } = projectData;
    let { headers } = publicSettings;

    let headersShown, headersHidden, rowsFolded, rowsHidden, colorization, nosColumnFixed;

    // let headersEditRestriction = publicSettings.cellEditRestriction[role]
    //     .map(hdKey => publicSettings.headers.find(hd => hd.key === hdKey).text);

    if (!userSettings) {
        headersShown = headers.map(hd => hd.text);
        headersHidden = [];
        rowsFolded = [];
        rowsHidden = [];
        colorization = null;
        nosColumnFixed = 0;
    } else {
        headersShown = userSettings.headersShown.map(hd => headers.find(h => h.key === hd).text);
        headersHidden = userSettings.headersHidden.map(hd => headers.find(h => h.key === hd).text);
        rowsFolded = userSettings.rowsFolded;
        rowsHidden = userSettings.rowsHidden;
        colorization = userSettings.colorization;
        nosColumnFixed = userSettings.nosColumnFixed;
    };

    return {
        headersShown,
        // headersEditRestriction,
        nosColumnFixed,
        headersHidden,
        rowsFolded,
        rowsHidden,
        colorization,
    };
};





























