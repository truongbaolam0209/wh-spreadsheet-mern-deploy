import { Button, Input } from 'antd';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { unflatten } from 'react-base-table';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { Context as UserContext } from '../../contexts/userContext';
import { groupByHeaders, mongoObjectId } from '../../utils';
import { getPanelWidthHeight } from '../PageSpreadsheet';
import ColorizedForm from './ColorizedForm';
import FormCellHistoryColor from './FormCellHistoryColor';
import FormDateAutomation from './FormDateAutomation';
import FormFilter from './FormFilter';
import FormGroup from './FormGroup';
import FormSort from './FormSort';
import PanelConfirm from './PanelConfirm';
import ReorderColumnForm from './ReorderColumnForm';
import TableActivityHistory from './TableActivityHistory';
import TableCellHistory from './TableCellHistory';
import TableDrawingDetail from './TableDrawingDetail';




const PanelSetting = (props) => {

    const { state: stateRow, getSheetRows } = useContext(RowContext);
    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateUser } = useContext(UserContext);
    const { state: stateCell, getCellModifiedTemp } = useContext(CellContext);

    const { panelType, panelSettingType, xxxxx, onClickCancelModal } = props;


    const applyReorderColumns = (reorderColumns) => {
        xxxxx({
            type: 'reorder-columns',
            reorderColumns
        });
    };
    const applyFilter = (filterRows) => {
        xxxxx({
            type: 'filter-by-columns',
            data: filterRows,
        });
    };
    const resetFilterSort = () => {
        xxxxx({ type: 'reset-filter-sort' });
    };
    const applySort = (sortRows) => {
        xxxxx({
            type: 'sort-data',
            data: sortRows,
        });
    };
    const unhideAllRows = () => {
        xxxxx({ type: 'unhide-all-rows' });
    };


    const [nosOfRows, setNosOfRows] = useState(1);
    const onClickInsertRow = () => {

        let allRows = [...stateRow.rowsAll];

        let rowCurrent = panelType.cellProps.rowData;


        let idsArr = []; 
        for (let i = 0; i < nosOfRows; i++) {
            idsArr.push(mongoObjectId());
        };

        let rowAbove, rowBelow;
        if (panelSettingType === 'Insert Drawings Below') {
            rowAbove = panelType.cellProps.rowData;
            let rowAboveIndex = allRows.indexOf(rowAbove);
            rowBelow = allRows[rowAboveIndex + 1];
        } else if (panelSettingType === 'Insert Drawings Above') {
            rowBelow = panelType.cellProps.rowData;
            let rowBelowIndex = allRows.indexOf(rowBelow);
            rowAbove = allRows[rowBelowIndex - 1];
        };
   
        let newRows = [];
        idsArr.forEach((id, i) => {
            newRows.push({
                id,
                _rowLevel: rowCurrent._rowLevel,
                _parentRow: rowCurrent._parentRow,
                _preRow: i === 0 ? rowAbove.id : idsArr[i - 1],
            });
        });

        rowBelow._preRow = idsArr[idsArr.length - 1]

        // rowtoChangePrerow._preRow = idsArr[idsArr.length - 1];

        let rowsArrTop = [...allRows].splice(0, allRows.indexOf(rowAbove) + 1);
        
        let rowsArrBottom = [...allRows].splice(allRows.indexOf(rowAbove) + 1, allRows.length - allRows.indexOf(rowAbove) - 1);

        const rowsAllOutput = [...rowsArrTop, ...newRows, ...rowsArrBottom];

        xxxxx({
            type: 'insert-drawings',
            data: {
                rowsVisible: rowsAllOutput.filter(row => stateRow.rowsHidden.indexOf(row.id) === -1 && stateRow.rowsHidden.indexOf(row._parentRow) === -1),
                rowsVisibleInit: rowsAllOutput.filter(row => stateRow.rowsHidden.indexOf(row.id) === -1 && stateRow.rowsHidden.indexOf(row._parentRow) === -1),
                rowsAll: rowsAllOutput,
                rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews || [], ...newRows, rowBelow ]
            }
        });
    };


    const applyGroup = (groupArray) => {
        xxxxx({
            type: 'group-columns',
            data: groupByHeaders(stateRow.rowsVisible.filter(r => r._rowLevel === 1), groupArray)
        });
    };


    const applyDateAutomation = (dateAutomation) => {

        let allRows = [...stateRow.rowsAll];

        const rowId = panelType.cellProps.rowData.id;
        let row = allRows.find(r => r.id === rowId);
        
        Object.keys(dateAutomation).forEach(key => {
            const cellTempId = `${rowId}-${key}`;
            const dateConverted = moment(dateAutomation[key]).format('DD/MM/YY');
            getCellModifiedTemp({ [cellTempId]: dateConverted });
            row[key] = dateConverted;
        });

        xxxxx({
            type: 'drawing-data-automation',
            data: {
                rowsVisible: allRows.filter(row => stateRow.rowsHidden.indexOf(row.id) === -1 && stateRow.rowsHidden.indexOf(row._parentRow) === -1),
                rowsVisibleInit: allRows.filter(row => stateRow.rowsHidden.indexOf(row.id) === -1 && stateRow.rowsHidden.indexOf(row._parentRow) === -1),
                rowsAll: allRows,
                rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews || [], row ]
            }
        });
    };

    const createNewDrawingRevision = () => {
        const arrHeadersGoBlank = [
            'Model Start (T)',
            'Model Start (A)',
            'Model Finish (T)',
            'Model Finish (A)',
            'Drawing Start (T)',
            'Drawing Start (A)',
            'Drawing Finish (T)',
            'Drawing Finish (A)',
            'Drg To Consultant (T)',
            'Drg To Consultant (A)',
            'Consultant Reply (T)',
            'Consultant Reply (A)',
            'Get Approval (T)',
            'Get Approval (A)',
            'Construction Issuance Date',
            'Construction Start',
            'Rev',
            'Status'
        ];

        let allRows = [...stateRow.rowsAll];

        const rowId = panelType.cellProps.rowData.id;
        let row = allRows.find(r => r.id === rowId);
        
        arrHeadersGoBlank.forEach(hd => {
            const cellTempId = `${rowId}-${hd}`;
            getCellModifiedTemp({ [cellTempId]: '' });
            row[hd] = '';
        });

        xxxxx({
            type: 'create-new-drawing-revisions',
            data: {
                rowsVisible: allRows.filter(row => stateRow.rowsHidden.indexOf(row.id) === -1 && stateRow.rowsHidden.indexOf(row._parentRow) === -1),
                rowsVisibleInit: allRows.filter(row => stateRow.rowsHidden.indexOf(row.id) === -1 && stateRow.rowsHidden.indexOf(row._parentRow) === -1),
                rowsAll: allRows,
                rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews || [], row ],
                rowsVersionsToSave: [...stateRow.rowsVersionsToSave || [], row ]
            }
        });
    };

    const setCellHistoryArr = (data) => {
        xxxxx({
            type: 'highlight-cell-history',
            data
        });
    };








    
    
    const applyColorization = (colorized) => {
        xxxxx({
            type: 'colorized',
            colorized
        });
    };
    const createNewDrawingVersion = () => {
        let arr = stateRow.sheetRows;
        let row = arr.find(r => r.id === panelType.cellProps.rowData.id);
        let index = arr.indexOf(row);
        arr.splice(index, 1);
        arr.splice(index, 0, { ...row, ...newRevisionDrawingData });

        console.log(arr);
        xxxxx({
            type: 'create-new-drawing-version',
            data: unflatten(arr),
        });
    };








    const ReorderColumns1 = () => {
        xxxxx(columnSet_01);
    };
    const ReorderColumns2 = () => {
        xxxxx(columnSet_02);
    };




    




    return (
        <>

            {panelSettingType === 'filter-ICON' && (
                <FormFilter applyFilter={applyFilter} />
            )}

            {panelSettingType === 'reorderColumn-ICON' && (
                <ReorderColumnForm 
                    applyReorderColumns={applyReorderColumns} 
                    onClickCancelModal={onClickCancelModal} 
                />
            )}

            {panelSettingType === 'rollback-ICON' && (
                <PanelConfirm />
            )}

            {panelSettingType === 'sort-ICON' && (
                <FormSort applySort={applySort} />
            )}

            {panelSettingType === 'eye-ICON' && (
                <div>
                    <Button onClick={unhideAllRows}>Unhide All Rows</Button>
                    {/* <Button onClick={hideSpecificRows}>Hide</Button> */}
                </div>
            )}
            {panelSettingType === 'group-ICON' && (
                <FormGroup applyGroup={applyGroup} />
            )}


            {(panelSettingType === 'Insert Drawings Below' || panelSettingType === 'Insert Drawings Above') && (
                <div>
                    <Input 
                        placeholder='Enter Number Of Drawings...'
                        type='number' min='1'
                        value={nosOfRows} 
                        onChange={(e) => setNosOfRows(e.target.value)}
                        style={{
                            marginBottom: 20
                        }}
                    />
                    <Button onClick={onClickInsertRow}>Apply</Button>
                </div>
            )}

            {panelSettingType === 'history-ICON' && (
                <TableActivityHistory 
                    width={getPanelWidthHeight(panelSettingType).width}
                    height={getPanelWidthHeight(panelSettingType).height}
                />
            )}

            {panelSettingType === 'color-cell-history-ICON' && (
                <FormCellHistoryColor setCellHistoryArr={setCellHistoryArr} />
            )}


            {panelSettingType === 'Date Automation' && (
                <FormDateAutomation applyDateAutomation={applyDateAutomation} />
            )}
            
            {panelSettingType === 'Create New Drawing Revision' && (
                <Button onClick={createNewDrawingRevision}>Are you sure</Button>
            )}



            {panelSettingType === 'colorized-ICON' && (
                <ColorizedForm applyColorization={applyColorization} />
            )}

            {panelSettingType === 'View drawing revision' && (
                <TableDrawingDetail {...panelType.cellProps} />
            )}

            {panelSettingType === 'View cell history' && (
                <TableCellHistory {...panelType.cellProps} />
            )}





        </>
    );
};

