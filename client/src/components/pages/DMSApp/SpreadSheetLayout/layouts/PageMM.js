import React from 'react';
import OverallComponentDMS from './generalComponents/OverallComponentDMS';



const PageMM = (props) => {

    return (
        <div>
            <OverallComponentDMS
                {...props}
                pageSheetTypeName='page-mm'
            />
        </div>
    );
};

export default PageMM;