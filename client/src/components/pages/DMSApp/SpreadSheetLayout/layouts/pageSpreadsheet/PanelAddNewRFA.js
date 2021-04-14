import { Icon, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import ButtonStyle from '../generalComponents/ButtonStyle';
import { getTradeNameFnc } from './FormDrawingTypeOrder';
import TableDrawingRFA from './TableDrawingRFA';

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

   const { roleTradeCompany: { role, company }, companies, listUser, listGroup } = stateProject.allDataOneSheet;
   const { rowsAll, currentRfaToAddNewOrReply, rowsRfaAll, drawingTypeTree, drawingTypeTreeDmsView } = stateRow;

   const listRecipient = [...listUser, ...listGroup];

   const listConsultant = companies.filter(x => x.companyType === 'Consultant');
   let consultantLead = listConsultant.find(x => x.isLeadConsultant);
   if (!consultantLead) {
      consultantLead = listConsultant[0];
   };


   const [tablePickDrawingRFA, setTablePickDrawingRFA] = useState(false);
   const [dwgsToAddNewRFA, setDwgsToAddNewRFA] = useState(null);
   const [dwgIdToAddComment, setIdToDwgAddComment] = useState(null);
   const [nosColumnFixed, setNosColumnFixed] = useState(1);
   const [commentText, setCommentText] = useState('');

   const [files, setFiles] = useState(null);

   const [listRecipientTo, setListRecipientTo] = useState([]);
   const [listRecipientCc, setListRecipientCc] = useState([]);



   const [textEmailTitle, setTextEmailTitle] = useState('');
   const [textEmailContent, setTextEmailContent] = useState('');


   let formType = role === 'Consultant' ? 'form-reply' : 'form-submit';

   const [arrayRFA, setArrayRFA] = useState(null);



   useEffect(() => {
      if (currentRfaToAddNewOrReply) {

         if (formType === 'form-submit') {

            const dwgsAlreadySubmit = rowsRfaAll.filter(dwg => {
               return dwg.rfaNumber === currentRfaToAddNewOrReply && dwg['RFA Ref'];
            });

            const dwgsToResubmit = rowsRfaAll.filter(dwg => {
               return dwg.rfaNumber === currentRfaToAddNewOrReply &&
                  !dwg['RFA Ref'] &&
                  !dwg[`submission-$$$-drawing-${company}`];
            });
            const dwg = dwgsToResubmit[0];


            setArrayRFA([...new Set(dwgsAlreadySubmit.map(dwg => dwg['RFA Ref']))]);
            setDwgsToAddNewRFA(dwgsToResubmit);

            for (const key in dwg) {
               if (key.includes(`submission-$$$-emailTo-`)) {
                  setListRecipientTo(dwg[key]);
               } else if (key.includes(`submission-$$$-emailCc-`)) {
                  setListRecipientCc(dwg[key]);
               };
            };

         } else if (formType === 'form-reply') {

            const dwgsNotReplyYet = rowsRfaAll.filter(dwg => {
               return dwg.rfaNumber === currentRfaToAddNewOrReply &&
                  dwg['RFA Ref'] &&
                  !dwg[`reply-$$$-status-${company}`];
            });

            const arrRFADataNotReplyYet = [...new Set(dwgsNotReplyYet.map(x => x['RFA Ref']))];
            setArrayRFA(arrRFADataNotReplyYet);

            const latestRFAToReply = arrRFADataNotReplyYet[0];

            setDwgsToAddNewRFA(dwgsNotReplyYet.filter(x => x['RFA Ref'] === latestRFAToReply));

            const dwg = dwgsNotReplyYet.filter(x => x['RFA Ref'] === latestRFAToReply)[0];

            let arrEmailCc = [];
            for (const key in dwg) {
               if (key.includes(`submission-$$$-user-`)) {
                  setListRecipientTo([dwg[key]]);
               } else if (key.includes(`submission-$$$-emailTo-`) || key.includes(`submission-$$$-emailCc-`)) {
                  arrEmailCc = [...arrEmailCc, ...dwg[key]];
               };
            };
            setListRecipientCc(arrEmailCc);
         };
      } else {
         setArrayRFA(null);
         setDwgsToAddNewRFA(null);
      };
   }, []);


   const onClickApplyModalPickDrawing = (dwgIds) => {
      if (dwgIds && dwgIds.length > 0) {
         setDwgsToAddNewRFA(rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1));
      };
      setTablePickDrawingRFA(false);
   };
   const setRevisionDwg = (id, rev) => {
      const row = dwgsToAddNewRFA.find(x => x.id === id);
      row['Rev'] = rev;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA]);
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
      if (currentRfaToAddNewOrReply) {
         const arr = arrayRFA.map(rev => rev.toLowerCase());
         if (arr.indexOf(currentRfaToAddNewOrReply.toLowerCase() + valueInputRFACreateNew.toLowerCase()) !== -1) {
            message.info('This RFA number has already existed, please choose a new number!');
            setValueInputRFACreateNew('');
         };
      } else {
         const arr = [...new Set(rowsRfaAll.map(x => (x['RFA Ref'] || '').toLowerCase()))];
         if (arr.indexOf(valueInputRFACreateNew.toLowerCase()) !== -1) {
            message.info('This RFA number has already existed, please choose a new number!');
            setValueInputRFACreateNew('');
            // setValueInputRFACreateNew(valueInputRFACreateNew.slice(0, valueInputRFACreateNew.length - 1));
         };
      };
   };




   const applyAddCommentToDrawing = () => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgIdToAddComment);
      row[`reply-$$$-comment-${company}`] = commentText;
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
      const rows = rowsRfaAll.filter(r => r.rfaNumber === currentRfaToAddNewOrReply && r['RFA Ref'] === rfaNumberValue);
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
                  rowsThisRFAWithRev={rowsRfaAll.filter(dwg => {
                     return dwg.rfaNumber === currentRfaToAddNewOrReply && dwg['Rev'];
                  })}
               />
            ) : (column === 'Comment' && formType === 'form-reply') ? (
               <CellAddCommentDrawing
                  onClickCommentBtn={onClickCommentBtn}
                  company={company}
               />

            ) : (column === 'Status' && formType === 'form-reply') ? (
               <CellSelectStatus
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  company={company}
               />

            ) : (column === 'File') ? (
               <CellSelectDrawingFile
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  files={files}
                  company={company}
                  role={role}
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

      

      let isAllDataInRowFilledIn = true;
      if (role !== 'Consultant') {
         dwgsToAddNewRFA && dwgsToAddNewRFA.forEach(r => {
            if (!r['Rev'] || !r[`submission-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
      };


      files && Object.keys(files).forEach(key => {
         let fileFound;
         if (role === 'Consultant') {
            fileFound = dwgsToAddNewRFA && dwgsToAddNewRFA.find(x => x[`reply-$$$-drawing-${company}`] === key);
         } else {
            fileFound = dwgsToAddNewRFA && dwgsToAddNewRFA.find(x => x[`submission-$$$-drawing-${company}`] === key);
         };
         if (!fileFound) {
            delete files[key];
         };
      });

      let trade, rfaToSaveVersionOrToReply;

      const rowFirstOfRfaId = dwgsToAddNewRFA[0];
      if (role === 'Consultant') {
         Object.keys(rowFirstOfRfaId).forEach(key => {
            if (key.includes('submission-$$$-trade-')) {
               trade = rowFirstOfRfaId[key];
            };
         });

         const rfaNumber = rowFirstOfRfaId['rfaNumber'];
         const rfaRef = rowFirstOfRfaId['RFA Ref'];

         if (rfaNumber === rfaRef) {
            rfaToSaveVersionOrToReply = '-';
         } else {
            rfaToSaveVersionOrToReply = rfaRef.slice(rfaNumber.length, rfaRef.length);
         };

      } else {
         const parentRowInDms = drawingTypeTreeDmsView.find(node => node.id === rowFirstOfRfaId._parentRow);
         trade = getTradeNameFnc(parentRowInDms, drawingTypeTreeDmsView);
         rfaToSaveVersionOrToReply = currentRfaToAddNewOrReply ? valueInputRFACreateNew : '-';
      };

      const rfaToSave = currentRfaToAddNewOrReply ? currentRfaToAddNewOrReply : valueInputRFACreateNew;
      
      if (
         !files || !rfaToSave ||
         !rfaToSaveVersionOrToReply ||
         !listRecipientTo || !dwgsToAddNewRFA ||
         listRecipientTo.length === 0 ||
         !textEmailTitle ||
         !textEmailContent ||
         Object.keys(files).length !== dwgsToAddNewRFA.length ||
         dwgsToAddNewRFA.length === 0 ||
         !isAllDataInRowFilledIn
      ) {
         message.info('Please fill in necessary data for drawings to submit!');
         return;
      };



      onClickApplyAddNewRFA({
         type: role === 'Consultant' ? 'reply' : 'submission',
         trade,
         files: Object.values(files),
         dwgsToAddNewRFA,
         rfaToSave,
         rfaToSaveVersionOrToReply,
         recipient: {
            to: listRecipientTo,
            cc: listRecipientCc
         },
         emailTitle: textEmailTitle,
         emailTextContent: textEmailContent,
      });
   };




   const dateToReply = moment().add(14, 'days').format('DD/MM/YY');


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

                        {currentRfaToAddNewOrReply ? (
                           <>
                              <div style={{ marginRight: 10, transform: 'translateY(5px)' }}>{currentRfaToAddNewOrReply}</div>
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
                        <div>{dateToReply}</div>
                     </div>
                  </div>
               )}


               {(formType === 'form-reply' && arrayRFA) && (
                  <div style={{ display: 'flex', marginBottom: 20 }}>
                     <div style={{ marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>RFA Number : </div>
                     {arrayRFA.length === 1 ? (
                        <div style={{ transform: 'translateY(5px)' }}>{arrayRFA[0]}</div>
                     ) : (
                        <SelectRFAStyled
                           showSearch
                           placeholder='Select RFA...'
                           onChange={onChangeConsultantPickRFAToReply}
                           defaultValue={arrayRFA[0]}
                        >
                           {arrayRFA.map(rfaData => (
                              <Select.Option key={rfaData} value={rfaData}>{rfaData}</Select.Option>
                           ))}
                        </SelectRFAStyled>
                     )}
                  </div>
               )}


               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>To</div>
                  <SelectRecipientStyled
                     mode='tags'
                     placeholder='Please select...'
                     value={listRecipientTo}
                     onChange={(list) => setListRecipientTo(list)}
                  >
                     {listRecipient.map(cm => (
                        <Select.Option key={cm}>{cm}</Select.Option>
                     ))}
                  </SelectRecipientStyled>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>CC</div>
                  <SelectRecipientStyled
                     mode='tags'
                     placeholder='Please select...'
                     value={listRecipientCc}
                     onChange={(list) => setListRecipientCc(list)}
                  >
                     {listRecipient.map(cm => (
                        <Select.Option key={cm}>{cm}</Select.Option>
                     ))}
                  </SelectRecipientStyled>
               </div>

               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 65, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Title : </div>
                  <Input
                     style={{
                        width: '90%',
                        marginBottom: 10,
                        borderRadius: 0,
                        borderTop: 'none',
                        borderRight: 'none',
                        borderLeft: 'none',
                     }}
                     onChange={(e) => setTextEmailTitle(e.target.value)}
                     onBlur={() => { }}
                     value={textEmailTitle}
                  />
               </div>

               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 65, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Content : </div>
                  <TextArea
                     style={{
                        width: '90%',
                        marginBottom: 10,
                        borderRadius: 0,
                        borderTop: 'none',
                        borderRight: 'none',
                        borderLeft: 'none',
                     }}
                     rows={4}
                     onChange={(e) => setTextEmailContent(e.target.value)}
                     value={textEmailContent}
                  />
               </div>


               <div style={{ display: 'flex', marginBottom: 20 }}>
                  {!currentRfaToAddNewOrReply && (
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
                  isPanelAddNewRfa={true}
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
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
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
                     defaultValue={dwgsToAddNewRFA.find(x => x.id === dwgIdToAddComment)[`reply-$$$-comment-${company}`] || ''}
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



const CellSelectDrawingFile = ({ files, rowData, dwgsToAddNewRFA, setDwgsToAddNewRFA, company, role }) => {

   const onChangeFileAttached = (fileName, dwgId) => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgId);
      if (role === 'Consultant') {
         row[`reply-$$$-drawing-${company}`] = fileName;
         setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
      } else {
         row[`submission-$$$-drawing-${company}`] = fileName;
         setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
      };
   };

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

const CellSelectStatus = ({ rowData, dwgsToAddNewRFA, setDwgsToAddNewRFA, company }) => {
   const consultantStatus = [
      'Reject and resubmit',
      'Approved with comments, to Resubmit',
      'Approved with Comment, no submission Required',
      'Approved for Construction'
   ];

   const onChangeStatusReply = (status, dwgId) => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgId);

      row[`reply-$$$-status-${company}`] = status;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
   };

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

   const commentText = rowData[`reply-$$$-comment-${company}`] || '';

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

const CellInputRevision = ({ setRevisionDwg, rowData, rowsThisRFAWithRev }) => {

   // ROW or ID =======================>>>>
   const allRevsExisting = [...new Set(rowsThisRFAWithRev.filter(dwg => dwg.row === rowData.id).map(x => x['Rev'].toLowerCase()))];

   const [value, setValue] = useState('');

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
            onChange={(e) => setValue(e.target.value)}
            value={value}
            onBlur={(e) => {
               if (allRevsExisting.indexOf(e.target.value.toLowerCase()) !== -1) {
                  message.info('This rev has already existed, please choose a new number!');
                  setValue('');
               } else {
                  setValue(e.target.value);
                  setRevisionDwg(rowData.id, e.target.value);
               };
            }}
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
   else if (header === 'Rev') return 50;
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
      'File'
   ];
};



