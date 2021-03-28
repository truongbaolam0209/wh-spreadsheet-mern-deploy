import { Icon, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';
import TableDrawingRFA from './TableDrawingRFA';



const listCompany1 = ['Woh Hup', 'TYLIN', 'AECOM'];
const listCompany2 = ['Jianho', 'Shimizu', 'Ong&Ong'];


const { TextArea } = Input;

const Table = (props) => {
   return (
      <AutoResizer>
         {({ width, height }) => {
            return (
               <BaseTable
                  {...props}
                  width={width}
                  height={height}
               />
            );
         }}
      </AutoResizer>
   );
};

const PanelAddNewRFA = ({ onClickCancelModal, onClickApplyAddNewRFA }) => {



   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany: { role, company, trade } } = stateProject.allDataOneSheet;
   const { rowsAll, currentRFAToAddNew, rowsRFAAll } = stateRow;

   const [rfaName, setRfaName] = useState('');
   const [rfaNameRev, setRfaNameRev] = useState('');

   const [tablePickDrawingRFA, setTablePickDrawingRFA] = useState(false);
   const [dwgsToAddNewRFA, setDwgsToAddNewRFA] = useState(null);
   const [dwgIdToAddComment, setIdToDwgAddComment] = useState(null);
   const [nosColumnFixed, setNosColumnFixed] = useState(1);
   const [commentText, setCommentText] = useState('');

   const [files, setFiles] = useState(null);


   let formType = role === 'Consultant' ? 'form-reply' : 'form-submit';
   let arrayRFA;
   let rfa;
   if (currentRFAToAddNew) {
      rfa = rowsRFAAll.find(rfa => rfa.id === currentRFAToAddNew);
      arrayRFA = [...new Set(rfa.children.map(x => x['RFA Ref']))];
   };


   useEffect(() => {
      if (currentRFAToAddNew) {
         setDwgsToAddNewRFA(rfa.children);
      };
   }, []);




   const onClickApplyModalPickDrawing = (dwgIds) => {
      if (dwgIds && dwgIds.length > 0) {
         setDwgsToAddNewRFA(rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1));
      };
      setTablePickDrawingRFA(false);
   };
   const setRevisionDwg = (id, rev) => {
      // const row = dwgsToAddNewRFA.find(x => x.id === id);
      // row['Rev'] = rev;
      // setDwgsToAddNewRFA([...dwgsToAddNewRFA]);
   };
   const removeDrawingToAddRFA = debounceFnc((id) => {
      setDwgsToAddNewRFA(dwgsToAddNewRFA.filter(x => x.id !== id));
      setNosColumnFixed(2);
      setNosColumnFixed(1);
   }, 1);


   const onClickCommentBtn = (id) => {
      setIdToDwgAddComment(id);
   };


   const [valueInputRFACreateNew, setValueInputRFACreateNew] = useState('');
   const onBlurInputRFANameCreateNew = () => {
      if (currentRFAToAddNew) {
         const arr = arrayRFA.map(rev => rev.toLowerCase());
         if (arr.indexOf(rfa.id.toLowerCase() + valueInputRFACreateNew.toLowerCase()) !== -1) {
            message.info('This RFA Number Has Already Existed, Please Choose A New Number!');
            setValueInputRFACreateNew('');
         };
      } else {
         if (rowsRFAAll.find(rfa => rfa.id.toLowerCase() === valueInputRFACreateNew.toLowerCase())) {
            message.info('This RFA Number Has Already Existed, Please Choose A New Number!');
            setValueInputRFACreateNew(valueInputRFACreateNew.slice(0, valueInputRFACreateNew.length - 1));
         };
      };
   };




   const applyAddCommentToDrawing = () => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgIdToAddComment);
      row[`Info-Comment-${company}`] = commentText;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
      setIdToDwgAddComment(null);
      setCommentText('');
   };
   const onChangeUploadFile = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { ...output, [file.name]: file };
         });
         setFiles(output);
      };
   };



   const onChangeConsultantPickRFAToReply = (rfaNumberValue) => {
      const rows = rfa.children.filter(r => r.rfaNumber === rfaNumberValue);
      setDwgsToAddNewRFA(rows);
   };


   const generateColumnsListDwgRFA = (headers, nosColumnFixed) => {
      return [
         {
            key: 'index',
            dataKey: 'index',
            title: '',
            width: 40,
            frozen: Column.FrozenDirection.LEFT,
            cellRenderer: ({ rowIndex }) => <div>{rowIndex + 1}</div>
         },
         ...headers.map((column, index) => ({
            key: column,
            dataKey: column,
            title: column,
            resizable: true,
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            width: getHeaderWidthDwgRFA(column),
            cellRenderer: (column === 'Rev' && formType === 'form-submit') ? (
               <CellInputRevision
                  setRevisionDwg={setRevisionDwg}
               />

            ) : (column === 'Comment' && formType === 'form-reply') ? (
               <CellAddCommentDrawing
                  onClickCommentBtn={onClickCommentBtn}
                  company={company}
               />

            ) : (column === 'Status' && formType === 'form-reply') ? (
               <CellSelectStatus
                  onChangeStatusReply={(status, dwgId) => {
                     const row = dwgsToAddNewRFA.find(x => x.id === dwgId);
                     row[`Info-Status-${company}`] = status;
                     row[`Info-DateReply-${company}`] = new Date();
                     setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
                  }}
               />

            ) : (column === 'File') ? (
               <CellSelectDrawingFile
                  files={files}
                  onChangeFileAttached={(fileName, dwgId) => {
                     const row = dwgsToAddNewRFA.find(x => x.id === dwgId);
                     if (role === 'Consultant') {
                        row[`Info-Drawing-${company}`] = fileName;
                        setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
                     } else {
                        row['Drawing'] = fileName;
                        setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
                     };
                  }}
               />
            ) : null
         })),
         {
            key: 'action',
            dataKey: 'action',
            title: '',
            width: 40,
            frozen: Column.FrozenDirection.RIGHT,
            cellRenderer: (
               <CellRemoveDrawing
                  removeDrawingToAddRFA={removeDrawingToAddRFA}
               />
            )
         },
      ];
   };


   const onClickApplyDoneFormRFA = () => {
      onClickApplyAddNewRFA({
         type: role === 'Consultant' ? 'reply' : 'submission',
         trade,
         files: Object.values(files),
         dwgsToAddNewRFA,
         rfaToSave: valueInputRFACreateNew
      });
   };


   return (
      <>
         <div style={{
            background: 'white',
            width: '100%',
            padding: 10,
         }}>
            <div style={{
               padding: 20,
               paddingRight: 10,
               borderBottom: `1px solid ${colorType.grey4}`,
            }}>

               {formType === 'form-submit' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: 10, transform: 'translateY(5px)', fontWeight: 'bold' }}>RFA Number : </div>
                        {currentRFAToAddNew ? (
                           <>
                              <div style={{ marginRight: 10, transform: 'translateY(5px)' }}>{currentRFAToAddNew}</div>
                              <Input
                                 style={{ width: 50, marginBottom: 10, borderRadius: 0 }}
                                 onChange={(e) => setValueInputRFACreateNew(e.target.value)}
                                 onBlur={onBlurInputRFANameCreateNew}
                                 value={valueInputRFACreateNew}
                              />
                           </>
                        ) : (
                           <Input
                              placeholder='RFA Number...'
                              style={{ width: 250, marginBottom: 10, borderRadius: 0 }}
                              onChange={(e) => setValueInputRFACreateNew(e.target.value)}
                              onBlur={onBlurInputRFANameCreateNew}
                              value={valueInputRFACreateNew}
                           />
                        )}

                     </div>
                     <div style={{ display: 'flex', transform: 'translateY(5px)' }}>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date Reply : </div>
                        <div>02/08/2021</div>
                     </div>
                  </div>
               )}

               {(formType === 'form-reply' && arrayRFA) && (
                  <div style={{ display: 'flex', marginBottom: 10 }}>
                     <div style={{ marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>RFA Number : </div>
                     <SelectRFAStyled
                        showSearch
                        placeholder='Select RFA...'
                        onChange={onChangeConsultantPickRFAToReply}
                     >
                        {arrayRFA.map(rfa => (
                           <Select.Option key={rfa} value={rfa}>{rfa}</Select.Option>
                        ))}
                     </SelectRFAStyled>
                  </div>
               )}


               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>To</div>
                  <SelectRecipientStyled
                     mode='multiple'
                     placeholder='Please select...'
                     defaultValue={[]}
                     onChange={() => { }}
                  >
                     {listCompany1.map(cm => (
                        <Select.Option key={cm}>{cm}</Select.Option>
                     ))}
                  </SelectRecipientStyled>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>CC</div>
                  <SelectRecipientStyled
                     mode='multiple'
                     placeholder='Please select...'
                     defaultValue={[]}
                     onChange={() => { }}
                  >
                     {listCompany2.map(cm => (
                        <Select.Option key={cm}>{cm}</Select.Option>
                     ))}
                  </SelectRecipientStyled>
               </div>


               <div style={{ display: 'flex', marginBottom: 20 }}>

                  {!currentRFAToAddNew && (
                     <ButtonStyle
                        marginRight={10}
                        name='Add Drawing To RFA'
                        onClick={() => setTablePickDrawingRFA(true)}
                     />
                  )}


                  <Upload
                     name='file' accept='application/pdf' multiple={true}
                     headers={{ authorization: 'authorization-text' }}
                     showUploadList={false}
                     beforeUpload={() => {
                        return false;
                     }}
                     onChange={onChangeUploadFile}
                     disabled={!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0}
                  >
                     <ButtonStyle
                        marginRight={5}
                        name='Choose Drawing File'
                        disabled={!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0}
                     />
                  </Upload>
                  <div style={{ marginLeft: 5, transform: 'translateY(5px)' }}>
                     {files ? `${Object.keys(files).length} PDF files has been chosen.` : ''}
                  </div>
               </div>




               {dwgsToAddNewRFA && (
                  <div style={{ width: window.innerWidth * 0.7 - 50, height: window.innerHeight * 0.3 }}>
                     <TableStyled
                        fixed
                        columns={generateColumnsListDwgRFA(headersDwgRFA(formType), nosColumnFixed)}
                        data={dwgsToAddNewRFA}
                        rowHeight={28}
                     />
                  </div>
               )}

            </div>


            <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
               <ButtonGroupComp
                  onClickCancel={onClickCancelModal}
                  onClickApply={onClickApplyDoneFormRFA}
               />
            </div>
         </div>


         {tablePickDrawingRFA && (
            <ModalPickDrawingRFAStyled
               title={'Select Drawings For New RFA'}
               visible={tablePickDrawingRFA}
               footer={null}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.8}
               onOk={() => setTablePickDrawingRFA(false)}
               onCancel={() => setTablePickDrawingRFA(false)}
            >
               <TableDrawingRFA
                  onClickCancelModalPickDrawing={() => setTablePickDrawingRFA(false)}
                  onClickApplyModalPickDrawing={onClickApplyModalPickDrawing}
               />
            </ModalPickDrawingRFAStyled>
         )}


         {dwgIdToAddComment && (
            <ModalPickDrawingRFAStyled
               title={'Add Drawing Comment'}
               visible={dwgIdToAddComment ? true : false}
               footer={null}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.5}
               onCancel={() => setIdToDwgAddComment(null)}
            >
               <div style={{ width: '100%', padding: 10 }}>
                  <TextArea
                     rows={4}
                     onChange={(e) => setCommentText(e.target.value)}
                     defaultValue={dwgsToAddNewRFA.find(x => x.id === dwgIdToAddComment)[`Info-Comment-${company}`] || ''}
                  />
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
                     <ButtonGroupComp
                        onClickCancel={() => setIdToDwgAddComment(null)}
                        onClickApply={applyAddCommentToDrawing}
                     />
                  </div>
               </div>
            </ModalPickDrawingRFAStyled>
         )}

      </>
   );
};

