import { DatePicker, Icon, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import Column from 'antd/lib/table/Column';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer } from 'react-base-table';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc, mongoObjectId, validateEmailInput } from '../../utils';
import ButtonGroupComp from './ButtonGroupComp';
import ButtonStyle from './ButtonStyle';



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


const PanelAddNewMultiForm = ({ onClickCancelModal, onClickApplyAddNewRFA }) => {


   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany: { role, company: companyUser }, companies, listUser, email, listGroup, projectNameShort: projectNameShortText, pageSheetTypeName } = stateProject.allDataOneSheet;
   const projectNameShort = projectNameShortText || 'NO-PROJECT-NAME';

   const { rowsAll, loading, currentRefToAddNewOrReplyOrEdit, rowsRfamAll, rowsRfamAllInit, drawingTypeTreeDmsView } = stateRow;

   const {
      currentRfaNumber, currentRfaRef, currentRfaData, formRefType, isFormEditting,
      isAdminAction, isAdminActionWithNoEmailSent, adminActionConsultantToReply,
   } = currentRefToAddNewOrReplyOrEdit || {};

   // const company = (formRefType === 'form-reply-RFA' && isAdminAction && adminActionConsultantToReply) ? adminActionConsultantToReply : companyUser;


   const listRecipient = (
      isAdminAction &&
      isAdminActionWithNoEmailSent &&
      (formRefType === 'form-submit-multi-type' || formRefType === 'form-resubmit-multi-type')
   )
      ? [...listUser, ...listGroup].filter(x => !validateEmailInput(x))
      : [...listUser, ...listGroup];


   const listConsultants = companies.filter(x => x.companyType === 'Consultant');


   const [refNumberSuffixFirstTimeSubmit, setRefNumberSuffixFirstTimeSubmit] = useState('');

   // const [rfaNewVersionResubmitSuffix, setRfaNewVersionResubmitSuffix] = useState('');

   const [tradeForFirstTimeSubmit, setTradeForFirstTimeSubmit] = useState('');

   const [dateReplyForSubmitForm, setDateReplyForSubmitForm] = useState(null);

   const [tablePickDrawingRFA, setTablePickDrawingRFA] = useState(false);
   // 
   // const [dwgIdToAddComment, setIdToDwgAddComment] = useState(null);
   // const [nosColumnFixed, setNosColumnFixed] = useState(1);
   // const [commentText, setCommentText] = useState('');

   const [filesPDFForm, setFilesPDFForm] = useState(null);
   const [filesPDFDrawing, setFilesPDFDrawing] = useState(null);
   const [dwgsImportFromRFA, setDwgsImportFromRFA] = useState(null);


   

   getInputForTable(filesPDFForm, filesPDFDrawing);


   const [listRecipientTo, setListRecipientTo] = useState([]);
   const [listRecipientCc, setListRecipientCc] = useState([]);

   const [listConsultantMustReply, setListConsultantMustReply] = useState([]);
   const [requestedBy, setRequestedBy] = useState(email);

   const [textEmailTitle, setTextEmailTitle] = useState('');

   const [description, setDescription] = useState('');



   useEffect(() => {
      if (formRefType === 'form-submit-multi-type') {
         if (!isFormEditting) {
   //          setDwgsImportFromRFA(null);
            setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));

         } else {
   //          const rowsToEdit = rowsRfaAllInit.filter(x => currentRfaRef === x['RFA Ref']);
   //          const oneRowInRfa = rowsToEdit[0];
   //          const rowsToEditClone = rowsToEdit.map(x => ({ ...x }));
   //          rowsToEditClone.forEach(r => {
   //             const dwgLink = r[`submission-$$$-drawing-${company}`];
   //             r[`submission-$$$-drawing-${company}`] = /[^/]*$/.exec(dwgLink)[0];
   //          });
   //          setDwgsImportFromRFA(rowsToEditClone);

   //          const listEmailTo = getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailTo', company) || [];
   //          setListRecipientTo([...new Set(listEmailTo)]);

   //          const listEmailCc = getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailCc', company) || [];
   //          setListRecipientCc([...new Set(listEmailCc)]);


   //          setListConsultantMustReply(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'consultantMustReply', company) || []);
   //          setRequestedBy(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'requestedBy', company) || '');
   //          setTextEmailTitle(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailTitle', company) || '');
   //          setDescription(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailAdditionalNotes', company) || '');

   //          setDateReplyForSubmitForm(moment(oneRowInRfa['Consultant Reply (T)'], 'DD/MM/YY'));
   //          setTradeForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'trade', company)));

   //          const rfaNumberSuffixPrevious = /[^/]*$/.exec(currentRfaRef)[0];
   //          setRefNumberSuffixFirstTimeSubmit(rfaNumberSuffixPrevious);
         };
   //    } else if (formRefType === 'form-resubmit-RFA') {
   //       if (!isFormEditting) {
   //          const dwgsToResubmit = rowsRfaAllInit.filter(dwg => {
   //             return dwg.rfaNumber === currentRfaNumber &&
   //                !dwg['RFA Ref'];
   //          });


   //          setDwgsImportFromRFA(dwgsToResubmit.map(x => ({ ...x })));

   //          const listEmailTo = currentRfaData[`submission-$$$-emailTo-${company}`] || [];
   //          setListRecipientTo([...new Set(listEmailTo)]);

   //          const listEmailCc = currentRfaData[`submission-$$$-emailCc-${company}`] || [];
   //          setListRecipientCc([...new Set(listEmailCc)]);


   //          setListConsultantMustReply(currentRfaData[`submission-$$$-consultantMustReply-${company}`]);
   //          setRequestedBy(currentRfaData[`submission-$$$-requestedBy-${company}`]);


   //          const versionAlreadySubmit = rowsRfaAllInit
   //             .filter(dwg => dwg.rfaNumber === currentRfaNumber && dwg['RFA Ref'])
   //             .map(x => x['RFA Ref']);

   //          const versionTextAlreadySubmitArr = versionAlreadySubmit.map(rfaNum => {
   //             return rfaNum.slice(currentRfaNumber.length, rfaNum.length);
   //          });
   //          const versionLeft = versionArray.filter(x => versionTextAlreadySubmitArr.indexOf(x) === -1);
   //          setRfaNewVersionResubmitSuffix(versionLeft[0]);

   //          const oneDwg = dwgsToResubmit[0];
   //          setTextEmailTitle('Resubmit - ' + oneDwg[`submission-$$$-emailTitle-${company}`]);
   //          setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));
   //       } else {

   //          const rowsToEdit = rowsRfaAllInit.filter(x => currentRfaRef === x['RFA Ref']);
   //          const oneRowInRfa = rowsToEdit[0];
   //          const rowsToEditClone = rowsToEdit.map(x => ({ ...x }));
   //          rowsToEditClone.forEach(r => {
   //             const dwgLink = r[`submission-$$$-drawing-${company}`];
   //             r[`submission-$$$-drawing-${company}`] = /[^/]*$/.exec(dwgLink)[0];
   //          });

   //          const versionTextSuffix = currentRfaRef.slice(currentRfaNumber.length, currentRfaRef.length);
   //          setRfaNewVersionResubmitSuffix(versionTextSuffix);

   //          setDwgsImportFromRFA(rowsToEditClone);

   //          const listEmailTo = getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailTo', company) || [];
   //          setListRecipientTo([...new Set(listEmailTo)]);

   //          const listEmailCc = getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailCc', company) || [];
   //          setListRecipientCc([...new Set(listEmailCc)]);

   //          setListConsultantMustReply(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'consultantMustReply', company) || []);
   //          setRequestedBy(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'requestedBy', company) || '');
   //          setTextEmailTitle(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailTitle', company) || '');
   //          setDescription(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'emailAdditionalNotes', company) || '');

   //          setDateReplyForSubmitForm(moment(oneRowInRfa['Consultant Reply (T)'], 'DD/MM/YY'));
   //          setTradeForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(oneRowInRfa, 'submission', 'trade', company)));

   //          const rfaNumberSuffixPrevious = /[^/]*$/.exec(currentRfaRef)[0];
   //          setRefNumberSuffixFirstTimeSubmit(rfaNumberSuffixPrevious);

   //       };
   //    } else if (formRefType === 'form-reply-RFA') {

   //       if (!isFormEditting) {
   //          const dwgsNotReplyYet = rowsRfaAllInit.filter(dwg => {
   //             return dwg.rfaNumber === currentRfaNumber &&
   //                dwg['RFA Ref'] === currentRfaRef &&
   //                !currentRfaData[`reply-$$$-status-${company}`];
   //          });

   //          setDwgsImportFromRFA(dwgsNotReplyYet.map(x => ({ ...x })));

   //          let arrEmailCc = [];
   //          for (const key in currentRfaData) {
   //             if (key.includes('submission-$$$-user-')) {
   //                const listEmailTo = currentRfaData[key] ? [currentRfaData[key]] : [];
   //                setListRecipientTo([...new Set(listEmailTo)]);

   //             } else if (key.includes('submission-$$$-emailTo-') || key.includes('submission-$$$-emailCc-')) {
   //                arrEmailCc = [...new Set([...arrEmailCc, ...currentRfaData[key]])];
   //             };
   //          };
   //          setListRecipientCc([...new Set(arrEmailCc)]);
   //          const oneDwg = dwgsNotReplyYet[0];
   //          const keyEmailTitle = getInfoKeyFromRfaData(oneDwg, 'submission', 'emailTitle');
   //          setTextEmailTitle('Reply - ' + oneDwg[keyEmailTitle]);

   //       } else {
   //          const dwgsToEditReply = rowsRfaAllInit.filter(x => currentRfaRef === x['RFA Ref']);
   //          const oneRowInRfa = dwgsToEditReply[0];
   //          const dwgsToEditReplyClone = dwgsToEditReply.map(x => ({ ...x }));
   //          dwgsToEditReplyClone.forEach(r => {
   //             const dwgLink = r[`reply-$$$-drawing-${company}`];
   //             r[`reply-$$$-drawing-${company}`] = /[^/]*$/.exec(dwgLink)[0];
   //          });
   //          setDwgsImportFromRFA(dwgsToEditReplyClone);

   //          const listEmailTo = getInfoValueFromRfaData(oneRowInRfa, 'reply', 'emailTo', company) || [];
   //          setListRecipientTo([...new Set(listEmailTo)]);

   //          const listEmailCc = getInfoValueFromRfaData(oneRowInRfa, 'reply', 'emailCc', company) || [];
   //          setListRecipientCc([...new Set(listEmailCc)]);

   //          setTextEmailTitle(getInfoValueFromRfaData(oneRowInRfa, 'reply', 'emailTitle', company) || '');
   //          setDescription(getInfoValueFromRfaData(oneRowInRfa, 'reply', 'emailAdditionalNotes', company) || '');
   //       };
      };
   }, []);


   useEffect(() => {
      if (tradeForFirstTimeSubmit && formRefType === 'form-submit-multi-type' && !isFormEditting) {

         const allRefNumberUnderThisTrade = rowsRfamAllInit.filter(r => r.trade === convertTradeCodeInverted(tradeForFirstTimeSubmit));

         let refNumberExtracted = [... new Set(allRefNumberUnderThisTrade.map(x => /[^/]*$/.exec(x['rfamRef'])[0]))];

         refNumberExtracted = refNumberExtracted
            .filter(x => x.length === 3 && parseInt(x) > 0)
            .map(x => parseInt(x));

         if (refNumberExtracted.length > 0) {
            const lastNumber = Math.max(...refNumberExtracted);
            const suggestedNewRfaNumber = lastNumber + 1;
            const suggestedNewRfaNumberConverted = suggestedNewRfaNumber.toString();
            const suggestedNewRfaNumberString = suggestedNewRfaNumberConverted.length === 3 ? suggestedNewRfaNumberConverted
               : suggestedNewRfaNumberConverted.length === 2 ? '0' + suggestedNewRfaNumberConverted
                  : '00' + suggestedNewRfaNumberConverted;

            setRefNumberSuffixFirstTimeSubmit(suggestedNewRfaNumberString);

         } else {
            setRefNumberSuffixFirstTimeSubmit('001');
         };

      };
   }, [tradeForFirstTimeSubmit]);


   // useEffect(() => {
   //    if (!loading) {
   //       setModalConfirmsubmitOrCancel(null);
   //    };
   // }, [loading]);




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
   //    if (filesPDFDrawing && Object.keys(filesPDFDrawing).length > 0) {
   //       const type = formRefType === 'form-reply-RFA' ? 'reply' : 'submission';
   //       const dwgsToAddNewRfaClone = dwgsImportFromRFA.map(x => ({ ...x }));
   //       Object.keys(filesPDFDrawing).forEach(key => {
   //          const filePdfName = key.slice(0, key.length - 4);
   //          dwgsToAddNewRfaClone.forEach(row => {
   //             if (row['Drawing Number'] && (row['Drawing Number'].includes(filePdfName) || filePdfName.includes(row['Drawing Number']))) {
   //                row[`${type}-$$$-drawing-${company}`] = key;
   //             };
   //          });
   //       });
   //       setDwgsImportFromRFA(dwgsToAddNewRfaClone);
   //    };
   // }, [filesPDFDrawing]);






   // const onClickApplyModalPickDrawing = (drawingTrade, dwgIds) => {
   //    if (dwgIds && dwgIds.length > 0) {
   //       const dwgsToAdd = rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1);
   //       setDwgsImportFromRFA(dwgsToAdd);
   //       const dwgFound = dwgsToAdd.find(x => x['Coordinator In Charge']);
   //       if (dwgFound) {
   //          setRequestedBy(dwgFound['Coordinator In Charge']);
   //       };
   //       setTradeForFirstTimeSubmit(convertTradeCode(drawingTrade));
   //    };
   //    setTablePickDrawingRFA(false);
   // };
   // const setRevisionDwg = (id, rev) => {
   //    const row = dwgsImportFromRFA.find(x => x.id === id);
   //    row['Rev'] = rev;
   //    setDwgsImportFromRFA([...dwgsImportFromRFA]);
   // };
   const setDwgsImportFromRef = debounceFnc((id) => {
      // setDwgsImportFromRFA(dwgsImportFromRFA.filter(x => x.id !== id));
      // setNosColumnFixed(2);
      // setNosColumnFixed(1);
   }, 1);


   // const onClickCommentBtn = (id) => {
   //    setIdToDwgAddComment(id);
   // };


   const onBlurInputRefNameCreateNew = () => {
      const arr = [...new Set(rowsRfamAllInit.map(x => (x['rfamRef'] || '')))];

      if (formRefType === 'form-submit-multi-type') {
         if (!isFormEditting) {
            const newRefToRaiseFirstSubmit = `RFAM/${projectNameShort}/${tradeForFirstTimeSubmit}/${refNumberSuffixFirstTimeSubmit}`;
            if (arr.indexOf(newRefToRaiseFirstSubmit) !== -1) {
               message.info('This RFA number has already existed, please choose a new number!');
               setRefNumberSuffixFirstTimeSubmit('');
            };
         } else {
            // const arrFilter = arr.filter(x => x !== currentRfaRef);
            // const newRefToRaiseFirstSubmit = `RFA/${projectNameShort}/${tradeForFirstTimeSubmit || '____'}/${refNumberSuffixFirstTimeSubmit}`;
            // if (arrFilter.indexOf(newRefToRaiseFirstSubmit) !== -1) {
            //    message.info('This RFA number has already existed, please choose a new number!');
            //    setRefNumberSuffixFirstTimeSubmit('');
            // };
         };
      } else if (formRefType === 'form-resubmit-multi-type') {
         // if (!isFormEditting) {
         //    const newRfaToRaiseResubmit = `${currentRfaNumber}${rfaNewVersionResubmitSuffix}`;
         //    if (arr.indexOf(newRfaToRaiseResubmit) !== -1) {
         //       message.info('This RFA number has already existed, please choose a new number!');
         //       setRfaNewVersionResubmitSuffix('');
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

   const onChangeUploadPDFDrawing = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { ...output, [file.name]: file };
         });
         setFilesPDFDrawing(output);
      };

      // const dwgsToAddNewRFAClone = dwgsImportFromRFA.map(x => ({ ...x }));
      // dwgsToAddNewRFAClone.forEach(r => {
      //    r[`${formRefType === 'form-reply-RFA' ? 'reply' : 'submission'}-$$$-drawing-${company}`] = '';
      // });
      // setDwgsImportFromRFA(dwgsToAddNewRFAClone);
   };

   const onChangeUploadPDFForm = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { ...output, [file.name]: file };
         });
         setFilesPDFForm(output);
      };



      // const dwgsToAddNewRFAClone = dwgsImportFromRFA.map(x => ({ ...x }));
      // dwgsToAddNewRFAClone.forEach(r => {
      //    r[`${formRefType === 'form-reply-RFA' ? 'reply' : 'submission'}-$$$-drawing-${company}`] = '';
      // });
      // setDwgsImportFromRFA(dwgsToAddNewRFAClone);
   };

   // const onChangeUploadFileDWFX = (info) => {
   //    if (info.fileList) {
   //       let output = {};
   //       let canUploadFile = true;
   //       info.fileList.forEach(file => {
   //          output = { ...output, [file.name]: file };
   //          if (file.size > 1000 * 1000 * 100) {
   //             canUploadFile = false;
   //          };
   //       });

   //       if (!canUploadFile) {
   //          message.warn('File size should be less than 100MB!');
   //       } else {
   //          setFilesDWFX(output);
   //       };
   //    };
   // };


   const onClickTagRecipientTo = (email) => {
      let outputListConsultantMustReply = [...listConsultantMustReply];
      const consultantName = extractConsultantName(email);

      const originConsultant = listConsultants.find(x => x.company === consultantName);
      outputListConsultantMustReply = outputListConsultantMustReply.filter(x => x !== consultantName);

      if (originConsultant && formRefType === 'form-submit-multi-type') {
         outputListConsultantMustReply.unshift(originConsultant.company);
         message.info(`Lead consultant: ${outputListConsultantMustReply[0]}`);

      } else if (originConsultant && formRefType === 'form-rsubmit-multi-type') {
         outputListConsultantMustReply.push(originConsultant.company);
      };
      setListConsultantMustReply(outputListConsultantMustReply);
   };

   // const onClickApplyDoneFormRFA = () => {
   //    if (!dwgsImportFromRFA || dwgsImportFromRFA.length === 0) {
   //       return message.info('Please insert drawings to submit!', 3);
   //    };

   //    let isAllDataInRowFilledIn = true;
   //    let listFilePdf;
   //    if (formRefType === 'form-submit-RFA' || formRefType === 'form-resubmit-RFA') {
   //       dwgsImportFromRFA.forEach(r => {
   //          if (!r['Rev'] || !r[`submission-$$$-drawing-${company}`]) {
   //             isAllDataInRowFilledIn = false;
   //          };
   //       });
   //       listFilePdf = dwgsImportFromRFA.map(r => r[`submission-$$$-drawing-${company}`]);
   //    } else if (formRefType === 'form-reply-RFA') {
   //       dwgsImportFromRFA.forEach(r => {
   //          if (!r[`reply-$$$-status-${company}`] || !r[`reply-$$$-drawing-${company}`]) {
   //             isAllDataInRowFilledIn = false;
   //          };
   //       });
   //       listFilePdf = dwgsImportFromRFA.map(r => r[`reply-$$$-drawing-${company}`]);
   //    };

   //    const dwgPdfFile = [...new Set(listFilePdf)];


   //    let trade, rfaToSaveVersionOrToReply, rfaToSave;
   //    if (formRefType === 'form-submit-RFA') {
   //       trade = convertTradeCodeInverted(tradeForFirstTimeSubmit);
   //       rfaToSaveVersionOrToReply = '-';
   //       rfaToSave = `RFA/${projectNameShort}/${tradeForFirstTimeSubmit}/${refNumberSuffixFirstTimeSubmit}`;

   //    } else if (formRefType === 'form-resubmit-RFA') { // resubmission
   //       trade = getInfoValueFromRfaData(currentRfaData, 'submission', 'trade');
   //       rfaToSaveVersionOrToReply = rfaNewVersionResubmitSuffix;
   //       rfaToSave = currentRfaNumber;

   //    } else if (formRefType === 'form-reply-RFA') { // reply
   //       trade = getInfoValueFromRfaData(currentRfaData, 'submission', 'trade');
   //       if (currentRfaNumber === currentRfaRef) {
   //          rfaToSaveVersionOrToReply = '-';
   //       } else {
   //          rfaToSaveVersionOrToReply = currentRfaRef.slice(currentRfaNumber.length, currentRfaRef.length);
   //       };
   //       rfaToSave = currentRfaNumber;
   //    };


   //    if (projectNameShort === 'NO-PROJECT-NAME') {
   //       return message.info('Please update project abbreviation name for RFA number!', 3);
   //    } else if (!isAllDataInRowFilledIn) {
   //       return message.info('Please fill in all necessary info for all drawings!', 3);
   //    } else if (dwgsImportFromRFA.length !== dwgPdfFile.length) {
   //       return message.info('Different drawings can not attach same Pdf file!', 3);
   //    } else if (!filesPDFDrawing && !isFormEditting) {
   //       return message.info('Please choose file pdf!', 3);
   //    } else if (!textEmailTitle && !isAdminActionWithNoEmailSent) {
   //       return message.info('Please fill in email title!', 3);
   //    } else if (!listRecipientTo || listRecipientTo.length === 0) {
   //       return message.info('Please fill in recipient!', 3);
   //    } else if (formRefType === 'form-submit-RFA' && !dateReplyForSubmitForm) {
   //       return message.info('Please fill in expected reply date!', 3);
   //    } else if (formRefType === 'form-submit-RFA' && listConsultantMustReply.length === 0) {
   //       return message.info('Please fill in consultant lead', 3);
   //    } else if (formRefType === 'form-submit-RFA' && !requestedBy) {
   //       return message.info('Please fill in person requested', 3);
   //    } else if (!trade || !rfaToSave || !rfaToSaveVersionOrToReply) {
   //       return message.info('Please fill in necessary info!', 3);
   //    };


   //    const filesPDFOutput = {};
   //    filesPDFDrawing && Object.keys(filesPDFDrawing).forEach(key => {
   //       let fileFound;
   //       if (formRefType === 'form-reply-RFA') {
   //          fileFound = dwgsImportFromRFA.find(x => x[`reply-$$$-drawing-${company}`] === key);
   //       } else {
   //          fileFound = dwgsImportFromRFA.find(x => x[`submission-$$$-drawing-${company}`] === key);
   //       };
   //       if (fileFound) {
   //          filesPDFOutput[key] = filesPDFDrawing[key];
   //       };
   //    });

   //    const filesDWFXOutput = {};
   //    filesDWFX && Object.keys(filesDWFX).forEach(key => {
   //       const found = dwgsImportFromRFA.find(x => x[`submission-$$$-dwfxName-${company}`] === key);
   //       if (found && !filesDWFXOutput[key]) {
   //          filesDWFXOutput[key] = filesDWFX[key];
   //       };
   //    });


   //    getSheetRows({ ...stateRow, loading: true });

   //    onClickApplyAddNewRFA({
   //       type: formRefType,
   //       isFormEditting,
   //       trade,
   //       filesPDFDrawing: (filesPDFOutput && Object.values(filesPDFOutput)) || [],
   //       filesDWFX: (filesDWFXOutput && Object.values(filesDWFXOutput)) || [],
   //       dwgsImportFromRFA: dwgsImportFromRFA.map(x => ({ ...x })),
   //       rfaToSave, rfaToSaveVersionOrToReply,
   //       recipient: {
   //          to: isAdminActionWithNoEmailSent ? [] : [...new Set(listRecipientTo)],
   //          cc: isAdminActionWithNoEmailSent ? [] : [...new Set(listRecipientCc)]
   //       },
   //       listConsultantMustReply: formRefType === 'form-reply-RFA' ? [] : [...listConsultantMustReply],
   //       requestedBy: formRefType === 'form-reply-RFA' ? '' : requestedBy,
   //       emailTextTitle: isAdminActionWithNoEmailSent ? '' : textEmailTitle,
   //       emailTextAdditionalNotes: isAdminActionWithNoEmailSent ? '' : description,
   //       dateReplyForsubmitForm: dateReplyForSubmitForm && dateReplyForSubmitForm.format('DD/MM/YY'),

   //       isAdminActionWithNoEmailSent,
   //       adminActionConsultantToReply,
   //       isAdminAction
   //    });
   // };


   const generateColumnsListDwgRef = (headers) => {

      const buttonRemoveDrawing = [
         {
            key: 'action', dataKey: 'action', title: '',
            width: 40,
            frozen: Column.FrozenDirection.RIGHT,
            cellRenderer: (
               <CellRemoveDrawing
                  setDwgsImportFromRef={setDwgsImportFromRef}
               />
            )
         }
      ];

      return [
         {
            key: 'index', dataKey: 'index', title: '', width: 40,
            frozen: Column.FrozenDirection.LEFT,
            cellRenderer: ({ rowIndex }) => <div>{rowIndex + 1}</div>
         },
         ...headers.map((column, index) => ({
            key: column, dataKey: column, title: column,
            resizable: true,
            frozen: index < 1 ? Column.FrozenDirection.LEFT : undefined,
            width: getHeaderWidthDwgRef(column),
            cellRenderer: (props) => (
               <div>xxx</div>
            )
         })),
         ...buttonRemoveDrawing,
      ];
   };


   return (
      <>
         <div style={{ background: 'white', width: '100%', padding: 10, color: 'black' }}>
            <div style={{
               padding: 20, paddingRight: 10,
               borderBottom: `1px solid ${colorType.grey4}`,
            }}>
               <div style={{ display: 'flex', marginBottom: 10 }}>
                  <div style={{ marginRight: 10, fontWeight: 'bold' }}>RFAM Number</div>
                  {formRefType === 'form-submit-multi-type' ? (
                     <>
                        <div style={{ marginRight: 2 }}>
                           {`RFAM/${projectNameShort}/`}

                           <SelectTradeStyled
                              showSearch
                              style={{ width: 200 }}
                              optionFilterProp='children'
                              onChange={(value) => setTradeForFirstTimeSubmit(value)}
                              filterOption={(input, option) =>
                                 option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              }
                              suffixIcon={<div></div>}
                           >
                              {['ARC', 'CS', 'ME', 'PC'].map(trade => (
                                 <Select.Option key={trade} value={trade}>{trade}</Select.Option>
                              ))}
                           </SelectTradeStyled>
                           {`/`}
                        </div>
                        {tradeForFirstTimeSubmit ? (
                           <InputStyled
                              style={{ width: 50, marginBottom: 10, borderRadius: 0, marginRight: 120, transform: 'translateY(-5px)' }}
                              onChange={(e) => setRefNumberSuffixFirstTimeSubmit(e.target.value)}
                              onBlur={onBlurInputRefNameCreateNew}
                              value={refNumberSuffixFirstTimeSubmit}
                           />
                        ) : (
                           <div style={{ marginRight: 120 }}>
                              <Tooltip title='Ref number automatically filled in after selecting trade'>{'____'}</Tooltip>
                           </div>
                        )}
                     </>
                  ) : null}
                  
                  {/* formRefType === 'form-resubmit-RFA' ? (
                     <>
                        <div style={{ marginRight: 2 }}>{currentRfaNumber}</div>
                        <InputStyled
                           style={{ width: 50, marginBottom: 10, borderRadius: 0, marginRight: 120, transform: 'translateY(-5px)' }}
                           onChange={(e) => setRfaNewVersionResubmitSuffix(e.target.value)}
                           onBlur={onBlurInputRefNameCreateNew}
                           value={rfaNewVersionResubmitSuffix}
                        />
                     </>

                  ) : formRefType === 'form-reply-RFA' ? (
                     <div>{currentRfaRef}</div>

                  ) : null} */}


                  {formRefType !== 'form-reply-multi-type' && (
                     <>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date Reply</div>
                        <DatePickerStyled
                           style={{ width: 110, transform: 'translateY(-5px)' }}
                           value={dateReplyForSubmitForm}
                           format={'DD/MM/YY'}
                           onChange={(e) => setDateReplyForSubmitForm(e)}
                        />
                     </>
                  )}


{/* 
                  {formRefType === 'form-reply-RFA' && adminActionConsultantToReply && (
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
                                 if (!isLeadConsultantIncluded) message.warning('Email loop must include lead consultant!');

                                 const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                                 if (
                                    itemJustRemoved &&
                                    listConsultantMustReply.find(x => x === extractConsultantName(itemJustRemoved)) &&
                                    !list.find(tg => extractConsultantName(tg) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved))
                                 ) {
                                    setListConsultantMustReply(listConsultantMustReply.filter(x => x !== extractConsultantName(itemJustRemoved)));
                                 };

                              } else if (formRefType === 'form-resubmit-multi-type') {
                                 const consultantLeadFromPreviousSubmission = listConsultantMustReply[0];
                                 const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                                 if (
                                    itemJustRemoved &&
                                    listConsultantMustReply.find(x => x === extractConsultantName(itemJustRemoved)) &&
                                    consultantLeadFromPreviousSubmission !== extractConsultantName(itemJustRemoved) &&
                                    !list.find(tg => extractConsultantName(tg) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved))
                                 ) {
                                    setListConsultantMustReply(listConsultantMustReply.filter(x => x !== extractConsultantName(itemJustRemoved)));
                                 };
                              };
                              setListRecipientTo([...new Set(list)]);
                           }}
                        >
                           {listRecipient.map(cm => {
                              const isLeadConsultant = listConsultantMustReply[0] && extractConsultantName(cm) === listConsultantMustReply[0];
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
                                       onClick={(e) => onClickTagRecipientTo(cm)}
                                    >
                                       {textShown}
                                    </div>
                                 </Option>
                              )
                           })}
                        </SelectRecipientStyled>

                        {formRefType !== 'form-reply-RFA' && (
                           <div style={{ display: 'flex', marginTop: 5, marginBottom: 10 }}>
                              <div style={{ marginRight: 8 }}>Lead consultant :</div>
                              <div style={{ fontWeight: 'bold', marginRight: 10 }}>{listConsultantMustReply[0] || ''}</div>
                              {formRefType === 'form-submit-RFA' && (
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



             {formRefType !== 'form-reply-multi-type' && (
                  <>
                     <div style={{ display: 'flex', marginBottom: 5 }}>
                        <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 15 }}>Requested by</div>
                        <InputStyled
                           style={{ width: 250, marginBottom: 10, borderRadius: 0 }}
                           onChange={(e) => setRequestedBy(e.target.value)}
                           value={requestedBy}
                        />
                     </div>
                  </>
               )}


                {!isAdminActionWithNoEmailSent && (
                  <>
                     <div style={{ display: 'flex', marginBottom: 20 }}>
                        <div style={{ width: 65, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold' }}>Subject</div>
                        <InputStyled
                           style={{ width: '90%', marginBottom: 10, borderRadius: 0 }}
                           onChange={(e) => setTextEmailTitle(e.target.value)}
                           value={textEmailTitle}
                        />
                     </div>

                     <br />

                     <div style={{ display: 'flex', marginBottom: 20 }}>
                        <div style={{ width: 90, marginRight: 20, transform: 'translateY(5px)', fontWeight: 'bold', marginBottom: 10 }}>Description</div>
                        <TextAreaStyled
                           style={{
                              width: '85%',
                              marginBottom: 10,
                              borderRadius: 0,
                           }}
                           rows={3}
                           onChange={(e) => setDescription(e.target.value)}
                           value={description}
                           placeholder='Write note...'
                        />
                     </div>
                  </>
               )}



               <div style={{ display: 'flex', marginBottom: 5 }}>

                  <Upload
                     name='file' accept='application/pdf' multiple={false} showUploadList={false}
                     headers={{ authorization: 'authorization-text' }}
                     beforeUpload={() => { return false }}
                     onChange={onChangeUploadPDFForm}
                  >
                     <ButtonStyle
                        marginRight={5}
                        name='Upload Form'
                     />
                  </Upload>

                  <Upload
                     name='file' accept='application/pdf' multiple={true} showUploadList={false}
                     headers={{ authorization: 'authorization-text' }}
                     beforeUpload={() => { return false }}
                     onChange={onChangeUploadPDFDrawing}
                  >
                     <ButtonStyle
                        marginRight={5}
                        name='Upload Drawing'
                     />
                  </Upload>

                  {formRefType === 'form-submit-multi-type' && !isFormEditting && (
                     <ButtonStyle
                        marginRight={10}
                        name='Add Drawing From RFA'
                        onClick={() => setTablePickDrawingRFA(true)}
                     />
                  )}


                  <div style={{ marginLeft: 5 }}>
                     {formRefType !== 'form-reply-RFA' ? (
                        <>
                           {filesPDFDrawing ? `${Object.keys(filesPDFDrawing).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                              / {filesPDFDrawing ? `${Object.keys(filesPDFDrawing).length} 3D models has been chosen.` : 'No 3D model has been chosen.'}
                        </>
                     ) : (
                        <>
                           {filesPDFDrawing ? `${Object.keys(filesPDFDrawing).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                        </>
                     )}
                  </div>
               </div>


             {(filesPDFForm || filesPDFDrawing || dwgsImportFromRFA) && (
                  <div style={{
                     width: window.innerWidth * 0.9 - 80,
                     // height: dwgsImportFromRFA.length * 28 + 80
                     height: 600
                  }}>
                     <TableStyled
                        fixed
                        columns={generateColumnsListDwgRef(headersDwgRef(formRefType))}
                        data={getInputForTable(filesPDFForm, filesPDFDrawing)}
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
                  // onClickCancel={() => setModalConfirmsubmitOrCancel('cancel')}
                  // onClickApply={() => setModalConfirmsubmitOrCancel('ok')}
                  onClickCancel={() => {}}
                  onClickApply={() => {}}
                  newTextBtnApply={'Submit'}
               />
            </div>


         </div>


         {/* {tablePickDrawingRFA && (
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
                  dwgsImportFromRFA={dwgsImportFromRFA}
                  tradeForFirstTimeSubmit={tradeForFirstTimeSubmit}
               />
            </ModalPickDrawingRFAStyled>
         )} */}

{/*
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
                     defaultValue={dwgsImportFromRFA.find(x => x.id === dwgIdToAddComment)[`reply-$$$-comment-${company}`] || ''}
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
                  formRefType={formRefType}
                  rfaRef={formRefType === 'form-submit-RFA'
                     ? `RFA/${projectNameShort}/${tradeForFirstTimeSubmit || '____'}/${refNumberSuffixFirstTimeSubmit}`
                     : formRefType === 'form-resubmit-RFA'
                        ? `${currentRfaNumber}${rfaNewVersionResubmitSuffix}`
                        : formRefType === 'form-reply-RFA'
                           ? `${currentRfaRef}` : null}
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
         )}*/}
      </>
   );
};
export default PanelAddNewMultiForm;


