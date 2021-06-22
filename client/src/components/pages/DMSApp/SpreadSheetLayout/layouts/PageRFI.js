import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageRFI = (props) => {

   return (
      <div>
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-rfi'
         />
      </div>
   );
};

export default PageRFI;