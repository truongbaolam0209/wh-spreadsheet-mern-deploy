import { Icon, Modal } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import 'react-base-table/styles.css';
import styled from 'styled-components';
import { colorType } from '../../SpreadSheetLayout/constants';
import CellHeader from '../../SpreadSheetLayout/layouts/generalComponents/CellHeader';
import { sortFnc } from '../../SpreadSheetLayout/layouts/generalComponents/FormSort';
import IconTable from '../../SpreadSheetLayout/layouts/generalComponents/IconTable';
import InputSearch from '../../SpreadSheetLayout/layouts/generalComponents/InputSearch';
import { debounceFnc, getActionName, getHeaderWidth, groupByHeaders } from '../../SpreadSheetLayout/utils';
import PanelSettingDashboard from './PanelSettingDashboard';



const Table = (props) => {
   return (
      <AutoResizer>
         {({ width }) => <BaseTable
            {...props}
            width={width}
            height={window.innerHeight * 0.7}
         />}
      </AutoResizer>
   );
};


const TableDrawingList = ({ data }) => {

   const { headers, dataTable: rows, headersGroup, isShowSelectedOnly, tableInfo } = data;

   const { panel, type, category, categorySub1 } = tableInfo;



   const [tableData, setTableData] = useState({
      headers: isShowSelectedOnly
         ? headers.filter(hd => hd === 'Drawing Number' || hd === 'Drawing Name' || headersGroup.indexOf(hd) !== -1)
         : headers,
      nosColumnFixed: 1,
      rowsAll: rows,
      modeFilter: [],
      modeSort: {},
      modeSearch: {},
      modeGroup: headersGroup,
   });


   const [cellSearchFound, setCellSearchFound] = useState(null);

   const [panelSettingType, setPanelSettingType] = useState(null);
   const [panelSettingVisible, setPanelSettingVisible] = useState(false);


   const buttonPanelFunction = (btn) => {
      setPanelSettingType(btn);
      setPanelSettingVisible(true);
   };


   const commandAction = (update) => {
      if (update.type === 'sort-data' || update.type === 'filter-by-columns' || update.type === 'reorder-columns' || update.type === 'group-columns') {
         if (update.type === 'sort-data') {
            update.data.modeSort.isIncludedParent = 'not included';
         };
         setTableData({ ...tableData, ...update.data });

      } else if (update.type === 'reset-filter-sort') {
         setTableData({ ...tableData, ...update.data });
         setSearchInputShown(false);
         setCellSearchFound(null);
      };
      setPanelSettingVisible(false);
      setPanelSettingType(null);
   };


   const [expandedRows, setExpandedRows] = useState([]);

   const onRowExpand = (props) => {
      const { rowKey, expanded } = props;
      let arr = [...expandedRows];
      if (expanded) {
         arr.push(rowKey);
      } else {
         arr.splice(arr.indexOf(rowKey), 1);
      };
      setExpandedRows(arr);
   };
   const ExpandIcon = (props) => {
      const { expanding, expandable, onExpand, depth } = props;
      const indent = (depth * 17).toString() + 'px';
      return (
         <div style={{
            marginLeft: indent,
            paddingLeft: expandable ? 10 : 13 + 10,
            paddingRight: 3,
            background: 'transparent'
         }}>
            {expandable && (
               <Icon
                  type={expanding ? 'plus-square' : 'minus-square'}
                  onClick={() => onExpand(expanding)}
                  style={{ color: 'black', transform: 'translate(0, -1px)' }}
               />
            )}
         </div>
      );
   };
   const expandIconProps = (props) => {
      return ({ expanding: !props.expanded });
   };


   const rowClassName = (props) => {
      const { rowData } = props;
      if (!rowData._rowLevel || rowData._rowLevel < 1) {
         return 'row-drawing-type';
      };
   };


   const [searchInputShown, setSearchInputShown] = useState(false);
   const searchGlobal = debounceFnc((textSearch) => {
      let searchDataObj = {};
      if (textSearch !== '') {
         tableData.rowsAll.forEach(row => {
            let obj = {};
            Object.keys(row).forEach(key => {
               if (
                  key !== 'id' && key !== '_preRow' && key !== '_parentRow' &&
                  row[key] &&
                  row[key].toString().toLowerCase().includes(textSearch.toLowerCase())
               ) {
                  obj[row.id] = [...obj[row.id] || [], key];
               };
            });
            if (Object.keys(obj).length > 0) searchDataObj = { ...searchDataObj, [row.id]: obj[row.id] };
         });
      };
      setCellSearchFound(searchDataObj);
      setTableData({
         ...tableData,
         nosColumnFixed: tableData.nosColumnFixed + 1
      });
      setTableData({
         ...tableData,
         nosColumnFixed: tableData.nosColumnFixed,
         modeSearch: { searchDataObj, isFoundShownOnly: 'show all' }
      });
   }, 500);

   const setTableDataXXX = (isFoundShownOnly) => {
      setTableData({
         ...tableData,
         modeSearch: { ...tableData.modeSearch, isFoundShownOnly }
      });
   };


   const renderColumns = (arr, nosColumnFixed) => {
      let headersObj = [{
         key: 'Index', dataKey: 'Index', title: '', width: 50,
         frozen: Column.FrozenDirection.LEFT,
         cellRenderer: (props) => {
            const { rowIndex } = props;
            return (
               <div style={{ padding: 5 }}>{rowIndex + 1}</div>
            );
         },
         style: { padding: 0, margin: 0 }
      }];
      arr.forEach((hd, index) => {
         headersObj.push({
            key: hd, dataKey: hd, title: hd,
            width: getHeaderWidth(hd),
            resizable: true,
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            headerRenderer: <CellHeader />,
            cellRenderer: (props) => {
               let { cellData, column, rowData } = props;

               if ((column.key.includes('(A)') || column.key.includes('(T)') ||
                  column.key === 'Construction Issuance Date' || column.key === 'Construction Start') &&
                  cellData && cellData.length === 10 && cellData.includes('-')) {
                  cellData = moment(cellData, 'YYYY-MM-DD').format('DD/MM/YY');
               };

               return (
                  <div style={{
                     padding: 5,
                     textOverflow: 'ellipsis',
                     overflow: 'hidden',
                     whiteSpace: 'nowrap',
                     color: 'black'
                  }}>
                     {rowData._rowLevel < 1 && column.key === 'Drawing Number' ? rowData.title : cellData}
                  </div>
               );
            },
            className: (props) => {
               const { rowData, column: { key } } = props;
               const { id } = rowData;

               return (cellSearchFound && id in cellSearchFound && cellSearchFound[id].indexOf(key) !== -1)
                  ? 'cell-found'
                  : '';
            }
         });
      });
      return headersObj;
   };

   const typeTitle = type === 'Bar Drawing Modeller' ? 'Drawing by modeller'
      : type === 'Bar Drawing Coordinator' ? 'Drawing by coordinator'
         : type === 'Bar Drawing Rev' ? 'Status of drawing per revision'
            : type === 'Bar Drawing Resubmit' ? 'No of drawing to resubmit'
               : type === 'Pie Drawing Status' ? 'Drawing Status' : '';

   return (

      <div style={{
         background: 'white',
         height: window.innerHeight * 0.8,
      }}>
         <div style={{ fontWeight: 'bold', margin: 15, fontSize: 17 }}>
            {panel} / {typeTitle} / {category} / {categorySub1 ? categorySub1 + '/' : ''} ({rows.length} nos)
         </div>
         <ButtonBox>
            {/* <IconTable type='layout' onClick={() => buttonPanelFunction('reorderColumn-ICON')} /> */}
            <IconTable type='filter' onClick={() => buttonPanelFunction('filter-ICON')} />
            <IconTable type='apartment' onClick={() => buttonPanelFunction('group-ICON')} />
            <IconTable type='sort-ascending' onClick={() => buttonPanelFunction('sort-ICON')} />

            {searchInputShown
               ? <InputSearch searchGlobal={searchGlobal} isDashboard={true} tableData={tableData} setTableDataXXX={setTableDataXXX} />
               : <IconTable type='search' onClick={() => setSearchInputShown(true)} />}

            {tableData.modeGroup.length > 0 ? (
               <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-1')} />
            ) : (
               <IconTable type='swap' onClick={() => buttonPanelFunction('swap-ICON-2')} />
            )}

            {/* <ExcelExport fileName={'dashboard-export'} /> */}
         </ButtonBox>


         <TableStyled
            dataForStyled={{ cellSearchFound }}
            fixed
            columns={renderColumns(tableData.headers, tableData.nosColumnFixed)}
            data={arrangeDrawingTypeFinal({
               rowsAll: tableData.rowsAll,
               modeFilter: tableData.modeFilter,
               modeSort: tableData.modeSort,
               modeSearch: tableData.modeSearch,
               modeGroup: tableData.modeGroup
            })}
            rowHeight={30}
            overscanRowCount={0}
            rowClassName={rowClassName}

            expandedRowKeys={expandedRows}

            expandColumnKey={headers[0]}

            expandIconProps={expandIconProps}
            components={{ ExpandIcon }}
            onRowExpand={onRowExpand}
         />






         <ModalStyledSetting
            title={tableData.modeGroup.length > 0 ? 'Quit Grouping Mode' : getActionName(panelSettingType)}
            visible={panelSettingVisible}
            footer={null}
            onCancel={() => {
               setPanelSettingVisible(false);
               setPanelSettingType(null);
            }}
            destroyOnClose={true}
            centered={true}
            width={panelSettingType === 'filter-ICON' ? window.innerWidth * 0.5 : 520}
         >
            <PanelSettingDashboard
               panelSettingType={panelSettingType}
               commandAction={commandAction}
               onClickCancelModal={() => {
                  setPanelSettingVisible(false);
                  setPanelSettingType(null);
               }}
               rowsAll={tableData.rowsAll}
               modeFilter={tableData.modeFilter}
               modeGroup={tableData.modeGroup}
               modeSort={tableData.modeSort}
               modeSearch={tableData.modeSearch}
               headers={tableData.headers}
            />
         </ModalStyledSetting>

      </div>

   );
};
export default TableDrawingList;