const getInputForTable = (filesPDFForm, filesPDFDrawing) => {
   let output = [];
   if (filesPDFForm) {
      for (const pdfForm in filesPDFForm) {
         output.push({
            id: mongoObjectId(),
            'Type': 'Form',
            'File Name': pdfForm
         });
      };
   };
   
   if (filesPDFDrawing) {
      for (const pdfDrawing in filesPDFDrawing) {
         output.push({
            id: mongoObjectId(),
            'Type': 'Drawing',
            'File Name': pdfDrawing
         });
      };
   };
   return output;
};

const CellRemoveDrawing = (props) => {

   // const { setDwgsImportFromRef, rowData } = props;

   const onClickRemoveDwgBtn = () => {
      // setDwgsImportFromRef(rowData.id);
   };

   return (
      <Tooltip title='Remove Drawing'>
         <Icon type='close' onClick={onClickRemoveDwgBtn} />
      </Tooltip>
   );
};



// const ConfirmSubmitOrCancelModal = ({ typeConfirm, formRefType, rfaRef, onClickCancelConfirmModal, onClickApplyConfirmModal }) => {

//    return (
//       <div style={{ padding: 20, width: '100%' }}>
//          {typeConfirm === 'ok' ? (
//             <div>Are you sure to {formRefType === 'form-reply-RFA' ? 'reply' : 'submit'} the <span style={{ fontWeight: 'bold' }}>{rfaRef}</span>?</div>
//          ) : typeConfirm === 'cancel' ? (
//             <div>Are you sure to cancel the {formRefType === 'form-reply-RFA' ? 'response' : 'submission'}?</div>
//          ) : null}

//          <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
//             <ButtonGroupComp
//                onClickCancel={onClickCancelConfirmModal}
//                onClickApply={() => onClickApplyConfirmModal(typeConfirm === 'ok' ? 'Submit' : 'Cancel Action Form')}
//                newTextBtnApply={'Yes'}
//             />
//          </div>
//       </div>
//    );
// };


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
const getHeaderWidthDwgRef = (header) => {
   if (header === 'Type') return 350;
   else if (header === 'File Name') return 250
   else return 50;
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


const SelectTradeStyled = styled(Select)`


`;




const headersDwgRef = (pageSheetTypeName) => {
   return pageSheetTypeName === 'page-rfam' ? [
      'Type',
      'File Name',
   ] : [
      'Drawing Number',
      'Drawing Name',
      'Coordinator In Charge',
      'Rev',
      'File PDF',
      '3D Model'
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