export default PanelSetting;


const columnSet_01 = {
    fixedColumnCount: 5,
    headers: [
        'Index',
        'Block/Zone',
        'Drawing Name',
        'Drawing Number',
        'RFA Ref',
        'Model Start (T)',
        'Level',
        'Unit/CJ',
        'Drg Type',
        'Use For',
        'Coordinator In Charge',
        'Modeller',
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
    ]
};


const columnSet_02 = {
    fixedColumnCount: 4,
    headers: [
        'Index',
        'Level',
        'Drawing Name',
        'Block/Zone',
        'RFA Ref',
        'Drawing Number',
        'Model Start (T)',
        'Unit/CJ',
        'Drg Type',
        'Use For',
        'Coordinator In Charge',
        'Modeller',
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
    ]
};




const newRevisionDrawingData = {
    'Model Start (A)': '',
    'Model Finish (T)': '',
    'Model Finish (A)': '',
    'Model Progress': '',
    'Drawing Start (T)': '',
    'Drawing Start (A)': '',
    'Drawing Finish (T)': '',
    'Drawing Finish (A)': '',
    'Drawing Progress': '',
    'Drg To Consultant (T)': '',
    'Drg To Consultant (A)': '',
    'Consultant Reply (T)': '',
    'Consultant Reply (A)': '',
    'Get Approval (T)': '',
    'Get Approval (A)': '',
    'Construction Issuance Date': '',
    'Construction Start': '',
    'Rev': '',
    'Status': ''
}
