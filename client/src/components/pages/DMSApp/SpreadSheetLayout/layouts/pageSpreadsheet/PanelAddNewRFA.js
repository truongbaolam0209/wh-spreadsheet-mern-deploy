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
import { getInfoValueFromRfaData } from './CellRFA';
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


const PanelAddNewRFA = ({ onClickCancelModal, onClickApplyAddNewRFA, formRfaType }) => {


   const { state: stateRow } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany: { role, company }, companies, listUser, listGroup, email } = stateProject.allDataOneSheet;
   const { rowsAll, currentRfaToAddNewOrReplyOrEdit, currentRfaRefToEditBeforeSendEmail, rowsRfaAll, rowsRfaAllInit, drawingTypeTreeDmsView } = stateRow;

   const listRecipient = [...listUser, ...listGroup];

   const listConsultant = companies.filter(x => x.companyType === 'Consultant');


   const [tablePickDrawingRFA, setTablePickDrawingRFA] = useState(false);
   const [dwgsToAddNewRFA, setDwgsToAddNewRFA] = useState(null);
   const [dwgIdToAddComment, setIdToDwgAddComment] = useState(null);
   const [nosColumnFixed, setNosColumnFixed] = useState(1);
   const [commentText, setCommentText] = useState('');

   const [filesPDF, setFilesPDF] = useState(null);
   const [filesDWFX, setFilesDWFX] = useState(null);

   const [listRecipientTo, setListRecipientTo] = useState([]);
   const [listRecipientCc, setListRecipientCc] = useState([]);

   const [listConsultantMustReply, setListConsultantMustReply] = useState([]);
   const [requestedBy, setRequestedBy] = useState('');

   const [textEmailTitle, setTextEmailTitle] = useState('');

   const [textEmailAdditionalNotes, setTextEmailAdditionalNotes] = useState('');


   const [isFirstSubmission, setIsFirstSubmission] = useState(false);

   const [arrayRFA, setArrayRFA] = useState(null);

   const [valueInputRFACreateNew, setValueInputRFACreateNew] = useState('');

   const [dwgIdsToRollBackSubmit, setDwgIdsToRollBackSubmit] = useState([]);



   useEffect(() => {

      if (currentRfaToAddNewOrReplyOrEdit) {

         const { currentRfaNumber, currentRfaRef, currentRfaData } = currentRfaToAddNewOrReplyOrEdit;

         if (formRfaType === 'form-submit-RFA') {

            const dwgsToResubmit = rowsRfaAll.filter(dwg => {
               return dwg.rfaNumber === currentRfaNumber &&
                  !dwg['RFA Ref'];
            });
            setArrayRFA([currentRfaRef]);
            setDwgsToAddNewRFA(dwgsToResubmit);
            setListRecipientTo(currentRfaData[`submission-$$$-emailTo-${company}`]);
            setListRecipientCc(currentRfaData[`submission-$$$-emailCc-${company}`]);
            setListConsultantMustReply(currentRfaData[`submission-$$$-consultantMustReply-${company}`]);
            setRequestedBy(currentRfaData[`submission-$$$-requestedBy-${company}`]);


         } else if (formRfaType === 'form-submit-edit-RFA') {

            // const tempRfaSaved = JSON.parse(localStorage.getItem(`editLastTime-form-submit-RFA-${email}-${currentRfaRefToEditBeforeSendEmail}`));

            // if (tempRfaSaved) {
            //    const { data } = tempRfaSaved;
            //    const {
            //       dwgsToAddNewRFA, rfaToSave, rfaToSaveVersionOrToReply,
            //       recipient, emailTextTitle, emailTextContent, listConsultantMustReply, requestedBy
            //    } = data;

            //    const rfaRefData = rfaToSaveVersionOrToReply === '-' ? rfaToSave : (rfaToSave + rfaToSaveVersionOrToReply);

            //    setArrayRFA([rfaRefData]);
            //    setDwgsToAddNewRFA(dwgsToAddNewRFA);
            //    setListRecipientTo(recipient.to);
            //    setListRecipientCc(recipient.cc);
            //    setListConsultantMustReply(listConsultantMustReply);
            //    setRequestedBy(requestedBy);
            //    setTextEmailTitle(emailTextTitle);
            //    setTextEmailAdditionalNotes(emailTextContent);

            //    if (currentRfaToAddNewOrReplyOrEdit === rfaRefData) {
            //       setValueInputRFACreateNew(currentRfaToAddNewOrReplyOrEdit);
            //    } else {
            //       setValueInputRFACreateNew(rfaRefData.slice(currentRfaToAddNewOrReplyOrEdit.length, rfaRefData.length));
            //    };
            // };

         } else if (formRfaType === 'form-reply-RFA') {

            const dwgsNotReplyYet = rowsRfaAll.filter(dwg => {
               return dwg.rfaNumber === currentRfaNumber &&
                  dwg['RFA Ref'] === currentRfaRef &&
                  !currentRfaData[`reply-$$$-status-${company}`];
            });
            setArrayRFA([currentRfaRef]);
            setDwgsToAddNewRFA(dwgsNotReplyYet);

            let arrEmailCc = [];
            for (const key in currentRfaData) {
               if (key.includes('submission-$$$-user-')) {
                  setListRecipientTo([currentRfaData[key]]);
               } else if (key.includes('submission-$$$-emailTo-') || key.includes('submission-$$$-emailCc-')) {
                  arrEmailCc = [...arrEmailCc, ...currentRfaData[key]];
               };
            };
            setListRecipientCc(arrEmailCc);

            const keyConsultantMustReply = getInfoValueFromRfaData(currentRfaData, 'submission', 'consultantMustReply');
            setListConsultantMustReply(keyConsultantMustReply);
         };

      } else { // Create New RFA ..................................................................
         setArrayRFA(null);
         setDwgsToAddNewRFA(null);
         setIsFirstSubmission(true);
      };
   }, []);



   useEffect(() => {
      // if (dwgsToAddNewRFA) {
      //    const dwgs = dwgsToAddNewRFA.map(r => {
      //       const row = { ...r };
      //       if (role === 'Consultant') {
      //          row[`reply-$$$-drawing-${company}`] = '';
      //       } else {
      //          row[`submission-$$$-drawing-${company}`] = '';
      //       };
      //       return row;
      //    });
      //    setDwgsToAddNewRFA(dwgs);
      // };
   }, [filesPDF]);



   const onClickApplyModalPickDrawing = (dwgIds) => {
      if (dwgIds && dwgIds.length > 0) {
         const dwgsToAdd = rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1);
         setDwgsToAddNewRFA(dwgsToAdd);

         const dwgFound = dwgsToAdd.find(x => x['Coordinator In Charge']);
         if (dwgFound) {
            setRequestedBy(dwgFound['Coordinator In Charge']);
         };
      };
      setTablePickDrawingRFA(false);
   };
   const setRevisionDwg = (id, rev) => {
      const row = dwgsToAddNewRFA.find(x => x.id === id);
      row['Rev'] = rev;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA]);
   };
   const removeDrawingToAddRFA = debounceFnc((id) => {
      if (formRfaType === 'form-submit-edit-RFA') {
         setDwgIdsToRollBackSubmit([...dwgIdsToRollBackSubmit, id]);
      };
      setDwgsToAddNewRFA(dwgsToAddNewRFA.filter(x => x.id !== id));
      setNosColumnFixed(2);
      setNosColumnFixed(1);
   }, 1);
   const onClickCommentBtn = (id) => {
      setIdToDwgAddComment(id);
   };



   const onBlurInputRFANameCreateNew = () => {
      if (currentRfaToAddNewOrReplyOrEdit && currentRfaToAddNewOrReplyOrEdit.currentRfaNumber) {
         const arr = arrayRFA.map(rev => rev.toLowerCase());
         if (arr.indexOf(currentRfaToAddNewOrReplyOrEdit.currentRfaNumber.toLowerCase() + valueInputRFACreateNew.toLowerCase()) !== -1) {
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
   const onChangeUploadFilePDF = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { ...output, [file.name]: file };
         });
         setFilesPDF(output);
      };
   };
   const onChangeUploadFileDWFX = (info) => {
      if (info.fileList) {
         const filesAll = info.fileList;
         setFilesDWFX(filesAll[filesAll.length - 1]);
      };
   };
   const onChangeConsultantPickRFAToReply = (rfaNumberValue) => {
      // const rows = rowsRfaAll.filter(r => r.rfaNumber === currentRfaToAddNewOrReplyOrEdit && r['RFA Ref'] === rfaNumberValue);
      // setDwgsToAddNewRFA(rows);
   };



   const onClickApplyDoneFormRFA = () => {

      let isAllDataInRowFilledIn = true;
      if (role !== 'Consultant') {
         dwgsToAddNewRFA && dwgsToAddNewRFA.forEach(r => {
            if (!r['Rev'] || !r[`submission-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
      } else {
         dwgsToAddNewRFA && dwgsToAddNewRFA.forEach(r => {
            if (!r['Status'] || !r[`reply-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
      };


      filesPDF && Object.keys(filesPDF).forEach(key => {
         let fileFound;
         if (role === 'Consultant') {
            fileFound = dwgsToAddNewRFA && dwgsToAddNewRFA.find(x => x[`reply-$$$-drawing-${company}`] === key);
         } else {
            fileFound = dwgsToAddNewRFA && dwgsToAddNewRFA.find(x => x[`submission-$$$-drawing-${company}`] === key);
         };
         if (!fileFound) {
            delete filesPDF[key];
         };
      });



      let trade, rfaToSaveVersionOrToReply, rfaToSave;
      const rowFirstOfRfaId = dwgsToAddNewRFA[0];

      if (role !== 'Consultant' && !currentRfaToAddNewOrReplyOrEdit) { // first time submission
         const parentRowInDms = drawingTypeTreeDmsView.find(node => node.id === rowFirstOfRfaId._parentRow);
         trade = getTradeNameFnc(parentRowInDms, drawingTypeTreeDmsView);
         rfaToSaveVersionOrToReply = '-';
         rfaToSave = valueInputRFACreateNew;

      } else if (role !== 'Consultant' && currentRfaToAddNewOrReplyOrEdit) {

         const { currentRfaNumber, currentRfaData } = currentRfaToAddNewOrReplyOrEdit;

         for (const key in currentRfaData) {
            if (key.includes('submission-$$$-trade-')) {
               trade = currentRfaData[key];
            };
         };
         rfaToSaveVersionOrToReply = valueInputRFACreateNew;
         rfaToSave = currentRfaNumber;

      } else if (role === 'Consultant') {

         const { currentRfaNumber, currentRfaRef, currentRfaData } = currentRfaToAddNewOrReplyOrEdit;

         for (const key in currentRfaData) {
            if (key.includes('submission-$$$-trade-')) {
               trade = currentRfaData[key];
            };
         };
         if (currentRfaNumber === currentRfaRef) {
            rfaToSaveVersionOrToReply = '-';
         } else {
            rfaToSaveVersionOrToReply = currentRfaRef.slice(currentRfaNumber.length, currentRfaRef.length);
         };
         rfaToSave = currentRfaNumber;
      };

      console.log(
         {
            filesPDF,
            formRfaType,
            rfaToSave,
            rfaToSaveVersionOrToReply,
            listRecipientTo, dwgsToAddNewRFA,
            listConsultantMustReply,
            role,
            textEmailTitle, dwgsToAddNewRFA, isAllDataInRowFilledIn
         }
      );


      if (
         (!filesPDF && formRfaType === 'form-submit-RFA') ||
         // !rfaToSave ||
         // !rfaToSaveVersionOrToReply ||
         !listRecipientTo || !dwgsToAddNewRFA ||
         listRecipientTo.length === 0 ||
         (role !== 'Consultant' && listConsultantMustReply.length === 0) ||
         (role !== 'Consultant' && !requestedBy) ||
         !textEmailTitle ||
         dwgsToAddNewRFA.length === 0 ||
         !isAllDataInRowFilledIn
      ) {
         message.info('Please fill in necessary data for drawings to submit!');
         return;
      };


      // str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');


      console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
         {
            type: formRfaType,
            trade,
            filesPDF: filesPDF && Object.values(filesPDF),
            filesDWFX,
            dwgsToAddNewRFA,
            dwgIdsToRollBackSubmit,
            rfaToSave,
            rfaToSaveVersionOrToReply,
            recipient: {
               to: [...new Set(listRecipientTo)],
               cc: [...new Set(listRecipientCc)],
            },
            listConsultantMustReply,
            requestedBy,
            emailTextTitle: textEmailTitle,
            emailTextAdditionalNotes: textEmailAdditionalNotes,
         });


      onClickApplyAddNewRFA({
         type: formRfaType,
         trade,
         filesPDF: filesPDF && Object.values(filesPDF),
         filesDWFX,
         dwgsToAddNewRFA,
         dwgIdsToRollBackSubmit,
         rfaToSave,
         rfaToSaveVersionOrToReply,
         recipient: {
            to: listRecipientTo,
            cc: listRecipientCc
         },
         listConsultantMustReply,
         requestedBy,
         emailTextTitle: textEmailTitle,
         emailTextAdditionalNotes: textEmailAdditionalNotes,
      });
   };
   const generateColumnsListDwgRFA = (headers, nosColumnFixed) => {

      const buttonRemoveDrawing = formRfaType.includes('form-submit-') ? [
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
         }
      ] : [];

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
            cellRenderer: (column === 'Rev' && (formRfaType === 'form-submit-RFA' || formRfaType === 'form-submit-edit-RFA')) ? (
               <CellInputRevision
                  setRevisionDwg={setRevisionDwg}
                  rowsThisRFAWithRev={rowsRfaAllInit.filter(dwg => {
                     if (currentRfaToAddNewOrReplyOrEdit) {
                        return dwg.rfaNumber === currentRfaToAddNewOrReplyOrEdit.currentRfaNumber && dwg['Rev'];
                     };
                  })}
                  isFirstSubmission={isFirstSubmission}
               />
            ) : (column === 'Comment' && formRfaType === 'form-reply-RFA') ? (
               <CellAddCommentDrawing
                  onClickCommentBtn={onClickCommentBtn}
                  company={company}
               />

            ) : (column === 'Status' && formRfaType === 'form-reply-RFA') ? (
               <CellSelectStatus
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  company={company}
               />

            ) : (column === 'File') ? (
               <CellSelectDrawingFile
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  filesPDF={filesPDF}
                  company={company}
                  role={role}
               />
            ) : null
         })),
         ...buttonRemoveDrawing,
      ];
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

               {(formRfaType === 'form-submit-RFA' || formRfaType === 'form-submit-edit-RFA') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: 10, transform: 'translateY(5px)', fontWeight: 'bold' }}>RFA Number : </div>

                        {currentRfaToAddNewOrReplyOrEdit ? (
                           <>
                              <div style={{ marginRight: 10, transform: 'translateY(5px)' }}>{currentRfaToAddNewOrReplyOrEdit.currentRfaNumber}</div>
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
                        <div>{moment().add(14, 'days').format('DD/MM/YY')}</div>
                     </div>
                  </div>
               )}


               {(formRfaType === 'form-reply-RFA' && arrayRFA) && (
                  <div style={{ display: 'flex', marginBottom: 20 }}>
                     <div style={{ marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>RFA Number : </div>
                     {arrayRFA.length === 1 ? (
                        <div style={{ transform: 'translateY(5px)' }}>{arrayRFA[0]}</div>
                     ) : (
                        // <SelectRFAStyled
                        //    showSearch
                        //    placeholder='Select RFA...'
                        //    onChange={onChangeConsultantPickRFAToReply}
                        //    defaultValue={arrayRFA[0]}
                        // >
                        //    {arrayRFA.map(rfaData => (
                        //       <Select.Option key={rfaData} value={rfaData}>{rfaData}</Select.Option>
                        //    ))}
                        // </SelectRFAStyled>
                        <></>
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


               {formRfaType.includes('form-submit-') && (
                  <>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>Consultants</div>
                        <SelectRecipientStyled
                           mode='tags'
                           placeholder='Please select...'
                           value={listConsultantMustReply}
                           onChange={(list) => setListConsultantMustReply(list)}
                        >
                           {listConsultant.map(cm => (
                              <Select.Option key={cm.company}>{cm.company}</Select.Option>
                           ))}
                        </SelectRecipientStyled>
                     </div>


                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>Requested by</div>
                        <Input
                           style={{ width: 300, marginBottom: 10, borderRadius: 0 }}
                           onChange={(e) => setRequestedBy(e.target.value)}
                           value={requestedBy}
                           disabled={dwgsToAddNewRFA ? false : true}
                        />
                     </div>
                  </>
               )}



               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 65, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Subject</div>
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

               {formRfaType.includes('form-submit-') ? (
                  <>
                     <div>Dear Mr/Mrs <span style={{ fontWeight: 'bold' }}>{listConsultantMustReply[0] || ''}</span>,</div>
                     <div>
                        <span style={{ fontWeight: 'bold' }}>{company}</span> has submitted <span style={{ fontWeight: 'bold' }}>{valueInputRFACreateNew}</span> for you to review, the drawings included in this RFA are in the list below.
                        Please review and reply to us by <span style={{ fontWeight: 'bold' }}>{moment().add(14, 'days').format('MMM Do YYYY')}.</span>
                     </div>
                  </>
               ) : (
                  <>
                     <div>Dear Mr/Mrs <span style={{ fontWeight: 'bold' }}>Woh Hup Private Ltd</span>,</div>
                     <div>
                        <span style={{ fontWeight: 'bold' }}>{company}</span> has replied this RFA, the drawings included in this RFA are in the list below.
                        Please review and update as per comments.
                     </div>
                  </>
               )}

               <br />

               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 70, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold', marginBottom: 10 }}>Additional notes : </div>
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
                     onChange={(e) => setTextEmailAdditionalNotes(e.target.value)}
                     value={textEmailAdditionalNotes}
                  />
               </div>


               <div style={{ display: 'flex', marginBottom: 20 }}>
                  {!currentRfaToAddNewOrReplyOrEdit && (
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
                     onChange={onChangeUploadFilePDF}
                  >
                     <ButtonStyle
                        marginRight={5}
                        name='Choose PDF File'
                        disabled={!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0}
                     />
                  </Upload>


                  {formRfaType.includes('form-submit-') && (
                     <Upload
                        name='file' accept='.dwfx' multiple={false}
                        headers={{ authorization: 'authorization-text' }}
                        showUploadList={false}
                        beforeUpload={() => {
                           return false;
                        }}
                        onChange={onChangeUploadFileDWFX}
                     >
                        <ButtonStyle
                           marginRight={5}
                           name='Choose DWFX File'
                           disabled={!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0}
                        />
                     </Upload>
                  )}


                  <div style={{ marginLeft: 5, transform: `${formRfaType.includes('form-submit-') ? 'translateY(-6px)' : 'translateY(5px)'}` }}>
                     <div>
                        {filesPDF ? `${Object.keys(filesPDF).length} PDF files has been chosen.` : 'No PDF files has been chosen'}
                     </div>
                     {formRfaType.includes('form-submit-') && (
                        <div>
                           {filesDWFX ? `${filesDWFX.name} has been chosen.` : 'No DWFX file has been chosen'}
                        </div>
                     )}
                  </div>
               </div>


               {dwgsToAddNewRFA && (
                  <div style={{ width: window.innerWidth * 0.7 - 50, height: dwgsToAddNewRFA.length * 28 + 80 }}>
                     <TableStyled
                        fixed
                        columns={generateColumnsListDwgRFA(headersDwgRFA(formRfaType), nosColumnFixed)}
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





const CellSelectDrawingFile = ({ filesPDF, rowData, dwgsToAddNewRFA, setDwgsToAddNewRFA, company, role }) => {

   const drawingName = rowData[`${role === 'Consultant' ? 'reply' : 'submission'}-$$$-drawing-${company}`];

   const [value, setValue] = useState(drawingName || '');

   useEffect(() => {
      if (!drawingName) {
         setValue('');
      };
   }, [drawingName]);


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
         onChange={(fileName) => {
            onChangeFileAttached(fileName, rowData.id);
            setValue(fileName);
         }}
         value={value}
      >
         {((filesPDF && Object.keys(filesPDF)) || []).map((fileName, i) => (
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
   const { onClickCommentBtn, rowData, company } = props;
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
const CellInputRevision = ({ setRevisionDwg, rowData, rowsThisRFAWithRev, isFirstSubmission }) => {

   // ROW or ID =======================>>>>
   const allRevsExisting = [...new Set(rowsThisRFAWithRev.filter(dwg => dwg.row === rowData.id).map(x => x['Rev'].toLowerCase()))];

   const [value, setValue] = useState(isFirstSubmission ? '0' : rowData['Rev'] ? rowData['Rev'] : '');


   useEffect(() => {
      if (isFirstSubmission) {
         setRevisionDwg(rowData.id, '0');
      };
   }, [])

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
            disabled={isFirstSubmission}
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
   else if (header === 'Coordinator In Charge') return 200;
   else return 200;
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



const headersDwgRFA = (formRfaType) => {
   return formRfaType === 'form-reply-RFA' ? [
      'Drawing Number',
      'Drawing Name',
      'Rev',
      'Status',
      'File',
      'Comment',
   ] : [
      'Drawing Number',
      'Drawing Name',
      'Coordinator In Charge',
      'Rev',
      'File'
   ];
};