export default PanelAddNewRFA;




const CellSelectDrawingFile = ({ files, onChangeFileAttached, rowData }) => {

   return (
      <SelectStyled
         placeholder='Select File...'
         onChange={(fileName) => onChangeFileAttached(fileName, rowData.id)}
      >
         {((files && Object.keys(files)) || []).map((fileName, i) => (
            <Select.Option key={fileName} value={fileName}>{fileName}</Select.Option>
         ))}
      </SelectStyled>
   );
};

const CellSelectStatus = ({ onChangeStatusReply, rowData }) => {
   const consultantStatus = [
      'Reject and resubmit',
      'Approved with comments, to Resubmit',
      'Approved with Comment, no submission Required',
      'Approved for Construction'
   ];
   return (
      <SelectStyled
         placeholder='Select Status...'
         onChange={(status) => onChangeStatusReply(status, rowData.id)}
      >
         {consultantStatus.map(stt => (
            <Select.Option key={stt} value={stt}>{stt}</Select.Option>
         ))}
      </SelectStyled>
   );
};

const CellAddCommentDrawing = (props) => {
   const { onClickCommentBtn, cellData, rowData, company } = props;
   const addComment = () => {
      onClickCommentBtn(rowData.id);
   };

   const commentText = rowData[`Info-Comment-${company}`] || '';

   return (
      <div style={{
         display: 'flex',
         width: '100%',
         textOverflow: 'ellipsis',
         overflow: 'hidden',
         whiteSpace: 'nowrap',
      }}>
         <Tooltip title='Add Comment For This Drawing'>
            <Icon
               type='form'
               onClick={addComment}
               style={{ marginRight: 5 }}
            />
         </Tooltip>
         <div style={{ marginLeft: 3 }}>{commentText}</div>
      </div>
   );
};

