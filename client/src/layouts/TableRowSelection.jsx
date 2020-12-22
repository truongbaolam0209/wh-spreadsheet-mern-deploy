import React, { useState } from 'react';
import BaseTable, { Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';

const cloneArray = (array) => {
    if (!Array.isArray(array)) return [];
    return [].concat(array);
}



export function toString(value) {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return value.toString ? value.toString() : '';
}

const generateData = (columns, count = 200, prefix = 'row-') =>
    new Array(count).fill(0).map((row, rowIndex) => {
        return columns.reduce(
            (rowData, column, columnIndex) => {
                rowData[column.dataKey] = `Row ${rowIndex} - Col ${columnIndex}`
                return rowData
            },
            {
                id: `${prefix}${rowIndex}`,
                parentId: null,
            }
        )
    })


const generateColumns = (count = 10, prefix = 'column-', props) =>
    new Array(count).fill(0).map((column, columnIndex) => ({
        ...props,
        key: `${prefix}${columnIndex}`,
        dataKey: `${prefix}${columnIndex}`,
        title: `Column ${columnIndex}`,
        width: 150,
    }))


function normalizeColumns(elements) {
    const columns = [];
    React.Children.forEach(elements, element => {
        if (React.isValidElement(element) && element.key) {
            const column = { ...element.props, key: element.key };
            columns.push(column);
        }
    });
    return columns;
}

export function callOrReturn(funcOrValue, ...args) {
    return typeof funcOrValue === 'function' ? funcOrValue(...args) : funcOrValue;
}
const StyledTable = styled(BaseTable)`
  .row-selected {
    background-color: red;
  }
`


const SelectionCell = (props) => {

    const { rowData, rowIndex, column } = props;
    const { onChange, selectedRowKeys, rowKey } = column;
    const checked = selectedRowKeys.includes(rowData[rowKey]);

    const _handleChange = e => {
        onChange({
            selected: e.target.checked,
            rowData,
            rowIndex
        });
    }

    return (
        <input type='checkbox' checked={checked} onChange={_handleChange} />

    );
};



const SelectableTable = (props) => {

    const {
        selectedRowKeys,
        defaultSelectedRowKeys,
        expandedRowKeys,
        defaultExpandedRowKeys,
        rowKey,
        onRowSelect,
        onSelectedRowsChange,
        rowClassName,
        columns,
        children,
        selectable,
        selectionColumnProps,
        ...rest
    } = props


    const [stateSelectedRowKeys, setStateSelectedRowKeys] = useState(
        (selectedRowKeys !== undefined
            ? selectedRowKeys
            : defaultSelectedRowKeys) || []
    );
    const [stateExpandedRowKeys, setStateExpandedRowKeys] = useState(
        (expandedRowKeys !== undefined
            ? expandedRowKeys
            : defaultExpandedRowKeys) || []
    );

    const setSelectedRowKeys = (selectedRowKeys) => {
        if (selectedRowKeys !== undefined) return
        setStateSelectedRowKeys(cloneArray(selectedRowKeys));

    }

    const setExpandedRowKeys = (expandedRowKeys) => {
        if (expandedRowKeys !== undefined) return;
        setStateExpandedRowKeys(cloneArray(expandedRowKeys));
    }

    const removeRowKeysFromState = (rowKeys) => {
        if (!Array.isArray(rowKeys)) return;

        const state = {};

        if (selectedRowKeys === undefined && stateSelectedRowKeys.length > 0) {
            state.selectedRowKeys = stateSelectedRowKeys.filter(key => !rowKeys.includes(key))
        }
        if (expandedRowKeys === undefined && stateExpandedRowKeys.length > 0) {
            state.expandedRowKeys = stateExpandedRowKeys.filter(key => !rowKeys.includes(key))
        }
        if (state.selectedRowKeys || state.expandedRowKeys) {
            setStateSelectedRowKeys(state.selectedRowKeys);
            setStateExpandedRowKeys(state.expandedRowKeys);
        };
    }



    const _handleSelectChange = ({ selected, rowData, rowIndex }) => {

        const selectedRowKeysX = [...stateSelectedRowKeys]
        const key = rowData[rowKey]

        if (selected) {
            if (!selectedRowKeysX.includes(key)) selectedRowKeysX.push(key)
        } else {
            const index = selectedRowKeysX.indexOf(key)
            if (index > -1) {
                selectedRowKeysX.splice(index, 1)
            }
        }

        if (selectedRowKeys === undefined) {
            setStateSelectedRowKeys(selectedRowKeysX)
        }
        onRowSelect({ selected, rowData, rowIndex });

        onSelectedRowsChange(selectedRowKeysX)
    }


    const _rowClassName = ({ rowData, rowIndex }) => {

        const rowClass = rowClassName
            ? callOrReturn(rowClassName, { rowData, rowIndex })
            : ''

        const key = rowData[rowKey]

        return [rowClass, stateSelectedRowKeys.includes(key) && 'row-selected']
            .filter(Boolean)
            .concat(' ')
    }

    let _columns = columns || normalizeColumns(children)
    if (selectable) {
        const selectionColumn = {
            width: 40,
            flexShrink: 0,
            resizable: false,
            frozen: Column.FrozenDirection.LEFT,
            cellRenderer: SelectionCell,
            ...selectionColumnProps,
            key: '__selection__',
            rowKey: rowKey,
            selectedRowKeys: stateSelectedRowKeys,
            onChange: _handleSelectChange,
        }
        _columns = [selectionColumn, ..._columns]
    }



    return (
        <StyledTable
            {...rest}
            columns={_columns}
            rowClassName={_rowClassName}
        />

    );
};



SelectableTable.defaultProps = {
    ...BaseTable.defaultProps,
    onRowSelect: {},
    onSelectedRowsChange: {},
}

const columns = generateColumns(10)
const data = generateData(columns, 200)


const TableRowSelection = () => {


    const onRowSelect = (props) => {
        console.log(props);
    };
    const onSelectedRowsChange = (props) => {
        console.log(props)
    };

    return (
        <SelectableTable
            width={1000}
            height={800}
            selectable
            columns={columns}
            data={data}
            onRowSelect={onRowSelect}
            onSelectedRowsChange={onSelectedRowsChange}
        />
    );
};

export default TableRowSelection;




