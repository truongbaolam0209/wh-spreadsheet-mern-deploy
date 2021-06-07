import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageCVI = (props) => {

   return (
      <div>
         <OverallComponentDMS
            {...props}
            pageSheetTypeName='page-cvi'
         />
      </div>
   );
};

export default PageCVI;