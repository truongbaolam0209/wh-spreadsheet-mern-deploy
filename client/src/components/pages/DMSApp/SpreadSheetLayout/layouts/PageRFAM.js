import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageRFAM = (props) => {

   return (

      <OverallComponentDMS
         {...props}
         pageSheetTypeName='page-rfam'
      />

   );
};

export default PageRFAM;