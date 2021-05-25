import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageRFAM = (props) => {

   return (
      <div>
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-rfam'
         />
      </div>
   );
};

export default PageRFAM;