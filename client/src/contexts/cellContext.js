import createDataContext from './createDataContext';



const cellReducer = (state, { type, payload }) => {
   switch (type) {


      case 'GET_CELL_MODIFIED_TEMP':
         return {
            ...state,
            cellsModifiedTemp: {
               ...state.cellsModifiedTemp,
               ...payload
            }
         };

      case 'OVERWRITE_CELL_MODIFIED_TEMP':
         return {
            ...state,
            cellsModifiedTemp: payload
         };

      case 'SET_CELL_ACTIVE':
         return {
            ...state,
            cellActive: payload
         };

      case 'COPY_TEMP_DATA':
         return {
            ...state,
            tempCopiedText: payload
         };
      case 'APPLY_ACTION_ON_CELL':
         return {
            ...state,
            cellAppliedAction: payload
         };
      default:
         return state;
   };
};


const getCellModifiedTemp = dispatch => (value) => {
   dispatch({
      type: 'GET_CELL_MODIFIED_TEMP',
      payload: value
   });
};
const OverwriteCellsModified = dispatch => (value) => {
   dispatch({
      type: 'OVERWRITE_CELL_MODIFIED_TEMP',
      payload: value
   });
};
const setCellActive = dispatch => (cell) => {
   dispatch({
      type: 'SET_CELL_ACTIVE',
      payload: cell
   });
};
const copyTempData = dispatch => (text) => {
   dispatch({
      type: 'COPY_TEMP_DATA',
      payload: text
   });
};
const applyActionOnCell = dispatch => (cell) => {
   dispatch({
      type: 'APPLY_ACTION_ON_CELL',
      payload: cell
   });
};

export const { Provider, Context } = createDataContext(
   cellReducer,
   {
      getCellModifiedTemp,
      setCellActive,
      copyTempData,
      applyActionOnCell,
      OverwriteCellsModified
   },
   {
      cellsModifiedTemp: {},
      cellActive: null,
      tempCopiedText: null,
      cellAppliedAction: null
   }
);
