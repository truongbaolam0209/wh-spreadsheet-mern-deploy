import { DatePicker, Icon, Input, message, Modal, Select, Tooltip, Upload } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import styled from 'styled-components';
import { colorType, EDIT_DURATION_MIN } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc, validateEmailInput } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import ButtonStyle from '../generalComponents/ButtonStyle';
import { checkIfEditTimeRfaIsOver, getInfoValueFromRfaData } from './CellRFA';
import { getTradeNameFnc } from './FormDrawingTypeOrder';
import TableDrawingRFA from './TableDrawingRFA';


const { Option } = Select;
const { TextArea } = Input;


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


const PanelAddNewRFA = ({ onClickCancelModal, onClickApplyAddNewRFA }) => {


   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const {
      roleTradeCompany: { company: companyUser }, companies, listUser,
      listGroup: listGroupOutput, projectNameShort: projectNameShortText, isBothSideActionUser
   } = stateProject.allDataOneSheet;

   const projectNameShort = projectNameShortText || 'NO-PROJECT-NAME';

   const { rowsAll, loading, currentRefToAddNewOrReplyOrEdit, rowsRfaAllInit } = stateRow;

   const {
      currentRefData, formRefType, isFormEditting,
      isBothSideActionUserWithNoEmailSent, consultantNameToReplyByBothSideActionUser,
   } = currentRefToAddNewOrReplyOrEdit || {};


   const company = (formRefType === 'form-reply-RFA' && isBothSideActionUser && consultantNameToReplyByBothSideActionUser)
      ? consultantNameToReplyByBothSideActionUser
      : companyUser;

   const listConsultants = companies.filter(x => x.companyType === 'Consultant');


   const listGroup = (isBothSideActionUser && isBothSideActionUserWithNoEmailSent)
      ? getGroupCompanyForBothSideActionUserSubmitWithoutEmail(listGroupOutput, listConsultants)
      : listGroupOutput;


   const listRecipient = (isBothSideActionUser && isBothSideActionUserWithNoEmailSent)
      ? getGroupCompanyForBothSideActionUserSubmitWithoutEmail(listGroupOutput, listConsultants)
      : [...listUser, ...listGroupOutput];



   const [rfaNumberSuffixFirstTimeSubmit, setRfaNumberSuffixFirstTimeSubmit] = useState('');
   const [rfaNewVersionResubmitSuffix, setRfaNewVersionResubmitSuffix] = useState('');
   const [tradeOfRfaForFirstTimeSubmit, setTradeOfRfaForFirstTimeSubmit] = useState(null);
   const [mepSubTradeFirstTime, setMepSubTradeFirstTime] = useState(null);


   const [dateReplyForSubmitForm, setDateReplyForSubmitForm] = useState(null);

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

   const [modalConfirmsubmitOrCancel, setModalConfirmsubmitOrCancel] = useState(null);

   const [dateSendThisForm, setDateSendThisForm] = useState(null);


   useEffect(() => {
      if (formRefType === 'form-submit-RFA') {
         if (!isFormEditting) {

            setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));

            if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
               setDateSendThisForm(moment(moment().format('DD/MM/YY'), 'DD/MM/YY'));
            };

         } else {
            const rowsInThisRef = rowsRfaAllInit.filter(x => currentRefData['RFA Ref'] === x['RFA Ref']);
            rowsInThisRef.forEach(r => {
               r[`submission-$$$-drawing-${company}`] = /[^/]*$/.exec(r[`submission-$$$-drawing-${company}`] || '')[0];
            });
            setDwgsToAddNewRFA(rowsInThisRef);

            const dateSendNoEmail = getInfoValueFromRfaData(currentRefData, 'submission', 'dateSendNoEmail');

            if (dateSendNoEmail) {
               const listConsultantMustReply = getInfoValueFromRfaData(currentRefData, 'submission', 'consultantMustReply') || [];
               setListRecipientTo(listConsultantMustReply.map(cmp => `${cmp}_%$%_`));
               setDateSendThisForm(moment(moment(getInfoValueFromRfaData(currentRefData, 'submission', 'date')).format('DD/MM/YY'), 'DD/MM/YY'));
            } else {
               setListRecipientTo([...new Set(getInfoValueFromRfaData(currentRefData, 'submission', 'emailTo') || [])]);
            };

            setListRecipientCc([...new Set(getInfoValueFromRfaData(currentRefData, 'submission', 'emailCc') || [])]);
            setTextEmailTitle(getInfoValueFromRfaData(currentRefData, 'submission', 'emailTitle') || '');
            setTextEmailAdditionalNotes(getInfoValueFromRfaData(currentRefData, 'submission', 'emailAdditionalNotes') || '');


            setListConsultantMustReply(getInfoValueFromRfaData(currentRefData, 'submission', 'consultantMustReply') || []);
            setRequestedBy(getInfoValueFromRfaData(currentRefData, 'submission', 'requestedBy') || '');
            setDateReplyForSubmitForm(moment(currentRefData['Consultant Reply (T)'], 'DD/MM/YY'));
            setTradeOfRfaForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(currentRefData, 'submission', 'trade')));
            setMepSubTradeFirstTime(getInfoValueFromRfaData(currentRefData, 'submission', 'subTradeForMep'));
            setRfaNumberSuffixFirstTimeSubmit(/[^/]*$/.exec(currentRefData['RFA Ref'])[0]);
         };

      } else if (formRefType === 'form-resubmit-RFA') {
         if (!isFormEditting) {
            const dwgsToResubmit = rowsRfaAllInit.filter(dwg => {
               return dwg.rfaNumber === currentRefData['rfaNumber'] && !dwg['RFA Ref'];
            });
            setDwgsToAddNewRFA(dwgsToResubmit);

            if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
               const listConsultantMustReply = getInfoValueFromRfaData(currentRefData, 'submission', 'consultantMustReply') || [];
               setListRecipientTo(listConsultantMustReply.map(cmp => `${cmp}_%$%_`));
               setDateSendThisForm(moment(moment().format('DD/MM/YY'), 'DD/MM/YY'));
            } else {
               setListRecipientTo([...new Set(getInfoValueFromRfaData(currentRefData, 'submission', 'emailTo') || [])]);
            };

            setListRecipientCc([...new Set(getInfoValueFromRfaData(currentRefData, 'submission', 'emailCc') || [])]);
            setTextEmailTitle('Resubmit - ' + getInfoValueFromRfaData(currentRefData, 'submission', 'emailTitle') || '');

            setListConsultantMustReply(getInfoValueFromRfaData(currentRefData, 'submission', 'consultantMustReply') || []);
            setRequestedBy(getInfoValueFromRfaData(currentRefData, 'submission', 'requestedBy') || '');
            setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));


            const versionAlreadySubmit = rowsRfaAllInit
               .filter(dwg => dwg.rfaNumber === currentRefData['rfaNumber'] && dwg['RFA Ref'])
               .map(x => x['RFA Ref']);

            const versionTextAlreadySubmitArr = versionAlreadySubmit.map(rfaNum => {
               return rfaNum.slice(currentRefData['rfaNumber'].length, rfaNum.length);
            });
            const versionLeft = versionArray.filter(x => versionTextAlreadySubmitArr.indexOf(x) === -1);
            setRfaNewVersionResubmitSuffix(versionLeft[0]);


            setTradeOfRfaForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(currentRefData, 'submission', 'trade')));
            setMepSubTradeFirstTime(getInfoValueFromRfaData(currentRefData, 'submission', 'subTradeForMep'));

         } else {
            const rowsInThisRef = rowsRfaAllInit.filter(x => currentRefData['RFA Ref'] === x['RFA Ref']);
            rowsInThisRef.forEach(r => {
               r[`submission-$$$-drawing-${company}`] = /[^/]*$/.exec(r[`submission-$$$-drawing-${company}`] || '')[0];
            });
            setDwgsToAddNewRFA(rowsInThisRef);

            const versionTextSuffix = currentRefData['RFA Ref'].slice(currentRefData['rfaNumber'].length, currentRefData['RFA Ref'].length);
            setRfaNewVersionResubmitSuffix(versionTextSuffix);


            const dateSendNoEmail = getInfoValueFromRfaData(currentRefData, 'submission', 'dateSendNoEmail');

            if (dateSendNoEmail) {
               const listConsultantMustReply = getInfoValueFromRfaData(currentRefData, 'submission', 'consultantMustReply') || [];
               setListRecipientTo(listConsultantMustReply.map(cmp => `${cmp}_%$%_`));
               setDateSendThisForm(moment(moment(getInfoValueFromRfaData(currentRefData, 'submission', 'date')).format('DD/MM/YY'), 'DD/MM/YY'));
            } else {
               setListRecipientTo([...new Set(getInfoValueFromRfaData(currentRefData, 'submission', 'emailTo') || [])]);
            };

            setListRecipientCc([...new Set(getInfoValueFromRfaData(currentRefData, 'submission', 'emailCc') || [])]);
            setTextEmailTitle(getInfoValueFromRfaData(currentRefData, 'submission', 'emailTitle') || '');
            setTextEmailAdditionalNotes(getInfoValueFromRfaData(currentRefData, 'submission', 'emailAdditionalNotes') || '');


            setListConsultantMustReply(getInfoValueFromRfaData(currentRefData, 'submission', 'consultantMustReply') || []);
            setRequestedBy(getInfoValueFromRfaData(currentRefData, 'submission', 'requestedBy') || '');
            setDateReplyForSubmitForm(moment(currentRefData['Consultant Reply (T)'], 'DD/MM/YY'));


            setTradeOfRfaForFirstTimeSubmit(convertTradeCode(getInfoValueFromRfaData(currentRefData, 'submission', 'trade')));
            setMepSubTradeFirstTime(getInfoValueFromRfaData(currentRefData, 'submission', 'subTradeForMep'));

         };

      } else if (formRefType === 'form-reply-RFA') {

         if (!isFormEditting) {

            const dwgsInThisRfaNotReplyYet = rowsRfaAllInit.filter(dwg => {
               return dwg['RFA Ref'] === currentRefData['RFA Ref'] && !getInfoValueFromRfaData(currentRefData, 'reply', 'status', company);
            });
            setDwgsToAddNewRFA(dwgsInThisRfaNotReplyYet);

            setListRecipientTo([getInfoValueFromRfaData(currentRefData, 'submission', 'user')]);

            setListRecipientCc([...new Set([
               ...(getInfoValueFromRfaData(currentRefData, 'submission', 'emailTo') || []),
               ...(getInfoValueFromRfaData(currentRefData, 'submission', 'emailCc') || []),
            ])]);

            setTextEmailTitle('Reply - ' + getInfoValueFromRfaData(currentRefData, 'submission', 'emailTitle') || '');

            if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
               setDateSendThisForm(moment(moment().format('DD/MM/YY'), 'DD/MM/YY'));
            };

         } else {

            const dwgsToEditReply = rowsRfaAllInit.filter(x => currentRefData['RFA Ref'] === x['RFA Ref']);

            dwgsToEditReply.forEach(r => {
               r[`reply-$$$-drawing-${company}`] = /[^/]*$/.exec(r[`reply-$$$-drawing-${company}`])[0];
            });
            setDwgsToAddNewRFA(dwgsToEditReply);

            setListRecipientTo([...new Set(getInfoValueFromRfaData(currentRefData, 'reply', 'emailTo', company) || [])]);
            setListRecipientCc([...new Set(getInfoValueFromRfaData(currentRefData, 'reply', 'emailCc', company) || [])]);

            setTextEmailTitle(getInfoValueFromRfaData(currentRefData, 'reply', 'emailTitle', company) || '');
            setTextEmailAdditionalNotes(getInfoValueFromRfaData(currentRefData, 'reply', 'emailAdditionalNotes', company) || '');


            const dateSendNoEmail = getInfoValueFromRfaData(currentRefData, 'reply', 'dateSendNoEmail', company);

            if (dateSendNoEmail) {
               setDateSendThisForm(moment(moment(getInfoValueFromRfaData(currentRefData, 'reply', 'date', company)), 'DD/MM/YY'));
            } else {
               setTextEmailTitle(getInfoValueFromRfaData(currentRefData, 'reply', 'emailTitle', company) || '');
            };
         };
      };
   }, []);

   useEffect(() => {
      if (tradeOfRfaForFirstTimeSubmit && formRefType === 'form-submit-RFA' && !isFormEditting) {
         let filterRows = rowsRfaAllInit.filter(x => {
            return x.rfaNumber && x.rfaNumber.split('/')[2] === tradeOfRfaForFirstTimeSubmit;
         });
         if (tradeOfRfaForFirstTimeSubmit === 'ME') {
            filterRows = filterRows.filter(x => {
               return x.rfaNumber.split('/')[3] === mepSubTradeFirstTime;
            });
         };
         let rfaNumberExtracted = [...new Set(filterRows.map(x => /[^/]*$/.exec(x.rfaNumber)[0]))];
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
   }, [tradeOfRfaForFirstTimeSubmit, mepSubTradeFirstTime]);

   useEffect(() => {
      if (!loading) {
         setModalConfirmsubmitOrCancel(null);
      };
   }, [loading]);

   useEffect(() => {
      if (filesDWFX && Object.keys(filesDWFX).length > 0) {
         const dwgsToAddNewRfaClone = dwgsToAddNewRFA.map(x => ({ ...x }));
         let isFileDWFXsameNameFound = false;
         Object.keys(filesDWFX).forEach(key => {
            const fileDwfxName = key.slice(0, key.length - 5);
            dwgsToAddNewRfaClone.forEach(row => {
               if (row['Drawing Number'] && (
                  row['Drawing Number'].includes(fileDwfxName) ||
                  fileDwfxName.includes(row['Drawing Number'])
               )) {
                  row[`submission-$$$-dwfxName-${company}`] = key;
                  isFileDWFXsameNameFound = true;
               };
            });
         });

         if (!isFileDWFXsameNameFound) {
            const first3Dfile = Object.keys(filesDWFX)[0];
            dwgsToAddNewRfaClone.forEach(row => {
               row[`submission-$$$-dwfxName-${company}`] = first3Dfile;
            });
         };
         setDwgsToAddNewRFA(dwgsToAddNewRfaClone);
      };
   }, [filesDWFX]);


   useEffect(() => {
      if (filesPDF && Object.keys(filesPDF).length > 0) {
         const type = formRefType === 'form-reply-RFA' ? 'reply' : 'submission';
         const dwgsToAddNewRfaClone = dwgsToAddNewRFA.map(x => ({ ...x }));
         Object.keys(filesPDF).forEach(key => {
            const filePdfName = key.slice(0, key.length - 4);
            dwgsToAddNewRfaClone.forEach(row => {
               if (row['Drawing Number'] && (row['Drawing Number'].includes(filePdfName) || filePdfName.includes(row['Drawing Number']))) {
                  row[`${type}-$$$-drawing-${company}`] = key;
               };
            });
         });
         setDwgsToAddNewRFA(dwgsToAddNewRfaClone);
      };
   }, [filesPDF]);






   const onClickApplyModalPickDrawing = (formRefType, drawingTrade, drawingSubTrade, dwgIds) => {

      if (!dwgIds || dwgIds.length === 0) return;

      let dwgsToAdd = [];

      if (formRefType === 'form-submit-RFA') {
         dwgsToAdd = rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1);
         setDwgsToAddNewRFA(dwgsToAdd);
         setTradeOfRfaForFirstTimeSubmit(convertTradeCode(drawingTrade));
         if (drawingSubTrade) {
            setMepSubTradeFirstTime(drawingSubTrade);
         };

         const dwgsThisTrade = rowsRfaAllInit
            .filter(dwg => getInfoValueFromRfaData(dwg, 'submission', 'trade') === drawingTrade)
            .filter(dwg => {
               if (drawingSubTrade !== 'Select Sub Trade...') {
                  return dwg[`submission-$$$-subTradeForMep-${company}`] === drawingSubTrade;
               } else {
                  return true;
               };
            })
            .sort((b, a) => (a.rfaNumber > b.rfaNumber ? 1 : -1));


         if (listRecipientTo.length === 0) {
            const rowFoundTo = dwgsThisTrade.find(r => {
               return getInfoValueFromRfaData(r, 'submission', 'emailTo') &&
                  getInfoValueFromRfaData(r, 'submission', 'emailTo').length > 0;
            });
            if (rowFoundTo) {
               const consultantMustReplyArray = getInfoValueFromRfaData(rowFoundTo, 'submission', 'consultantMustReply') || [];

               if (isBothSideActionUser && isBothSideActionUserWithNoEmailSent) {
                  setListRecipientTo(consultantMustReplyArray.map(cmp => `${cmp}_%$%_`));
                  setListConsultantMustReply(consultantMustReplyArray);
               } else {
                  setListRecipientTo(getInfoValueFromRfaData(rowFoundTo, 'submission', 'emailTo') || []);
                  setListConsultantMustReply(consultantMustReplyArray);
               };
            };

         };

         if (listRecipientCc.length === 0) {
            const rowFoundCc = dwgsThisTrade.find(r => {
               return getInfoValueFromRfaData(r, 'submission', 'emailCc') &&
                  getInfoValueFromRfaData(r, 'submission', 'emailCc').length > 0;
            });
            if (rowFoundCc) {
               setListRecipientCc(getInfoValueFromRfaData(rowFoundCc, 'submission', 'emailCc') || []);
            };
         };

      } else if (formRefType === 'form-resubmit-RFA') {
         dwgsToAdd = rowsAll.filter(r => dwgIds.indexOf(r.id) !== -1);
         const dwgsToAddNewRfaClearNewRowsPrevious = dwgsToAddNewRFA.filter(r => r['rfaNumber']);
         setDwgsToAddNewRFA([...dwgsToAddNewRfaClearNewRowsPrevious, ...dwgsToAdd]);
      };


      const dwgFound = dwgsToAdd.find(x => x['Coordinator In Charge']);
      if (dwgFound) {
         setRequestedBy(dwgFound['Coordinator In Charge']);
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

   const onBlurInputRFANameCreateNew = () => {
      const arr = [...new Set(rowsRfaAllInit.map(x => (x['RFA Ref'] || '')))];
      if (formRefType === 'form-submit-RFA') {
         let regExp = /[a-zA-Z]/g;
         if (regExp.test(rfaNumberSuffixFirstTimeSubmit)) {
            message.info('Please key in number only!');
            setRfaNumberSuffixFirstTimeSubmit('');
         } else {

            const subTradeForMepDwg = (mepSubTradeFirstTime && mepSubTradeFirstTime !== 'Select Sub Trade...') ? `${mepSubTradeFirstTime}/` : '';
            if (!isFormEditting) {
               const newRfaToRaiseFirstSubmit = `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${subTradeForMepDwg}${rfaNumberSuffixFirstTimeSubmit}`;
               if (arr.indexOf(newRfaToRaiseFirstSubmit) !== -1) {
                  message.info('This RFA number has already existed, please choose a new number!');
                  setRfaNumberSuffixFirstTimeSubmit('');
               };
            } else {
               const arrFilter = arr.filter(x => x !== currentRefData['RFA Ref']);
               const newRfaToRaiseFirstSubmit = `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${subTradeForMepDwg}${rfaNumberSuffixFirstTimeSubmit}`;
               if (arrFilter.indexOf(newRfaToRaiseFirstSubmit) !== -1) {
                  message.info('This RFA number has already existed, please choose a new number!');
                  setRfaNumberSuffixFirstTimeSubmit('');
               };
            };
         };
      } else if (formRefType === 'form-resubmit-RFA') {
         if (versionArray.indexOf(rfaNewVersionResubmitSuffix) === -1) {
            message.info('Please key in letter only!');
            setRfaNewVersionResubmitSuffix('');
         } else {
            if (!isFormEditting) {
               const newRfaToRaiseResubmit = `${currentRefData['rfaNumber']}${rfaNewVersionResubmitSuffix}`;
               if (arr.indexOf(newRfaToRaiseResubmit) !== -1) {
                  message.info('This RFA number has already existed, please choose a new number!');
                  setRfaNewVersionResubmitSuffix('');
               };
            };
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
      const dwgsToAddNewRFAClone = dwgsToAddNewRFA.map(x => ({ ...x }));
      dwgsToAddNewRFAClone.forEach(r => {
         r[`${formRefType === 'form-reply-RFA' ? 'reply' : 'submission'}-$$$-drawing-${company}`] = '';
      });
      setDwgsToAddNewRFA(dwgsToAddNewRFAClone);
   };

   const onChangeUploadFileDWFX = (info) => {
      if (info.fileList) {
         let output = {};
         let canUploadFile = true;
         info.fileList.forEach(file => {
            output = { ...output, [file.name]: file };
            if (file.size > 1000 * 1000 * 100) {
               canUploadFile = false;
            };
         });

         if (!canUploadFile) {
            message.warn('File size should be less than 100MB!');
         } else {
            setFilesDWFX(output);
         };
      };
   };

   const onClickTagRecipientTo = (email, isRemoveTag) => {
      if (formRefType !== 'form-reply-RFA') {
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

   const onClickApplyDoneFormRFA = () => {

      if (isFormEditting) {
         if (
            ((formRefType === 'form-submit-RFA' || formRefType === 'form-resubmit-RFA') && checkIfEditTimeRfaIsOver(currentRefData, null, EDIT_DURATION_MIN, 'check-if-submission-edit-is-over') <= 0) ||
            (formRefType === 'form-reply-RFA' && checkIfEditTimeRfaIsOver(currentRefData, company, EDIT_DURATION_MIN, 'check-if-reply-edit-is-over') <= 0)
         ) {
            return message.info('Time is up, you are unable to edit the submission!', 2);
         };
      };



      if (!dwgsToAddNewRFA || dwgsToAddNewRFA.length === 0) {
         return message.info('Please insert drawings to submit!', 2);
      };

      let isAllDataInRowFilledIn = true;
      let listFilePdf;
      if (formRefType === 'form-submit-RFA' || formRefType === 'form-resubmit-RFA') {
         dwgsToAddNewRFA.forEach(r => {
            if (!r['Rev'] || !r[`submission-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
         listFilePdf = dwgsToAddNewRFA.map(r => r[`submission-$$$-drawing-${company}`]);
      } else if (formRefType === 'form-reply-RFA') {
         dwgsToAddNewRFA.forEach(r => {
            if (!r[`reply-$$$-status-${company}`] || !r[`reply-$$$-drawing-${company}`]) {
               isAllDataInRowFilledIn = false;
            };
         });
         listFilePdf = dwgsToAddNewRFA.map(r => r[`reply-$$$-drawing-${company}`]);
      };

      const dwgPdfFile = [...new Set(listFilePdf)];


      let trade, rfaToSaveVersionOrToReply, rfaToSave, mepSubTradeInfo;
      if (formRefType === 'form-submit-RFA') {
         trade = convertTradeCodeInverted(tradeOfRfaForFirstTimeSubmit);
         mepSubTradeInfo = (mepSubTradeFirstTime && mepSubTradeFirstTime !== 'Select Sub Trade...') ? mepSubTradeFirstTime : null;

         rfaToSaveVersionOrToReply = '-';
         if (tradeOfRfaForFirstTimeSubmit === 'ME') {
            rfaToSave = `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit}/${mepSubTradeInfo}/${rfaNumberSuffixFirstTimeSubmit}`;
         } else {
            rfaToSave = `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit}/${rfaNumberSuffixFirstTimeSubmit}`;
         };
      } else if (formRefType === 'form-resubmit-RFA') { // resubmission
         trade = getInfoValueFromRfaData(currentRefData, 'submission', 'trade');
         mepSubTradeInfo = getInfoValueFromRfaData(currentRefData, 'submission', 'subTradeForMep');

         rfaToSaveVersionOrToReply = rfaNewVersionResubmitSuffix;
         rfaToSave = currentRefData['rfaNumber'];

      } else if (formRefType === 'form-reply-RFA') { // reply
         trade = getInfoValueFromRfaData(currentRefData, 'submission', 'trade');
         mepSubTradeInfo = getInfoValueFromRfaData(currentRefData, 'submission', 'subTradeForMep');

         if (currentRefData['rfaNumber'] === currentRefData['RFA Ref']) {
            rfaToSaveVersionOrToReply = '-';
         } else {
            rfaToSaveVersionOrToReply = currentRefData['RFA Ref'].slice(currentRefData['rfaNumber'].length, currentRefData['RFA Ref'].length);
         };
         rfaToSave = currentRefData['rfaNumber'];
      };


      if (projectNameShort === 'NO-PROJECT-NAME') {
         return message.info('Please update project abbreviation name for RFA number!', 2);
      } else if (!isAllDataInRowFilledIn) {
         return message.info('Please fill in all necessary info for all drawings!', 2);
      } else if (dwgsToAddNewRFA.length !== dwgPdfFile.length) {
         return message.info('Different drawings can not attach same Pdf file!', 2);
      } else if (!filesPDF && !isFormEditting) {
         return message.info('Please choose file pdf!', 2);
      } else if (
         ((formRefType === 'form-submit-RFA' || formRefType === 'form-resubmit-RFA') && !textEmailTitle) ||
         (formRefType === 'form-reply-RFA' && !textEmailTitle && !isBothSideActionUserWithNoEmailSent)
      ) {
         return message.info('Please fill in email title!', 2);

      } else if ((!listRecipientTo || listRecipientTo.length === 0) && !isBothSideActionUserWithNoEmailSent) {
         return message.info('Please fill in recipient!', 2);

      } else if (formRefType === 'form-submit-RFA' && !dateReplyForSubmitForm) {
         return message.info('Please fill in expected reply date!', 2);

      } else if (formRefType === 'form-submit-RFA' && listConsultantMustReply.length === 0) {

         return message.info('Please fill in consultant lead', 2);
      } else if (formRefType === 'form-submit-RFA' && !requestedBy) {
         return message.info('Please fill in person requested', 2);
      } else if (!trade || !rfaToSave || !rfaToSaveVersionOrToReply) {
         return message.info('Please fill in necessary info!', 2);
      };


      const filesPDFOutput = {};
      filesPDF && Object.keys(filesPDF).forEach(key => {
         let fileFound;
         if (formRefType === 'form-reply-RFA') {
            fileFound = dwgsToAddNewRFA.find(x => x[`reply-$$$-drawing-${company}`] === key);
         } else {
            fileFound = dwgsToAddNewRFA.find(x => x[`submission-$$$-drawing-${company}`] === key);
         };
         if (fileFound) {
            filesPDFOutput[key] = filesPDF[key];
         };
      });

      const filesDWFXOutput = {};
      filesDWFX && Object.keys(filesDWFX).forEach(key => {
         const found = dwgsToAddNewRFA.find(x => x[`submission-$$$-dwfxName-${company}`] === key);
         if (found && !filesDWFXOutput[key]) {
            filesDWFXOutput[key] = filesDWFX[key];
         };
      });


      getSheetRows({ ...stateRow, loading: true });

      onClickApplyAddNewRFA({
         type: formRefType,
         isFormEditting,
         trade, mepSubTradeInfo,
         filesPDF: (filesPDFOutput && Object.values(filesPDFOutput)) || [],
         filesDWFX: (filesDWFXOutput && Object.values(filesDWFXOutput)) || [],
         dwgsToAddNewRFA: dwgsToAddNewRFA.map(x => ({ ...x })),
         rfaToSave, rfaToSaveVersionOrToReply,
         recipient: {
            to: isBothSideActionUserWithNoEmailSent ? [] : [...new Set(listRecipientTo)],
            cc: isBothSideActionUserWithNoEmailSent ? [] : [...new Set(listRecipientCc)]
         },
         listConsultantMustReply: formRefType === 'form-reply-RFA' ? [] : [...listConsultantMustReply],
         requestedBy: formRefType === 'form-reply-RFA' ? '' : requestedBy,
         emailTextTitle: textEmailTitle,
         emailTextAdditionalNotes: isBothSideActionUserWithNoEmailSent ? '' : textEmailAdditionalNotes,
         dateReplyForsubmitForm: dateReplyForSubmitForm && dateReplyForSubmitForm.format('DD/MM/YY'),
         dateSendThisForm,

         isBothSideActionUserWithNoEmailSent,
         consultantNameToReplyByBothSideActionUser,


      });
   };

   const generateColumnsListDwgRFA = (headers, nosColumnFixed) => {

      const buttonRemoveDrawing = !isFormEditting && (formRefType === 'form-submit-RFA' || formRefType === 'form-resubmit-RFA') ? [
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
            cellRenderer: (column === 'Rev' && formRefType !== 'form-reply-RFA') ? (
               <CellInputRevision
                  setRevisionDwg={setRevisionDwg}
                  rowsThisRFAWithRev={rowsRfaAllInit.filter(dwg => {
                     return currentRefData && dwg.rfaNumber === currentRefData['rfaNumber'] && dwg['Rev'];
                  })}
                  isFirstSubmission={formRefType === 'form-submit-RFA'}
               />
            ) : (column === 'Comment' && formRefType === 'form-reply-RFA') ? (
               <CellAddCommentDrawing
                  onClickCommentBtn={onClickCommentBtn}
                  company={company}
               />

            ) : (column === 'Status' && formRefType === 'form-reply-RFA') ? (
               <CellSelectStatus
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  company={company}
               />

            ) : (column === 'File PDF') ? (
               <CellSelectDrawingFile
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  filesPDF={filesPDF}
                  company={company}
                  formRefType={formRefType}
               />
            ) : (column === '3D Model') ? (
               <CellSelect3DFile
                  dwgsToAddNewRFA={dwgsToAddNewRFA}
                  setDwgsToAddNewRFA={setDwgsToAddNewRFA}
                  filesDWFX={filesDWFX}
                  company={company}
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
            color: 'black',
         }}>
            <div style={{
               padding: 20,
               paddingRight: 10,
               borderBottom: `1px solid ${colorType.grey4}`,
            }}>
               <div style={{ display: 'flex', marginBottom: 10 }}>
                  <div style={{ marginRight: 10, fontWeight: 'bold' }}>RFA Number</div>
                  {formRefType === 'form-submit-RFA' ? (
                     <>
                        <div style={{ marginRight: 2 }}>
                           {`RFA/${projectNameShort}/`}
                           <Tooltip title='Trade info automatically filled in after selecting drawings'>{tradeOfRfaForFirstTimeSubmit || '____'}</Tooltip>

                           {(mepSubTradeFirstTime && mepSubTradeFirstTime !== 'Select Sub Trade...') && (
                              <Tooltip title='Sub trade info automatically filled in after selecting drawings'>{'/' + mepSubTradeFirstTime}</Tooltip>
                           )}

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
                  ) : formRefType === 'form-resubmit-RFA' ? (
                     <>
                        <div style={{ marginRight: 2 }}>{currentRefData['rfaNumber']}</div>
                        <InputStyled
                           style={{ width: 50, marginBottom: 10, borderRadius: 0, marginRight: 120, transform: 'translateY(-5px)' }}
                           onChange={(e) => setRfaNewVersionResubmitSuffix(e.target.value)}
                           onBlur={onBlurInputRFANameCreateNew}
                           value={rfaNewVersionResubmitSuffix}
                        />
                     </>

                  ) : formRefType === 'form-reply-RFA' ? (
                     <div>{currentRefData['RFA Ref']}</div>

                  ) : null}


                  {(isBothSideActionUser && isBothSideActionUserWithNoEmailSent) && (
                     <div style={{ display: 'flex', marginRight: 40, marginLeft: 50 }}>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date Submission</div>
                        <DatePickerStyled
                           value={dateSendThisForm}
                           format={'DD/MM/YY'}
                           onChange={(e) => setDateSendThisForm(e)}
                        />
                     </div>
                  )}

                  {formRefType !== 'form-reply-RFA' && (
                     <div style={{ display: 'flex' }}>
                        <div style={{ marginRight: 10, fontWeight: 'bold' }}>Date Reply</div>
                        <DatePickerStyled
                           value={dateReplyForSubmitForm}
                           format={'DD/MM/YY'}
                           onChange={(e) => setDateReplyForSubmitForm(e)}
                        />
                     </div>
                  )}

                  {formRefType === 'form-reply-RFA' && consultantNameToReplyByBothSideActionUser && (
                     <div style={{ marginLeft: 20 }}>Company reply: <span style={{ fontWeight: 'bold' }}>{consultantNameToReplyByBothSideActionUser}</span></div>
                  )}

               </div>



               {!(isBothSideActionUser && isBothSideActionUserWithNoEmailSent && formRefType === 'form-reply-RFA') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                     <div style={{ transform: 'translateY(5px)', fontWeight: 'bold', marginRight: 5 }}>{isBothSideActionUserWithNoEmailSent ? 'Consultants' : 'To'}</div>
                     <div style={{ width: '95%' }}>
                        <SelectRecipientStyled
                           mode='tags'
                           placeholder={formRefType === 'form-submit-RFA' ? 'Please pick drawings first to get email list of previous submission...' : 'Please select...'}
                           value={listRecipientTo}

                           onChange={(list) => {

                              if (list.find(tag => !listGroup.find(x => x === tag) && !validateEmailInput(tag))) {
                                 return message.warning('Please choose an available group email or key in an email address!');
                              };

                              if (formRefType === 'form-submit-RFA') {
                                 let isLeadConsultantIncluded = false;
                                 list.forEach(tagCompany => {
                                    if (checkIfMatchWithInputCompanyFormat(tagCompany, listConsultants)) {
                                       isLeadConsultantIncluded = true;
                                    };
                                 });
                                 if (!isLeadConsultantIncluded) {
                                    message.warning('You must include lead consultant!');
                                 };

                                 const itemJustRemoved = listRecipientTo.find(x => !list.find(it => it === x));
                                 if (
                                    itemJustRemoved &&
                                    listConsultantMustReply.find(x => x === extractConsultantName(itemJustRemoved)) &&
                                    !list.find(tg => extractConsultantName(tg) && extractConsultantName(tg) === extractConsultantName(itemJustRemoved))
                                 ) {
                                    setListConsultantMustReply(listConsultantMustReply.filter(x => x !== extractConsultantName(itemJustRemoved)));
                                 };

                              } else if (formRefType === 'form-resubmit-RFA') {
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
                              const isLeadConsultantStyled = isLeadConsultant ? {
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
                                          padding: '0 5px',
                                       }}
                                       onClick={() => onClickTagRecipientTo(cm, false)}
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



               {!(isBothSideActionUser && isBothSideActionUserWithNoEmailSent) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                     <div style={{ transform: 'translateY(5px)', fontWeight: 'bold' }}>CC</div>
                     <div style={{ width: '95%' }}>
                        <SelectRecipientStyled
                           mode='tags'
                           placeholder={formRefType === 'form-submit-RFA' ? 'Please pick drawings first to get email list of previous submission...' : 'Please select...'}
                           value={listRecipientCc}
                           onChange={(list) => {
                              if (list.find(tag => !listGroup.find(x => x === tag) && !validateEmailInput(tag))) {
                                 return message.warning('Please choose an available group email or key in an email address!');
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



               {formRefType !== 'form-reply-RFA' && (
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

               {!(isBothSideActionUser && isBothSideActionUserWithNoEmailSent && formRefType === 'form-reply-RFA') && (
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
               )}

               {!isBothSideActionUserWithNoEmailSent && (
                  <>
                     <div style={{ paddingLeft: 100 }}>
                        <div style={{ paddingLeft: 0 }}>Dear All,</div>
                        {formRefType === 'form-reply-RFA' ? (
                           <div>
                              <span style={{ fontWeight: 'bold' }}>{company}</span> has replied this RFA, the drawings included in this RFA are in the list below.
                              Please review and update as per comments.
                           </div>
                        ) : (
                           <div>
                              <span style={{ fontWeight: 'bold' }}>{company}</span> has submitted <span style={{ fontWeight: 'bold' }}>
                                 {formRefType === 'form-resubmit-RFA'
                                    ? `${currentRefData['rfaNumber']}${rfaNewVersionResubmitSuffix}`
                                    : `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${(mepSubTradeFirstTime && mepSubTradeFirstTime !== 'Select Sub Trade...')
                                       ? `${mepSubTradeFirstTime}/`
                                       : ''
                                    }${rfaNumberSuffixFirstTimeSubmit}`}
                              </span> for you to review, the drawings included in this RFA are in the list below.
                              Please review and reply to us by <span style={{ fontWeight: 'bold' }}>{dateReplyForSubmitForm ? dateReplyForSubmitForm.format('DD/MM/YY') : ''}.</span>
                           </div>
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
                  </>
               )}



               <div style={{ display: 'flex', marginBottom: 5 }}>
                  {formRefType !== 'form-reply-RFA' && !isFormEditting && (
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

                  {formRefType !== 'form-reply-RFA' && (
                     <Upload
                        name='file' accept='.dwfx' multiple={true}
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


                  <div style={{ marginLeft: 5 }}>
                     {formRefType !== 'form-reply-RFA' ? (
                        <>
                           {filesPDF ? `${Object.keys(filesPDF).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                           / {filesDWFX ? `${Object.keys(filesDWFX).length} 3D models has been chosen.` : 'No 3D model has been chosen.'}
                        </>
                     ) : (
                        <>
                           {filesPDF ? `${Object.keys(filesPDF).length} PDF files has been chosen ` : 'No PDF files has been chosen '}
                        </>
                     )}
                  </div>
               </div>


               {dwgsToAddNewRFA && (
                  <div style={{
                     width: window.innerWidth * 0.9 - 80,
                     height: dwgsToAddNewRFA.length * 28 + 80
                  }}>
                     <TableStyled
                        fixed
                        columns={generateColumnsListDwgRFA(headersDwgRFA(formRefType), nosColumnFixed)}
                        data={dwgsToAddNewRFA}
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
                  newTextBtnApply={'Submit'}
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
                  formRefType={formRefType}
                  tradeOfRfaForFirstTimeSubmit={tradeOfRfaForFirstTimeSubmit}
                  mepSubTradeFirstTime={mepSubTradeFirstTime || 'Select Sub Trade...'}
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
                  formRefType={formRefType}
                  rfaRef={formRefType === 'form-submit-RFA'
                     ? `RFA/${projectNameShort}/${tradeOfRfaForFirstTimeSubmit || '____'}/${(mepSubTradeFirstTime && mepSubTradeFirstTime !== 'Select Sub Trade...')
                        ? `${mepSubTradeFirstTime}/`
                        : ''
                     }${rfaNumberSuffixFirstTimeSubmit}`
                     : formRefType === 'form-resubmit-RFA'
                        ? `${currentRefData['rfaNumber']}${rfaNewVersionResubmitSuffix}`
                        : formRefType === 'form-reply-RFA'
                           ? `${currentRefData['RFA Ref']}` : null}
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



const CellSelectDrawingFile = ({ filesPDF, rowData, dwgsToAddNewRFA, setDwgsToAddNewRFA, company, formRefType }) => {



   const pdfFileName = formRefType === 'form-reply-RFA'
      ? getInfoValueFromRfaData(rowData, 'reply', 'drawing', company)
      : getInfoValueFromRfaData(rowData, 'submission', 'drawing');

   const [value, setValue] = useState(pdfFileName || 'No PDF file');
   useEffect(() => {
      if (pdfFileName && pdfFileName !== 'No PDF file') {
         setValue(pdfFileName);
      } else {
         setValue('No PDF file');
      };
   }, [pdfFileName]);

   const onChangeFileAttached = (fileName, dwgId) => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgId);
      row[`${formRefType === 'form-reply-RFA' ? 'reply' : 'submission'}-$$$-drawing-${company}`] = fileName;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
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
         {(filesPDF && Object.keys(filesPDF) || []).map((fileName, i) => (
            <Select.Option key={fileName} value={fileName}>{fileName}</Select.Option>
         ))}
      </SelectStyled>
   );
};
const CellSelect3DFile = ({ filesDWFX, rowData, dwgsToAddNewRFA, setDwgsToAddNewRFA, company }) => {

   const dwfxFileName = getInfoValueFromRfaData(rowData, 'submission', 'dwfxName');
   const [value, setValue] = useState(dwfxFileName || 'No 3D model');

   useEffect(() => {
      if (dwfxFileName && dwfxFileName !== 'No 3D model') {
         setValue(dwfxFileName);
      };
   }, [dwfxFileName]);

   const onChangeFileAttached = (fileName, dwgId) => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgId);
      row[`submission-$$$-dwfxName-${company}`] = fileName === 'No 3D model' ? '' : fileName;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
   };

   return (
      <SelectStyled
         onChange={(fileName) => {
            onChangeFileAttached(fileName, rowData.id);
            setValue(fileName);
         }}
         value={value}
      >
         {(filesDWFX && [...Object.keys(filesDWFX), 'No 3D model'] || ['No 3D model']).map((fileName, i) => (
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

   const statusData = getInfoValueFromRfaData(rowData, 'reply', 'status', company);
   const [valueStatus, setValueStatus] = useState(statusData || '');
   useEffect(() => {
      if (statusData) {
         setValueStatus(statusData);
      } else {
         setValueStatus('');
      };
   }, [statusData]);


   const onChangeStatusReply = (status, dwgId) => {
      const row = dwgsToAddNewRFA.find(x => x.id === dwgId);
      row[`reply-$$$-status-${company}`] = status;
      setDwgsToAddNewRFA([...dwgsToAddNewRFA.map(dwg => ({ ...dwg }))]);
   };

   return (
      <SelectStyled
         placeholder='Select Status...'
         onChange={(status) => onChangeStatusReply(status, rowData.id)}
         value={valueStatus}
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

   const commentText = getInfoValueFromRfaData(rowData, 'reply', 'comment', company) || '';

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
const ConfirmSubmitOrCancelModal = ({ typeConfirm, formRefType, rfaRef, onClickCancelConfirmModal, onClickApplyConfirmModal }) => {

   return (
      <div style={{ padding: 20, width: '100%' }}>
         {typeConfirm === 'ok' ? (
            <div>Are you sure to {formRefType === 'form-reply-RFA' ? 'reply' : 'submit'} the <span style={{ fontWeight: 'bold' }}>{rfaRef}</span>?</div>
         ) : typeConfirm === 'cancel' ? (
            <div>Are you sure to cancel the {formRefType === 'form-reply-RFA' ? 'response' : 'submission'}?</div>
         ) : null}

         <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelConfirmModal}
               onClickApply={() => onClickApplyConfirmModal(typeConfirm === 'ok' ? 'Submit' : 'Cancel Action Form')}
               newTextBtnApply={'Yes'}
            />
         </div>
      </div>
   );
};
const getHeaderWidthDwgRFA = (header) => {
   if (header === 'File PDF') return 350;
   else if (header === 'Rev') return 50;
   else if (header === 'Status') return 350;
   else if (header === 'Drawing Number') return 250;
   else if (header === 'Drawing Name') return 420;
   else if (header === 'Comment') return 200;
   else if (header === 'Coordinator In Charge') return 200;
   else return 200;
};
const ModalConfirmStyled = styled(Modal)`
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
      justify-content: center;
   };
`;
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
   };
`;
const TextAreaStyled = styled(TextArea)`
   color: black;
   border-top: none;
   border-right: none;
   border-left: none;
   &:focus {
      outline: none;
      box-shadow: none;
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
   };
   .ant-select-selection__rendered {
      outline: none;
   };
`;
const SelectRecipientStyled = styled(Select)`
   width: 100%;
   .ant-select-selection__choice {
      margin-right: 5px;
      border: 1px solid ${colorType.grey1}
   };
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
      };
   };
   .ant-select-dropdown-menu-item .ant-select-dropdown-menu-item-selected {
      padding: 0;
   };
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



const headersDwgRFA = (formRefType) => {
   return formRefType === 'form-reply-RFA' ? [
      'Drawing Number',
      'Drawing Name',
      'Rev',
      'Status',
      'File PDF',
      'Comment',
   ] : [
      'Drawing Number',
      'Drawing Name',
      'Coordinator In Charge',
      'Rev',
      'File PDF',
      '3D Model'
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

export const getGroupCompanyForBothSideActionUserSubmitWithoutEmail = (listGroup, listConsultants) => {
   let output = [];
   listConsultants.forEach(cmp => {
      if (listGroup.find(x => x.includes(`${cmp.company}_%$%_`))) {
         output.push(`${cmp.company}_%$%_`);
      };
   });
   return [...new Set(output)];
};