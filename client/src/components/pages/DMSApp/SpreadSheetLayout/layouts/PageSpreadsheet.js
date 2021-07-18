import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageSpreadsheet = (props) => {

   return (

      <OverallComponentDMS
         {...props}
         pageSheetTypeName='page-spreadsheet'
      />

   );
};

export default PageSpreadsheet;


