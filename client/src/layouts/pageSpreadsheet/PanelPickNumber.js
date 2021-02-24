import { Input } from 'antd';
import React, { useState } from 'react';
import ButtonGroupComp from './ButtonGroupComp';



const PanelPickNumber = ({ onClickCancelModal, onClickApply }) => {
   const [nosOfRows, setNosOfRows] = useState(1);
   return (
      <div style={{ padding: 20 }}>
         <Input
            placeholder='Enter Number Of Drawings...'
            type='number' min='1'
            value={nosOfRows}
            onChange={(e) => setNosOfRows(e.target.value)}
            style={{
               marginBottom: 20,
               borderRadius: 0
            }}
         />
         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={() => onClickApply(nosOfRows)}
            />
         </div>
      </div>
   );
};
export default PanelPickNumber;
