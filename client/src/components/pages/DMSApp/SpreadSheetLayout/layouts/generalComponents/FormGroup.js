import { Icon, Select, Tooltip } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';

const { Option } = Select;





const FormGroup = ({ applyGroup, onClickCancelModal, headers }) => {

    const [group, setGroup] = useState([
        {
            id: mongoObjectId(),
            column: 'Status'
        }
    ]);



    const setGroupHeader = (id, hd) => {
        const found = group.find(x => x.id === id);
        found.column = hd;
        setGroup([...group]);
    };

    const removeTag = (id) => {
        const arr = group.filter(x => x.id !== id);
        setGroup(arr);
    };

    const onClickApply = () => {
        applyGroup(group.map(x => x.column).filter(x => x !== 'Select Field...'));
    };


    const onClickAddField = () => {
        setGroup([
            ...group,
            {
                id: mongoObjectId(),
                column: 'Select Field...'
            }
        ])
    };

    return (
        <div style={{
            width: '100%',
            height: '100%'
        }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${colorType.grey4}` }}>

                <ButtonStyle
                    colorText='black'
                    marginRight={10}
                    borderColor={colorType.grey1}
                    background={colorType.grey4}
                    onClick={onClickAddField}
                    name='Add Field'
                    marginBottom={10}
                />
                {group.map(hd => (
                    <SelectComp
                        key={hd.id}
                        item={hd}
                        group={group}
                        setGroupHeader={setGroupHeader}
                        removeTag={removeTag}
                        headers={headers}
                    />
                ))}

            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                <ButtonGroupComp
                    onClickCancel={onClickCancelModal}
                    onClickApply={onClickApply}
                />
            </div>

        </div>
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


const SelectComp = ({ setGroupHeader, group, removeTag, item, headers }) => {


    return (
        <div style={{ display: 'flex', paddingBottom: 10, width: '70%' }}>

            <SelectStyled
                defaultValue='Select Field...'
                style={{ width: '100%', marginRight: 10 }}
                onChange={(column) => {
                    setGroupHeader(item.id, column);
                }}
                value={item.column}
            >
                {headers.filter(hd => !group.find(x => x.column === hd)).map(hd => (
                    <Option key={hd} value={hd}>{hd}</Option>
                ))}
            </SelectStyled>

            <Tooltip title='Remove Field'>
                <IconStyled>
                    <Icon
                        type='delete'
                        style={{
                            transform: 'translate(0, -3px)',
                            color: colorType.grey2,
                            fontSize: 12
                        }}
                        onClick={() => removeTag(item.id)}
                    />
                </IconStyled>
            </Tooltip>

        </div>
    );
};
const SelectStyled = styled(Select)`
    .ant-select-selection {
        border-radius: 0;
    }
`;

