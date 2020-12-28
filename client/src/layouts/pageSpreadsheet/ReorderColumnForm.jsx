import React, { useContext, useState } from 'react';
import { DraggableArea } from 'react-draggable-tags';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import ButtonGroupComp from './ButtonGroupComp';




const ReorderColumnForm = ({ applyReorderColumns, onClickCancelModal }) => {


    const { state: stateProject } = useContext(ProjectContext);

    const onClickApply = () => {


        let arr = [];
        let arrHidden = [];
        let countfrozen = 0;
        tags.forEach(tg => {
            if (tg.mode === 'frozen') {
                arr.push(tg.header);
                countfrozen++;
            } else if (tg.mode === 'hidden') {
                arrHidden.push(tg.header);
            }
        });
        tags.forEach(tg => {
            if (tg.mode === 'shown') {
                arr.push(tg.header);
            };
        });


        applyReorderColumns({
            nosColumnFixed: countfrozen,
            headersAll: arr,
            headersHidden: arrHidden,
        });
    };


    const setMode = (obj) => {

        // let xxx = [];
        tags.forEach(tg => {
            if (tg.header === obj.header) {
                tg.mode = obj.mode;
            };
            // xxx.push({...tg});
        });
        // setTags(xxx);
    };

    const getTags = () => {
        let arr = [];
        stateProject.userData.headersHidden.forEach((header, index) => {
            arr.push({
                id: index,
                header,
                mode: 'hidden'
            });
        });
        stateProject.userData.headersAll.forEach((header, index) => {
            arr.push({
                id: index + stateProject.userData.headersHidden.length,
                header,
                mode: index < stateProject.userData.nosColumnFixed ? 'frozen' : 'shown'
            });
        });

        return arr;
    };

    const [tags, setTags] = useState(getTags());
    console.log(tags);

    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
            <PanelStyled>
                <div style={{ width: '100%', paddingTop: 20 }}>
                    <DraggableArea
                        isList
                        tags={tags}
                        render={(props) => {
                            const { tag } = props;
                            return (
                                <ButtonColumn tag={tag} setMode={setMode} />
                            );
                        }}
                        onChange={(tags) => setTags(tags)}
                    />
                </div>

            </PanelStyled>
            <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: 13, height: 13, background: colorType.primary, marginRight: 7 }}></div>
                        <div style={{ fontSize: 11 }}>Frozen Columns</div>
                    </div>
                    <div style={{ display: 'flex', marginTop: 5 }}>
                        <div style={{ width: 13, height: 13, background: '#f1a99f', marginRight: 7 }}></div>
                        <div style={{ fontSize: 11 }}>Shown Columns</div>
                    </div>
                    <div style={{ display: 'flex', marginTop: 5 }}>
                        <div style={{ width: 13, height: 13, background: colorType.grey4, marginRight: 7 }}></div>
                        <div style={{ fontSize: 11 }}>Hidden Columns</div>
                    </div>
                </div>

                <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={onClickApply}
                />
            </div>

        </div>
    );
};
export default ReorderColumnForm;


const PanelStyled = styled.div`

    height: 60vh;
    width: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    border-bottom: 1px solid ${colorType.grey4};

    ::-webkit-scrollbar {
        -webkit-appearance: none;
        background-color: #e3e3e3;
    }

    ::-webkit-scrollbar:vertical {
        width: 15px;
    }

    ::-webkit-scrollbar:horizontal {
        height: 15px;
    }

    ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        border: 2px solid #e3e3e3;
        background-color: #999;

        &:hover {
            background-color: #666;
        }
    }
`;


const ButtonColumn = ({ tag, setMode }) => {


    const styleShown = {
        background: '#f1a99f',
        color: 'black'
    };
    const styleFrozen = {
        background: colorType.primary,
        color: 'white'
    };
    const styleHidden = {
        background: colorType.grey4,
        color: 'grey'
    };

    const [btnStyle, setBtnStyle] = useState(
        tag.mode === 'hidden' ? styleHidden :
            tag.mode === 'frozen' ? styleFrozen :
                styleShown
    );

    const [type, setType] = useState(tag.mode);

    const onClick = () => {
        if (type === 'shown') {
            setBtnStyle(styleFrozen);
            setMode({
                header: tag.header,
                id: tag.id,
                mode: 'frozen'
            });
            setType('frozen');

        } else if (type === 'frozen') {
            setBtnStyle(styleHidden);
            setMode({
                header: tag.header,
                id: tag.id,
                mode: 'hidden'
            });
            setType('hidden');

        } else if (type === 'hidden') {
            setBtnStyle(styleShown);
            setMode({
                header: tag.header,
                id: tag.id,
                mode: 'shown'
            });
            setType('shown');
        };
    };

    return (
        <div
            style={{
                ...btnStyle,
                padding: 9,

    
                textAlign: 'center',
                fontWeight: 'bold',
                width: '70%',
                margin: 'auto',
                marginBottom: 10
            }}
            onClick={onClick}
        >
            {tag.header}
        </div>
    );
};


