import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageSpreadsheet = (props) => {

   return (
      <div>
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-spreadsheet'
         />
      </div>
   );
};

export default PageSpreadsheet;


