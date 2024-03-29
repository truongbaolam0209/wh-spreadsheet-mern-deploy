import React, { useContext, useState } from 'react';
import { DraggableArea } from 'react-draggable-tags';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import ButtonColumnTag from './ButtonColumnTag';
import ButtonGroupComp from './ButtonGroupComp';



const ReorderColumnForm = ({ applyReorderColumns, onClickCancelModal }) => {


   const { state: stateProject } = useContext(ProjectContext);

   let { headersHidden, headersShown, nosColumnFixed } = stateProject.userData;

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
         };
      });
      tags.forEach(tg => {
         if (tg.mode === 'shown') {
            arr.push(tg.header);
         };
      });


      applyReorderColumns({
         nosColumnFixed: countfrozen,
         headersShown: arr,
         headersHidden: arrHidden,
      });
   };


   const setMode = (obj) => {
      tags.forEach(tg => {
         if (tg.header === obj.header) {
            tg.mode = obj.mode;
         };
      });
   };

   const getTags = () => {
      let arr = [];
      headersHidden.forEach((header, index) => {
         arr.push({
            id: index,
            header,
            mode: 'hidden'
         });
      });
      headersShown.forEach((header, index) => {
         arr.push({
            id: index + headersHidden.length,
            header,
            mode: index < nosColumnFixed ? 'frozen' : 'shown'
         });
      });
      return arr;
   };

   const [tags, setTags] = useState(getTags());


   return (
      <div style={{
         width: '100%',
         height: '100%'
      }}>
         <PanelStyled>
            <div style={{ fontSize: 11, paddingLeft: 20 }}>Click to freeze, unfreeze or hide headers tag, drag to change the order.</div>
            <div style={{ width: '100%', paddingTop: 20 }}>
               <DraggableArea
                  isList
                  tags={tags}
                  render={(props) => {
                     const { tag } = props;
                     return (
                        <ButtonColumnTag tag={tag} setMode={setMode} actionType='reorder-columns-action' />
                     );
                  }}
                  onChange={(tags) => setTags(tags)}
               />
            </div>

         </PanelStyled>
         <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between' }}>
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
`;





