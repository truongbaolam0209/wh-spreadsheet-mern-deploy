import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageMM = (props) => {

    return (
       
            <OverallComponentDMS
                {...props}
                pageSheetTypeName='page-mm'
            />
       
    );
};

export default PageMM;