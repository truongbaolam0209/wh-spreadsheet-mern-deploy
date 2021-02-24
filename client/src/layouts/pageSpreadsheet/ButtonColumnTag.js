
import React, { useEffect, useState } from 'react';
import { colorType } from '../../constants';


const ButtonColumnTag = ({ tag, setMode, actionType }) => {

   const styleShown = { background: '#f1a99f', color: 'black' };
   const styleFrozen = { background: colorType.primary, color: 'white' };
   const styleHidden = { background: colorType.grey4, color: 'grey' };

   const [btnStyle, setBtnStyle] = useState(
      tag.mode === 'hidden' ? styleHidden :
         tag.mode === 'frozen' ? styleFrozen :
            styleShown
   );

   const [type, setType] = useState(tag.mode);

   useEffect(() => {
      if (actionType === 'view-templates-action') {
         setType(tag.mode);
         setBtnStyle(
            tag.mode === 'hidden' ? styleHidden :
               tag.mode === 'frozen' ? styleFrozen :
                  styleShown
         );
      };
   }, [tag.mode]);

   
   const onClick = () => {
      if (actionType === 'reorder-columns-action') {
         if (type === 'shown') {
            setBtnStyle(styleFrozen);
            setMode({ header: tag.header, id: tag.id, mode: 'frozen' });
            setType('frozen');
         } else if (type === 'frozen') {
            setBtnStyle(styleHidden);
            setMode({ header: tag.header, id: tag.id, mode: 'hidden' });
            setType('hidden');
         } else if (type === 'hidden') {
            setBtnStyle(styleShown);
            setMode({ header: tag.header, id: tag.id, mode: 'shown' });
            setType('shown');
         };
      } else if (actionType === 'rearrange-drawing-type-tree-action') {
         if (type === 'shown') {
            setBtnStyle(styleHidden);
            setMode({ header: tag.header, id: tag.id, mode: 'hidden' });
            setType('hidden');
         } else if (type === 'hidden') {
            setBtnStyle(styleShown);
            setMode({ header: tag.header, id: tag.id, mode: 'shown' });
            setType('shown');
         };
      } else if (actionType === 'view-templates-action') {
         setMode({ id: tag.id });
      };
   };

   return (
      <div
         style={{
            ...btnStyle,
            padding: 9,
            cursor: actionType === 'view-templates-action' && 'pointer',
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

export default ButtonColumnTag;