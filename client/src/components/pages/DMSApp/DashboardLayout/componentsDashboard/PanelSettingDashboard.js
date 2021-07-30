import React from 'react';
import FormFilter from '../../SpreadSheetLayout/layouts/generalComponents/FormFilter';
import FormGroup from '../../SpreadSheetLayout/layouts/generalComponents/FormGroup';
import FormSort from '../../SpreadSheetLayout/layouts/generalComponents/FormSort';
import PanelConfirm from '../../SpreadSheetLayout/layouts/generalComponents/PanelConfirm';
import PanelConfirmResetMode from '../../SpreadSheetLayout/layouts/generalComponents/PanelConfirmResetMode';



const PanelSettingDashboard = (props) => {

   const {
      panelSettingType, commandAction, onClickCancelModal,
      rowsAll, modeFilter, modeSort, modeSearch, headers
   } = props;

   const applyFilter = (filter) => commandAction({ type: 'filter-by-columns', data: { modeFilter: filter } });

   const applyResetMode = (modeReset) => {
      const modeResetObj = {};
      modeReset.forEach(type => {
         if (type.header === 'Filter' && type.mode === 'hidden') modeResetObj.modeFilter = [];
         if (type.header === 'Sort' && type.mode === 'hidden') modeResetObj.modeSort = {};
         if (type.header === 'Search' && type.mode === 'hidden') modeResetObj.modeSearch = {};
      });
      return commandAction({
         type: 'reset-filter-sort',
         data: { rowsAll, ...modeResetObj }
      });
   };
   const applyQuitGroupingMode = () => {
      return commandAction({
         type: 'reset-filter-sort',
         data: { modeGroup: [], modeSearch: {} }
      });
   };

   const applyGroup = (data) => commandAction({ type: 'group-columns', data: { modeGroup: data } });

   const applySort = (data) => commandAction({ type: 'sort-data', data: { modeSort: data } });


   return (
      <>
         {panelSettingType === 'filter-ICON' && (
            <FormFilter
               applyFilter={applyFilter}
               onClickCancelModal={onClickCancelModal}
               headers={headers}
               modeFilter={modeFilter}
               rowsInputData={rowsAll}
               isDashboard={true}
            />
         )}

         {panelSettingType === 'sort-ICON' && (
            <FormSort
               applySort={applySort}
               onClickCancel={onClickCancelModal}
               headers={headers}
               modeSort={modeSort}
            />
         )}


         {panelSettingType === 'swap-ICON-1' && (
            <PanelConfirm
               onClickCancel={onClickCancelModal}
               onClickApply={applyQuitGroupingMode}
               content='Do you want to quit grouping mode ?'
            />
         )}

         {panelSettingType === 'swap-ICON-2' && (
            <PanelConfirmResetMode
               onClickCancelModal={onClickCancelModal}
               applyResetMode={applyResetMode}
               modeFilter={modeFilter}
               modeSort={modeSort}
               modeSearch={modeSearch}
               isDashboard={true}
            />
         )}




         {panelSettingType === 'group-ICON' && (
            <FormGroup
               applyGroup={applyGroup}
               onClickCancelModal={onClickCancelModal}
               headers={headers}
            />
         )}

      </>
   );
};

export default PanelSettingDashboard;







