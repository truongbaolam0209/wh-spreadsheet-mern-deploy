import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageDT = (props) => {

    return (
        
            <OverallComponentDMS
                {...props}
                pageSheetTypeName='page-dt'
            />
        
    );
};

export default PageDT;