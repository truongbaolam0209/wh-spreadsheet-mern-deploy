import { Button, Input } from 'antd';
import Axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { SERVER_URL } from '../../constants';
import { Context as CellContext } from '../../contexts/cellContext';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { convertCellTempToHistory, convertDrawingVersionToHistory, extractCellInfo, mongoObjectId, sortRowsReorder } from '../../utils';
import ColorizedForm from './ColorizedForm';
import FormCellColorizedCheck from './FormCellColorizedCheck';
import FormDateAutomation from './FormDateAutomation';
import FormDrawingTypeOrder from './FormDrawingTypeOrder';
import FormFilter from './FormFilter';
import FormGroup from './FormGroup';
import FormSort from './FormSort';
import PanelConfirm from './PanelConfirm';
import ReorderColumnForm from './ReorderColumnForm';
import TableActivityHistory from './TableActivityHistory';
import TableCellHistory from './TableCellHistory';
import TableDrawingDetail from './TableDrawingDetail';





const PanelSetting = (props) => {

    const { state: stateRow } = useContext(RowContext);
    const { state: stateProject } = useContext(ProjectContext);
    const { state: stateCell, getCellModifiedTemp } = useContext(CellContext);

    const { panelType, panelSettingType, commandAction, onClickCancelModal, setLoading } = props;


    const applyReorderColumns = (reorderColumns) => {
        commandAction({
            type: 'reorder-columns',
            data: reorderColumns
        });
    };
    const applyFilter = (filterRows) => {
        commandAction({
            type: 'filter-by-columns',
            data: filterRows,
        });
    };
    const applyResetFilter = () => {
        commandAction({
            type: 'reset-filter-sort'
        });
    };
    const applySort = (sortRows) => {
        commandAction({
            type: 'sort-data',
            data: sortRows,
        });
    };
    const unhideAllRows = () => {
        commandAction({ type: 'unhide-all-rows' });
    };


    const [nosOfRows, setNosOfRows] = useState(1);
    const onClickInsertRow = () => {

        const genId = (nosOfRows) => {
            let arr = [];
            for (let i = 0; i < nosOfRows; i++) {
                arr.push(mongoObjectId());
            };
            return arr;
        };
        let idsArr = genId(nosOfRows);

        let rowsUpdate, rowsAllOutput, newRows

        if (panelSettingType === 'Insert Drawings Below') {
            let rowAbove = panelType.cellProps.rowData;

            newRows = idsArr.map((id, i) => {
                return ({
                    id,
                    _rowLevel: 1,
                    _parentRow: rowAbove._parentRow,
                    _preRow: i === 0 ? rowAbove.id : idsArr[i - 1]
                });
            });

            let rowBelow = stateRow.rowsAll.find(r => r._preRow === rowAbove.id);
            if (rowBelow) {
                rowBelow._preRow = idsArr[idsArr.length - 1];
                rowsUpdate = [...newRows, rowAbove];
            } else {
                rowsUpdate = [...newRows];
            };

        } else if (panelSettingType === 'Insert Drawings Above') {
            let rowBelow = stateRow.rowsAll.find(r => r.id === panelType.cellProps.rowData.id);

            newRows = idsArr.map((id, i) => {
                return ({
                    id,
                    _rowLevel: 1,
                    _parentRow: rowBelow._parentRow,
                    _preRow: i === 0 ? rowBelow._preRow : idsArr[i - 1]
                });
            });
            rowBelow._preRow = idsArr[idsArr.length - 1];
            rowsUpdate = [...newRows, rowBelow];
        };
        rowsAllOutput = [...stateRow.rowsAll, ...newRows];

        commandAction({
            type: 'insert-drawings',
            data: {
                rowsAll: sortRowsReorder(rowsAllOutput),
                rowsUpdateAndNews: rowsUpdate
            }
        });
    };


    const applyGroup = (data) => {
        commandAction({
            type: 'group-columns',
            data
        });
    };


    const applyDateAutomation = (dateAutomation) => {
        let rowsAll = stateRow.rowsAll;

        const rowId = panelType.cellProps.rowData.id;
        let row = rowsAll.find(r => r.id === rowId);

        Object.keys(dateAutomation).forEach(key => {
            const cellTempId = `${rowId}-${key}`;
            const dateConverted = moment(dateAutomation[key]).format('DD/MM/YY');
            getCellModifiedTemp({ [cellTempId]: dateConverted });
            row[key] = dateConverted;
        });

        commandAction({
            type: 'drawing-data-automation',
            data: {
                rowsAll,
                rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews || [], row]
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

        let rowsAll = stateRow.rowsAll;

        const rowId = panelType.cellProps.rowData.id;
        let row = rowsAll.find(r => r.id === rowId);
        let rowOldVersiontoSave = { ...row };

        arrHeadersGoBlank.forEach(hd => {
            const cellTempId = `${rowId}-${hd}`;
            getCellModifiedTemp({ [cellTempId]: '' });
            row[hd] = '';
        });

        commandAction({
            type: 'create-new-drawing-revisions',
            data: {
                rowsAll,
                rowsUpdateAndNews: [...stateRow.rowsUpdateAndNews || [], row],
                rowsVersionsToSave: [...stateRow.rowsVersionsToSave || [], rowOldVersiontoSave]
            }
        });
    };

    const setCellHistoryArr = (data) => {
        commandAction({
            type: 'highlight-cell-history',
            data
        });
    };

    const applyFolderOrganize = (folders) => {

        const getRowschildren = (parentId) => {
            let idsArr = [];
            for (let i = 0; i < 5; i++) idsArr.push(mongoObjectId());

            let newRows = [];
            idsArr.forEach((id, i) => {
                newRows.push({
                    id,
                    _rowLevel: 1,
                    _parentRow: parentId,
                    _preRow: i === 0 ? null : idsArr[i - 1]
                });
            });
            return newRows;
        };

        let { rowsAll } = stateRow;

        let rowsFolderPrevious = rowsAll.filter(r => r._rowLevel === 0);
        let rowsUpdate = [];
        let unfoldIdsArrayNew = [];
        let rowsNew = [];
        console.log(folders);
        folders.forEach((fld, i) => {
            let rowCheck = rowsFolderPrevious.find(r => r.id === fld.id);
            if (rowCheck) {
                let obj = {};

                if (i === 0 && rowCheck._preRow !== null) {
                    obj._preRow = null;
                    rowCheck._preRow = null;
                };

                if (i !== 0 && rowCheck._preRow !== folders[i - 1].id) {
                    obj._preRow = folders[i - 1].id;
                    rowCheck._preRow = folders[i - 1].id;
                };

                if (rowCheck['Drawing Number'] !== fld.header) {
                    obj['Drawing Number'] = fld.header;
                    rowCheck['Drawing Number'] = fld.header;
                    getCellModifiedTemp({ [`${rowCheck['id']}-Drawing Number`]: fld.header });
                };

                if (!_.isEmpty(obj)) {
                    rowsUpdate.push({ ...rowCheck });
                };

            } else { // new Row
                let rowLevel0 = {
                    id: fld.id,
                    _parentRow: null,
                    _preRow: i === 0 ? null : folders[i - 1].id,
                    _rowLevel: 0,
                    'Drawing Number': fld.header
                };
                const rowsChidlren = getRowschildren(fld.id);

                rowsNew = [...rowsNew, rowLevel0, ...rowsChidlren];

                getCellModifiedTemp({ [`${fld.id}-Drawing Number`]: fld.header });

                unfoldIdsArrayNew.push(fld.id);

                rowsUpdate = [...rowsUpdate, ...rowsChidlren, rowLevel0];
            };
        });

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
                    found['Drawing Number'] = row['Drawing Number'];
                } else {
                    rowsNewUpdate.push(row);
                };
            });
            output = [...rowsUpdateAndNews, ...rowsNewUpdate];
        };



        commandAction({
            type: 'drawing-folder-organization',
            data: {
                rowsAll: sortRowsReorder([...rowsAll, ...rowsNew]),
                rowsUpdateAndNews: output,
                unfoldIdsArrayNew
            }
        });
    };


    const saveDataToServer = async () => {

        const { email, projectId, username } = stateProject.allDataOneSheet;
        const { headers } = stateProject.allDataOneSheet.publicSettings;
        const { cellsModifiedTemp } = stateCell;
        const { rowsVersionsToSave, rowsUpdateAndNews, rowsAll } = stateRow;
        try {
            setLoading(true);
            commandAction({ type: 'confirm-save-data' });

            // SAVE CELL HISTORY
            if (!_.isEmpty(stateCell.cellsModifiedTemp)) {
                await Axios.post(
                    `${SERVER_URL}/cell/history/${projectId}`,
                    convertCellTempToHistory(cellsModifiedTemp, stateProject)
                );
            };

            // SAVE DRAWINGS NEW VERSION
            if (rowsVersionsToSave && rowsVersionsToSave.length > 0) {
                await Axios.post(
                    `${SERVER_URL}/row/history/${projectId}?username=${username}`,
                    convertDrawingVersionToHistory(rowsVersionsToSave, stateProject)
                );
            };

            // SAVE DRAWINGS DATA
            if (rowsUpdateAndNews && rowsUpdateAndNews.length > 0) {

                // DELETE ROWS FIRST


                // GET LATEST ROWS FROM DB
                const res = await Axios.get(`${SERVER_URL}/sheet/${projectId}?userId=${email}`);
                let rowsInDB = res.data.rows;

                rowsUpdateAndNews.forEach(row => {
                    let rowDB = rowsInDB.find(r => r.id === row.id);
                    if (rowDB) {
                        headers.forEach(hd => {
                            row[hd.text] = rowDB[hd.text]; // update latest cell data.
                        });
                        Object.keys(cellsModifiedTemp).forEach(key => {
                            const { rowId, headerName } = extractCellInfo(key);
                            if (rowId === row.id) {
                                row[headerName] = cellsModifiedTemp[key];
                            };
                        });
                    } else {
                        // Not found mean NEW or DELETE by other user
                    }
                });


                let rowsUpdatePreRowParentRow = [];

                let rowsCurrentLevel0 = rowsAll.filter(r => r._rowLevel === 0);
                let rowsLevel0NewFromDB = [];
                rowsInDB.filter(rw => rw._rowLevel === 0).forEach(r => {
                    let row = rowsCurrentLevel0.find(row => row.id === r.id);
                    if (row) {
                        if (row._preRow !== r._preRow) rowsUpdatePreRowParentRow.push(row);
                    } else {
                        rowsLevel0NewFromDB.push(r);
                    };
                });
                let lastRowCurrentLevel0 = rowsCurrentLevel0.find(row => rowsCurrentLevel0.find(r => r._preRow === row.id));
                rowsLevel0NewFromDB.forEach((r, i) => {
                    if (i === 0) {
                        if (r._preRow !== lastRowCurrentLevel0.id) {
                            r._preRow = lastRowCurrentLevel0.id;
                            rowsUpdatePreRowParentRow.push(r);
                        };
                    } else {
                        if (r._preRow !== rowsLevel0NewFromDB[i - 1].id) {
                            r._preRow = rowsLevel0NewFromDB[i - 1].id;
                            rowsUpdatePreRowParentRow.push(r);
                        };
                    };
                });


                let rowsCurrentLevel1 = rowsAll.filter(r => r._rowLevel === 1);
                let rowsLevel1NewsFromDB = [];
                rowsInDB.filter(rw => rw._rowLevel === 1).forEach(r => {
                    let row = rowsCurrentLevel1.find(row => row.id === r.id);
                    if (row) {
                        if (row._preRow !== r._preRow) rowsUpdatePreRowParentRow.push(row);
                    } else {
                        rowsLevel1NewsFromDB.push(r);
                    };
                });
                let objSameParent = {};
                rowsLevel1NewsFromDB.forEach(r => {
                    objSameParent[r._parentRow] = [...objSameParent[r._parentRow] || [], r];
                });
                Object.keys(objSameParent).forEach(key => {
                    let rowsCurrentSameParent = rowsCurrentLevel1.filter(r => r._parentRow === key);
                    let lastRowL1ThisParent = rowsCurrentSameParent.find(row => rowsCurrentSameParent.find(r => r._preRow === row.id));
                    let rowsNewL1ThisParentFromDB = objSameParent[key];
                    rowsNewL1ThisParentFromDB.forEach((r, i) => {
                        if (i === 0) {
                            if (r._preRow !== lastRowL1ThisParent.id) {
                                r._preRow = lastRowL1ThisParent.id;
                                rowsUpdatePreRowParentRow.push(r);
                            };
                        } else {
                            if (r._preRow !== rowsNewL1ThisParentFromDB[i - 1].id) {
                                r._preRow = rowsNewL1ThisParentFromDB[i - 1].id;
                                rowsUpdatePreRowParentRow.push(r);
                            };
                        };
                    });
                });


                let rowsUpdateNoChangePreRowParentRow = rowsUpdateAndNews.filter(row => !rowsUpdatePreRowParentRow.find(r => r.id === row.id));
                let rowsUpdateChangePreRowParentRow = rowsUpdateAndNews.filter(row => rowsUpdatePreRowParentRow.find(r => r.id === row.id));
                rowsUpdateChangePreRowParentRow.forEach(row => {
                    let rowFound = rowsUpdatePreRowParentRow.find(r => r.id === row.id);
                    row._preRow = rowFound._preRow;
                    row._parentRow = rowFound._parentRow;
                });
                let rowsChangePreRowParentRow = rowsUpdatePreRowParentRow.filter(row => !rowsUpdateAndNews.find(r => r.id === row.id));
                
                let finalOutput = [
                    ...rowsUpdateNoChangePreRowParentRow,
                    ...rowsUpdateChangePreRowParentRow,
                    ...rowsChangePreRowParentRow
                ];
                
         

                let rowsToSaveFinal = finalOutput.map(row => {
                    let rowDataObj = {};
                    Object.keys(row).forEach(key => {
                        if (key === 'id') rowDataObj._id = row[key];
                        if (key === '_parentRow') rowDataObj.parentRow = row[key];
                        if (key === '_preRow') rowDataObj.preRow = row[key];
                        if (key === '_rowLevel') rowDataObj.level = row[key];
                    });
                    headers.forEach(hd => {
                        if (row[hd.text]) rowDataObj.data = { ...rowDataObj.data || {}, [hd.key]: row[hd.text] };
                    });
                    return rowDataObj;
                });

                await Axios.post(
                    `${SERVER_URL}/sheet/update-rows/${projectId}`,
                    { rows: rowsToSaveFinal }
                );
            };


            // SAVE SETTINGS 

            await Axios.post(
                `${SERVER_URL}/sheet/update-setting/${projectId}?userId=${email}`,
                {
                    headersShown: stateProject.userData.headersAllInit.map(hd => headers.find(h => h.text === hd).key),
                    headersHidden: stateProject.userData.headersHidden.map(hd => headers.find(h => h.text === hd).key),
                    nosColumnFixed: stateProject.userData.nosColumnFixed,
                    rowsFolded: stateProject.userData.rowsFolded,
                    rowsHidden: stateProject.userData.rowsHidden,
                    colorization: stateProject.userData.colorization,
                }
            );


            commandAction({ type: 'save-data-successfully' });

            const res = await Axios.get(`${SERVER_URL}/sheet/${projectId}?userId=${email}`);

            commandAction({
                type: 'get-data-from-server',
                data: res.data
            });


        } catch (err) {
            console.log(err);
        };
    };










    const applyColorization = (colorized) => {
        commandAction({
            type: 'colorized',
            colorized
        });
    };



    return (
        <>
            {panelSettingType === 'save-ICON' && (
                <PanelConfirm
                    onClickCancel={onClickCancelModal}
                    onClickApply={saveDataToServer}
                />
            )}

            {panelSettingType === 'filter-ICON' && (
                <FormFilter applyFilter={applyFilter} />
            )}

            {panelSettingType === 'rollback-ICON' && (
                <PanelConfirm
                    onClickCancel={onClickCancelModal}
                    onClickApply={applyResetFilter}
                />
            )}

            {panelSettingType === 'reorderColumn-ICON' && (
                <ReorderColumnForm
                    applyReorderColumns={applyReorderColumns}
                    onClickCancelModal={onClickCancelModal}
                />
            )}



            {panelSettingType === 'sort-ICON' && (
                <FormSort applySort={applySort} onClickCancel={onClickCancelModal} />
            )}

            {panelSettingType === 'eye-ICON' && (
                <div>
                    <Button onClick={unhideAllRows}>Unhide All Rows</Button>
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
                <TableActivityHistory />
            )}

            {panelSettingType === 'color-cell-history-ICON' && (
                <FormCellColorizedCheck setCellHistoryArr={setCellHistoryArr} />
            )}


            {panelSettingType === 'Date Automation' && (
                <FormDateAutomation applyDateAutomation={applyDateAutomation} />
            )}

            {panelSettingType === 'Create New Drawing Revision' && (
                <PanelConfirm
                    onClickCancel={onClickCancelModal}
                    onClickApply={createNewDrawingRevision}
                />
            )}

            {panelSettingType === 'View Drawing Revision' && (
                <TableDrawingDetail {...panelType.cellProps} />
            )}

            {panelSettingType === 'addDrawingType-ICON' && (
                <FormDrawingTypeOrder applyFolderOrganize={applyFolderOrganize} />
            )}

            {panelSettingType === 'View Cell History' && (
                <TableCellHistory {...panelType.cellProps} />
            )}

            {panelSettingType === 'colorized-ICON' && (
                <ColorizedForm applyColorization={applyColorization} />
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
