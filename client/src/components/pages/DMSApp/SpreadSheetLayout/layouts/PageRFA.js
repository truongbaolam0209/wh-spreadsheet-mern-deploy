import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageRFA = (props) => {

   return (
      <div>
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-rfa'
         />
      </div>
   );
};

export default PageRFA;