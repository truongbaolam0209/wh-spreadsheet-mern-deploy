import { Checkbox, DatePicker, Icon, Input, message, Modal, Select, TimePicker, Tooltip, Upload } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc, mongoObjectId, validateEmailInput } from '../../utils';
import { getInfoValueFromRefDataForm } from '../pageSpreadsheet/CellForm';
import { getKeyTextForSheet } from '../pageSpreadsheet/PanelSetting';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';
import TableDrawingRfaForMultiForm from './TableDrawingRfaForMultiForm';




const { Option } = Select;
const { TextArea } = Input;


const extractConsultantName = (name) => {
   const indexOfSplitString = name.indexOf('_%$%_');
   return name.slice(0, indexOfSplitString === -1 ? -99999 : indexOfSplitString);
};

const checkIfMatchWithInputCompanyFormat = (item, listConsultants) => {
   let result = false;
   listConsultants.forEach(cm => {
      if (cm.company === extractConsultantName(item)) {
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


const PanelAddNewMultiForm = ({ onClickCancelModal, onClickApplySendFormToSignature }) => {


   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany: { role, company: companyUser }, companies, listUser, email, listGroup, projectName, projectNameShort: projectNameShortText, pageSheetTypeName } = stateProject.allDataOneSheet;
   const projectNameShort = projectNameShortText || 'NO-PROJECT-NAME';

   const {
      rowsAll, loading, currentRefToAddNewOrReplyOrEdit,
      rowsRfamAllInit, rowsRfiAllInit, rowsCviAllInit, rowsDtAllInit, rowsMmAllInit
   } = stateRow;

   const rowsRefAllInit = pageSheetTypeName === 'page-rfam' ? rowsRfamAllInit
      : pageSheetTypeName === 'page-rfi' ? rowsRfiAllInit
         : pageSheetTypeName === 'page-cvi' ? rowsCviAllInit
            : pageSheetTypeName === 'page-dt' ? rowsDtAllInit
               : pageSheetTypeName === 'page-mm' ? rowsMmAllInit
                  : [];


   const refType = getKeyTextForSheet(pageSheetTypeName);
   const refKey = refType + 'Ref';

   const {
      currentRefNumber, currentRefData, formRefType, isFormEditting,
      isAdminAction, isAdminActionWithNoEmailSent, adminActionConsultantToReply,
   } = currentRefToAddNewOrReplyOrEdit || {};

   const company = (formRefType === 'form-reply-multi-type' && isAdminAction && adminActionConsultantToReply) ? adminActionConsultantToReply : companyUser;



   const listRecipient = (
      isAdminAction &&
      isAdminActionWithNoEmailSent &&
      (formRefType === 'form-submit-multi-type' || formRefType === 'form-resubmit-multi-type')
   )
      ? [...listUser, ...listGroup].filter(x => !validateEmailInput(x))
      : [...listUser, ...listGroup];


   const listConsultants = companies.filter(x => x.companyType === 'Consultant');


   const [refNumberSuffixFirstTimeSubmit, setRefNumberSuffixFirstTimeSubmit] = useState('');

   const [refNewVersionResubmitSuffix, setRefNewVersionResubmitSuffix] = useState('');

   const [tradeForFirstTimeSubmit, setTradeForFirstTimeSubmit] = useState('');

   const [consultantReplyStatus, setConsultantReplyStatus] = useState('');
   const [submissionType, setSubmissionType] = useState('');

   const [dateReplyForSubmitForm, setDateReplyForSubmitForm] = useState(null);

   const [dateConversation, setDateConversation] = useState(null);
   const [timeConversation, setTimeConversation] = useState(null);

   const [tablePickDrawingRefSubmitted, setTablePickDrawingRefSubmitted] = useState(false);

   const [nosColumnFixed, setNosColumnFixed] = useState(1);


   const [filesPdfDrawing, setFilesPdfDrawing] = useState({});
   const [fileFormCoverReply, setFileFormCoverReply] = useState({});

   const [dwgsImportFromRFA, setDwgsImportFromRFA] = useState([]);

   const [dataInputForTable, setDataInputForTable] = useState([]);




   useEffect(() => {
      setDataInputForTable(getInputForTable(fileFormCoverReply, filesPdfDrawing, dwgsImportFromRFA));
   }, [fileFormCoverReply, filesPdfDrawing, dwgsImportFromRFA]);


   const [listRecipientTo, setListRecipientTo] = useState([]);
   const [listRecipientCc, setListRecipientCc] = useState([]);

   const [listConsultantMustReply, setListConsultantMustReply] = useState([]);
   const [requestedBy, setRequestedBy] = useState(email);
   const [signaturedBy, setSignaturedBy] = useState('');

   const [textEmailTitle, setTextEmailTitle] = useState('');
   const [conversationAmong, setConversationAmong] = useState('');

   const [description, setDescription] = useState('');
   const [contractSpecification, setContractSpecification] = useState('');
   const [proposedSpecification, setProposedSpecification] = useState('');

   const [modalConfirmsubmitOrCancel, setModalConfirmsubmitOrCancel] = useState(null);

   const [isCostImplication, setIsCostImplication] = useState(true);
   const [isTimeExtension, setIsTimeExtension] = useState(true);

   const [herewithForDt, setHerewithForDt] = useState('');
   const [transmittedForDt, setTransmittedForDt] = useState('');



   useEffect(() => {
      if (formRefType === 'form-submit-multi-type') {
         if (!isFormEditting) {
            setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));

         } else {
            //          const rowsToEdit = rowsRefAllInit.filter(x => currentRefText === x['RFA Ref']);
            //          const oneRowInRef = rowsToEdit[0];
            //          const rowsToEditClone = rowsToEdit.map(x => ({ ...x }));
            //          rowsToEditClone.forEach(r => {
            //             const dwgLink = r[`submission-$$$-drawing-${company}`];
            //             r[`submission-$$$-drawing-${company}`] = /[^/]*$/.exec(dwgLink)[0];
            //          });
            //          setDwgsImportFromRFA(rowsToEditClone);

            //          const listEmailTo = getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailTo', company) || [];
            //          setListRecipientTo([...new Set(listEmailTo)]);

            //          const listEmailCc = getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailCc', company) || [];
            //          setListRecipientCc([...new Set(listEmailCc)]);


            //          setListConsultantMustReply(getInfoValueFromRfaData(oneRowInRef, 'submission', 'consultantMustReply', company) || []);
            //          setRequestedBy(getInfoValueFromRfaData(oneRowInRef, 'submission', 'requestedBy', company) || '');
            //          setTextEmailTitle(getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailTitle', company) || '');
            //          setDescription(getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailAdditionalNotes', company) || '');

            //          setDateReplyForSubmitForm(moment(oneRowInRef['Consultant Reply (T)'], 'DD/MM/YY'));
            //          setTradeForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(oneRowInRef, 'submission', 'trade', company)));

            //          const rfaNumberSuffixPrevious = /[^/]*$/.exec(currentRefText)[0];
            //          setRefNumberSuffixFirstTimeSubmit(rfaNumberSuffixPrevious);
         };
         //    } else if (formRefType === 'form-resubmit-RFA') {
         //       if (!isFormEditting) {
         //          const dwgsToResubmit = rowsRefAllInit.filter(dwg => {
         //             return dwg.rfaNumber === currentRefNumber &&
         //                !dwg['RFA Ref'];
         //          });


         //          setDwgsImportFromRFA(dwgsToResubmit.map(x => ({ ...x })));

         //          const listEmailTo = currentRefData[`submission-$$$-emailTo-${company}`] || [];
         //          setListRecipientTo([...new Set(listEmailTo)]);

         //          const listEmailCc = currentRefData[`submission-$$$-emailCc-${company}`] || [];
         //          setListRecipientCc([...new Set(listEmailCc)]);


         //          setListConsultantMustReply(currentRefData[`submission-$$$-consultantMustReply-${company}`]);
         //          setRequestedBy(currentRefData[`submission-$$$-requestedBy-${company}`]);


         //          const versionAlreadySubmit = rowsRefAllInit
         //             .filter(dwg => dwg.rfaNumber === currentRefNumber && dwg['RFA Ref'])
         //             .map(x => x['RFA Ref']);

         //          const versionTextAlreadySubmitArr = versionAlreadySubmit.map(rfaNum => {
         //             return rfaNum.slice(currentRefNumber.length, rfaNum.length);
         //          });
         //          const versionLeft = versionArray.filter(x => versionTextAlreadySubmitArr.indexOf(x) === -1);
         //          setRefNewVersionResubmitSuffix(versionLeft[0]);

         //          const oneDwg = dwgsToResubmit[0];
         //          setTextEmailTitle('Resubmit - ' + oneDwg[`submission-$$$-emailTitle-${company}`]);
         //          setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));
         //       } else {

         //          const rowsToEdit = rowsRefAllInit.filter(x => currentRefText === x['RFA Ref']);
         //          const oneRowInRef = rowsToEdit[0];
         //          const rowsToEditClone = rowsToEdit.map(x => ({ ...x }));
         //          rowsToEditClone.forEach(r => {
         //             const dwgLink = r[`submission-$$$-drawing-${company}`];
         //             r[`submission-$$$-drawing-${company}`] = /[^/]*$/.exec(dwgLink)[0];
         //          });

         //          const versionTextSuffix = currentRefText.slice(currentRefNumber.length, currentRefText.length);
         //          setRefNewVersionResubmitSuffix(versionTextSuffix);

         //          setDwgsImportFromRFA(rowsToEditClone);

         //          const listEmailTo = getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailTo', company) || [];
         //          setListRecipientTo([...new Set(listEmailTo)]);

         //          const listEmailCc = getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailCc', company) || [];
         //          setListRecipientCc([...new Set(listEmailCc)]);

         //          setListConsultantMustReply(getInfoValueFromRfaData(oneRowInRef, 'submission', 'consultantMustReply', company) || []);
         //          setRequestedBy(getInfoValueFromRfaData(oneRowInRef, 'submission', 'requestedBy', company) || '');
         //          setTextEmailTitle(getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailTitle', company) || '');
         //          setDescription(getInfoValueFromRfaData(oneRowInRef, 'submission', 'emailAdditionalNotes', company) || '');

         //          setDateReplyForSubmitForm(moment(oneRowInRef['Consultant Reply (T)'], 'DD/MM/YY'));
         //          setTradeForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(oneRowInRef, 'submission', 'trade', company)));

         //          const rfaNumberSuffixPrevious = /[^/]*$/.exec(currentRefText)[0];
         //          setRefNumberSuffixFirstTimeSubmit(rfaNumberSuffixPrevious);

         //       };


      } else if (formRefType === 'form-reply-multi-type') {
         if (!isFormEditting) {

            let arrEmailCc = [];
            for (const key in currentRefData) {
               if (key.includes(`submission-${refType}-user-`)) {
                  const listEmailTo = currentRefData[key] ? [currentRefData[key]] : [];
                  setListRecipientTo([...new Set(listEmailTo)]);
               } else if (key.includes(`submission-${refType}-emailTo-`) || key.includes(`submission-${refType}-emailCc-`)) {
                  arrEmailCc = [...new Set([...arrEmailCc, ...currentRefData[key]])];
               };
            };
            setListRecipientCc([...new Set(arrEmailCc)]);

            const title = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTitle');
            setTextEmailTitle('Reply - ' + title);

            //       } else {
            //          const dwgsToEditReply = rowsRefAllInit.filter(x => currentRefText === x['RFA Ref']);
            //          const oneRowInRef = dwgsToEditReply[0];
            //          const dwgsToEditReplyClone = dwgsToEditReply.map(x => ({ ...x }));
            //          dwgsToEditReplyClone.forEach(r => {
            //             const dwgLink = r[`reply-$$$-drawing-${company}`];
            //             r[`reply-$$$-drawing-${company}`] = /[^/]*$/.exec(dwgLink)[0];
            //          });
            //          setDwgsImportFromRFA(dwgsToEditReplyClone);

            //          const listEmailTo = getInfoValueFromRfaData(oneRowInRef, 'reply', 'emailTo', company) || [];
            //          setListRecipientTo([...new Set(listEmailTo)]);

            //          const listEmailCc = getInfoValueFromRfaData(oneRowInRef, 'reply', 'emailCc', company) || [];
            //          setListRecipientCc([...new Set(listEmailCc)]);

            //          setTextEmailTitle(getInfoValueFromRfaData(oneRowInRef, 'reply', 'emailTitle', company) || '');
            //          setDescription(getInfoValueFromRfaData(oneRowInRef, 'reply', 'emailAdditionalNotes', company) || '');
         };
      };
   }, []);


   useEffect(() => {
      if (tradeForFirstTimeSubmit && formRefType === 'form-submit-multi-type' && !isFormEditting) {

         const allRefNumberUnderThisTrade = rowsRefAllInit.filter(r => r.trade === convertTradeCodeInverted(tradeForFirstTimeSubmit));

         let refNumberExtracted = [... new Set(allRefNumberUnderThisTrade.map(x => /[^/]*$/.exec(x[refKey])[0]))];

         refNumberExtracted = refNumberExtracted
            .filter(x => x.length === 3 && parseInt(x) > 0)
            .map(x => parseInt(x));

         if (refNumberExtracted.length > 0) {
            const lastNumber = Math.max(...refNumberExtracted);
            const suggestedNewRefNumber = lastNumber + 1;
            const suggestedNewRefNumberConverted = suggestedNewRefNumber.toString();
            const suggestedNewRefNumberString = suggestedNewRefNumberConverted.length === 3 ? suggestedNewRefNumberConverted
               : suggestedNewRefNumberConverted.length === 2 ? '0' + suggestedNewRefNumberConverted
                  : '00' + suggestedNewRefNumberConverted;

            setRefNumberSuffixFirstTimeSubmit(suggestedNewRefNumberString);

         } else {
            setRefNumberSuffixFirstTimeSubmit('001');
         };

      };
   }, [tradeForFirstTimeSubmit]);



   useEffect(() => {
      if (!loading) {
         setModalConfirmsubmitOrCancel(null);
      };
   }, [loading]);




   // useEffect(() => {
   //    if (filesDWFX && Object.keys(filesDWFX).length > 0) {
   //       const dwgsToAddNewRfaClone = dwgsImportFromRFA.map(x => ({ ...x }));
   //       let isFileDWFXsameNameFound = false;
   //       Object.keys(filesDWFX).forEach(key => {
   //          const fileDwfxName = key.slice(0, key.length - 5);
   //          dwgsToAddNewRfaClone.forEach(row => {
   //             if (row['Drawing Number'] && (row['Drawing Number'].includes(fileDwfxName) || fileDwfxName.includes(row['Drawing Number']))) {
   //                row[`submission-$$$-dwfxName-${company}`] = key;
   //                isFileDWFXsameNameFound = true;
   //             };
   //          });
   //       });

   //       if (!isFileDWFXsameNameFound) {
   //          const first3Dfile = Object.keys(filesDWFX)[0];
   //          dwgsToAddNewRfaClone.forEach(dwg => {
   //             dwg[`submission-$$$-dwfxName-${company}`] = first3Dfile;
   //          });
   //       };
   //       setDwgsImportFromRFA(dwgsToAddNewRfaClone);
   //    };
   // }, [filesDWFX]);


   // useEffect(() => {
   //    if (filesPdfDrawing && Object.keys(filesPdfDrawing).length > 0) {
   //       const type = formRefType === 'form-reply-RFA' ? 'reply' : 'submission';
   //       const dwgsToAddNewRfaClone = dwgsImportFromRFA.map(x => ({ ...x }));
   //       Object.keys(filesPdfDrawing).forEach(key => {
   //          const filePdfName = key.slice(0, key.length - 4);
   //          dwgsToAddNewRfaClone.forEach(row => {
   //             if (row['Drawing Number'] && (row['Drawing Number'].includes(filePdfName) || filePdfName.includes(row['Drawing Number']))) {
   //                row[`${type}-$$$-drawing-${company}`] = key;
   //             };
   //          });
   //       });
   //       setDwgsImportFromRFA(dwgsToAddNewRfaClone);
   //    };
   // }, [filesPdfDrawing]);





   // const setRevisionDwg = (id, rev) => {
   //    const row = dwgsImportFromRFA.find(x => x.id === id);
   //    row['Rev'] = rev;
   //    setDwgsImportFromRFA([...dwgsImportFromRFA]);
   // };

   const onClickRemoveDwgBtn = debounceFnc((rowData) => {

      if (rowData['Type'] === 'Drawing') {
         delete filesPdfDrawing[rowData['File Name']];
         let obj = {};
         for (const key in filesPdfDrawing) {
            obj[key] = filesPdfDrawing[key];
         };
         setFilesPdfDrawing(obj);

      } else if (rowData['Type'] === 'Cover') {

         delete fileFormCoverReply[rowData['File Name']];
         let obj = {};
         for (const key in fileFormCoverReply) {
            obj[key] = fileFormCoverReply[key];
         };
         setFileFormCoverReply(obj);

      } else if (!rowData['Type']) {
         setDwgsImportFromRFA(dwgsImportFromRFA.filter(x => x.id !== rowData.id));
      };

      setNosColumnFixed(2);
      setNosColumnFixed(1);
   }, 1);




   const onBlurInputRefNameCreateNew = () => {
      const arr = [...new Set(rowsRefAllInit.map(x => (x[refKey] || '')))];

      if (formRefType === 'form-submit-multi-type') {
         if (!isFormEditting) {
            const newRefToRaiseFirstSubmit = `${refType.toUpperCase()}/${projectNameShort}/${tradeForFirstTimeSubmit}/${refNumberSuffixFirstTimeSubmit}`;
            if (arr.indexOf(newRefToRaiseFirstSubmit) !== -1) {
               message.info(`This ${refType.toUpperCase()} number has already existed, please choose a new number!`);
               setRefNumberSuffixFirstTimeSubmit('');
            };
         } else {
            // const arrFilter = arr.filter(x => x !== currentRefText);
            // const newRefToRaiseFirstSubmit = `${refType.toUpperCase()}/${projectNameShort}/${tradeForFirstTimeSubmit || '____'}/${refNumberSuffixFirstTimeSubmit}`;
            // if (arrFilter.indexOf(newRefToRaiseFirstSubmit) !== -1) {
            //    message.info(`This ${refType.toUpperCase()} number has already existed, please choose a new number!`);
            //    setRefNumberSuffixFirstTimeSubmit('');
            // };
         };
      } else if (formRefType === 'form-resubmit-multi-type') {
         // if (!isFormEditting) {
         //    const newRefToRaiseResubmit = `${currentRefNumber}${refNewVersionResubmitSuffix}`;
         //    if (arr.indexOf(newRefToRaiseResubmit) !== -1) {
         //       message.info(`This ${refType.toUpperCase()} number has already existed, please choose a new number!`);
         //       setRefNewVersionResubmitSuffix('');
         //    };
         // };
      };
   };



   // const applyAddCommentToDrawing = () => {
   //    const row = dwgsImportFromRFA.find(x => x.id === dwgIdToAddComment);
   //    row[`reply-$$$-comment-${company}`] = commentText;
   //    setDwgsImportFromRFA([...dwgsImportFromRFA.map(dwg => ({ ...dwg }))]);
   //    setIdToDwgAddComment(null);
   //    setCommentText('');
   // };

   const onChangeUploadPdfDrawing = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { ...output, [file.name]: file };
         });
         setFilesPdfDrawing(output);
      };
   };


   const onChangeUploadFormCoverForReply = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { [file.name]: file };
         });
         setFileFormCoverReply(output);
      };
   };


   const onClickTagRecipientTo = (email, isRemoveTag) => {
      if (formRefType !== 'page-mm') {
         let outputListConsultantMustReply = [...listConsultantMustReply];
         const consultantName = extractConsultantName(email);
         const originConsultant = listConsultants.find(x => x.company === consultantName);
         outputListConsultantMustReply = outputListConsultantMustReply.filter(x => x !== consultantName);

         if (originConsultant && !isRemoveTag) {
            outputListConsultantMustReply.unshift(originConsultant.company);
         };
         setListConsultantMustReply(outputListConsultantMustReply);
      };
   };



   const onClickApplyDoneFormRef = (typeButton) => {

      let trade, refToSaveVersionOrToReply, refToSave;
      if (formRefType.includes('form-submit-multi-')) {
         if (pageSheetTypeName === 'page-mm') {
            trade = convertTradeCodeMeetingMinutesInverted(tradeForFirstTimeSubmit);
         } else {
            trade = convertTradeCodeInverted(tradeForFirstTimeSubmit);
         };

         refToSaveVersionOrToReply = '0';
         refToSave = `${refType.toUpperCase()}/${projectNameShort}/${tradeForFirstTimeSubmit}/${refNumberSuffixFirstTimeSubmit}`;
      } else if (formRefType.includes('form-resubmit-multi-')) {
         // trade = currentRefData.trade;
         // refToSaveVersionOrToReply = refNewVersionResubmitSuffix;
         // refToSave = currentRefNumber;
      } else if (formRefType.includes('form-reply-multi-')) { // reply

         trade = currentRefData.trade;
         refToSaveVersionOrToReply = currentRefData.revision;
         refToSave = currentRefNumber;
      };


      const isSubmitOrResubmitForm = formRefType.includes('form-submit-multi-') || formRefType.includes('form-resubmit-multi-');


      if (projectNameShort === 'NO-PROJECT-NAME') {
         return message.info(`Please update project abbreviation name for ${refType.toUpperCase()} number!`, 3);
      } else if (!textEmailTitle && !isAdminActionWithNoEmailSent) {
         return message.info('Please fill in email title!', 3);
      } else if (!description) {
         return message.info('Please fill in description!', 3);
      } else if (!listRecipientTo || listRecipientTo.length === 0) {
         return message.info('Please fill in recipient!', 3);
      } else if (isSubmitOrResubmitForm && !dateReplyForSubmitForm) {
         return message.info('Please fill in expected reply date!', 3);
      } else if (isSubmitOrResubmitForm && listConsultantMustReply.length === 0 && pageSheetTypeName !== 'page-mm') {
         return message.info('Please fill in consultant lead', 3);
      } else if (isSubmitOrResubmitForm && !requestedBy) {
         return message.info('Please fill in person requested', 3);
      } else if (!trade || !refToSave || !refToSaveVersionOrToReply) {
         return message.info('Please fill in necessary info!', 3);
      } else if (isSubmitOrResubmitForm && !signaturedBy && pageSheetTypeName !== 'page-mm') {
         return message.info('Please fill in signatured by!', 3);
      } else if (isSubmitOrResubmitForm && !submissionType && pageSheetTypeName === 'page-rfam') {
         return message.info('Please fill in submission type!', 3);
      } else if (isSubmitOrResubmitForm && !conversationAmong && (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-mm')) {
         return message.info('Please fill in conversation among!', 3);
      } else if (isSubmitOrResubmitForm && (!dateConversation || !timeConversation) && (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-mm')) {
         return message.info('Please fill in date and time conversation!', 3);
      } else if (isSubmitOrResubmitForm && !herewithForDt && pageSheetTypeName === 'page-dt') {
         return message.info('Please fill in herewith!', 3);
      } else if (isSubmitOrResubmitForm && !transmittedForDt && pageSheetTypeName === 'page-dt') {
         return message.info('Please fill in transmitted for!', 3);
      } else if (!isSubmitOrResubmitForm && !consultantReplyStatus && pageSheetTypeName === 'page-rfam') {
         return message.info('Please fill in reply status!', 3);
      };

      let outputConsultantsToReply = [];
      if (!formRefType.includes('form-reply-multi-')) {
         if (
            pageSheetTypeName === 'page-rfam' ||
            pageSheetTypeName === 'page-rfi'
         ) {
            outputConsultantsToReply = [...listConsultantMustReply];
         } else if (
            pageSheetTypeName === 'page-cvi' ||
            pageSheetTypeName === 'page-dt'
         ) {
            outputConsultantsToReply = [...listConsultantMustReply].sort();
         };
      };



      getSheetRows({ ...stateRow, loading: true });


      onClickApplySendFormToSignature(typeButton, {
         type: formRefType,
         isFormEditting,
         trade,
         filesPdfDrawing: Object.values(filesPdfDrawing),
         dwgsImportFromRFA: dwgsImportFromRFA.map(x => ({ ...x })),
         fileFormCoverReply: Object.values(fileFormCoverReply)[0],
         refToSave, refToSaveVersionOrToReply,
         recipient: {
            to: isAdminActionWithNoEmailSent ? [] : [...new Set(listRecipientTo)],
            cc: isAdminActionWithNoEmailSent ? [] : [...new Set(listRecipientCc)]
         },
         listConsultantMustReply: outputConsultantsToReply,
         requestedBy: formRefType.includes('form-reply-multi-') ? '' : requestedBy,
         signaturedBy: formRefType.includes('form-reply-multi-') ? '' : signaturedBy,
         dateConversation, timeConversation,
         conversationAmong,
         isCostImplication, isTimeExtension,
         emailTextTitle: isAdminActionWithNoEmailSent ? '' : textEmailTitle,
         description: isAdminActionWithNoEmailSent ? '' : description,
         dateReplyForSubmitForm,
         consultantReplyStatus,

         isAdminActionWithNoEmailSent,
         adminActionConsultantToReply,
         isAdminAction,


         contractSpecification,
         proposedSpecification,
         submissionType,
         herewithForDt,
         transmittedForDt
      });
   };


   const generateColumnsListDwgRef = (headers, nosColumnFixed) => {

      const buttonRemoveDrawing = !isFormEditting ? [
         {
            key: 'action', dataKey: 'action', title: '',
            width: 40,
            frozen: Column.FrozenDirection.RIGHT,
            cellRenderer: (
               <CellRemoveDrawing
                  onClickRemoveDwgBtn={onClickRemoveDwgBtn}
               />
            )
         }
      ] : [];


      return [
         {
            key: 'index', dataKey: 'index', title: '', width: 40,
            frozen: Column.FrozenDirection.LEFT,
            cellRenderer: ({ rowIndex }) => <div>{rowIndex + 1}</div>
         },
         ...headers.map((column, index) => ({
            key: column, dataKey: column, title: column,
            resizable: true,
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            width: getHeaderWidthDwgRef(column),
            cellRenderer: ({ rowData, cellData }) => {
               let cellTypeName;
               if (!rowData['Type']) {
                  if (column === 'Type') {
                     cellTypeName = 'Submitted RFA';
                  } else if (column === 'File Name') {
                     cellTypeName = rowData['Drawing Number'];
                  };
               };
               return <div>{cellTypeName || cellData}</div>;
            }
         })),
         ...buttonRemoveDrawing,
      ];
   };







   return (
      <>
         <div style={{ background: 'white', width: '100%', padding: 10, color: 'black' }}>
            <div style={{ padding: 20, paddingRight: 10, borderBottom: `1px solid ${colorType.grey4}` }}>
               <div style={{ display: 'flex', marginBottom: 10 }}>
                  <div style={{ marginRight: 10, fontWeight: 'bold' }}>{refType.toUpperCase()} Number</div>
                  {formRefType === 'form-submit-multi-type' ? (
                     <>
                        <div>{`${refType.toUpperCase()}/${projectNameShort}/`}</div>
                        <SelectTradeStyled
                           showSearch
                           optionFilterProp='children'
                           onChange={(value) => setTradeForFirstTimeSubmit(value)}
                           filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           suffixIcon={<div></div>}
                        >
                           {(
                              pageSheetTypeName === 'page-mm'
                                 ? ['PRO', 'TEC', 'ICE']
                                 : ['ARC', 'CS', 'ME', 'PC']
                           ).map(trade => (
                              <Select.Option key={trade} value={trade}>{trade}</Select.Option>
                           ))}
                        </SelectTradeStyled>
                        <div style={{ marginLeft: 10 }}>/</div>
                        {tradeForFirstTimeSubmit ? (
                           <InputStyled
                              style={{ width: 50, marginRight: 120 }}
                              onChange={(e) => setRefNumberSuffixFirstTimeSubmit(e.target.value)}
                              onBlur={onBlurInputRefNameCreateNew}
                              value={refNumberSuffixFirstTimeSubmit}
                           />
                        ) : (
                           <div style={{ marginRight: 120, transform: 'translateY(8px)', color: colorType.grey1 }}>
                              <Tooltip title='Ref number automatically filled in after selecting trade'>{'____'}</Tooltip>
                           </div>
                        )}
                     </>
                     // ) : formRefType === 'form-resubmit-multi-form' ? (
                     //    <>
                     //       <div style={{ marginRight: 2 }}>{currentRefNumber}</div>
                     //       <InputStyled
                     //          style={{ width: 50, marginBottom: 10, borderRadius: 0, marginRight: 120, transform: 'translateY(-5px)' }}
                     //          onChange={(e) => setRefNewVersionResubmitSuffix(e.target.value)}
                     //          onBlur={onBlurInputRefNameCreateNew}
                     //          value={refNewVersionResubmitSuffix}
                     //       />
                     //    </>

                  ) : formRefType === 'form-reply-multi-type' ? (
                     <div>{currentRefNumber + (currentRefData.revision === '0' ? '' : currentRefData.revision)}</div>

                  ) : null}



                  {formRefType !== 'form-reply-multi-type' && pageSheetTypeName !== 'page-mm' && (
                     <>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date Reply</div>
                        <DatePickerStyled
                           value={dateReplyForSubmitForm}
                           format={'DD/MM/YY'}
                           onChange={(e) => setDateReplyForSubmitForm(e)}
                        />
                     </>
                  )}


                  {/* 
                  {formRefType === 'form-reply-multi-type' && adminActionConsultantToReply && (
                     <div style={{ marginLeft: 20 }}>Company reply: <span style={{ fontWeight: 'bold' }}>{adminActionConsultantToReply}</span></div>
                  )}

 */}
               </div>



               {!isAdminActionWithNoEmailSent && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                     <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>{'To'}</div>
                     <div style={{ width: '95%' }}>
                        <SelectRecipientStyled
                           mode='tags'
                           placeholder='Please select...'
                           value={listRecipientTo}

                           onChange={(list) => {
                              if (list.find(tag => !listGroup.find(x => x === tag) && !validateEmailInput(tag))) {
                                 return message.warning('Please choose an available group email or key in an email address!');
                              };

                              if (formRefType === 'form-submit-multi-type') {
                                 let isLeadConsultantIncluded = false;
                                 list.forEach(tagCompany => {
                                    if (checkIfMatchWithInputCompanyFormat(tagCompany, listConsultants)) {
                                       isLeadConsultantIncluded = true;
                                    };
                                 });
                                 if (!isLeadConsultantIncluded && pageSheetTypeName !== 'page-mm') {
                                    if (
                                       pageSheetTypeName === 'page-rfam' ||
                                       pageSheetTypeName === 'page-rfi'
                                    ) {
                                       message.warning('You must include lead consultant!');
                                    } else if (
                                       pageSheetTypeName === 'page-cvi' ||
                                       pageSheetTypeName === 'page-dt'
                                    ) {
                                       message.warning('You must include consultants!');
                                    };
                                 };

                                 const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                                 if (
                                    itemJustRemoved &&
                                    listConsultantMustReply.find(x => x === extractConsultantName(itemJustRemoved)) &&
                                    !list.find(tg => extractConsultantName(tg) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved))
                                 ) {
                                    setListConsultantMustReply(listConsultantMustReply.filter(x => x !== extractConsultantName(itemJustRemoved)));
                                 };


                              } else if (formRefType === 'form-resubmit-multi-type') {
                                 // const consultantLeadFromPreviousSubmission = listConsultantMustReply[0];
                                 // const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                                 // if (
                                 //    itemJustRemoved &&
                                 //    listConsultantMustReply.find(x => x === extractConsultantName(itemJustRemoved)) &&
                                 //    consultantLeadFromPreviousSubmission !== extractConsultantName(itemJustRemoved) &&
                                 //    !list.find(tg => extractConsultantName(tg) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved))
                                 // ) {
                                 //    setListConsultantMustReply(listConsultantMustReply.filter(x => x !== extractConsultantName(itemJustRemoved)));
                                 // };
                              };
                              setListRecipientTo([...new Set(list)]);

                              let companyNameToCheck, isRemoveTag;
                              if (list.length === listRecipientTo.length + 1) {
                                 companyNameToCheck = list.find(x => !listRecipientTo.find(item => item === x));
                                 isRemoveTag = false;
                              } else if (list.length === listRecipientTo.length - 1) {
                                 companyNameToCheck = listRecipientTo.find(x => !list.find(item => item === x));
                                 isRemoveTag = true;
                              };

                              onClickTagRecipientTo(companyNameToCheck, isRemoveTag);
                           }}
                        >
                           {listRecipient.map(cm => {
                              const isLeadConsultant = listConsultantMustReply[0] && extractConsultantName(cm) === listConsultantMustReply[0];
                              const isLeadConsultantStyled = (isLeadConsultant && (
                                 pageSheetTypeName === 'page-rfam' ||
                                 pageSheetTypeName === 'page-rfi'
                              )) ? {
                                 background: colorType.primary,
                                 fontWeight: 'bold',
                                 color: 'white'
                              } : {};
                              const textShown = extractConsultantName(cm) ? cm.replace('_%$%_', ' ') : cm;

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
                                       onClick={() => onClickTagRecipientTo(cm, false)}
                                    >
                                       {textShown}
                                    </div>
                                 </Option>
                              )
                           })}
                        </SelectRecipientStyled>

                        {formRefType !== 'form-reply-multi-type' && (
                           <div style={{ display: 'flex', marginTop: 5, marginBottom: 10 }}>
                              {pageSheetTypeName !== 'page-mm' && (
                                 <div style={{ marginRight: 8 }}>
                                    {(pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi') ? 'Lead consultant :'
                                       : (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt') ? 'Received By :'
                                          : 'n/a'
                                    }
                                 </div>
                              )}
                              {pageSheetTypeName !== 'page-mm' && (
                                 <div style={{ fontWeight: 'bold', marginRight: 10 }}>
                                    {(pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi') ? (listConsultantMustReply[0] || '')
                                       : (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt') ? (listConsultantMustReply.sort().join(', ') || '')
                                          : 'n/a'
                                    }
                                 </div>
                              )}



                              {formRefType === 'form-submit-multi-type' && pageSheetTypeName !== 'page-mm' && (
                                 <div style={{ fontSize: 11, color: 'grey', fontStyle: 'italic', transform: 'translateY(3px)' }}>(Click on tag to change lead consultant)</div>
                              )}

                           </div>
                        )}
                     </div>
                  </div>
               )}




               {!isAdminActionWithNoEmailSent && (
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
                              setListRecipientCc([...new Set(list)]);
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
               )}



               {formRefType !== 'form-reply-multi-type' && pageSheetTypeName !== 'page-mm' && (
                  <div style={{ display: 'flex' }}>
                     <div style={{ display: 'flex', marginBottom: 5, marginRight: 120 }}>
                        <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 15 }}>Requested by</div>
                        <InputStyled
                           style={{ width: 250, marginBottom: 10, borderRadius: 0 }}
                           onChange={(e) => setRequestedBy(e.target.value)}
                           value={requestedBy}
                        />
                     </div>
                     <div style={{ display: 'flex', marginBottom: 5 }}>
                        <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 15 }}>Signature</div>
                        <SelectTradeStyled
                           style={{ width: 200 }}
                           showSearch
                           optionFilterProp='children'
                           onChange={(value) => setSignaturedBy(value)}
                           filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           suffixIcon={<div></div>}
                        >
                           {listUser.map((email, i) => (
                              <Select.Option key={i} value={email}>{email}</Select.Option>
                           ))}
                        </SelectTradeStyled>
                     </div>
                  </div>
               )}




               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 65, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Subject</div>
                  <InputStyled
                     style={{ width: '90%', marginBottom: 10, borderRadius: 0 }}
                     onChange={(e) => setTextEmailTitle(e.target.value)}
                     value={textEmailTitle}
                  />
               </div>

               {
                  formRefType !== 'form-reply-multi-type' &&
                  pageSheetTypeName === 'page-dt' &&
                  (
                     <div style={{ display: 'flex' }}>
                        <div style={{ display: 'flex', marginBottom: 5, marginRight: 100 }}>
                           <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 15 }}>Herewith</div>
                           <SelectTradeStyled
                              style={{ width: 200 }}
                              showSearch
                              optionFilterProp='children'
                              onChange={(value) => setHerewithForDt(value)}
                              filterOption={(input, option) =>
                                 option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              suffixIcon={<div></div>}
                           >
                              {[
                                 'Drawings', 'CD', 'Calculations', 'Method Statement', 'Document', 'Programme',
                                 'Specifications', 'Part Prints/Sketches', 'Catalogues', 'Test Results', 'Correspondence', 'Others',
                              ].map((typeFile, i) => (
                                 <Select.Option key={i} value={typeFile}>{typeFile}</Select.Option>
                              ))}
                           </SelectTradeStyled>
                        </div>

                        <div style={{ display: 'flex', marginBottom: 5 }}>
                           <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 15 }}>Transmitted For</div>
                           <SelectTradeStyled
                              style={{ width: 200 }}
                              showSearch
                              optionFilterProp='children'
                              onChange={(value) => setTransmittedForDt(value)}
                              filterOption={(input, option) =>
                                 option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              suffixIcon={<div></div>}
                           >
                              {['Information / Action', 'Comments / Approval', 'Construction', 'Record'].map((typeFile, i) => (
                                 <Select.Option key={i} value={typeFile}>{typeFile}</Select.Option>
                              ))}
                           </SelectTradeStyled>
                        </div>
                     </div>
                  )}



               {
                  formRefType !== 'form-reply-multi-type' &&
                  pageSheetTypeName === 'page-rfam' &&
                  (
                     <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Submission Type</div>
                        <SelectTradeStyled
                           style={{ width: 150 }}
                           showSearch
                           optionFilterProp='children'
                           onChange={(value) => setSubmissionType(value)}
                           filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           suffixIcon={<div></div>}
                        >
                           {[
                              'New Submittal',
                              'Alternative',
                              'Resubmittal',
                           ].map(typeSubmit => (
                              <Select.Option key={typeSubmit} value={typeSubmit}>{typeSubmit}</Select.Option>
                           ))}
                        </SelectTradeStyled>
                     </div>
                  )}



               {
                  formRefType !== 'form-reply-multi-type' &&
                  (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-mm') &&
                  (
                     <>
                        <div style={{ display: 'flex', marginBottom: 20 }}>
                           <div style={{ width: 150, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Conversation Among</div>
                           <InputStyled
                              style={{ width: '90%', marginBottom: 10, borderRadius: 0 }}
                              onChange={(e) => setConversationAmong(e.target.value)}
                              value={conversationAmong}
                           />
                        </div>

                        <div style={{ display: 'flex' }}>
                           <div style={{ display: 'flex', marginRight: 50 }}>
                              <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date</div>
                              <DatePickerStyled
                                 value={dateConversation}
                                 format={'DD/MM/YY'}
                                 onChange={(e) => setDateConversation(e)}
                              />
                           </div>

                           <div style={{ display: 'flex' }}>
                              <div style={{ marginRight: 10, fontWeight: 'bold' }}>Time</div>
                              <TimePickerStyled
                                 defaultValue={moment('12:08', 'HH:mm')} format={'HH:mm'}
                                 value={timeConversation}
                                 onChange={(e) => setTimeConversation(e)}
                              />
                           </div>
                        </div>
                     </>
                  )}


               <br />

               <div style={{ display: 'flex', marginBottom: 20 }}>
                  <div style={{ width: 90, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold', marginBottom: 10 }}>Description</div>
                  <TextAreaStyled
                     style={{ width: '85%', marginBottom: 10, borderRadius: 0 }}
                     rows={5}
                     onChange={(e) => setDescription(e.target.value)}
                     value={description}
                     placeholder='Write details...'
                  />
               </div>


               {
                  formRefType !== 'form-reply-multi-type' &&
                  pageSheetTypeName === 'page-rfam' &&
                  (
                     <>
                        <div style={{ display: 'flex', marginBottom: 20 }}>
                           <div style={{ width: 90, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold', marginBottom: 10 }}>Contract Specification</div>
                           <TextAreaStyled
                              style={{ width: '85%', marginBottom: 10, borderRadius: 0 }}
                              rows={5}
                              onChange={(e) => setContractSpecification(e.target.value)}
                              value={contractSpecification}
                              placeholder='Write contract specification...'
                           />
                        </div>
                        <div style={{ display: 'flex', marginBottom: 20 }}>
                           <div style={{ width: 90, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold', marginBottom: 10 }}>Proposed Specification</div>
                           <TextAreaStyled
                              style={{ width: '85%', marginBottom: 10, borderRadius: 0 }}
                              rows={5}
                              onChange={(e) => setProposedSpecification(e.target.value)}
                              value={proposedSpecification}
                              placeholder='Write proposed specification...'
                           />
                        </div>
                     </>
                  )}




               {
                  formRefType !== 'form-reply-multi-type' &&
                  pageSheetTypeName === 'page-cvi' &&
                  (
                     <>
                        <div style={{ display: 'flex', marginBottom: 10 }}>
                           <div style={{ marginRight: 30 }}>
                              <div style={{ marginBottom: 10 }}>
                                 <CheckboxStyled
                                    onChange={() => setIsCostImplication(true)}
                                    checked={isCostImplication}
                                 >Variation with cost implication</CheckboxStyled>
                              </div>
                              <div>
                                 <CheckboxStyled
                                    onChange={() => setIsTimeExtension(true)}
                                    checked={isTimeExtension}
                                 >With time extension</CheckboxStyled>
                              </div>
                           </div>
                           <div>
                              <div style={{ marginBottom: 10 }}>
                                 <CheckboxStyled
                                    onChange={() => setIsCostImplication(false)}
                                    checked={!isCostImplication}
                                 >With no cost implication</CheckboxStyled>
                              </div>
                              <div>
                                 <CheckboxStyled
                                    onChange={() => setIsTimeExtension(false)}
                                    checked={!isTimeExtension}
                                 >With no time extension</CheckboxStyled>
                              </div>
                           </div>
                        </div>
                        {/* <div>This form is issued pursuant to the Conditions of Contract and also constitutes our notification of an event which may form the basis of a possible claim for additional costs or an extension of time or both.</div> */}
                     </>
                  )}


               {
                  formRefType === 'form-reply-multi-type' &&
                  pageSheetTypeName === 'page-rfam' &&
                  (
                     <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Status</div>
                        <SelectTradeStyled
                           style={{ width: 400 }}
                           showSearch
                           optionFilterProp='children'
                           onChange={(value) => setConsultantReplyStatus(value)}
                           filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                           }
                           suffixIcon={<div></div>}
                        >
                           {[
                              'Reject and resubmit',
                              'Approved with comments, to Resubmit',
                              'Approved with Comment, no submission Required',
                              'Approved for Construction'
                           ].map(status => (
                              <Select.Option key={status} value={status}>{status}</Select.Option>
                           ))}
                        </SelectTradeStyled>
                     </div>
                  )}




               <br /><br />

               <div style={{ display: 'flex', marginBottom: 5 }}>
                  {formRefType === 'form-reply-multi-type' && (
                     <Upload
                        name='file' accept='application/pdf' multiple={false} showUploadList={false}
                        headers={{ authorization: 'authorization-text' }}
                        beforeUpload={() => { return false }}
                        onChange={onChangeUploadFormCoverForReply}
                     >
                        <ButtonStyle
                           marginRight={5}
                           name='Upload Reply Form'
                        />
                     </Upload>
                  )}




                  {formRefType === 'form-submit-multi-type' && (
                     <>
                        <Upload
                           name='file' accept='application/pdf' multiple={true} showUploadList={false}
                           headers={{ authorization: 'authorization-text' }}
                           beforeUpload={() => { return false }}
                           onChange={onChangeUploadPdfDrawing}
                        >
                           <ButtonStyle
                              marginRight={5}
                              name='Upload Documents'
                           />
                        </Upload>

                        {pageSheetTypeName !== 'page-mm' && (
                           <ButtonStyle
                              marginRight={10}
                              name='Add Drawings From RFA'
                              onClick={() => setTablePickDrawingRefSubmitted(true)}
                           />
                        )}
                     </>

                  )}


                  <div style={{ marginLeft: 5 }}>
                     {formRefType !== 'form-reply-multi-type' ? (
                        <>
                           {filesPdfDrawing ? `${Object.keys(filesPdfDrawing).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                           / {filesPdfDrawing ? `${Object.keys(filesPdfDrawing).length} 3D models has been chosen.` : 'No 3D model has been chosen.'}
                        </>
                     ) : (
                        <>
                           {filesPdfDrawing ? `${Object.keys(filesPdfDrawing).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                        </>
                     )}
                  </div>
               </div>


               {(
                  Object.keys(filesPdfDrawing).length > 0 ||
                  Object.keys(fileFormCoverReply).length > 0 ||
                  dwgsImportFromRFA.length > 0
               ) && (
                     <div style={{
                        width: window.innerWidth * 0.9 - 80,
                        height: (Object.keys(filesPdfDrawing).length + dwgsImportFromRFA.length) * 28 + 80
                     }}>
                        <TableStyled
                           fixed
                           columns={generateColumnsListDwgRef(headersDwgRef(pageSheetTypeName), nosColumnFixed)}
                           data={dataInputForTable}
                           rowHeight={28}
                        />
                     </div>
                  )}


            </div>


            <div style={{
               padding: 20,
               display: 'flex',
               flexDirection: 'row-reverse'
            }}>
               <ButtonGroupComp
                  onClickCancel={() => setModalConfirmsubmitOrCancel('cancel')}
                  onClickApply={() => setModalConfirmsubmitOrCancel('ok')}
                  newTextBtnApply={formRefType === 'form-reply-multi-type' ? 'Submit' : 'Create Form & Email For Signature'}

                  onClickApplyAdditional01={() => setModalConfirmsubmitOrCancel('download')}
                  newTextBtnApplyAdditional01={formRefType === 'form-reply-multi-type' ? null : 'Create Form & Download Pdf'}
               />
            </div>


         </div>


         {tablePickDrawingRefSubmitted && (
            <ModalStyled
               title={'Select Drawings For New RFA'}
               visible={tablePickDrawingRefSubmitted}
               footer={null}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.85}
               onOk={() => setTablePickDrawingRefSubmitted(false)}
               onCancel={() => setTablePickDrawingRefSubmitted(false)}
            >
               <TableDrawingRfaForMultiForm
                  // onClickCancelModalPickDrawing={() => setTablePickDrawingRefSubmitted(false)}
                  onClickApplyModalPickRfaDrawings={(dwgsRfaToAdd) => {
                     setDwgsImportFromRFA(dwgsRfaToAdd);
                     setTablePickDrawingRefSubmitted(false);
                  }}
                  dwgsImportFromRFA={dwgsImportFromRFA}
               />
            </ModalStyled>
         )}


         {modalConfirmsubmitOrCancel && formRefType && (
            <ModalStyled
               title={modalConfirmsubmitOrCancel === 'ok' ? 'Confirm Submission'
                  : modalConfirmsubmitOrCancel === 'download' ? 'Download Form Pdf'
                     : 'Cancel Submission'
               }
               visible={modalConfirmsubmitOrCancel !== null ? true : false}
               footer={null}
               destroyOnClose={true}
               centered={true}
            >
               <ConfirmSubmitOrCancelModal
                  typeConfirm={modalConfirmsubmitOrCancel}
                  formRefType={formRefType}
                  refData={formRefType.includes('form-submit-multi-')
                     ? `${refType.toUpperCase()}/${projectNameShort}/${tradeForFirstTimeSubmit}/${refNumberSuffixFirstTimeSubmit}`
                     : formRefType.includes('form-resubmit-multi-')
                        ? `${currentRefNumber}${refNewVersionResubmitSuffix}`
                        : formRefType.includes('form-reply-multi-')
                           ? `${currentRefNumber}` : null}
                  onClickCancelConfirmModal={() => setModalConfirmsubmitOrCancel(null)}
                  onClickApplyConfirmModal={(confirmFinal) => {
                     if (confirmFinal === 'Cancel Action Form') {
                        setModalConfirmsubmitOrCancel(null);
                        onClickCancelModal();
                     } else {
                        onClickApplyDoneFormRef(confirmFinal);
                     };
                  }}
               />
            </ModalStyled>
         )}

      </>
   );
};

export default PanelAddNewMultiForm;


const getInputForTable = (fileFormCoverReply, filesPdfDrawing, dwgsImportFromRFA) => {
   let output = [];
   if (fileFormCoverReply) {
      for (const pdfDrawing in fileFormCoverReply) {
         output.push({
            id: mongoObjectId(),
            'Type': 'Form Cover',
            'File Name': pdfDrawing
         });
      };
   };

   if (filesPdfDrawing) {
      for (const pdfDrawing in filesPdfDrawing) {
         output.push({
            id: mongoObjectId(),
            'Type': 'Drawing',
            'File Name': pdfDrawing
         });
      };
   };

   if (dwgsImportFromRFA && dwgsImportFromRFA.length > 0) {
      dwgsImportFromRFA.forEach(row => {
         output.push(row);
      });
   };

   return output;
};

const CellRemoveDrawing = (props) => {

   const { onClickRemoveDwgBtn, rowData } = props;

   return (
      <Tooltip title='Remove File'>
         <Icon type='close' onClick={() => onClickRemoveDwgBtn(rowData)} />
      </Tooltip>
   );
};



const ConfirmSubmitOrCancelModal = ({ typeConfirm, formRefType, refData, onClickCancelConfirmModal, onClickApplyConfirmModal }) => {

   return (
      <div style={{ padding: 20, width: '100%' }}>
         {typeConfirm === 'ok' ? (
            <div>Are you sure to {formRefType === 'form-reply-multi-type' ? 'reply' : 'submit'} the <span style={{ fontWeight: 'bold' }}>{refData}</span>?</div>
         ) : typeConfirm === 'download' ? (
            <div>Are you sure to download Pdf form ?</div>
         ) : typeConfirm === 'cancel' ? (
            <div>Are you sure to cancel the {formRefType === 'form-reply-multi-type' ? 'response' : 'submission'}?</div>
         ) : null}

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelConfirmModal}
               onClickApply={() => onClickApplyConfirmModal(typeConfirm === 'ok' ? 'action-multiform-email' : typeConfirm === 'download' ? 'action-multiform-download' : 'Cancel Action Form')}
               newTextBtnApply={'Yes'}
            />
         </div>
      </div>
   );
};


const ModalStyled = styled(Modal)`
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


const getHeaderWidthDwgRef = (header) => {
   if (header === 'Type') return 350;
   else if (header === 'File Name') return 500;
   else return 50;
};



const CheckboxStyled = styled(Checkbox)`
   .ant-checkbox-inner {
      border-radius: 0;
      border: none;
      background: ${colorType.primary}
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
   transform: translateY(-5px);
   color: black;
   border-top: none;
   border-right: none;
   border-left: none;
   border-radius: 0;
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

const TimePickerStyled = styled(TimePicker)`
   transform: translateY(-5px);
   .ant-time-picker-input {
      border-radius: 0;
      border-top: none;
      border-right: none;
      border-left: none;
      outline: none;
      box-shadow: none;
      &:focus {
         outline: none;
         box-shadow: none;
      };
      width: 110px;
   };
   .anticon {
      transform: translateX(-10px);
   }
`;


const DatePickerStyled = styled(DatePicker)`
   transform: translateY(-5px);
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
      };
      width: 110px;
   };
`;


const SelectTradeStyled = styled(Select)`
   transform: translateY(-5px);
   width: 60px;
   cursor: alias;

   .ant-select-selection__rendered {
      padding: 0;
      margin: 0;
      margin-left: 10px;
   };
   .ant-select-selection {
      border-radius: 0;
      border-top: none;
      border-right: none;
      border-left: none;
      outline: none;
      box-shadow: none;
      &:focus {
         outline: none;
         box-shadow: none;
      };
   }
`;




const headersDwgRef = (pageSheetTypeName) => {

   return pageSheetTypeName === 'page-rfa' ? [
      'Drawing Number',
      'Drawing Name',
      'Coordinator In Charge',
      'Rev',
      'File PDF',
      '3D Model'

   ] : [
      'Type',
      'File Name',
   ];
};

// export const findTradeOfDrawing = (row, dwgTypeTree) => {
//    let output;
//    const parentNode = dwgTypeTree.find(x => x.id === row._parentRow);
//    if (parentNode) {
//       output = getTradeNameFnc(parentNode, dwgTypeTree);
//    };
//    return output;
// };

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
export const convertTradeCodeMeetingMinutesInverted = (trade) => {
   if (trade === 'PRO') return 'PROJECT PROGRESS MEETING';
   if (trade === 'TEC') return 'TECHNICAL MEETING';
   if (trade === 'ICE') return 'ICE MEETING';
};