const CellInputRevision = ({ setRevisionDwg, rowData, cellData }) => {
   return (
      <Tooltip title='Edit Revision Name'>
         <input
            style={{
               outline: 'none',
               border: 'none',
               borderRadius: 0,
               background: 'transparent',
               width: '80%'
            }}
            placeholder={cellData || ''}
            onChange={(e) => setRevisionDwg(rowData.id, e.target.value)}
         />
      </Tooltip>
   );
};


const CellRemoveDrawing = (props) => {

   const { removeDrawingToAddRFA, rowData } = props;

   const onClickRemoveDwgBtn = () => {
      removeDrawingToAddRFA(rowData.id);
   };

   return (
      <Tooltip title='Remove Drawing'>
         <Icon type='close' onClick={onClickRemoveDwgBtn} />
      </Tooltip>
   );
};




const getHeaderWidthDwgRFA = (header) => {
   if (header === 'File') return 350;
   else if (header === 'Rev') return 70;
   else if (header === 'Status') return 350;
   else if (header === 'Drawing Number') return 250;
   else if (header === 'Drawing Name') return 420;
   else if (header === 'Comment') return 200;
};



const ModalPickDrawingRFAStyled = styled(Modal)`
   .ant-modal-content {
      border-radius: 0;
   };
   .ant-modal-close {
      display: none;
   };
   .ant-modal-header {
      padding: 10px;
   };
   .ant-modal-title {
      padding-left: 10px;
      font-size: 20px;
      font-weight: bold;
   };
   .ant-modal-body {
      padding: 0;
      display: flex;
      justify-content: center;
   };
`;

