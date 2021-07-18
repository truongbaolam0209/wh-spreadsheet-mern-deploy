import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageRFA = (props) => {

   return (

      <OverallComponentDMS
         {...props}
         pageSheetTypeName='page-rfa'
      />

   );
};

export default PageRFA;