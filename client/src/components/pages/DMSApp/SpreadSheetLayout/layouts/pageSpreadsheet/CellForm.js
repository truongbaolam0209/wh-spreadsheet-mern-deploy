import { Icon, message, Modal, Tooltip, Upload } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, EDIT_DURATION_MIN, SERVER_URL, tradeArrayForm, tradeArrayMeetingMinutesForm, versionTextArray } from '../../constants';
import { compareDatesMultiForm, replaceBreakLine } from '../../utils';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import ButtonStyle from '../generalComponents/ButtonStyle';
import { convertReplyOrSubmissionDate, isColumnConsultant, isColumnWithReplyData } from './CellRFA';
import { getFileNameFromLinkResponse, getKeyTextForSheet } from './PanelSetting';





const CellForm = (props) => {


   const { rowData, cellData, column, buttonPanelFunction, contextInput, commandAction, setLoading } = props;


   const { contextCell, contextRow, contextProject } = contextInput;
   const { stateCell, getCellModifiedTemp, setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const {
      token, projectId, projectName, roleTradeCompany, companies, company, email, projectIsAppliedRfaView,
      pageSheetTypeName, isBothSideActionUser
   } = stateProject.allDataOneSheet;


   const expandedColumn = pageSheetTypeName === 'page-rfam' ? 'RFAM Ref'
      : pageSheetTypeName === 'page-rfi' ? 'RFI Ref'
         : pageSheetTypeName === 'page-cvi' ? 'CVI Ref'
            : pageSheetTypeName === 'page-dt' ? 'DT Ref'
               : pageSheetTypeName === 'page-mm' ? 'MM Ref'
                  : 'n/a';

   const [activeBtn, setActiveBtn] = useState(null);

   const [modalContentText, setModalContentText] = useState(null);

   const [arrayButtonCell, setArrayButtonCell] = useState([]);
   const [arrayButtonCellSubmitAndReply, setArrayButtonCellSubmitAndReply] = useState([]);


   const [btnShown, setBtnShown] = useState(false);

   const { rowsRfamAllInit, rowsRfamAll, rowsRfiAllInit, rowsRfiAll, rowsCviAllInit, rowsCviAll, rowsDtAllInit, rowsDtAll, rowsMmAllInit, rowsMmAll } = stateRow;

   const rowsRefAllInit = pageSheetTypeName === 'page-rfam' ? rowsRfamAllInit
      : pageSheetTypeName === 'page-rfi' ? rowsRfiAllInit
         : pageSheetTypeName === 'page-cvi' ? rowsCviAllInit
            : pageSheetTypeName === 'page-dt' ? rowsDtAllInit
               : pageSheetTypeName === 'page-mm' ? rowsMmAllInit
                  : [];

   const rowsRefAll = pageSheetTypeName === 'page-rfam' ? rowsRfamAll
      : pageSheetTypeName === 'page-rfi' ? rowsRfiAll
         : pageSheetTypeName === 'page-cvi' ? rowsCviAll
            : pageSheetTypeName === 'page-dt' ? rowsDtAll
               : pageSheetTypeName === 'page-mm' ? rowsMmAll
                  : [];


   const refType = getKeyTextForSheet(pageSheetTypeName);
   const refKey = refType + 'Ref';


   const [replyStatus, setReplyStatus] = useState(null);
   const [replyCompany, setReplyCompany] = useState(null);
   const [replyDate, setReplyDate] = useState(null);

   const [modalListDrawingAttached, setModalListDrawingAttached] = useState(null);


   const [overdueCount, setOverdueCount] = useState(0);


   const [panelUploadSignedOffFormShown, setPanelUploadSignedOffFormShown] = useState(false);
   const [fileSignedOffFormPdf, setFileSignedOffFormPdf] = useState(null);
   const onChangeUploadSignedOffForm = (info) => {
      if (info.fileList) {
         let output = {};
         info.fileList.forEach(file => {
            output = { [file.name]: file };
         });
         setFileSignedOffFormPdf(output);
      };
   };





   useEffect(() => {

      if (!rowData.treeLevel) {

         if (column.key === expandedColumn) {

            let cellButtonArr = [];
            let cellButtonArrSubmitAndReply = [];
            const consultantMustReplyArray = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');

            const isEditTimeLeadConsultantReplyIsOverMultiForm = checkIfEditTimeIsOverMultiForm(rowData, consultantMustReplyArray[0], EDIT_DURATION_MIN, refType, 'check-if-reply-edit-is-over');
            const isUserTheRefCreator = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'user') === email;
            const isSignedOffAlreadySubmitted = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
            const isEditTimeSubmissionIsOverMultiForm = checkIfEditTimeIsOverMultiForm(rowData, null, EDIT_DURATION_MIN, refType, 'check-if-submission-edit-is-over');


            if (roleTradeCompany.role === 'Document Controller') {

               if (isUserTheRefCreator) {
                  if (isEditTimeSubmissionIsOverMultiForm <= 0) {
                     if (pageSheetTypeName !== 'page-mm' && !isSignedOffAlreadySubmitted) {
                        cellButtonArrSubmitAndReply = [...cellButtonArrSubmitAndReply, 'btn-submitSignedOffToConsultant'];
                     };
                  } else {
                     cellButtonArr = [...cellButtonArr, 'btn-edit'];
                     setEditTimeLeft(isEditTimeSubmissionIsOverMultiForm);
                  };
               };


               if (
                  (getInfoValueFromRefDataForm(rowData, 'reply', refType, 'status', consultantMustReplyArray[0]) && isEditTimeLeadConsultantReplyIsOverMultiForm <= 0) ||
                  ((pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt') && isSignedOffAlreadySubmitted)
               ) {
                  const versionTextIndex = versionTextArray.indexOf(rowData.revision);
                  const versionTextNext = versionTextArray[versionTextIndex + 1];
                  const rowVersionNext = rowsRefAllInit.find(r => r[refKey] === rowData[refKey] && r.revision === versionTextNext);
                  if (!rowVersionNext) {
                     cellButtonArrSubmitAndReply = [...cellButtonArrSubmitAndReply, 'btn-resubmit'];
                  };
               };
            };

            if (
               (getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkFormNoSignature') && isUserTheRefCreator) ||
               (getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkFormNoSignature') && pageSheetTypeName === 'page-mm') ||
               getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit')
            ) {
               cellButtonArr = [...cellButtonArr, 'btn-linkSubmissionFiles'];
            };



            setArrayButtonCell([...new Set(cellButtonArr)]);
            setArrayButtonCellSubmitAndReply([...new Set(cellButtonArrSubmitAndReply)]);


         } else if (isColumnWithReplyData(column.key)) {

            let cellButtonArr = [];
            let cellButtonArrSubmitAndReply = [];
            const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyFormData(rowData, column.key, refType);
            setReplyStatus(replyStatusData);
            setReplyCompany(replyCompanyData);
            setReplyDate(convertReplyOrSubmissionDate(replyDateData));

            const isEditTimeReplyIsOverMultiForm = checkIfEditTimeIsOverMultiForm(rowData, replyCompanyData, EDIT_DURATION_MIN, refType, 'check-if-reply-edit-is-over');
            const isUserTheRefCreator = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'user', replyCompanyData) === email;
            const isSignedOffAlreadySubmitted = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
            const isThisRefAlreadyReplied = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'status', replyCompanyData);
            const isRepliedFormUploaded = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', replyCompanyData);


            if ((roleTradeCompany.role === 'Consultant' && replyCompanyData === company) || isBothSideActionUser) {
               if (
                  isSignedOffAlreadySubmitted &&
                  ((!isThisRefAlreadyReplied && (pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')))
               ) {
                  cellButtonArrSubmitAndReply = [...cellButtonArrSubmitAndReply, 'btn-reply'];
               };

               if (isRepliedFormUploaded && isEditTimeReplyIsOverMultiForm > 0 && isUserTheRefCreator) {
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
                  setEditTimeLeft(isEditTimeReplyIsOverMultiForm);
               };
            };


            if (isRepliedFormUploaded && (isEditTimeReplyIsOverMultiForm <= 0 || isUserTheRefCreator)) { // !isEditTimeReplyIsOverMultiForm && isUserTheRefCreator 
               cellButtonArr = [...cellButtonArr, 'btn-linkReplyFiles'];
            };
            setArrayButtonCell([...new Set(cellButtonArr)]);
            setArrayButtonCellSubmitAndReply([...new Set(cellButtonArrSubmitAndReply)]);


         } else if (isColumnConsultant(column.key)) {

            const consultantMustReplyArray = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');

            let cellButtonArr = [];
            let cellButtonArrSubmitAndReply = [];
            if (roleTradeCompany.role === 'Consultant' && consultantMustReplyArray.indexOf(company) !== -1) {

               setReplyStatus(rowData[`reply-${refType}-status-${company}`]);
               setReplyCompany(company);
               const dateInfo = rowData[`reply-${refType}-date-${company}`];
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               const isEditTimeReplyIsOverMultiForm = checkIfEditTimeIsOverMultiForm(rowData, company, EDIT_DURATION_MIN, refType, 'check-if-reply-edit-is-over');
               const isUserTheRefCreator = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'user', company) === email;
               const isSignedOffAlreadySubmitted = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
               const isThisRefAlreadyReplied = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'status', company);
               const isRepliedFormUploaded = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', company);

               if (
                  isSignedOffAlreadySubmitted &&
                  ((!isThisRefAlreadyReplied && (pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')))
               ) {
                  cellButtonArrSubmitAndReply = [...cellButtonArrSubmitAndReply, 'btn-reply'];

               };

               if (isRepliedFormUploaded && isEditTimeReplyIsOverMultiForm > 0 && isUserTheRefCreator) {
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
                  setEditTimeLeft(isEditTimeReplyIsOverMultiForm);
               };

               if (isRepliedFormUploaded && (isEditTimeReplyIsOverMultiForm <= 0 || isUserTheRefCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-linkReplyFiles'];
               };

            } else {
               const consultantLead = consultantMustReplyArray[0];
               setReplyStatus(rowData[`reply-${refType}-status-${consultantLead}`]);
               setReplyCompany(consultantLead);
               const dateInfo = rowData[`reply-${refType}-date-${consultantLead}`];
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               const isUserTheRefCreator = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'user', consultantLead) === email;
               const isRepliedFormUploaded = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', consultantLead);
               const isEditTimeReplyIsOverMultiForm = checkIfEditTimeIsOverMultiForm(rowData, consultantLead, EDIT_DURATION_MIN, refType, 'check-if-reply-edit-is-over');

               const isSignedOffAlreadySubmitted = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
               const isThisRefAlreadyReplied = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'status', consultantLead);

               if (isBothSideActionUser) {
                  if (
                     isSignedOffAlreadySubmitted &&
                     ((!isThisRefAlreadyReplied && (pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')))
                  ) {
                     cellButtonArrSubmitAndReply = [...cellButtonArrSubmitAndReply, 'btn-reply'];
                  };

                  if (isRepliedFormUploaded && isEditTimeReplyIsOverMultiForm > 0 && isUserTheRefCreator) {
                     cellButtonArr = [...cellButtonArr, 'btn-edit'];
                     setEditTimeLeft(isEditTimeReplyIsOverMultiForm);
                  };
               };


               if (isRepliedFormUploaded && (isEditTimeReplyIsOverMultiForm <= 0 || isUserTheRefCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-linkReplyFiles'];
               };
            };

            setArrayButtonCell([...new Set(cellButtonArr)]);
            setArrayButtonCellSubmitAndReply([...new Set(cellButtonArrSubmitAndReply)]);

         } else if (isTextContentCell(column.key)) {
            const textContentCell = getInfoValueFromRefDataForm(
               rowData, 'submission', refType,
               column.key === 'Description' ? 'description' :
                  column.key === 'Contract Specification' ? 'contractSpecification' :
                     column.key === 'Proposed Specification' ? 'proposedSpecification' :
                        'conversationAmong'
            );
            if (textContentCell) {
               setArrayButtonCell(['btn-textContent']);
            };
         } else if (column.key === 'Due Date') {
            const consultantMustReplyArray = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');
            const leadConsultantStatus = getInfoValueFromRefDataForm(rowData, 'reply', 'status', refType, consultantMustReplyArray[0]);
            if (!leadConsultantStatus) {
               const compare = compareDatesMultiForm(getInfoValueFromRefDataForm(rowData, 'submission', refType, 'due'));

               setOverdueCount(compare);
            };
         };
      };

   }, [activeBtn]);


   const [editTimeLeft, setEditTimeLeft] = useState(null);
   useEffect(() => {
      if (editTimeLeft > 0) {
         const timer = setTimeout(() => {
            if (column.key === expandedColumn) {
               setArrayButtonCell(arrayButtonCell.filter(btn => btn !== 'btn-edit'));
               if (pageSheetTypeName !== 'page-mm') {
                  setArrayButtonCellSubmitAndReply([...arrayButtonCellSubmitAndReply, 'btn-submitSignedOffToConsultant']);
               };
            } else if (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) {
               setArrayButtonCell(arrayButtonCell.filter(btn => btn !== 'btn-edit'));
            } else if (column.key === 'Received By') {

            };
         }, editTimeLeft * 60 * 1000);
         return () => clearTimeout(timer);
      };
   }, [editTimeLeft]);










   const onClickRefDrawing = (btn) => {
      const rowsNotThisRef = rowsRefAll.filter(r => r[refKey] !== rowData[refKey]);

      let rowsThisRefFiltered = rowsRefAllInit.filter(r => {
         return r.revision === btn && r[refKey] === rowData[refKey];
      });
      const rowsToDisplay = [...rowsNotThisRef, ...rowsThisRefFiltered].sort((a, b) => (a[refKey] > b[refKey] ? 1 : -1));

      setActiveBtn(btn);

      getSheetRows({
         ...stateRow,
         [`rows${refType.charAt(0).toUpperCase() + refType.slice(1)}All`]: rowsToDisplay
      });

   };




   const openDrawingFromList = async (dwgLink) => {
      try {
         const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
         window.open(res.data, '_blank');
      } catch (err) {
         console.log(err);
      };
   };



   const onClickCellButton = async (btnName, companyCellTagCviOrDt) => {
      try {
         if (btnName === 'btn-linkSubmissionFiles') {
            const linkFormSubmission = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit') ||
               getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkFormNoSignature');

            const dwgsLinkList = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawings') || [];
            const dwgsRfaLinkList = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawingsRfa') || [];
            setModalListDrawingAttached([
               linkFormSubmission,
               ...[...dwgsLinkList, ...dwgsRfaLinkList].sort((a, b) => (/[^/]*$/.exec(a)[0] > /[^/]*$/.exec(b)[0] ? 1 : -1))
            ]);

         } else if (btnName === 'btn-linkReplyFiles') {

            let linkFormReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', companyCellTagCviOrDt || replyCompany);
            let linkDocumentsReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkDocumentsReply', companyCellTagCviOrDt || replyCompany) || [];

            setModalListDrawingAttached([
               linkFormReply,
               ...linkDocumentsReply.sort((a, b) => (/[^/]*$/.exec(a)[0] > /[^/]*$/.exec(b)[0] ? 1 : -1))
            ]);

         } else if (btnName === 'btn-submitSignedOffToConsultant') {
            setPanelUploadSignedOffFormShown(true);

         } else if (btnName === 'btn-edit') {

            let typeFormBtn = '';
            let objConsultantNameToReplyByBothSideActionUser = {};

            if (companyCellTagCviOrDt) {
               typeFormBtn = 'form-reply-multi-type';
               if (isBothSideActionUser) {
                  objConsultantNameToReplyByBothSideActionUser = {
                     consultantNameToReplyByBothSideActionUser: companyCellTagCviOrDt
                  };
               };
            } else {
               if (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) {
                  typeFormBtn = 'form-reply-multi-type';
                  if (isBothSideActionUser) {
                     objConsultantNameToReplyByBothSideActionUser = {
                        consultantNameToReplyByBothSideActionUser: replyCompany
                     };
                  };
               } else {
                  if (rowData.revision !== '0') {
                     typeFormBtn = 'form-resubmit-multi-type';
                  } else {
                     typeFormBtn = 'form-submit-multi-type';
                  };
               };
            };

            const dataSendNoEmail = (typeFormBtn === 'form-submit-multi-type' || typeFormBtn === 'form-resubmit-multi-type')
               ? getInfoValueFromRefDataForm(rowData, 'submission', refType, 'dateSendNoEmail')
               : (typeFormBtn === 'form-reply-multi-type' && !companyCellTagCviOrDt)
                  ? getInfoValueFromRefDataForm(rowData, 'reply', refType, 'dateSendNoEmail', replyCompany)
                  : (typeFormBtn === 'form-reply-multi-type' && companyCellTagCviOrDt)
                     ? getInfoValueFromRefDataForm(rowData, 'reply', refType, 'dateSendNoEmail', companyCellTagCviOrDt)
                     : null;


            buttonPanelFunction(typeFormBtn);
            getSheetRows({
               ...stateRow,
               currentRefToAddNewOrReplyOrEdit: {
                  currentRefData: rowData,
                  formRefType: typeFormBtn,
                  isFormEditting: true,
                  isBothSideActionUserWithNoEmailSent: dataSendNoEmail ? true : false,
                  ...objConsultantNameToReplyByBothSideActionUser
               },
            });

         } else if (btnName === 'btn-resubmit') {
            if (isBothSideActionUser) {
               buttonPanelFunction('option-email-or-not-for-admin');
               getSheetRows({
                  ...stateRow,
                  currentRefToAddNewOrReplyOrEdit: {
                     tempRefData: rowData,
                  },
               });
            } else {
               buttonPanelFunction('form-resubmit-multi-type');
               getSheetRows({
                  ...stateRow,
                  currentRefToAddNewOrReplyOrEdit: {
                     currentRefData: rowData,
                     formRefType: 'form-resubmit-multi-type',
                     isFormEditting: false
                  },
               });
            };

         } else if (btnName === 'btn-reply') {
            if (companyCellTagCviOrDt) {

               if (pageSheetTypeName === 'page-dt') {
                  buttonPanelFunction('acknowledge-form');
                  getSheetRows({
                     ...stateRow,
                     currentRefToAddNewOrReplyOrEdit: {
                        currentRefData: rowData,
                        formRefType: 'form-reply-multi-type',
                        isFormEditting: false,
                     },
                  });
               } else if (pageSheetTypeName === 'page-cvi' && !isBothSideActionUser) {
                  buttonPanelFunction('acknowledge-or-reply-form');
                  getSheetRows({
                     ...stateRow,
                     currentRefToAddNewOrReplyOrEdit: {
                        currentRefData: rowData,
                        formRefType: 'form-reply-multi-type',
                        isFormEditting: false,
                     },
                  });
               } else if (pageSheetTypeName === 'page-cvi' && isBothSideActionUser) {
                  buttonPanelFunction('option-email-or-not-for-admin');
                  getSheetRows({
                     ...stateRow,
                     currentRefToAddNewOrReplyOrEdit: {
                        tempRefData: rowData,
                        tempConsultantToReply: companyCellTagCviOrDt
                     },
                  });
               };


            } else {
               if (isBothSideActionUser) {
                  buttonPanelFunction('option-email-or-not-for-admin');
                  getSheetRows({
                     ...stateRow,
                     currentRefToAddNewOrReplyOrEdit: {
                        tempRefData: rowData,
                        tempConsultantToReply: replyCompany,
                     },
                  });
               } else {
                  buttonPanelFunction('form-reply-multi-type');
                  getSheetRows({
                     ...stateRow,
                     currentRefToAddNewOrReplyOrEdit: {
                        currentRefData: rowData,
                        formRefType: 'form-reply-multi-type',
                        isFormEditting: false
                     },
                  });
               };
            };

         } else if (btnName === 'btn-textContent') {
            const textContentCell = getInfoValueFromRefDataForm(
               rowData, 'submission', refType,
               column.key === 'Description' ? 'description' :
                  column.key === 'Contract Specification' ? 'contractSpecification' :
                     column.key === 'Proposed Specification' ? 'proposedSpecification' :
                        'conversationAmong'
            );
            setModalContentText(textContentCell);
         };
      } catch (err) {
         console.log(err);
      };
   };






   const submitSignedOffFormSendEmail = async () => {

      if (!fileSignedOffFormPdf || Object.values(fileSignedOffFormPdf).length === 0) {
         return message.warn('Please upload pdf signed off form!', 3)
      };

      try {
         setLoading(true);
         commandAction({ type: '' });

         let data;
         data = new FormData();
         Object.values(fileSignedOffFormPdf).forEach(file => {
            data.append('files', file.originFileObj);
         });
         data.append('projectId', projectId);
         data.append(`${refType}Number`, `${rowData[`${refType}Ref`]}/${rowData.revision}/submit`);

         let arrayFileName = [];
         if (data) {
            const res = await Axios.post('/api/drawing/set-dms-files', data);
            const listFileName = res.data;

            arrayFileName = listFileName.map(link => ({
               fileName: getFileNameFromLinkResponse(link),
               fileLink: link
            })).map(x => x.fileLink);
         };

         let rowOutput = { _id: rowData.id, data: {} };
         rowOutput.data[`submission-${refType}-linkSignedOffFormSubmit-${company}`] = arrayFileName[0];

         await Axios.post(`${SERVER_URL}/row-${refType}/save-rows-${refType}/`, { token, projectId, rows: [rowOutput] });


         if (!getInfoValueFromRefDataForm(rowData, 'submission', refType, 'dateSendNoEmail')) {

            const data = {
               projectId, company, projectName,
               formSubmitType: refType,
               type: 'submit-signed-off-final',
               rowIds: [rowData.id],
               emailSender: email,
            };

            await Axios.post('/api/rfa/mail', {
               token, data,
               momentToTriggerEmail: moment().add(moment.duration(EDIT_DURATION_MIN, 'minutes')),
               isInstant: true
            });
         };



         message.success('Submitted Successfully', 2);

         const route = pageSheetTypeName === 'page-rfam' ? 'row-rfam'
            : pageSheetTypeName === 'page-cvi' ? 'row-cvi'
               : pageSheetTypeName === 'page-rfi' ? 'row-rfi'
                  : pageSheetTypeName === 'page-dt' ? 'row-dt'
                     : pageSheetTypeName === 'page-mm' ? 'row-mm'
                        : 'n/a';

         const res = await Axios.get(`${SERVER_URL}/${route}/`, { params: { token, projectId, email } });
         const rowsAllMultiForm = res.data;

         const expandedRowsIdArr = [
            ...(pageSheetTypeName === 'page-mm' ? tradeArrayMeetingMinutesForm : tradeArrayForm),
            ...rowsAllMultiForm.filter(x => x[refKey]).map(x => x[refKey])
         ];

         commandAction({
            type: 'reload-data-view-multi-form',
            data: {
               rowsAllMultiForm,
               expandedRowsIdArr,
            }
         });

      } catch (err) {
         getSheetRows({ ...stateRow, loading: false });
         commandAction({ type: 'save-data-failure' });
         console.log(err);
      };
   };



   const widthCellForContentText = !isTextContentCell(column.key) ? {} : {
      width: column.width - 30
   };



   return (
      <div
         style={{
            width: '100%', height: '100%',
            position: 'relative',
            display: 'flex',
            padding: 3, paddingLeft: 5, color: 'black',
            color: replyStatus ? 'white' : 'black',
            background: (column.key === 'Due Date' && overdueCount < 0)
               ? '#FFEBCD'
               : (colorTextRow[replyStatus] || 'transparent'),

         }}
         onMouseOver={() => {
            if (!btnShown) setBtnShown(true);
         }}
         onMouseLeave={() => {
            if (btnShown) setBtnShown(false);
         }}
      >
         {(rowData.treeLevel && column.key === expandedColumn) ? (
            <div style={{ color: 'black', fontWeight: 'bold' }}>{rowData.title}</div>
         ) : !rowData.treeLevel ? (
            <div style={{
               display: 'flex',
               textOverflow: 'ellipsis',
               overflow: 'hidden',
               whiteSpace: 'nowrap',
            }}>
               <span
                  style={{ ...widthCellForContentText }}
               >
                  {getCellFormData(
                     rowData, column.key, refType, replyCompany, replyStatus, replyDate,
                     onClickCellButton, company, pageSheetTypeName, email, overdueCount, isBothSideActionUser
                  )}
               </span>

               {(column.key === expandedColumn && pageSheetTypeName !== 'page-mm') && (
                  <div style={{
                     position: 'absolute', left: 150, top: 4,
                     display: 'flex',
                  }}>
                     {rowData['btn'].map(btn => (
                        <ButtonForm
                           key={btn}
                           onClick={() => onClickRefDrawing(btn)}
                           isActive={btn === rowData.revision}
                        >{btn}</ButtonForm>
                     ))}
                  </div>
               )}

            </div>
         ) : ''}


         {btnShown && !rowData.treeLevel && (
            <>
               {arrayButtonCell.map((btn, i) => (
                  <Tooltip key={i} placement='top' title={getTooltipText(btn)}>
                     <Icon
                        type={getButtonType(btn)}
                        style={{
                           cursor: 'pointer', fontSize: 16,
                           position: 'absolute',
                           right: getOffsetRight(i, arrayButtonCellSubmitAndReply.length > 0),
                           top: 6
                        }}
                        onClick={() => onClickCellButton(btn)}
                     />
                  </Tooltip>
               ))}
            </>
         )}

         {!rowData.treeLevel && arrayButtonCellSubmitAndReply.map((btn, i) => (
            <Tooltip key={i} placement='top' title={getTooltipText(btn)}>
               <Icon
                  type={getButtonType(btn)}
                  style={{ cursor: 'pointer', fontSize: 16, position: 'absolute', right: 5, top: 6 }}
                  onClick={() => onClickCellButton(btn)}
               />
            </Tooltip>
         ))}


         {modalListDrawingAttached && (
            <ModalStyled
               title={'Documents List'}
               visible={modalListDrawingAttached !== null ? true : false}
               footer={null}
               destroyOnClose={true}
               centered={true}
               onCancel={() => {
                  setModalListDrawingAttached(null);
                  setBtnShown(false);
               }}

            >
               <div style={{
                  width: '95%'
               }}>{modalListDrawingAttached.map(dwgLink => {
                  const fileName = /[^/]*$/.exec(dwgLink)[0]
                  return (
                     <FileLinkName
                        key={dwgLink}
                        onClick={() => openDrawingFromList(dwgLink)}
                        style={{ cursor: 'pointer', margin: 5, padding: 5 }}
                     >{fileName}</FileLinkName>
                  );
               })}</div>
               <div style={{ padding: 20, display: 'flex', flexDirection: 'row-reverse', marginTop: 15, borderTop: '1px solid #D8D8D8' }}>
                  <ButtonGroupComp
                     onClickCancel={() => {
                        setModalListDrawingAttached(null);
                        setBtnShown(false);
                     }}
                     onClickApply={() => {
                        setModalListDrawingAttached(null);
                        setBtnShown(false);
                     }}
                  />
               </div>
            </ModalStyled>
         )}



         {modalContentText && (
            <ModalStyled
               title={column.key}
               visible={modalContentText !== null ? true : false}
               footer={null}
               onCancel={() => {
                  setModalContentText(null);
                  setBtnShown(false);
               }}
               destroyOnClose={true}
               centered={true}
               width='50%'
            >
               <div style={{ overflowY: 'auto', whiteSpace: 'pre-wrap', maxHeight: 600 }}>
                  {replaceBreakLine(modalContentText)}
               </div>
            </ModalStyled>
         )}




         {panelUploadSignedOffFormShown && (
            <ModalStyled
               title={'Submit Signed Off Cover Form'}
               visible={panelUploadSignedOffFormShown}
               footer={null}
               onCancel={() => {
                  setPanelUploadSignedOffFormShown(false);
                  setBtnShown(false);
               }}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.6}
            >
               <div style={{ background: 'white', height: 120 }}>
                  <div style={{
                     marginBottom: 20,
                     display: 'flex',
                     textOverflow: 'ellipsis',
                     overflow: 'hidden',
                     whiteSpace: 'nowrap',
                     // borderBottom: '1px solid #D8D8D8'
                  }}>
                     <Upload
                        name='file' accept='application/pdf' multiple={false} showUploadList={false}
                        headers={{ authorization: 'authorization-text' }}
                        beforeUpload={() => { return false }}
                        onChange={onChangeUploadSignedOffForm}
                     >
                        <ButtonStyle
                           marginRight={5}
                           name='Upload Signed Off Cover Form'
                        />
                     </Upload>
                     <div style={{
                        marginLeft: 15
                     }}>{fileSignedOffFormPdf && Object.values(fileSignedOffFormPdf)[0].name}</div>
                  </div>


                  <div style={{ marginTop: 10, padding: 10, float: 'right' }}>
                     <ButtonGroupComp
                        onClickApply={submitSignedOffFormSendEmail}
                        onClickCancel={() => {
                           setPanelUploadSignedOffFormShown(false);
                           setBtnShown(false);
                        }}
                        newTextBtnApply={`Submit ${refType.toUpperCase()}`}
                     />
                  </div>
               </div>
            </ModalStyled>
         )}

      </div>
   );
};

export default CellForm;



const ButtonForm = styled.div`
   &:hover {
      cursor: pointer;
   };
   border-radius: 0;
   border: 1px solid grey;
   background: ${props => props.isActive ? colorType.yellow : colorType.grey4};
   min-width: 24px;
   margin-right: 3px;
   
   text-align: center;
   transition: 0.3s;
`;

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
      padding: 20px;
      justify-content: center;
   }
`;


const FileLinkName = styled.div`
   &:hover {
      background-color: #f1f2f6;
   };
   transition: 0.3s;
   text-overflow: ellipsis;
   overflow: hidden;
   white-space: nowrap;
`;

const getTooltipText = (btnName, pageSheetTypeName) => {
   let result = 'No Tooltip';
   if (btnName === 'btn-linkSubmissionFiles') {
      result = 'Open Submission Documents';
   } else if (btnName === 'btn-submitSignedOffToConsultant') {
      result = 'Submit To Consultants';
   } else if (btnName === 'btn-edit') {
      result = 'Edit Form';
   } else if (btnName === 'btn-resubmit') {
      result = 'Resubmit Form';
   } else if (btnName === 'btn-reply' && pageSheetTypeName === 'page-cvi') {
      result = 'Reply Or Acknowledge Form';
   } else if (btnName === 'btn-reply' && pageSheetTypeName === 'page-dt') {
      result = 'Acknowledge Form';
   } else if (btnName === 'btn-reply' && pageSheetTypeName !== 'page-cvi' && pageSheetTypeName !== 'page-dt') {
      result = 'Open Reply Documents';
   } else if (btnName === 'btn-linkReplyFiles') {
      result = 'Open Reply Form';
   } else if (btnName === 'btn-textContent') {
      result = 'See Content';
   };
   return result;
};

const getOffsetRight = (index, isThereIconSubmitOrReply) => {
   let y = isThereIconSubmitOrReply ? 22 : 0;

   if (index === 0) return 5 + y;
   else {
      return 5 + y + index * 22;
   };
};
const getButtonType = (btnName) => {
   let result = 'xxx';
   if (btnName === 'btn-linkSubmissionFiles') {
      result = 'file';
   } else if (btnName === 'btn-submitSignedOffToConsultant') {
      result = 'vertical-align-top';
   } else if (btnName === 'btn-edit') {
      result = 'edit';
   } else if (btnName === 'btn-resubmit') {
      result = 'plus-square';
   } else if (btnName === 'btn-reply') {
      result = 'form';
   } else if (btnName === 'btn-linkReplyFiles') {
      result = 'file';
   } else if (btnName === 'btn-textContent') {
      result = 'file';
   };
   return result;
};





export const checkIfEditTimeIsOverMultiForm = (rowData, replyCompany, editTimeAllowed, refType, type) => {

   if (type === 'check-if-submission-edit-is-over') {

      const dateNoSendEmailSubmission = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'dateSendNoEmail');
      const dateSubmission = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'date');
      const date = dateNoSendEmailSubmission || dateSubmission;

      if (!date) return -1;

      const duration = moment.duration(moment(new Date()).diff(date)).asMinutes();
      return editTimeAllowed - duration;

   } else if (type === 'check-if-reply-edit-is-over') {
      const dateNoSendEmailReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'dateSendNoEmail', replyCompany);
      const dateReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'date', replyCompany);
      const date = dateNoSendEmailReply || dateReply;

      if (!date) return -1;

      const duration = moment.duration(moment(new Date()).diff(date)).asMinutes();
      return editTimeAllowed - duration;

   };
};



const getCellFormData = (row, header, refType, replyCompany, replyStatus, replyDate, onClickCellButton, company, pageSheetTypeName, email, overdueCount, isBothSideActionUser) => {

   if (
      header === 'RFAM Ref' ||
      header === 'RFI Ref' ||
      header === 'CVI Ref' ||
      header === 'DT Ref' ||
      header === 'MM Ref'
   ) {
      return row.revision === '0' ? row[refType + 'Ref'] : row[refType + 'Ref'] + row.revision;

   } else if (header === 'Description') return getInfoValueFromRefDataForm(row, 'submission', refType, 'description');
   else if (header === 'Requested By') return getInfoValueFromRefDataForm(row, 'submission', refType, 'requestedBy');
   else if (header === 'Submission Date') {
      const dateSubmission = getInfoValueFromRefDataForm(row, 'submission', refType, 'date');

      return moment(dateSubmission).format('DD/MM/YY');

   } else if (header === 'Conversation Date') {
      const dateSubmission = getInfoValueFromRefDataForm(row, 'submission', refType, 'dateConversation');
      const timeSubmission = getInfoValueFromRefDataForm(row, 'submission', refType, 'timeConversation');
      return `${moment(dateSubmission).format('DD/MM/YY')} -  ${moment(timeSubmission).format('HH:mm')}`;

   } else if (header === 'Due Date') {
      const dateDue = getInfoValueFromRefDataForm(row, 'submission', refType, 'due');
      if (dateDue) {
         return <span style={{
            fontWeight: overdueCount < 0 && 'bold',
            color: overdueCount < 0 && 'red',
         }}>
            {moment(dateDue).format('DD/MM/YY')}
         </span>

      } else {
         return '';
      };


   } else if (header === 'Conversation Among') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'conversationAmong');
   } else if (header === 'Cost Implication') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'isCostImplication')
         ? <Icon type='check' />
         : null;
   } else if (header === 'Time Extension') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'isTimeExtension')
         ? <Icon type='check' />
         : null;
   } else if (header === 'Signatured By') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'signaturedBy');
   } else if (header === 'Contract Specification') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'contractSpecification');
   } else if (header === 'Proposed Specification') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'proposedSpecification');
   } else if (header === 'Submission Type') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'submissionType');
   } else if (header === 'Attachment Type') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'herewithForDt');
   } else if (header === 'Transmitted For') {
      return getInfoValueFromRefDataForm(row, 'submission', refType, 'transmittedForDt');
   } else if (header === 'Received By') {

      const consultantMustReply = getInfoValueFromRefDataForm(row, 'submission', refType, 'consultantMustReply');

      return (
         <div style={{ display: 'flex' }}>
            {consultantMustReply.map((cmp, i) => {

               let iconTagsArray = [];

               const isEditTimeReplyIsOverMultiForm = checkIfEditTimeIsOverMultiForm(row, cmp, EDIT_DURATION_MIN, refType, 'check-if-reply-edit-is-over');
               const isUserTheRefCreator = getInfoValueFromRefDataForm(row, 'reply', refType, 'user', cmp) === email;
               const isSignedOffAlreadySubmitted = getInfoValueFromRefDataForm(row, 'submission', refType, 'linkSignedOffFormSubmit');

               const isThisRefAlreadyAcknowledged = getInfoValueFromRefDataForm(row, 'reply', refType, 'acknowledge', cmp);
               const isThisRefAlreadyReplied = getInfoValueFromRefDataForm(row, 'reply', refType, 'status', cmp);

               const isRepliedFormUploaded = getInfoValueFromRefDataForm(row, 'reply', refType, 'linkFormReply', cmp);

               if (
                  ((cmp === company || isBothSideActionUser) && isSignedOffAlreadySubmitted && pageSheetTypeName === 'page-cvi' && !isThisRefAlreadyReplied) ||
                  (cmp === company && isSignedOffAlreadySubmitted && pageSheetTypeName === 'page-dt' && !isThisRefAlreadyReplied)
               ) {
                  iconTagsArray = [...iconTagsArray, 'btn-reply'];
               };

               if ((cmp === company || isBothSideActionUser) && isRepliedFormUploaded && isEditTimeReplyIsOverMultiForm > 0 && isUserTheRefCreator) {
                  iconTagsArray = [...iconTagsArray, 'btn-edit'];
               };

               if (
                  isRepliedFormUploaded && (isEditTimeReplyIsOverMultiForm <= 0 || isUserTheRefCreator)) {
                  iconTagsArray = [...iconTagsArray, 'btn-linkReplyFiles'];
               };


               if (pageSheetTypeName === 'page-dt' && isThisRefAlreadyAcknowledged) {
                  iconTagsArray = iconTagsArray.filter(btn => btn !== 'btn-reply');
               };

               return (
                  <div
                     key={i}
                     style={{
                        marginRight: 5, paddingLeft: 4, paddingRight: 4,
                        background: (isThisRefAlreadyAcknowledged || isThisRefAlreadyReplied) ? colorType.yellow : 'white',
                        fontWeight: (isThisRefAlreadyAcknowledged || isThisRefAlreadyReplied) ? 'bold' : 'normal',
                        border: `1px solid ${colorType.grey1}`,
                        display: 'flex',
                     }}
                  >
                     <div>{cmp}</div>
                     {iconTagsArray.map((icon, index) => (
                        <Tooltip key={index} placement='top' title={getTooltipText(icon, pageSheetTypeName)}>
                           <Icon
                              type={getButtonType(icon)}
                              style={{
                                 cursor: 'pointer', fontSize: 16,
                                 marginTop: 1,
                                 marginLeft: index === 0 ? 10 : 5
                              }}
                              onClick={() => onClickCellButton(icon, cmp)}
                           />
                        </Tooltip>
                     ))}
                  </div>
               );
            })}
         </div>
      );
   } else if (isColumnConsultant(header) || isColumnWithReplyData(header)) {
      return replyStatus ? (
         <>
            <span style={{ fontWeight: 'bold' }}>{replyCompany}</span>
            <span>{` - (${replyDate})`}</span>
         </>
      ) : replyCompany;
   };

   return 'xxx-xx';
};






const getConsultantReplyFormData = (rowData, header, refType) => {
   let replyStatus, replyCompany, replyDate;

   const listConsultantMustReply = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');
   if (!listConsultantMustReply || listConsultantMustReply.length === 0) return { replyStatus, replyCompany, replyDate };

   const consultantHeaderNumber = parseInt(header.slice(12, header.length - 1));

   const consultantNameOfThisCell = listConsultantMustReply[consultantHeaderNumber - 1];

   return {
      replyStatus: rowData[`reply-${refType}-status-${consultantNameOfThisCell}`],
      replyCompany: consultantNameOfThisCell,
      replyDate: convertReplyOrSubmissionDate(rowData[`reply-${refType}-date-${consultantNameOfThisCell}`])
   };
};


export const getInfoValueFromRefDataForm = (obj, typeSubmit, typeForm, info, company) => {
   for (const key in obj) {
      if (key.includes(
         typeSubmit === 'reply'
            ? `${typeSubmit}-${typeForm}-${info}-${company}`
            : `${typeSubmit}-${typeForm}-${info}-` // must have '-' ending 
      )) {
         return obj[key];
      };
   };
};
export const getInfoKeyFromRefDataForm = (obj, typeSubmit, typeForm, info, company) => {
   for (const key in obj) {
      if (key.includes(
         typeSubmit === 'reply'
            ? `${typeSubmit}-${typeForm}-${info}-${company}`
            : `${typeSubmit}-${typeForm}-${info}-` // must have '-' ending 
      )) {
         return key;
      };
   };
};


const isTextContentCell = (header) => {
   return header === 'Description' ||
      header === 'Contract Specification' ||
      header === 'Proposed Specification' ||
      header === 'Conversation Among';
};



