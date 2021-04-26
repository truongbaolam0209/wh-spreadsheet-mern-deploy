import { DatePicker, Icon, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc, validateEmailInput } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import ButtonStyle from '../generalComponents/ButtonStyle';
import { getInfoKeyFromRfaData, getInfoValueFromRfaData } from './CellRFA';
import { getTradeNameFnc } from './FormDrawingTypeOrder';
import TableDrawingRFA from './TableDrawingRFA';


const { Option } = Select;
const { TextArea } = Input;


const extractConsultantName = (name) => {
   const indexOfSplitString = name.indexOf('_%$%_');
   return name.slice(0, indexOfSplitString === -1 ? -99999 : indexOfSplitString);
};

const checkIfMatchWithInputCompanyFormat = (item, listConsultants) => {
   let result = false;
   listConsultants.forEach(cm => {
      if (cm.company.toUpperCase() === item || cm.company.toUpperCase() === extractConsultantName(item)) {
         result = true;
      };
   });
   return result;
};
const versionArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];



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


   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany: { role, company }, companies, listUser, listGroup, email, projectNameShort: projectNameShortText } = stateProject.allDataOneSheet;
   const projectNameShort = projectNameShortText || 'NO-PROJECT-NAME';

   const { rowsAll, loading, currentRfaToAddNewOrReplyOrEdit, currentRfaRefToEditBeforeSendEmail, rowsRfaAll, rowsRfaAllInit, drawingTypeTreeDmsView } = stateRow;

   const listRecipient = [...listUser, ...listGroup];

   const listConsultants = companies.filter(x => x.companyType === 'Consultant');


   const [rfaNumberSuffixFirstTimeSubmit, setRfaNumberSuffixFirstTimeSubmit] = useState('');
   const [rfaNewVersionResubmitSuffix, setRfaNewVersionResubmitSuffix] = useState('');

   const [tradeOfRfaForFirstTimeSubmit, setTradeOfRfaForFirstTimeSubmit] = useState(null);

   const [dateReplyForSubmitForm, setDateReplyForSubmitForm] = useState(formRfaType.includes('form-submit-') && moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));

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

   const [dwgIdsToRollBackSubmit, setDwgIdsToRollBackSubmit] = useState([]);

   const [modalConfirmsubmitOrCancel, setModalConfirmsubmitOrCancel] = useState(null);


   let companySendRfa;
   if (formRfaType.includes('form-reply-') && currentRfaToAddNewOrReplyOrEdit) {
      const { currentRfaData } = currentRfaToAddNewOrReplyOrEdit;
      const keyUser = getInfoKeyFromRfaData(currentRfaData, 'submission', 'user');
      companySendRfa = keyUser.slice(20, keyUser.length);
   };


   useEffect(() => {

      if (currentRfaToAddNewOrReplyOrEdit) {

         const { currentRfaNumber, currentRfaRef, currentRfaData } = currentRfaToAddNewOrReplyOrEdit;

         if (formRfaType === 'form-submit-RFA') {

            const dwgsToResubmit = rowsRfaAllInit.filter(dwg => {
               return dwg.rfaNumber === currentRfaNumber &&
                  !dwg['RFA Ref'];
            });
            setDwgsToAddNewRFA(dwgsToResubmit);
            setListRecipientTo(currentRfaData[`submission-$$$-emailTo-${company}`]);
            setListRecipientCc(currentRfaData[`submission-$$$-emailCc-${company}`]);
            setListConsultantMustReply(currentRfaData[`submission-$$$-consultantMustReply-${company}`]);
            setRequestedBy(currentRfaData[`submission-$$$-requestedBy-${company}`]);


            const versionAlreadySubmit = rowsRfaAllInit.filter(dwg => dwg.rfaNumber === currentRfaNumber && dwg['RFA Ref']).map(x => x['RFA Ref']);
            const versionTextAlreadySubmitArr = versionAlreadySubmit.map(rfaNum => {
               return rfaNum.slice(currentRfaNumber.length, rfaNum.length);
            });
            const versionLeft = versionArray.filter(x => versionTextAlreadySubmitArr.indexOf(x) === -1);
            setRfaNewVersionResubmitSuffix(versionLeft[0]);

            const oneDwg = dwgsToResubmit[0];
            setTextEmailTitle('Resubmit - ' + oneDwg[`submission-$$$-emailTitle-${company}`]);


         } else if (formRfaType === 'form-submit-edit-RFA') {

            // const tempRfaSaved = JSON.parse(localStorage.getItem(`editLastTime-form-submit-RFA-${email}-${currentRfaRefToEditBeforeSendEmail}`));

            // if (tempRfaSaved) {
            //    const { data } = tempRfaSaved;
            //    const {
            //       dwgsToAddNewRFA, rfaToSave, rfaToSaveVersionOrToReply,
            //       recipient, emailTextTitle, emailTextContent, listConsultantMustReply, requestedBy
            //    } = data;

            //    const rfaRefData = rfaToSaveVersionOrToReply === '-' ? rfaToSave : (rfaToSave + rfaToSaveVersionOrToReply);

            //    setDwgsToAddNewRFA(dwgsToAddNewRFA);
            //    setListRecipientTo(recipient.to);
            //    setListRecipientCc(recipient.cc);
            //    setListConsultantMustReply(listConsultantMustReply);
            //    setRequestedBy(requestedBy);
            //    setTextEmailTitle(emailTextTitle);
            //    setTextEmailAdditionalNotes(emailTextContent);

            //    if (currentRfaToAddNewOrReplyOrEdit === rfaRefData) {
            //       setRfaNewVersionResubmitSuffix(currentRfaToAddNewOrReplyOrEdit);
            //    } else {
            //       setRfaNewVersionResubmitSuffix(rfaRefData.slice(currentRfaToAddNewOrReplyOrEdit.length, rfaRefData.length));
            //    };
            // };

         } else if (formRfaType === 'form-reply-RFA') {

            const dwgsNotReplyYet = rowsRfaAll.filter(dwg => {
               return dwg.rfaNumber === currentRfaNumber &&
                  dwg['RFA Ref'] === currentRfaRef &&
                  !currentRfaData[`reply-$$$-status-${company}`];
            });
            setDwgsToAddNewRFA(dwgsNotReplyYet);

            let arrEmailCc = [];
            for (const key in currentRfaData) {
               if (key.includes('submission-$$$-user-')) {
                  setListRecipientTo([currentRfaData[key]]);
               } else if (key.includes('submission-$$$-emailTo-') || key.includes('submission-$$$-emailCc-')) {
                  arrEmailCc = [...new Set([...arrEmailCc, ...currentRfaData[key]])];
               };


            };
            setListRecipientCc(arrEmailCc);

            const oneDwg = dwgsNotReplyYet[0];
            const keyEmailTitle = getInfoKeyFromRfaData(oneDwg, 'submission', 'emailTitle');
            setTextEmailTitle('Reply - ' + oneDwg[keyEmailTitle]);
         };

      } else { // Create New RFA ..................................................................
         setDwgsToAddNewRFA(null);
         setIsFirstSubmission(true);

      };
   }, []);


   useEffect(() => {
      if (tradeOfRfaForFirstTimeSubmit) {
         const allRfaNumberUnderThisTrade = rowsRfaAllInit.filter(r => {
            let trade;
            if (!r.row) {
               trade = findTradeOfDrawing(r, drawingTypeTreeDmsView);
            };
            return trade && trade.includes(convertTradeCodeInverted(tradeOfRfaForFirstTimeSubmit));
         });
         let rfaNumberExtracted = [...new Set(allRfaNumberUnderThisTrade.map(x => /[^/]*$/.exec(x.rfaNumber)[0]))];
         rfaNumberExtracted = rfaNumberExtracted
            .filter(x => x.length === 3 && parseInt(x) > 0)
            .map(x => parseInt(x));


         if (rfaNumberExtracted.length > 0) {
            const lastNumber = Math.max(...rfaNumberExtracted);
            const suggestedNewRfaNumber = lastNumber + 1;
            const suggestedNewRfaNumberConverted = suggestedNewRfaNumber.toString();
            const suggestedNewRfaNumberString = suggestedNewRfaNumberConverted.length === 3 ? suggestedNewRfaNumberConverted
               : suggestedNewRfaNumberConverted.length === 2 ? '0' + suggestedNewRfaNumberConverted
                  : '00' + suggestedNewRfaNumberConverted;
            setRfaNumberSuffixFirstTimeSubmit(suggestedNewRfaNumberString);
         } else {
            setRfaNumberSuffixFirstTimeSubmit('001');
         };
      };
   }, [tradeOfRfaForFirstTimeSubmit]);



   useEffect(() => {
      if (!loading) {
         setModalConfirmsubmitOrCancel(null);
      };
   }, [loading]);



   const onClickApplyModalPickDrawing = (drawingTrade, dwgIds) => {
      if (dwgIds && dwgIds.length > 0) {
         const dwgsToAdd = rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1);
         setDwgsToAddNewRFA(dwgsToAdd);
         const dwgFound = dwgsToAdd.find(x => x['Coordinator In Charge']);
         if (dwgFound) {
            setRequestedBy(dwgFound['Coordinator In Charge']);
         };
         setTradeOfRfaForFirstTimeSubmit(convertTradeCode(drawingTrade));
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
      const arr = [...new Set(rowsRfaAllInit.map(x => (x['RFA Ref'] || '')))];

      if (currentRfaToAddNewOrReplyOrEdit && currentRfaToAddNewOrReplyOrEdit.currentRfaNumber) {
         const newRfaToRaiseResubmit = `${currentRfaToAddNewOrReplyOrEdit.currentRfaNumber}${rfaNewVersionResubmitSuffix}`;
         if (arr.indexOf(newRfaToRaiseResubmit) !== -1) {
            message.info('This RFA number has already existed, please choose a new number!');
            setRfaNewVersionResubmitSuffix('');
         };

      } else {
         const newRfaToRaiseFirstSubmit = `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${rfaNumberSuffixFirstTimeSubmit}`;
         if (arr.indexOf(newRfaToRaiseFirstSubmit) !== -1) {
            message.info('This RFA number has already existed, please choose a new number!');
            setRfaNumberSuffixFirstTimeSubmit('');
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
         const file = filesAll[0];
         if (file.size < 100 * 1000 * 1000) {
            setFilesDWFX(file);
         } else {
            message.warn('File size should be less than 100MB!');
         };
      };
   };
   const onChangeConsultantPickRFAToReply = (rfaNumberValue) => {
      // const rows = rowsRfaAll.filter(r => r.rfaNumber === currentRfaToAddNewOrReplyOrEdit && r['RFA Ref'] === rfaNumberValue);
      // setDwgsToAddNewRFA(rows);
   };


   const onClickTagRecipientTo = (email) => {
      let outputListConsultantMustReply = [...listConsultantMustReply];
      const consultantNameEmailGroup = extractConsultantName(email) || email;
      const originConsultant = listConsultants.find(x => x.company.toUpperCase() === consultantNameEmailGroup);
      outputListConsultantMustReply = outputListConsultantMustReply.filter(x => x.toUpperCase() !== consultantNameEmailGroup);
      if (originConsultant && !currentRfaToAddNewOrReplyOrEdit && formRfaType === 'form-submit-RFA') { // first time submit
         outputListConsultantMustReply.unshift(originConsultant.company);
         message.info(`Lead consultant: ${consultantNameEmailGroup}`);

      } else if (originConsultant && currentRfaToAddNewOrReplyOrEdit && formRfaType === 'form-submit-RFA') { // resubmit
         outputListConsultantMustReply.push(originConsultant.company);

      };
      setListConsultantMustReply(outputListConsultantMustReply);
   };

   const onClickApplyDoneFormRFA = () => {
      if (!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0) {
         return message.info('Please insert drawings to submit!', 3);
      };

      let isAllDataInRowFilledIn = true;
      let listFilePdf;
      if (role === 'Document Controller') {
         dwgsToAddNewRFA.forEach(r => {
            if (!r['Rev'] || !r[`submission-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
         listFilePdf = dwgsToAddNewRFA.map(r => r[`submission-$$$-drawing-${company}`]);
      } else if (role === 'Consultant') {
         dwgsToAddNewRFA.forEach(r => {
            if (!r[`reply-$$$-status-${company}`] || !r[`reply-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
         listFilePdf = dwgsToAddNewRFA.map(r => r[`reply-$$$-drawing-${company}`]);
      };

      const dwgPdfFile = [...new Set(listFilePdf)];


      let trade, rfaToSaveVersionOrToReply, rfaToSave;
      if (role === 'Document Controller' && !currentRfaToAddNewOrReplyOrEdit) { // first time submission
         trade = convertTradeCodeInverted(tradeOfRfaForFirstTimeSubmit);
         rfaToSaveVersionOrToReply = '-';
         rfaToSave = `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit}/${rfaNumberSuffixFirstTimeSubmit}`;

      } else if (role === 'Document Controller' && currentRfaToAddNewOrReplyOrEdit) { // resubmission
         const { currentRfaNumber, currentRfaData } = currentRfaToAddNewOrReplyOrEdit;
         trade = getInfoValueFromRfaData(currentRfaData, 'submission', 'trade');
         rfaToSaveVersionOrToReply = rfaNewVersionResubmitSuffix;
         rfaToSave = currentRfaNumber;

      } else if (role === 'Consultant') { // reply
         const { currentRfaNumber, currentRfaRef, currentRfaData } = currentRfaToAddNewOrReplyOrEdit;
         trade = getInfoValueFromRfaData(currentRfaData, 'submission', 'trade');
         if (currentRfaNumber === currentRfaRef) {
            rfaToSaveVersionOrToReply = '-';
         } else {
            rfaToSaveVersionOrToReply = currentRfaRef.slice(currentRfaNumber.length, currentRfaRef.length);
         };
         rfaToSave = currentRfaNumber;
      };



      if (projectNameShort === 'NO-PROJECT-NAME') {
         return message.info('Please update project abbreviation name for RFA number!', 3);
      } else if (!isAllDataInRowFilledIn) {
         return message.info('Please fill in all necessary info for all drawings!', 3);
      } else if (dwgsToAddNewRFA.length !== dwgPdfFile.length || !filesPDF) {
         return message.info('Different drawings can not attach same Pdf file!', 3);
      } else if (!textEmailTitle) {
         return message.info('Please fill in email title!', 3);
      } else if (!listRecipientTo || listRecipientTo.length === 0) {
         return message.info('Please fill in recipient!', 3);
      } else if (role === 'Document Controller' && !dateReplyForSubmitForm) {
         return message.info('Please fill in expected reply date!', 3);
      } else if (role === 'Document Controller' && listConsultantMustReply.length === 0) {
         return message.info('Please fill in consultant lead', 3);
      } else if (role === 'Document Controller' && !requestedBy) {
         return message.info('Please fill in person requested', 3);
      } else if (!trade || !rfaToSave || !rfaToSaveVersionOrToReply) {
         return message.info('Please fill in necessary info!', 3);
      };

      const filesOutput = {};
      filesPDF && Object.keys(filesPDF).forEach(key => {
         let fileFound;
         if (role === 'Consultant') {
            fileFound = dwgsToAddNewRFA.find(x => x[`reply-$$$-drawing-${company}`] === key);
         } else if (role === 'Document Controller') {
            fileFound = dwgsToAddNewRFA.find(x => x[`submission-$$$-drawing-${company}`] === key);
         };
         if (fileFound) {
            filesOutput[key] = filesPDF[key];
         };
         // if (!fileFound) {
         //    delete filesPDF[key];
         // };
      });
      console.log('LOG-DATA-FORM================================>>>>>',
         {
            type: formRfaType,
            trade,
            filesPDF: filesOutput && Object.values(filesOutput),
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
            dateReplyForsubmitForm: dateReplyForSubmitForm && dateReplyForSubmitForm.format('DD/MM/YY')
         });


      getSheetRows({ ...stateRow, loading: true });

      onClickApplyAddNewRFA({
         type: formRfaType, trade,
         filesPDF: filesOutput && Object.values(filesOutput),
         filesDWFX,
         dwgsToAddNewRFA: dwgsToAddNewRFA.map(x => ({ ...x })),
         dwgIdsToRollBackSubmit,
         rfaToSave, rfaToSaveVersionOrToReply,
         recipient: {
            to: [...new Set(listRecipientTo)],
            cc: [...new Set(listRecipientCc)]
         },
         listConsultantMustReply: [...listConsultantMustReply],
         requestedBy,
         emailTextTitle: textEmailTitle,
         emailTextAdditionalNotes: textEmailAdditionalNotes,
         dateReplyForsubmitForm: dateReplyForSubmitForm && dateReplyForSubmitForm.format('DD/MM/YY')
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
            // height: '90vh',
            // maxHeight: '90vh',
            padding: 10,
            color: 'black',
         }}>
            <div style={{
               padding: 20,
               paddingRight: 10,
               borderBottom: `1px solid ${colorType.grey4}`,
            }}>

               {formRfaType.includes('form-submit-') ? (
                  <div style={{ display: 'flex' }}>
                     <div style={{ marginRight: 10,  fontWeight: 'bold' }}>RFA Number</div>

                     {currentRfaToAddNewOrReplyOrEdit ? (
                        <>
                           <div style={{ marginRight: 2  }}>{currentRfaToAddNewOrReplyOrEdit.currentRfaNumber}</div>
                           <InputStyled
                              style={{ width: 50, marginBottom: 10, borderRadius: 0, marginRight: 120, transform: 'translateY(-5px)' }}
                              onChange={(e) => setRfaNewVersionResubmitSuffix(e.target.value)}
                              onBlur={onBlurInputRFANameCreateNew}
                              value={rfaNewVersionResubmitSuffix}
                           />
                        </>
                     ) : (
                        <>
                           <div style={{ marginRight: 2  }}>{`RFA/${projectNameShort}/`}
                              <Tooltip title='Trade info automatically filled in after selecting drawings'>
                                 {tradeOfRfaForFirstTimeSubmit || '____'}
                              </Tooltip>
                              {`/`}
                           </div>
                           {tradeOfRfaForFirstTimeSubmit ? (
                              <InputStyled
                                 style={{ width: 50, marginBottom: 10, borderRadius: 0, marginRight: 120, transform: 'translateY(-5px)' }}
                                 onChange={(e) => setRfaNumberSuffixFirstTimeSubmit(e.target.value)}
                                 onBlur={onBlurInputRFANameCreateNew}
                                 value={rfaNumberSuffixFirstTimeSubmit}
                              />
                           ) : (
                              <div style={{ marginRight: 120 }}>
                                 <Tooltip title='Rfa number automatically filled in after selecting drawings'>{'____'}</Tooltip>
                              </div>
                           )}

                        </>
                     )}
                     
                     <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date Reply</div>
                     <DatePickerStyled
                        style={{ width: 110, transform: 'translateY(-5px)' }}
                        value={dateReplyForSubmitForm}
                        format={'DD/MM/YY'}
                        onChange={(e) => setDateReplyForSubmitForm(e)}
                     />

                  </div>
               ) : (
                  <div style={{ display: 'flex', marginBottom: 20 }}>
                     <div style={{ marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>RFA Number</div>
                     <div style={{ transform: 'translateY(5px)' }}>{currentRfaToAddNewOrReplyOrEdit && currentRfaToAddNewOrReplyOrEdit.currentRfaRef || ''}</div>
                  </div>
               )}


               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>To</div>
                  <div style={{ width: '95%' }}>
                     <SelectRecipientStyled
                        mode='tags'
                        placeholder='Please select...'
                        value={listRecipientTo}

                        onChange={(list) => {

                           if (list.find(tag => !listGroup.find(x => x === tag) && !validateEmailInput(tag))) {
                              message.warning('Please choose an available group email or key in an email address!');
                              return;
                           };


                           if (!currentRfaToAddNewOrReplyOrEdit && formRfaType === 'form-submit-RFA') { // first time submit, not edit

                              let isLeadConsultantIncluded = false;
                              list.forEach(tagCompany => {
                                 if (checkIfMatchWithInputCompanyFormat(tagCompany, listConsultants)) {
                                    isLeadConsultantIncluded = true;
                                 };
                              });
                              if (!isLeadConsultantIncluded) {
                                 message.warning('Email loop must include lead consultant!');
                              };

                              const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                              if (
                                 itemJustRemoved &&
                                 listConsultantMustReply.find(x => x.toUpperCase() === itemJustRemoved || x.toUpperCase() === extractConsultantName(itemJustRemoved))
                              ) {
                                 if (!list.find(tg => {
                                    return (extractConsultantName(tg) && extractConsultantName(itemJustRemoved) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved)) ||
                                       (extractConsultantName(tg) && extractConsultantName(tg) === itemJustRemoved) ||
                                       (tg === extractConsultantName(itemJustRemoved) && extractConsultantName(itemJustRemoved))
                                 })) {
                                    if (extractConsultantName(itemJustRemoved)) {
                                       setListConsultantMustReply(listConsultantMustReply.filter(x => x.toUpperCase() !== extractConsultantName(itemJustRemoved)));
                                    } else {
                                       setListConsultantMustReply(listConsultantMustReply.filter(x => x.toUpperCase() !== itemJustRemoved));
                                    };
                                 };
                              };
                           } else if (currentRfaToAddNewOrReplyOrEdit && formRfaType === 'form-submit-RFA') { // resubmit, not edit
                              let consultantLeadFromPreviousSubmission;
                              if (currentRfaToAddNewOrReplyOrEdit) {
                                 consultantLeadFromPreviousSubmission = listConsultantMustReply[0];
                              };

                              const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                              if (
                                 itemJustRemoved &&
                                 listConsultantMustReply.find(x => x.toUpperCase() === itemJustRemoved || x.toUpperCase() === extractConsultantName(itemJustRemoved)) &&
                                 consultantLeadFromPreviousSubmission.toUpperCase() !== itemJustRemoved && consultantLeadFromPreviousSubmission.toUpperCase() !== extractConsultantName(itemJustRemoved)
                              ) {
                                 if (!list.find(tg => {
                                    return (extractConsultantName(tg) && extractConsultantName(itemJustRemoved) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved)) ||
                                       (extractConsultantName(tg) && extractConsultantName(tg) === itemJustRemoved) ||
                                       (tg === extractConsultantName(itemJustRemoved) && extractConsultantName(itemJustRemoved))
                                 })) {
                                    if (extractConsultantName(itemJustRemoved)) {
                                       setListConsultantMustReply(listConsultantMustReply.filter(x => x.toUpperCase() !== extractConsultantName(itemJustRemoved)));
                                    } else {
                                       setListConsultantMustReply(listConsultantMustReply.filter(x => x.toUpperCase() !== itemJustRemoved));
                                    };
                                 };
                              };
                           };
                           setListRecipientTo(list);
                        }}
                     >
                        {listRecipient.map(cm => {
                           const isLeadConsultant = listConsultantMustReply[0] && (cm === listConsultantMustReply[0].toUpperCase() || extractConsultantName(cm) === listConsultantMustReply[0].toUpperCase());
                           const isLeadConsultantStyled = isLeadConsultant ? {
                              background: colorType.primary,
                              fontWeight: 'bold',
                              color: 'white'
                           } : {};
                           const textShown = extractConsultantName(cm) ? cm.replace('_%$%_', '_') : cm;

                           return (
                              <Option key={cm}>
                                 <div
                                    style={{
                                       background: 'transparent',
                                       fontWeight: 'normal',
                                       color: 'black',
                                       ...isLeadConsultantStyled,
                                       padding: '0 5px'
                                    }}
                                    onClick={() => onClickTagRecipientTo(cm)}
                                 >
                                    {textShown}
                                 </div>
                              </Option>
                           )
                        })}
                     </SelectRecipientStyled>

                     {formRfaType.includes('form-submit-') && (
                        <div style={{ display: 'flex', marginTop: 5, marginBottom: 10 }}>
                           <div style={{ marginRight: 8 }}>Lead consultant :</div>
                           <div style={{ fontWeight: 'bold', marginRight: 10 }}>{listConsultantMustReply[0] || ''}</div>
                           {!currentRfaToAddNewOrReplyOrEdit && (
                              <div style={{ fontSize: 11, color: 'grey', fontStyle: 'italic', transform: 'translateY(3px)' }}>(Click on tag to change lead consultant)</div>
                           )}
                        </div>
                     )}
                  </div>
               </div>


               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>CC</div>
                  <div style={{ width: '95%' }}>
                     <SelectRecipientStyled
                        mode='tags'
                        placeholder='Please select...'
                        value={listRecipientCc}
                        onChange={(list) => {
                           if (list.find(tag => !listGroup.find(x => x === tag) && !validateEmailInput(tag))) {
                              message.warning('Please choose an available group email or key in an email address!');
                              return;
                           };
                           setListRecipientCc(list);
                        }}
                     >
                        {listRecipient.map(cm => {
                           const textShown = extractConsultantName(cm) ? cm.replace('_%$%_', '_') : cm;
                           return (
                              <Option key={cm}>
                                 <div style={{
                                    background: 'transparent',
                                    fontWeight: 'normal',
                                    color: 'black',
                                    padding: '0 5px'
                                 }}>{textShown}</div>
                              </Option>
                           )
                        })}
                     </SelectRecipientStyled>
                  </div>
               </div>


               {formRfaType.includes('form-submit-') && (
                  <>
                     <div style={{ display: 'flex', marginBottom: 5 }}>
                        <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 15 }}>Requested by</div>
                        <InputStyled
                           style={{ width: 250, marginBottom: 10, borderRadius: 0 }}
                           onChange={(e) => setRequestedBy(e.target.value)}
                           value={requestedBy}
                           disabled={dwgsToAddNewRFA ? false : true}
                        />
                     </div>
                  </>
               )}



               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 65, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Subject</div>
                  <InputStyled
                     style={{
                        width: '90%',
                        marginBottom: 10,
                        borderRadius: 0,
                     }}
                     onChange={(e) => setTextEmailTitle(e.target.value)}
                     value={textEmailTitle}
                  />
               </div>

               <div style={{ paddingLeft: 100 }}>
                  {formRfaType.includes('form-submit-') ? (
                     <>
                        {/* <div>Dear Mr/Mrs <span style={{ fontWeight: 'bold' }}>{listConsultantMustReply[0] || ''}</span>,</div> */}
                        <div style={{ paddingLeft: 0 }}>Dear All,</div>
                        <div>
                           <span style={{ fontWeight: 'bold' }}>{company}</span> has submitted <span style={{ fontWeight: 'bold' }}>
                              {currentRfaToAddNewOrReplyOrEdit
                                 ? `${currentRfaToAddNewOrReplyOrEdit.currentRfaNumber}${rfaNewVersionResubmitSuffix}`
                                 : `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${rfaNumberSuffixFirstTimeSubmit}`}
                           </span> for you to review, the drawings included in this RFA are in the list below.
                        Please review and reply to us by <span style={{ fontWeight: 'bold' }}>{dateReplyForSubmitForm ? dateReplyForSubmitForm.format('DD/MM/YY') : ''}.</span>
                        </div>
                     </>
                  ) : (
                     <>
                        {/* <div>Dear Mr/Mrs <span style={{ fontWeight: 'bold' }}>{companySendRfa || ''}</span>,</div> */}
                        <div style={{ paddingLeft: 0 }}>Dear All,</div>
                        <div>
                           <span style={{ fontWeight: 'bold' }}>{company}</span> has replied this RFA, the drawings included in this RFA are in the list below.
                        Please review and update as per comments.
                     </div>
                     </>
                  )}
               </div>
               <br />

               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 70, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold', marginBottom: 10 }}>Notes : </div>
                  <TextAreaStyled
                     style={{
                        width: '90%',
                        marginBottom: 10,
                        borderRadius: 0,
                     }}
                     rows={3}
                     onChange={(e) => setTextEmailAdditionalNotes(e.target.value)}
                     value={textEmailAdditionalNotes}
                     placeholder='Write note...'
                  />
               </div>


               <div style={{ display: 'flex', marginBottom: 5 }}>
                  {!currentRfaToAddNewOrReplyOrEdit && (
                     <ButtonStyle
                        marginRight={10}
                        name='Add Drawing To List'
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
                        onChange={onChangeUploadFileDWFX}
                        beforeUpload={() => {
                           return false;
                         }}
                     >
                        <ButtonStyle
                           marginRight={5}
                           name='Upload 3D Model'
                           disabled={!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0}
                        />
                     </Upload>
                  )}


                  <div style={{ marginLeft: 5, transform: `${formRfaType.includes('form-submit-') ? 'translateY(8px)' : 'translateY(5px)'}` }}>
                     {filesPDF ? `${Object.keys(filesPDF).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                     / {filesDWFX ? `${filesDWFX.name} has been chosen.` : 'No 3D model has been chosen.'}

                  </div>
               </div>


               {dwgsToAddNewRFA && (
                  <div style={{
                     width: window.innerWidth * 0.9 - 80,
                     // height: dwgsToAddNewRFA.length > 4 ? 162 : dwgsToAddNewRFA.length * 28 + 80
                     height: dwgsToAddNewRFA.length * 28 + 80
                  }}>
                     <TableStyled
                        fixed
                        columns={generateColumnsListDwgRFA(headersDwgRFA(formRfaType), nosColumnFixed)}
                        data={dwgsToAddNewRFA}
                        rowHeight={28}
                     />
                  </div>
               )}
            </div>


            <div style={{
               // position: 'absolute', 
               // bottom: 10,
               // right: 10,
               padding: 20,
               display: 'flex',
               flexDirection: 'row-reverse'
            }}>
               <ButtonGroupComp
                  onClickCancel={() => setModalConfirmsubmitOrCancel('cancel')}
                  onClickApply={() => setModalConfirmsubmitOrCancel('ok')}
                  newText={'Submit'}
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
               width={window.innerWidth * 0.85}
               onOk={() => setTablePickDrawingRFA(false)}
               onCancel={() => setTablePickDrawingRFA(false)}
            >
               <TableDrawingRFA
                  onClickCancelModalPickDrawing={() => setTablePickDrawingRFA(false)}
                  onClickApplyModalPickDrawing={onClickApplyModalPickDrawing}
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  tradeOfRfaForFirstTimeSubmit={tradeOfRfaForFirstTimeSubmit}
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
                  <TextAreaStyled
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


         {modalConfirmsubmitOrCancel && (
            <ModalConfirmStyled
               title={modalConfirmsubmitOrCancel === 'ok' ? 'Confirm Submission' : 'Cancel Submission'}
               visible={modalConfirmsubmitOrCancel !== null ? true : false}
               footer={null}
               destroyOnClose={true}
               centered={true}
            >
               <ConfirmSubmitOrCancelModal
                  typeConfirm={modalConfirmsubmitOrCancel}
                  formRfaType={formRfaType}
                  rfaRef={currentRfaToAddNewOrReplyOrEdit ? (
                     formRfaType === 'form-submit-RFA'
                        ? `${currentRfaToAddNewOrReplyOrEdit.currentRfaNumber}${rfaNewVersionResubmitSuffix}`
                        : formRfaType === 'form-reply-RFA'
                           ? `${currentRfaToAddNewOrReplyOrEdit.currentRfaRef}` : '')
                     : `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${rfaNumberSuffixFirstTimeSubmit}`
                  }
                  onClickCancelConfirmModal={() => setModalConfirmsubmitOrCancel(null)}
                  onClickApplyConfirmModal={(confirmFinal) => {
                     if (confirmFinal === 'Cancel Action Form') {
                        setModalConfirmsubmitOrCancel(null);
                        onClickCancelModal();
                     } else if (confirmFinal === 'Submit') {
                        onClickApplyDoneFormRFA();
                     };
                  }}
               />
            </ModalConfirmStyled>
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
      } else if (role === 'Document Controller') {
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
   const allRevsExisting = [...new Set(rowsThisRFAWithRev.filter(dwg => dwg.row === rowData.id).map(x => x['Rev']))];

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
               if (allRevsExisting.indexOf(e.target.value) !== -1) {
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


const ConfirmSubmitOrCancelModal = ({ typeConfirm, formRfaType, rfaRef, onClickCancelConfirmModal, onClickApplyConfirmModal }) => {

   return (
      <div style={{ padding: 20, width: '100%' }}>
         {typeConfirm === 'ok' ? (
            <div>Are you sure to {formRfaType.includes('form-submit-') ? 'submit' : 'reply'} the <span style={{ fontWeight: 'bold' }}>{rfaRef}</span>?</div>
         ) : typeConfirm === 'cancel' ? (
            <div>Are you sure to cancel the {formRfaType.includes('form-submit-') ? 'submission' : 'response'}?</div>
         ) : null}

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelConfirmModal}
               onClickApply={() => onClickApplyConfirmModal(typeConfirm === 'ok' ? 'Submit' : 'Cancel Action Form')}
               newText={'Yes'}
            />
         </div>
      </div>
   );
};
const ModalConfirmStyled = styled(Modal)`
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
   .BaseTable__header-row {
      background: ${colorType.grey1};
   };
   .BaseTable__row-cell {
      padding: 10px;
      border-right: 1px solid #DCDCDC;
      overflow: visible !important;
   };
`;
const InputStyled = styled(Input)`
   color: black;
   border-top: none;
   border-right: none;
   border-left: none;
   &:focus {
      outline: none;
      box-shadow: none;
   }
`;
const TextAreaStyled = styled(TextArea)`
   color: black;
   border-top: none;
   border-right: none;
   border-left: none;
   &:focus {
      outline: none;
      box-shadow: none;
   }
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
   width: 100%;
   .ant-select-selection__choice {
      /* padding: 0; */
      margin-right: 5px;
      border: 1px solid ${colorType.grey1}
   }
   .ant-select-selection__choice__remove {
      
   }

   .ant-select-selection {
      border-radius: 0;
      width: 100%;
      background: transparent;

      border-top: none;
      border-right: none;
      border-left: none;
      outline: none;
      box-shadow: none;
      &:focus {
         outline: none;
         box-shadow: none;
      }
   };

`;


const DatePickerStyled = styled(DatePicker)`
   .ant-calendar-picker-input {
      border-radius: 0;
      border-top: none;
      border-right: none;
      border-left: none;
      outline: none;
      box-shadow: none;
      &:focus {
         outline: none;
         box-shadow: none;
      }
   };
   .anticon {
      transform: translateY(-5px);
   }
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

export const findTradeOfDrawing = (row, dwgTypeTree) => {
   let output;
   const parentNode = dwgTypeTree.find(x => x.id === row._parentRow);
   if (parentNode) {
      output = getTradeNameFnc(parentNode, dwgTypeTree);
   };
   return output;
};

const convertTradeCode = (trade) => {
   if (trade === 'ARCHI') return 'ARC';
   if (trade === 'C&S') return 'CS';
   if (trade === 'M&E') return 'ME';
   if (trade === 'PRECAST') return 'PC';
};
export const convertTradeCodeInverted = (trade) => {
   if (trade === 'ARC') return 'ARCHI';
   if (trade === 'CS') return 'C&S';
   if (trade === 'ME') return 'M&E';
   if (trade === 'PC') return 'PRECAST';
};