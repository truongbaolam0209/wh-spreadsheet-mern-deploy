import { Icon, Input, Modal } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { mongoObjectId } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';





const FormDrawingTypeOrder = ({ onClickCancelModal, applyFolderOrganize }) => {

   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const [input, setInput] = useState(addProjectLevel(stateRow.drawingTypeTree, stateProject.allDataOneSheet.projectName));
   const [data, setData] = useState(arrangeDrawingType(input));



   useEffect(() => {
      setData(arrangeDrawingType(input));
   }, [input]);

   const onClickApply = () => {
      input.splice(0, 1); // remove projectName Row
      applyFolderOrganize(input);
   };


   const addFolderBelow = (node) => {
      let nodeIndex;
      input.forEach((nd, i) => {
         if (nd.id === node.id) nodeIndex = i;
      });

      let newNodeIndex;
      for (let i = 0; i < input.length; i++) {
         if (input[i]._rowLevel - 1 === node._rowLevel && i > nodeIndex) {
            if (!newNodeIndex) newNodeIndex = i;
         };
      };
      for (let i = 0; i < Math.abs(node._rowLevel); i++) {
         input.splice(newNodeIndex + i, 0, {
            id: mongoObjectId(),
            'Drawing Number': 'NEW DRAWING TYPE...',
            _rowLevel: node._rowLevel + i + 1,
            expanded: true,
         });
      };
      setInput([...input]);
   };

   const [modalShown, setModalShown] = useState(false);
   const [modalTitle, setModalTitle] = useState(null);
   const [value, setValue] = useState(null);
   const [item, setItem] = useState(null);

   const deleteFolder = (node) => {
      setItem(node);
      setModalTitle('Delete Drawing Type');
      setModalShown(true);
   };
   const editFolderName = (node) => {
      setValue(node.title);
      setItem(node);
      setModalTitle('Edit Drawing Type Name');
      setModalShown(true);
   };
   const onClickApplyModal = () => {

      if (modalTitle === 'Delete Drawing Type') {

         let removeArr = [...item.children || [], item];
         const removeIdsArr = removeArr.map(e => e.id);
         let arr = input.filter(e => removeIdsArr.indexOf(e.id) === -1);
         setInput([...arr]);

         setModalShown(false);
         setModalTitle(null);
         setValue(null);
         setItem(null);
      } else {
         input.find(e => e.id === item.id)['Drawing Number'] = value;
         setInput([...input]);

         setModalShown(false);
         setModalTitle(null);
         setValue(null);
         setItem(null);
      };
   };

   const fileAdd = () => {
      let projectLevel = input[0]._rowLevel;
      input[0]._rowLevel = projectLevel - 1;
      input.splice(1, 0, {
         id: mongoObjectId(),
         'Drawing Number': 'NEW DRAWING TYPE...',
         _rowLevel: projectLevel,
         expanded: true,
      });
      setInput([...input]);
   };


   const findChildData = (node) => {
      let rowsChild = stateRow.rowsAll.filter(r => r._parentRow === node.id);
      return {
         parentName: node.title,
         rowsChild: rowsChild
      }
   };

   return (
      <Container>
         <PanelStyled>
            <SortableTreeStyled
               treeData={data}
               onChange={treeData => {
                  // setData(treeData);
               }}
               canDrop={(props) => {
                  const { nextParent, node } = props;
                  return nextParent && nextParent._rowLevel === node._rowLevel - 1;
               }}
               onMoveNode={({ prevTreeIndex, nextTreeIndex }) => {
                  let item = input[prevTreeIndex];
                  input.splice(prevTreeIndex, 1);
                  input.splice(nextTreeIndex, 0, item);
                  setInput([...input]);
               }}
               isVirtualized={false}
               generateNodeProps={(props) => {
                  const { node, parentNode } = props;
                  return ({
                     buttons: parentNode === null ? [
                        // <IconBtn type='file-add' onClick={() => fileAdd()} />,
                        <IconBtn type='plus' onClick={() => addFolderBelow(node)} />,
                     ] : [
                           <IconBtn type='edit' onClick={() => editFolderName(node)} />,
                           <IconBtn type='delete' onClick={() => deleteFolder(node)} />
                        ],
                  })
               }}
            />
         </PanelStyled>

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={onClickApply}
            />
         </div>

         {modalShown && (
            <ModalStyledSetting
               title={modalTitle}
               visible={modalShown}
               footer={null}
               onCancel={() => {
                  setModalShown(false);
                  setValue(null);
                  setModalTitle(null);
               }}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.6}
            >
               <div style={{ padding: 20, width: '100%', maxHeight: window.innerHeight * 0.7 }}>
                  {modalTitle === 'Delete Drawing Type' ? (
                     <div style={{  }}>
                        <div>{`Are you sure to delete the drawing type ${findChildData(item).parentName} ?`}</div>
                        <div>All the following <span style={{ fontWeight: 'bold' }}>{findChildData(item).rowsChild.length}</span> drawings will be deleted:</div>
                        <br />
                        <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
                           {findChildData(item).rowsChild.map((dr, i) => (
                              <div key={i}>({i + 1}) - {dr['Drawing Number']} - {dr['Drawing Name']}</div>
                           ))}
                        </div>
                     </div>
                  ) : (
                        <Input
                           placeholder='Enter new name...'
                           style={{ width: '100%' }}
                           value={value}
                           onChange={(e) => setValue(e.target.value)}
                        />
                     )}

                  <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                     <ButtonGroupComp
                        onClickCancel={() => {
                           setModalShown(false);
                           setValue(null);
                           setModalTitle(null);
                        }}
                        onClickApply={onClickApplyModal}
                     />
                  </div>
               </div>
            </ModalStyledSetting>
         )}
      </Container>
   );
};

