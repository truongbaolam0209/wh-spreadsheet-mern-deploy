import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageDataEntrySheet = (props) => {

   return (
      
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-data-entry'
         />
     
   );
};

export default PageDataEntrySheet;


