import { Input } from 'antd';
import React, { useState } from 'react';
import ButtonGroupComp from './ButtonGroupComp';



const PanelConfirm = ({ onClickCancel, onClickApply, content }) => {

    const [value, setValue] = useState('');


    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
            <div style={{ padding: 20 }}>
                {(content === 'Do you want to save a new view template ?' ? (
                    <div>
                        <div>Do you want to save a new view template ?</div>
                        <Input
                            placeholder='Enter view template name...'
                            style={{ width: '100%' }}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            style={{
                                marginBottom: 20,
                                borderRadius: 0
                             }}
                        />
                    </div>

                ) : content) || 'Are you sure ?'}
            </div>
            <div style={{ padding: 20, paddingTop: 0, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancel}
                    onClickApply={() => onClickApply(value)}
                />
            </div>

        </div>
    );
};

export default PanelConfirm;