export default FormDrawingTypeOrder;



const SortableTreeStyled = styled(SortableTree)`

   .rst__node {
      height: 50px !important;
   }

   .rst__rowWrapper {
      /* padding: 10px; */
   }

   .rst__row {
      /* height: 35px; */
   }
   .rst__rowWrapper {
      /* height: 50px; */
   }
   .rst__nodeContent {
      /* height: 50px; */
   }

   .rst__rowContents {
      min-width: fit-content;
   }

`;

const IconBtn = ({ type, onClick }) => {
   return (
      <IconStyle type={type} onClick={onClick} />
   );
};

const IconStyle = styled(Icon)`
   font-size: 14px;
   margin: 2px;
   padding: 4px;
   &:hover {
      background-color: ${colorType.grey0};
   };
`;
const ModalStyledSetting = styled(Modal)`
    .ant-modal-content {
        border-radius: 0;
    }
   .ant-modal-close {
      display: none;
   }
   .ant-modal-header {
      padding: 10px;
   }
   .ant-modal-title {
        padding-left: 10px;
        font-size: 20px;
        font-weight: bold;
   }
   .ant-modal-body {
      padding: 0;
      display: flex;
      justify-content: center;
   }
`;

const addProjectLevel = (drawingTypeTree, projectName) => {

   let data = drawingTypeTree.map(e => ({ ...e }));
   let levelArray = [...new Set(data.map(r => r._rowLevel))].sort((a, b) => b - a);

   let projectLevel = levelArray[levelArray.length - 1] - 1;

   data.unshift({
      'Drawing Number': projectName,
      id: mongoObjectId(),
      _rowLevel: projectLevel,
      expanded: true
   });
   return data;
};

const arrangeDrawingType = (args) => {

   let data = args.map(e => ({ ...e }));
   let levelArray = [...new Set(data.map(r => r._rowLevel))].sort((a, b) => b - a);

   levelArray.forEach(lvl => {
      data.forEach((row, index) => {
         if (row._rowLevel === lvl) {
            row.title = row['Drawing Number'];
            delete row['Drawing Number'];

            let arr = data.filter((r, i) => r._rowLevel === lvl - 1 && i < index);
            let parentRow = arr[arr.length - 1];
            if (parentRow) parentRow.children = [...parentRow.children || [], row];
         };
      });
   });
   return data.filter(r => r._rowLevel === levelArray[levelArray.length - 1]);
};



const Container = styled.div`
   height: ${`${window.innerHeight * 0.8}` + 'px'};
   width: 100%;
   display: flex;
   flex-direction: column;
`;

const PanelStyled = styled.div`
   width: 100%;
   float: right;
   overflow-x: hidden;
   border-bottom: 1px solid ${colorType.grey4};
`;