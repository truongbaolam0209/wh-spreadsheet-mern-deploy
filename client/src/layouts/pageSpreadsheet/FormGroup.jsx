import { Icon, Select, Tooltip } from 'antd';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { groupByHeaders, mongoObjectId } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';

const { Option } = Select;





const FormGroup = ({ applyGroup, onClickCancelModal }) => {

    const { state: stateRow } = useContext(RowContext);

    const [group, setGroup] = useState([]);

    const setGroupHeader = (hd) => {
        setGroup([...group, hd]);
    };
    const removeTag = (column, id) => {
        idArr.splice(idArr.indexOf(id), 1);
        setIdArr([...idArr]);

        group.splice(group.indexOf(column), 1);
        setGroup([...group]);
    };

    const onClickApply = () => {
        if (group.length === 0) return;
        let output = groupByHeaders(stateRow.rowsAll.filter(r => r._rowLevel === 1), group);
        applyGroup(output);
    };

    const [idArr, setIdArr] = useState([]);
    const onClickAddField = () => {
        if (idArr.length <= group.length) {
            setIdArr([
                ...idArr, 
                mongoObjectId()
            ]);
        };
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
                {idArr.map(key => (
                    <SelectComp
                        key={key}
                        id={key}
                        setGroupHeader={setGroupHeader}
                        group={group}
                        removeTag={removeTag}
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


const SelectComp = ({ setGroupHeader, group, removeTag, id }) => {

    const { state: stateProject } = useContext(ProjectContext);
    const [cl, setCl] = useState(null);

    return (
        <div style={{ display: 'flex', paddingBottom: 10, width: '70%' }}>

            <SelectStyled
                defaultValue='Select Field...'
                style={{ width: '100%', marginRight: 10 }}
                onChange={(column) => {
                    setGroupHeader(column);
                    setCl(column);
                }}
            >
                {stateProject.userData.headersShown.filter(hd => group.indexOf(hd) === -1).map(hd => (
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
                        onClick={() => removeTag(cl, id)}
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

