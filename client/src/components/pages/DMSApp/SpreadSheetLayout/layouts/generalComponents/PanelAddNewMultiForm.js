import { Checkbox, DatePicker, Icon, Input, message, Modal, Select, TimePicker, Tooltip, Upload } from 'antd';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import BaseTable, { AutoResizer, Column } from 'react-base-table';
import styled from 'styled-components';
import { colorType, EDIT_DURATION_MIN, versionTextArray } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { debounceFnc, mongoObjectId, validateEmailInput } from '../../utils';
import { checkIfEditTimeIsOverMultiForm, getInfoValueFromRefDataForm } from '../pageSpreadsheet/CellForm';
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
      currentRefData, formRefType, isFormEditting,
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


   const [tradeForFirstTimeSubmit, setTradeForFirstTimeSubmit] = useState('');
   const [refNumberSuffixFirstTimeSubmit, setRefNumberSuffixFirstTimeSubmit] = useState('');
   const [refNewVersionResubmitSuffix, setRefNewVersionResubmitSuffix] = useState('');


   const [consultantReplyStatus, setConsultantReplyStatus] = useState('');
   const [fileReplyFormName, setFileReplyFormName] = useState('');
   const [fileFormCoverReply, setFileFormCoverReply] = useState({});


   const [submissionType, setSubmissionType] = useState('');

   const [dateReplyForSubmitForm, setDateReplyForSubmitForm] = useState(null);

   const [dateConversation, setDateConversation] = useState(null);
   const [timeConversation, setTimeConversation] = useState(null);

   const [tablePickDrawingRfaSubmitted, setTablePickDrawingRfaSubmitted] = useState(false);

   const [nosColumnFixed, setNosColumnFixed] = useState(1);


   const [filesPdfDrawing, setFilesPdfDrawing] = useState({});
   const [dwgsImportFromRFA, setDwgsImportFromRFA] = useState([]);
   const [dataInputForTable, setDataInputForTable] = useState([]);


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
      if (isFormEditting &&
         dwgsImportFromRFA.length === 0 &&
         Object.values(filesPdfDrawing).length === 0
      ) {
         const linkDrawingsData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'linkDrawings', company) || [];
         const linkDrawingsRfaData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'linkDrawingsRfa', company) || [];

         setDataInputForTable([
            ...linkDrawingsData.map(dwgLink => {
               return {
                  id: mongoObjectId(),
                  'File Name': /[^/]*$/.exec(dwgLink)[0],
                  'Type': 'Drawing',
               };
            }),
            ...linkDrawingsRfaData.map(dwgLink => {
               return {
                  id: mongoObjectId(),
                  'Drawing Number': /[^/]*$/.exec(dwgLink)[0],
               };
            })
         ]);
      } else {
         setDataInputForTable(getInputForTable(filesPdfDrawing, dwgsImportFromRFA));
      };
   }, [filesPdfDrawing, dwgsImportFromRFA]);


   useEffect(() => {
      if (Object.values(fileFormCoverReply).length > 0) {
         const file = Object.values(fileFormCoverReply)[0];
         setFileReplyFormName(file.name);
      };
   }, [fileFormCoverReply]);



   useEffect(() => {
      if (formRefType === 'form-submit-multi-type') {
         if (!isFormEditting) {
            setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));

         } else {
            const listRecipientToData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTo', company) || [];
            setListRecipientTo([...new Set(listRecipientToData)]);

            const listRecipientCcData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailCc', company) || [];
            setListRecipientCc([...new Set(listRecipientCcData)]);

            const listConsultantMustReplyData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'consultantMustReply', company) || [];
            setListConsultantMustReply(listConsultantMustReplyData);

            const requestedByData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'requestedBy', company) || '';
            setRequestedBy(requestedByData);

            const signaturedByData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'signaturedBy', company) || '';
            setSignaturedBy(signaturedByData);

            const textEmailTitleData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTitle', company) || '';
            setTextEmailTitle(textEmailTitleData);

            const descriptionData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'description', company) || '';
            setDescription(descriptionData);


            setConversationAmong(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'conversationAmong', company));
            setContractSpecification(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'contractSpecification', company));
            setProposedSpecification(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'proposedSpecification', company));
            setIsCostImplication(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'isCostImplication', company));
            setIsTimeExtension(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'isTimeExtension', company));
            setHerewithForDt(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'herewithForDt', company));
            setTransmittedForDt(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'transmittedForDt', company));
            setSubmissionType(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'submissionType', company));

            setTimeConversation(moment(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'timeConversation', company)));
            setDateConversation(moment(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'dateConversation', company)));

            setDateReplyForSubmitForm(moment(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'due', company)));
    
            setTradeForFirstTimeSubmit(convertTradeCode(currentRefData.trade));

            const refNumberSuffixFirstTimeSubmitData = /[^/]*$/.exec(currentRefData[refKey])[0];
            setRefNumberSuffixFirstTimeSubmit(refNumberSuffixFirstTimeSubmitData);

         };

      } else if (formRefType === 'form-resubmit-multi-type') {

         if (!isFormEditting) {

            setDateReplyForSubmitForm(moment(moment().add(14, 'days').format('DD/MM/YY'), 'DD/MM/YY'));

            const listRecipientToData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTo', company) || [];
            setListRecipientTo([...new Set(listRecipientToData)]);

            const listRecipientCcData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailCc', company) || [];
            setListRecipientCc([...new Set(listRecipientCcData)]);

            const listConsultantMustReplyData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'consultantMustReply', company) || [];
            setListConsultantMustReply(listConsultantMustReplyData);

            const textEmailTitleData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTitle', company) || '';
            setTextEmailTitle(textEmailTitleData);


            const versionTextIndex = versionTextArray.indexOf(currentRefData.revision);
            const versionTextNext = versionTextArray[versionTextIndex + 1];
            setRefNewVersionResubmitSuffix(versionTextNext);

         } else {

            const listRecipientToData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTo', company) || [];
            setListRecipientTo([...new Set(listRecipientToData)]);

            const listRecipientCcData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailCc', company) || [];
            setListRecipientCc([...new Set(listRecipientCcData)]);

            const listConsultantMustReplyData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'consultantMustReply', company) || [];
            setListConsultantMustReply(listConsultantMustReplyData);

            const requestedByData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'requestedBy', company) || '';
            setRequestedBy(requestedByData);

            const signaturedByData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'signaturedBy', company) || '';
            setSignaturedBy(signaturedByData);

            const textEmailTitleData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'emailTitle', company) || '';
            setTextEmailTitle(textEmailTitleData);

            const descriptionData = getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'description', company) || '';
            setDescription(descriptionData);


            setConversationAmong(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'conversationAmong', company));
            setContractSpecification(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'contractSpecification', company));
            setProposedSpecification(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'proposedSpecification', company));
            setIsCostImplication(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'isCostImplication', company));
            setIsTimeExtension(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'isTimeExtension', company));
            setHerewithForDt(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'herewithForDt', company));
            setTransmittedForDt(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'transmittedForDt', company));
            setSubmissionType(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'submissionType', company));

            setTimeConversation(moment(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'timeConversation', company)));
            setDateConversation(moment(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'dateConversation', company)));

            setDateReplyForSubmitForm(moment(getInfoValueFromRefDataForm(currentRefData, 'submission', refType, 'due', company)));

            setRefNewVersionResubmitSuffix(currentRefData.revision);
         };


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

         } else {

            const listRecipientToData = getInfoValueFromRefDataForm(currentRefData, 'reply', refType, 'emailTo', company) || [];
            setListRecipientTo([...new Set(listRecipientToData)]);

            const listRecipientCcData = getInfoValueFromRefDataForm(currentRefData, 'reply', refType, 'emailCc', company) || [];
            setListRecipientCc([...new Set(listRecipientCcData)]);

            const textEmailTitleData = getInfoValueFromRefDataForm(currentRefData, 'reply', refType, 'emailTitle', company) || '';
            setTextEmailTitle(textEmailTitleData);

            const descriptionData = getInfoValueFromRefDataForm(currentRefData, 'reply', refType, 'description', company) || '';
            setDescription(descriptionData);

            const statusData = getInfoValueFromRefDataForm(currentRefData, 'reply', refType, 'status', company) || '';
            setConsultantReplyStatus(statusData);

            const linkFormReplyData = getInfoValueFromRefDataForm(currentRefData, 'reply', refType, 'linkFormReply', company) || '';
            setFileReplyFormName(/[^/]*$/.exec(linkFormReplyData)[0]);

         };
      };
   }, []);


   useEffect(() => {
      if (tradeForFirstTimeSubmit && formRefType === 'form-submit-multi-type') {

         if (!isFormEditting) {
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
         } else {
            if (checkIfRefIsDuplicated()) {
               message.info(`This ${refType.toUpperCase()} number has already existed, please choose a new number!`);
               setRefNumberSuffixFirstTimeSubmit('');
            };
         };
      };
   }, [tradeForFirstTimeSubmit]);



   useEffect(() => {
      if (!loading) {
         setModalConfirmsubmitOrCancel(null);
      };
   }, [loading]);




   const checkIfRefIsDuplicated = () => {
      const arr = [...new Set(rowsRefAllInit.map(r => (r[refKey] || '')))];
      if (formRefType === 'form-submit-multi-type') {
         const newRefToSubmit = `${refType.toUpperCase()}/${projectNameShort}/${tradeForFirstTimeSubmit}/${refNumberSuffixFirstTimeSubmit}`;
         return (
            (!isFormEditting && arr.indexOf(newRefToSubmit) !== -1) ||
            (isFormEditting && arr.indexOf(newRefToSubmit) !== -1 && newRefToSubmit !== currentRefData[refKey])
         );
      } else if (formRefType === 'form-resubmit-multi-type') {
         const newRefToSubmit = currentRefData[refKey] + refNewVersionResubmitSuffix;

         return (
            (!isFormEditting && arr.indexOf(newRefToSubmit) !== -1) ||
            (isFormEditting && arr.indexOf(newRefToSubmit) !== -1 && newRefToSubmit !== (currentRefData[refKey] + currentRefData.revision))
         );
      };
   };


   const onBlurInputRefNameCreateNew = () => {
      if (checkIfRefIsDuplicated()) {
         message.info(`This ${refType.toUpperCase()} number has already existed, please choose a new number!`);
         setRefNumberSuffixFirstTimeSubmit('');
         setRefNewVersionResubmitSuffix('');
      };
   };




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

      const isSubmitOrResubmitForm = formRefType.includes('form-submit-multi-') || formRefType.includes('form-resubmit-multi-');

      if (isFormEditting) {
         if (
            (isSubmitOrResubmitForm && checkIfEditTimeIsOverMultiForm(currentRefData, null, EDIT_DURATION_MIN, refType, 'wohhup-check-if-submission-edit-is-over')) ||
            (!isSubmitOrResubmitForm && checkIfEditTimeIsOverMultiForm(currentRefData, company, EDIT_DURATION_MIN, refType, 'consultant-check-if-reply-edit-is-over'))
         ) {
            return message.info('Time is up, you are unable to edit the submission!', 2);
         };
      };

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
         trade = currentRefData.trade;
         refToSaveVersionOrToReply = refNewVersionResubmitSuffix;
         refToSave = currentRefData[refKey];
      } else if (formRefType.includes('form-reply-multi-')) { // reply
         trade = currentRefData.trade;
         refToSaveVersionOrToReply = currentRefData.revision;
         refToSave = currentRefData[refKey];
      };


      


      if (projectNameShort === 'NO-PROJECT-NAME') {
         return message.info(`Please update project abbreviation name for ${refType.toUpperCase()} number!`, 2);
      } else if (!textEmailTitle && !isAdminActionWithNoEmailSent) {
         return message.info('Please fill in email title!', 2);
      } else if (!description) {
         return message.info('Please fill in description!', 2);
      } else if (!listRecipientTo || listRecipientTo.length === 0) {
         return message.info('Please fill in recipient!', 2);
      } else if (isSubmitOrResubmitForm && !dateReplyForSubmitForm) {
         return message.info('Please fill in expected reply date!', 2);
      } else if (isSubmitOrResubmitForm && listConsultantMustReply.length === 0 && pageSheetTypeName !== 'page-mm') {
         return message.info('Please fill in consultant lead', 2);
      } else if (isSubmitOrResubmitForm && !requestedBy) {
         return message.info('Please fill in person requested', 2);
      } else if (!trade || !refToSave || !refToSaveVersionOrToReply) {
         return message.info('Please fill in necessary info!', 2);
      } else if (isSubmitOrResubmitForm && !signaturedBy && pageSheetTypeName !== 'page-mm') {
         return message.info('Please fill in signatured by!', 2);
      } else if (isSubmitOrResubmitForm && !submissionType && pageSheetTypeName === 'page-rfam') {
         return message.info('Please fill in submission type!', 2);
      } else if (isSubmitOrResubmitForm && !conversationAmong && (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-mm')) {
         return message.info('Please fill in conversation among!', 2);
      } else if (isSubmitOrResubmitForm && (!dateConversation || !timeConversation) && (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-mm')) {
         return message.info('Please fill in date and time conversation!', 2);
      } else if (isSubmitOrResubmitForm && !herewithForDt && pageSheetTypeName === 'page-dt') {
         return message.info('Please fill in herewith!', 2);
      } else if (isSubmitOrResubmitForm && !transmittedForDt && pageSheetTypeName === 'page-dt') {
         return message.info('Please fill in transmitted for!', 2);

      } else if (formRefType === 'form-resubmit-multi-type' && !refNewVersionResubmitSuffix) {
         return message.info('Please fill in version!', 2);
      } else if (!isSubmitOrResubmitForm && !consultantReplyStatus && pageSheetTypeName === 'page-rfam') {
         return message.info('Please fill in reply status!', 2);
      } else if (!isSubmitOrResubmitForm && Object.keys(fileFormCoverReply).length === 0 && !isFormEditting) {
         return message.info('Please upload form!', 2);
      };


      let outputConsultantsToReply = [];
      if (isSubmitOrResubmitForm) {
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
         isFormEditting, trade,

         filesPdfDrawing: Object.values(filesPdfDrawing),
         dwgsImportFromRFA: dwgsImportFromRFA.map(x => ({ ...x })),
         fileFormCoverReply: Object.values(fileFormCoverReply)[0],

         refToSave, refToSaveVersionOrToReply,
         recipient: {
            to: isAdminActionWithNoEmailSent ? [] : [...new Set(listRecipientTo)],
            cc: isAdminActionWithNoEmailSent ? [] : [...new Set(listRecipientCc)]
         },
         listConsultantMustReply: outputConsultantsToReply,
         requestedBy, signaturedBy,
         dateConversation, timeConversation,
         conversationAmong,
         isCostImplication, isTimeExtension,
         emailTextTitle: isAdminActionWithNoEmailSent ? '' : textEmailTitle,
         description: isAdminActionWithNoEmailSent ? '' : description,
         dateReplyForSubmitForm,
         consultantReplyStatus,
         contractSpecification,
         proposedSpecification,
         submissionType,
         herewithForDt,
         transmittedForDt,

         isAdminActionWithNoEmailSent,
         adminActionConsultantToReply,
         isAdminAction,
      });
   };


   const generateColumnsListDwgRef = (headers, nosColumnFixed) => {
      const buttonRemoveDrawing = [
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
            frozen: index < nosColumnFixed ? Column.FrozenDirection.LEFT : undefined,
            width: getHeaderWidthDwgRef(column),
            cellRenderer: ({ rowData, cellData }) => {
               let cellTypeName;
               if (!rowData['Type'] && !rowData['File Name']) {
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


   const onClickRemoveDwgBtn = debounceFnc((rowData) => {
      return;
      // const onClickRemoveDwgBtn = (rowData) => {

      if (rowData['Type'] === 'Drawing') {
         // let obj = {};
         // for (const key in filesPdfDrawing) {
         //    const file = filesPdfDrawing[key];
         //    if (file.name !== rowData['File Name']) {
         //       obj[key] = file;
         //    };
         // };
         // setFilesPdfDrawing(obj);

      } else if (rowData['Type'] === 'Cover') {
         // delete fileFormCoverReply[rowData['File Name']];
         // let obj = {};
         // for (const key in fileFormCoverReply) {
         //    obj[key] = fileFormCoverReply[key];
         // };
         // setFileFormCoverReply(obj);

      } else if (!rowData['Type']) {
         // setDwgsImportFromRFA(dwgsImportFromRFA.filter(x => x.id !== rowData.id));
      };

      setNosColumnFixed(2);
      setNosColumnFixed(1);
   }, 1);
   // };




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
                           onChange={(value) => {
                              setTradeForFirstTimeSubmit(value);
                           }}
                           filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                           suffixIcon={<div></div>}
                           value={tradeForFirstTimeSubmit}
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
                  ) : formRefType === 'form-resubmit-multi-type' ? (
                     <>
                        <div style={{ marginRight: 2 }}>{currentRefData[refKey]}</div>
                        <InputStyled
                           style={{ width: 50, marginRight: 120 }}
                           onChange={(e) => setRefNewVersionResubmitSuffix(e.target.value)}
                           onBlur={onBlurInputRefNameCreateNew}
                           value={refNewVersionResubmitSuffix}
                        />
                     </>

                  ) : formRefType === 'form-reply-multi-type' ? (
                     <div>{currentRefData[refKey] + (currentRefData.revision === '0' ? '' : currentRefData.revision)}</div>

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


                   
                  {/* {formRefType === 'form-reply-multi-type' && adminActionConsultantToReply && (
                     <div style={{ marginLeft: 20 }}>Company reply: <span style={{ fontWeight: 'bold' }}>{adminActionConsultantToReply}</span></div>
                  )} */}

                  
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
                           value={signaturedBy}
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
                           value={submissionType}
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
                           value={consultantReplyStatus}
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

                  <div style={{ marginLeft: 10 }}>{fileReplyFormName}</div>


                  {(formRefType === 'form-submit-multi-type' || formRefType === 'form-resubmit-multi-type') && (
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
                              onClick={() => setTablePickDrawingRfaSubmitted(true)}
                           />
                        )}
                     </>
                  )}

               </div>


               {(dataInputForTable.length > 0) && (
                  <div style={{
                     width: window.innerWidth * 0.9 - 80,
                     height: dataInputForTable.length * 28 + 80
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


         {tablePickDrawingRfaSubmitted && (
            <ModalStyled
               title={'Select Drawings For New RFA'}
               visible={tablePickDrawingRfaSubmitted}
               footer={null}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.85}
               onOk={() => setTablePickDrawingRfaSubmitted(false)}
               onCancel={() => setTablePickDrawingRfaSubmitted(false)}
            >
               <TableDrawingRfaForMultiForm
                  onClickCancelModalPickDrawing={() => setTablePickDrawingRfaSubmitted(false)}
                  onClickApplyModalPickRfaDrawings={(dwgsRfaToAdd) => {
                     setDwgsImportFromRFA(dwgsRfaToAdd);
                     setTablePickDrawingRfaSubmitted(false);
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
                        ? `${currentRefData[refKey]}${refNewVersionResubmitSuffix}`
                        : formRefType.includes('form-reply-multi-')
                           ? `${currentRefData[refKey]}` : null}
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


const getInputForTable = (filesPdfDrawing, dwgsImportFromRFA) => {

   let output = [];
   // if (fileFormCoverReply) {
   //    for (const pdfDrawing in fileFormCoverReply) {
   //       output.push({
   //          id: mongoObjectId(),
   //          'Type': 'Form Cover',
   //          'File Name': pdfDrawing
   //       });
   //    };
   // };

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
