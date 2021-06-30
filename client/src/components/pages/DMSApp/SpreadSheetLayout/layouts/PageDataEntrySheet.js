import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageDataEntrySheet = (props) => {

   return (
      <div>
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-data-entry'
         />
      </div>
   );
};

export default PageDataEntrySheet;


