import { Icon, Select } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as UserContext } from '../../contexts/userContext';
import ButtonGroupComp from './ButtonGroupComp';

const { Option } = Select;



const FormGroup = ({ applyGroup, onClickCancelModal }) => {


    const [group, setGroup] = useState([]);

    const setGroupHeader = (hd) => {
        setGroup([...group, hd]);
    };

    const onClickApply = () => {

        applyGroup(group);
    };

    return (
        <>
            <div style={{ 
                padding: 20, 
                borderBottom: `1px solid ${colorType.grey4}`,
                
            }}>
                {Object.keys(group).map(key => (
                    <div key={key} style={{ display: 'flex' }}>
                        <SelectComp
                            setGroupHeader={setGroupHeader}
                        />
                        <IconStyled>
                            <Icon 
                                type='close' 
                                style={{ 
                                    transform: 'translate(0, -3px)',
                                    color: colorType.grey2,
                                    fontSize: 11
                                }}
                                onClick={() => {}} 
                            />
                        </IconStyled>
                    </div>
                ))}

                <SelectComp
                    setGroupHeader={setGroupHeader}
                />
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={onClickApply}
                />
            </div>
        </>
    );
};
export default FormGroup;

const IconStyled = styled.div`
        margin-left: 7px;
        width: 18px; 
        height: 18px; 
        border: 1px solid ${colorType.grey1};
        text-align: center;
        &:hover {
            background-color: ${colorType.grey4};
            cursor: pointer;
        };

`;


const SelectComp = ({ setGroupHeader }) => {

    const { state: stateUser } = useContext(UserContext);

    return (
        <div style={{ display: 'flex', paddingBottom: 20, width: '70%' }}>

            <SelectStyled
                defaultValue='Select Field...'
                style={{ width: '100%', marginRight: 20 }}
                onChange={(column) => setGroupHeader(column)}
            >
                {stateUser.headersShown.map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>

        </div>
    );
};



const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;
