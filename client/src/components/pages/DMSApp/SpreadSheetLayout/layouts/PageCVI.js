import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageCVI = (props) => {

   return (
      <OverallComponentDMS
         {...props}
         pageSheetTypeName='page-cvi'
      />
   );
};

export default PageCVI;