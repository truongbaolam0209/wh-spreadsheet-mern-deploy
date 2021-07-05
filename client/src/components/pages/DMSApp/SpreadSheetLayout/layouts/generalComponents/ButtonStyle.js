import { Button } from 'antd';
import React, { useContext, useState } from 'react';
import { Context as RowContext } from '../../contexts/rowContext';




const ButtonStyle = ({
   colorText,
   marginRight,
   marginLeft,
   borderColor,
   borderOverwritten,
   marginBottom,
   background,
   name,
   onClick,
   disabled
}) => {


   const { state: stateRow } = useContext(RowContext);
   const { loading } = stateRow;

   const [isClicked, setIsClicked] = useState(false);


   const arrayButtonUpload = [
      'Choose PDF File',
      'Upload Reply Form',
      'Upload Documents',
      'Upload Signed Off Cover Form',
      'Upload 3D Model',
   ];


   const arrayButtonToLockAfterClick = [
      'Send Email',
      'Apply',
      'Acknowledge',
      'Yes'
   ];


   const arrayButtonLoadingAfterClick = [
      'Yes',
      'Acknowledge'
   ];


   return (
      <Button
         style={{
            borderRadius: 0,
            background: background,
            color: colorText,
            border: 'none',
            marginRight,
            marginBottom,
            marginLeft,
            border: `1px solid ${borderOverwritten ? borderColor : (borderColor || background)}`,
         }}

         disabled={disabled || (loading && arrayButtonLoadingAfterClick.indexOf(name) !== -1) || (!loading && isClicked && arrayButtonToLockAfterClick.indexOf(name) !== -1)}
         loading={loading && arrayButtonLoadingAfterClick.indexOf(name) !== -1}

         onClick={() => {
            if (arrayButtonToLockAfterClick.indexOf(name) !== -1) {
               setIsClicked(true);
            };
            if (arrayButtonUpload.indexOf(name) === -1) {
               onClick();
            };
         }}
      >
         {name}
      </Button>
   );
};

export default ButtonStyle;


