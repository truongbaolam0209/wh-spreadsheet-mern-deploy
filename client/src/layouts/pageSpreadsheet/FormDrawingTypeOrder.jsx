import { Icon } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { DraggableArea } from 'react-draggable-tags';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';






const FormDrawingTypeOrder = ({ onClickCancelModal, applyFolderOrganize }) => {

   const { state: stateProject } = useContext(ProjectContext);
   const { state: stateRow } = useContext(RowContext);

   const folders = stateRow.rowsAll
      .filter(r => r._rowLevel === 0);


   const getTags = () => {
      let arr = [];
      folders.forEach((row) => {
         arr.push({
            id: row.id,
            header: row['Drawing Number'],
         });
      });
      return arr;
   };

   const [tags, setTags] = useState(getTags());

   const addNewFolder = ({ index }) => {
      let newTags = [...tags];
      newTags.splice(index + 1, 0, {
         id: mongoObjectId(),
         header: 'New Drawing Type',
      });
      setTags(newTags);
   };


   const updateFolderName = (tag, index, value) => {
      tags[index].header = value;
      setTags(tags);
   };


   const onClickApply = () => {
      applyFolderOrganize(tags);
   };


   return (
      <Container>

         <PanelStyled>

            <ButtonFolder>
               <Icon type='folder' style={{ transform: 'translate(0, 3px)', marginRight: 5, color: 'grey' }} />
               <div>{stateProject.allDataOneSheet.projectName.toUpperCase()}</div>
            </ButtonFolder>

            <DraggableArea
               isList
               tags={tags}
               render={(props) => {
                  const { tag, index } = props;
                  return (
                     <ButtonFolder style={{
                        float: 'right'
                     }}>
                        <Icon type='folder' style={{ fontSize: 15, transform: 'translate(0, 2px)', marginRight: 5, color: 'grey' }} />

                        <InputComp tag={tag} index={index} updateFolderName={updateFolderName} />

                        <div style={{ float: 'right' }}>
                           <Icon type='plus-circle' style={{ fontSize: 15, marginRight: 5, color: 'grey' }} onClick={() => addNewFolder(props)} />
                           <Icon type='delete' style={{ fontSize: 15, marginRight: 5, color: 'grey' }} />
                        </div>
                     </ButtonFolder>
                  );
               }}
               style={{
                  padding: 0,
                  width: '100%',
               }}
               onChange={(tags) => setTags(tags)}
            />

         </PanelStyled>

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={onClickApply}
            />
         </div>
      </Container>
   );
};

export default FormDrawingTypeOrder;


const InputComp = ({ tag, updateFolderName, index }) => {

   const [value, setValue] = useState(tag.header);
   const [isDoubleClick, setIsDoubleClick] = useState(false);

   const inputReff = useRef();


   useEffect(() => {
      if (isDoubleClick) {
         inputReff.current.focus();
      };

   }, [isDoubleClick]);

   return (
      <div
         onDoubleClick={() => setIsDoubleClick(true)}
         onBlur={() => {
            setIsDoubleClick(false);
            updateFolderName(tag, index, value);
         }}
         style={{
            width: '75%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
         }}
      >
         {isDoubleClick ? (
            <input 
               ref={inputReff}
               value={value} 
               onChange={(e) => setValue(e.target.value)} 
               style={{ 
                  width: '100%',
                  border: 'none'
                }}
            />
         ) : (
               <div>{tag.header}</div>
            )
         }

      </div>

   );

};

const addZero = (num) => {
   if (num < 10) return '0' + num;
   return num;
};

const Container = styled.div`
   height: ${`${window.innerHeight * 0.8}` + 'px'};
   width: 100%;
   
   display: flex;
   flex-direction: column;
`;


const ButtonFolder = styled.div`
   background: white;
   padding: 4px;
   margin: 4px;
   color: black;
   font-size: 13px;
   border: 1px solid ${colorType.grey1};
   width: 70%;
   display: flex;
   cursor: pointer;
   
   -webkit-box-shadow: 0px 6px 19px 5px rgba(0,0,0,0.04); 
   box-shadow: 0px 6px 19px 5px rgba(0,0,0,0.04);

`;


const PanelStyled = styled.div`

    width: 100%;
    float: right;
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