const generateColumns = (count = 10, prefix = 'column-', props) =>
   new Array(count).fill(0).map((column, columnIndex) => ({
      ...props,
      key: `${prefix}${columnIndex}`,
      dataKey: `${prefix}${columnIndex}`,
      title: `Column ${columnIndex}`,
      width: 150,
   }));




const TableStyled = styled(Table)`

   .row-drawing-type {
      background-color: ${colorType.grey3};
      font-weight: bold;
   };

   ${({ dataForStyled }) => {
      const { cellSearchFound } = dataForStyled;
      if (cellSearchFound) return `.cell-found { background-color: #7bed9f; }`;
   }}

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
   width: '100%';
   position: relative;
   display: flex;
   padding-top: 7px;
   padding-bottom: 7px;
   padding-left: 7px;
   background: ${colorType.grey4};


   border: 1px solid ${colorType.grey4};
`;


const arrangeDrawingTypeFinal = ({ rowsAll, modeFilter, modeSort, modeSearch, modeGroup }) => {

   let rowsAllInTemplate = rowsAll.map(x => ({ ...x }));


   if (Object.keys(modeSearch).length === 2) {
      const { isFoundShownOnly, searchDataObj } = modeSearch;
      if (isFoundShownOnly === 'show found only') {
         rowsAllInTemplate = rowsAllInTemplate.filter(row => row.id in searchDataObj);
      };
   };

   if (modeFilter.length > 0) {
      let filterObj = {};
      modeFilter.forEach(filter => {
         if (filter.header) {
            filterObj[filter.header] = [...filterObj[filter.header] || [], filter.value];
         };
      });
      Object.keys(filterObj).forEach(header => {
         rowsAllInTemplate = rowsAllInTemplate.filter(r => filterObj[header].indexOf(r[header]) !== -1);
      });
      if (Object.keys(modeSort).length !== 3 && modeFilter.find(x => x.isIncludedParent === 'not included')) {
         return rowsAllInTemplate;
      };
   };

   if (Object.keys(modeSort).length === 3) {
      const { isIncludedParent: isIncludedParentSort, column: columnSort, type: typeSort } = modeSort;
      if (isIncludedParentSort === 'included') {
         const listParentIds = [...new Set(rowsAllInTemplate.map(x => x._parentRow))];
         let rowsSortedOutput = [];
         listParentIds.forEach(parentId => {
            let subRows = rowsAllInTemplate.filter(x => x._parentRow === parentId);
            if (typeSort === 'ascending') {
               subRows = sortFnc(subRows, columnSort, true);
            } else if (typeSort === 'descending') {
               subRows = sortFnc(subRows, columnSort, false);
            };
            rowsSortedOutput = [...rowsSortedOutput, ...subRows];
         });
         rowsAllInTemplate = [...rowsSortedOutput];

         if (modeFilter.find(x => x.isIncludedParent === 'not included')) return rowsAllInTemplate;

      } else if (isIncludedParentSort === 'not included') {
         if (typeSort === 'ascending') {
            rowsAllInTemplate = sortFnc(rowsAllInTemplate, columnSort, true);
         } else if (typeSort === 'descending') {
            rowsAllInTemplate = sortFnc(rowsAllInTemplate, columnSort, false);
         };
         return rowsAllInTemplate;
      };
   };


   if (modeGroup.length > 0) {
      const { rows } = groupByHeaders(rowsAllInTemplate, modeGroup);
      return rows;
   };

   return rowsAllInTemplate;
};
























