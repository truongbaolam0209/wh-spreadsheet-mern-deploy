import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { mongoObjectId } from '../../utils';
import ButtonColumnTag from './ButtonColumnTag';
import ButtonGroupComp from './ButtonGroupComp';


const PanelConfirmResetMode = ({ applyResetMode, onClickCancelModal, modeFilter, modeSort, modeSearch, pageSheetTypeName }) => {


    const [btnArr, setBtnArr] = useState(pageSheetTypeName === 'page-spreadsheet' ? [
        { id: mongoObjectId(), header: 'Filter', mode: modeFilter.length > 0 ? 'shown' : 'hidden' },
        { id: mongoObjectId(), header: 'Sort', mode: Object.keys(modeSort).length > 0 ? 'shown' : 'hidden' },
        { id: mongoObjectId(), header: 'Search', mode: Object.keys(modeSearch).length > 0 ? 'shown' : 'hidden' },
    ] : [
        { id: mongoObjectId(), header: 'Filter', mode: modeFilter.length > 0 ? 'shown' : 'hidden' },
        { id: mongoObjectId(), header: 'Search', mode: Object.keys(modeSearch).length > 0 ? 'shown' : 'hidden' },
    ]);

    const onClickApply = () => {
        applyResetMode(btnArr);
    };

    const setMode = (item) => {
        let found = btnArr.find(x => x.id === item.id);
        if (found.mode === 'shown') {
            found.mode = 'hidden';
        } else if (found.mode === 'hidden') {
            found.mode = 'shown';
        };
        setBtnArr([...btnArr]);
    };

    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
            <PanelStyled>
                <div style={{ width: '100%', paddingTop: 20 }}>
                    {btnArr.map((tag, i) => (
                        <ButtonColumnTag
                            key={i}
                            tag={tag}
                            setMode={setMode}
                            actionType='reset-mode-action'
                        />
                    ))}
                </div>

            </PanelStyled>
            <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={onClickApply}
                />
            </div>

        </div>
    );
};
export default PanelConfirmResetMode;


const PanelStyled = styled.div`
   height: 60vh;
   width: 100%;
   overflow-y: scroll;
   overflow-x: hidden;
   border-bottom: 1px solid ${colorType.grey4};
`;