const TableStyled = styled(Table)`
   .row-selected-rfa {
      background-color: ${colorType.cellHighlighted};
   };
   .BaseTable__row-cell-text {
      color: black
   };
   .BaseTable__table .BaseTable__body {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
   };
   .BaseTable__header-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      background: ${colorType.grey1};
      color: black
   };
   .BaseTable__row-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
   };
`;

const SelectStyled = styled(Select)`
   width: 100%;
   outline: none;
   .ant-select-selection {
      outline: none;
      border-radius: 0;
      border: none;
      width: 100%;
      background: transparent;
   }
   .ant-select-selection__rendered {
      outline: none;
   }
`;

const SelectRecipientStyled = styled(Select)`
   width: 95%;
   outline: none;
   .ant-select-selection {
      outline: none;
      border-radius: 0;
      width: 100%;
      background: transparent;
   };
   .ant-select-selection__rendered {
      outline: none;
   };
`;


const SelectRFAStyled = styled(Select)`
   width: 250px;
   outline: none;
   .ant-select-selection {
      outline: none;
      border-radius: 0;
      width: 100%;
      background: transparent;
   };
   .ant-select-selection__rendered {
      outline: none;
   };
`;



const headersDwgRFA = (formType) => {
   return formType === 'form-reply' ? [
      'Drawing Number',
      'Drawing Name',
      'Rev',
      'Status',
      'File',
      'Comment',
   ] : [
      'Drawing Number',
      'Drawing Name',
      'Rev',
      'Status',
      'File'
   ];
};



