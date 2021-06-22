import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageDT = (props) => {

    return (
        <div>
            <OverallComponentDMS
                {...props}
                pageSheetTypeName='page-dt'
            />
        </div>
    );
};

export default PageDT;