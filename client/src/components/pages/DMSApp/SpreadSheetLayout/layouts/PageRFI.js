import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageRFI = (props) => {

   return (

      <OverallComponentDMS
         {...props}
         pageSheetTypeName='page-rfi'
      />

   );
};

export default PageRFI;