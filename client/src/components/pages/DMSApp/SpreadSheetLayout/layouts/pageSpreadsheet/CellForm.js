import { Icon, message, Modal, Tooltip, Upload } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, SERVER_URL, tradeArrayForm, tradeArrayMeetingMinutesForm } from '../../constants';
import { mongoObjectId } from '../../utils';
import ButtonColumnTag from '../generalComponents/ButtonColumnTag';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import ButtonStyle from '../generalComponents/ButtonStyle';
import { convertReplyOrSubmissionDate, getInfoValueFromRfaData, isColumnConsultant, isColumnWithReplyData } from './CellRFA';
import { getFileNameFromLinkResponse, getKeyTextForSheet } from './PanelSetting';





const CellForm = (props) => {

   const { rowData, cellData, column, buttonPanelFunction, contextInput, commandAction, setLoading } = props;


   const { contextCell, contextRow, contextProject } = contextInput;
   const { stateCell, getCellModifiedTemp, setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const {
      token, projectId, projectName, roleTradeCompany, companies, company, email, projectIsAppliedRfaView,
      pageSheetTypeName, isAdmin, isUserCanSubmitBothSide
   } = stateProject.allDataOneSheet;


   const expandedColumn = pageSheetTypeName === 'page-rfam' ? 'RFAM Ref'
      : pageSheetTypeName === 'page-rfi' ? 'RFI Ref'
         : pageSheetTypeName === 'page-cvi' ? 'CVI Ref'
            : pageSheetTypeName === 'page-dt' ? 'DT Ref'
               : pageSheetTypeName === 'page-mm' ? 'MM Ref'
                  : 'n/a';

   const [activeBtn, setActiveBtn] = useState('All');

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
   const [consultantsReply, setConsultantsReply] = useState([]);

   const [thereIsDrawingWithNoReplyAndConsultantAllowedReply, setThereIsDrawingWithNoReplyAndConsultantAllowedReply] = useState(false);
   const [thereIsDrawingWithNoRef, setThereIsDrawingWithNoRef] = useState(false);
   const [consultantsNotReplyYet, setConsultantsNotReplyYet] = useState([]);

   const [modalPickConsultantForAdmin, setModalPickConsultantForAdmin] = useState(false);
   const [modalActionTypeForAdminSubmit, setModalActionTypeForAdminSubmit] = useState(null);

   const [isAdminActionWithNoEmailSent, setIsAdminActionWithNoEmailSent] = useState(false);

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

            const consultantMustReplyArray = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');

            if (isUserCanSubmitBothSide) {
               // if (allRowsChildren.find(row => !row[refKey])) {
               //    setThereIsDrawingWithNoRef(true);
               // } else {
               //    setThereIsDrawingWithNoRef(false);
               // };
               // let arrayConsultantNotReplyYet = [];
               // consultantMustReplyArray.forEach(cst => {
               //    const statusReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'status', cst);
               //    if (!statusReply) {
               //       arrayConsultantNotReplyYet.push(cst);
               //    };
               // });
               // if (arrayConsultantNotReplyYet.length > 0) {
               //    setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
               //    setConsultantsNotReplyYet(arrayConsultantNotReplyYet);
               // } else {
               //    setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
               // };

            } else if (roleTradeCompany.role === 'Consultant') {
               if (
                  consultantMustReplyArray && consultantMustReplyArray.indexOf(company) !== -1 &&
                  (
                     (!rowData[`reply-${refType}-status-${company}`] && pageSheetTypeName === 'page-rfam') ||
                     (!rowData[`reply-${refType}-status-${company}`] && pageSheetTypeName === 'page-rfi') ||
                     (!rowData[`reply-${refType}-acknowledge-${company}`] && pageSheetTypeName === 'page-dt') ||
                     ((!rowData[`reply-${refType}-acknowledge-${company}`] && !rowData[`reply-${refType}-status-${company}`]) && pageSheetTypeName === 'page-cvi')
                  )

               ) {
                  setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
               } else {
                  setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
               };
            } else if (roleTradeCompany.role === 'Document Controller') {

               // if (allRowsChildren.find(row => !row['RFA Ref'])) {
               //    setThereIsDrawingWithNoRef(true);
               // } else {
               //    setThereIsDrawingWithNoRef(false);
               // };
            };
         } else {

            if (column.key === 'Received By') {

               setConsultantsReply(getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply'));


            } else if (isColumnWithReplyData(column.key)) {
               const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyFormData(rowData, column.key, refType, companies);
               setReplyStatus(replyStatusData);
               setReplyCompany(replyCompanyData);
               setReplyDate(convertReplyOrSubmissionDate(replyDateData));

            } else if (isColumnConsultant(column.key)) {

               if (roleTradeCompany.role !== 'Consultant') {
                  const consultantLead = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply')[0];
                  setReplyStatus(rowData[`reply-${refType}-status-${consultantLead}`]);
                  setReplyCompany(consultantLead);

                  const dateInfo = rowData[`reply-${refType}-date-${consultantLead}`];
                  setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               } else {
                  const consultantMustReplyValue = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');
                  if (consultantMustReplyValue.indexOf(company) !== -1) {
                     setReplyStatus(rowData[`reply-${refType}-status-${company}`]);
                     setReplyCompany(company);
                     const dateInfo = rowData[`reply-${refType}-date-${company}`];

                     setReplyDate(convertReplyOrSubmissionDate(dateInfo));
                  };
               };
            };
         };
      };
   }, [activeBtn]);




   const [isDrawingDetailTableDms, setIsDrawingDetailTableDms] = useState(null);
   const [is3dModelAttached, setIs3dModelAttached] = useState(false);

   useEffect(() => {
      // if (column.key.includes('Version ')) {
      //    const versionIndex = column.key.slice(8, column.key.length);
      //    const infoData = rowData['Info'];
      //    if (isColumnWithReplyData(infoData)) {
      //       const dataStatus = getInfoValueFromRfaData(rowData[versionIndex], 'reply', 'status');
      //       if (dataStatus) {
      //          const dataDate = getInfoValueFromRfaData(rowData[versionIndex], 'reply', 'date');
      //          const keyStatus = getInfoKeyFromRfaData(rowData[versionIndex], 'reply', 'status');
      //          const companyName = keyStatus.slice(17, keyStatus.length);

      //          setReplyStatus(dataStatus);
      //          setReplyCompany(companyName);
      //          setReplyDate(convertReplyOrSubmissionDate(dataDate));

      //          setRefData(rowData[versionIndex]);

      //          setIsDrawingDetailTableDms('drawing-detail-consultant');
      //       };
      //    } else if (infoData === 'RFA Ref') {
      //       setRefData(rowData[versionIndex]);

      //       setIsDrawingDetailTableDms('drawing-detail-rfa');

      //       const dwfxLink = getInfoValueFromRfaData(rowData[versionIndex], 'submission', 'dwfxLink');
      //       if (dwfxLink) {
      //          setIs3dModelAttached(true);
      //       };
      //    };
      // };

      // if (!rowData.treeLevel && projectIsAppliedRfaView && column.key === 'RFA Ref' && rowData['RFA Ref']) {
      //    const dwfxLink = getInfoValueFromRfaData(rowData, 'submission', 'dwfxLink');
      //    if (dwfxLink) {
      //       setIs3dModelAttached(true);
      //    };
      // };
   }, []);







   const onClickRefDrawing = (btn) => {

      const rowsNotThisRef = rowsRefAll.filter(r => r[refKey] !== rowData[refKey]);

      let rowsThisRefFiltered = rowsRefAllInit.filter(r => {
         return r.revision === btn && r[refKey] === rowData[refKey];
      });
      
      getSheetRows({
         ...stateRow,
         [`rows${refType.charAt(0).toUpperCase() + refType.slice(1)}All`]: [...rowsNotThisRef, ...rowsThisRefFiltered]
      });
      setActiveBtn(btn);
   };

   const onClickSubmitOrReplyForm = (btn) => {
      if (!isUserCanSubmitBothSide) {
         // if (btn === 'form-reply-RFA') {
         //    const isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'consultant-check-if-rfa-ready-to-reply');
         //    if (!isEditTimeOver) {
         //       return message.warn('Woh Hup is submitting this RFA, please wait ...');
         //    };
         // } else if (btn === 'form-resubmit-RFA') {
         //    const isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'wohhup-check-if-rfa-ready-to-resubmit');
         //    if (!isEditTimeOver) {
         //       return message.warn('Consultant is replying this RFA, please wait ...');
         //    };
         // };
      };

      // if (roleTradeCompany.role === 'Consultant') {


      // } else if (roleTradeCompany.role === 'Document Controller') {

      // };



      if (roleTradeCompany.role === 'Consultant' && (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt')) {
         if (pageSheetTypeName === 'page-dt') {
            buttonPanelFunction('acknowledge-form');
         } else if (pageSheetTypeName === 'page-cvi') {
            buttonPanelFunction('acknowledge-or-reply-form');
         };

      } else {
         if (btn === 'form-upload-signed-off') {
            setPanelUploadSignedOffFormShown(true);
         } else {
            if (isUserCanSubmitBothSide) {
               setModalActionTypeForAdminSubmit(btn);
            } else {
               buttonPanelFunction(btn);

            };
         };
      };

      getSheetRows({
         ...stateRow,
         currentRefToAddNewOrReplyOrEdit: {
            currentRefNumber: rowData[refKey],
            currentRefData: rowData,
            formRefType: btn,
            isFormEditting: false
         },
      });
   };



   const onMouseDownCellButtonConsultant = async (btn) => {

      try {
         let userReply, isEditTimeOver;
         // if (isDrawingDetailTableDms === 'drawing-detail-consultant') {
         //    userReply = getInfoValueFromRfaData(rfaData, 'reply', 'user', replyCompany);
         //    isEditTimeOver = checkIfEditTimeIsOver(rfaData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
         // } else {
         //    userReply = getInfoValueFromRfaData(rowData, 'reply', 'user', replyCompany);
         //    isEditTimeOver = checkIfEditTimeIsOver(rowData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
         // };

         // if (isEditTimeOver || userReply === email) {

         if (btn === 'Open Form') {

            const linkFormReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', replyCompany);
            const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormReply, expire: 1000 } });
            window.open(res.data);

         } else if (btn === 'Edit') {
            // let adminEditData = {};
            // const listEmailTo = getInfoValueFromRfaData(rfaData, 'reply', 'emailTo', replyCompany);
            // if (isUserCanSubmitBothSide) {
            //    adminEditData = {
            //       isAdminAction: true,
            //       isAdminActionWithNoEmailSent: !listEmailTo || listEmailTo.length === 0,
            //       adminActionConsultantToReply: replyCompany
            //    };
            // };

            // buttonPanelFunction('form-reply-RFA');
            // getSheetRows({
            //    ...stateRow,
            //    currentRfaToAddNewOrReplyOrEdit: {
            //       currentRfaNumber: rowData.rfaNumber,
            //       currentRfaRef: rowData['RFA Ref'],
            //       currentRfaData: rfaData,
            //       formRefType: 'form-reply-RFA',
            //       isFormEditting: true,
            //       ...adminEditData
            //    },
            // });
         };
         // } else {
         //    return message.warn('Consultant is replying this RFA, please wait ...');
         // };
      } catch (err) {
         console.log(err);
      };
   };


   const openDrawingFromList = async (dwgLink) => {
      try {
         const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
         window.open(res.data);
      } catch (err) {
         console.log(err);
      };
   }


   const onMouseDownCellButtonRef = async (btn) => {
      try {
         // let userSubmission, isEditTimeOver;
         // if (isDrawingDetailTableDms === 'drawing-detail-rfa') {
         //    userSubmission = getInfoValueFromRfaData(rfaData, 'submission', 'user');
         //    isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
         // } else {
         //    userSubmission = getInfoValueFromRfaData(rowData, 'submission', 'user');
         //    isEditTimeOver = checkIfEditTimeIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
         // };

         // if (!isEditTimeOver && userSubmission === email && btn === 'Open Form') {
         //    return message.warn('3D model is uploading, please wait ...');
         // };

         // if (isEditTimeOver || userSubmission === email) {
         if (btn === 'Open Drawing List') {

            const dwgsLinkList = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawings');

            setModalListDrawingAttached(dwgsLinkList);

         } else if (btn === 'Open Form') {

            const linkFormSignedOff = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
            if (linkFormSignedOff) {
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormSignedOff, expire: 1000 } });
               window.open(res.data);
            } else {
               const linkFormNoSignature = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkFormNoSignature');
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormNoSignature, expire: 1000 } });
               window.open(res.data);
            };


         } else if (btn === 'Edit') {
            // const typeBtn = rowData['RFA Ref'] !== rowData.rfaNumber ? 'form-resubmit-RFA' : 'form-submit-RFA';
            // if (isUserCanSubmitBothSide) {

            // } else {

            //    buttonPanelFunction(typeBtn);
            //    getSheetRows({
            //       ...stateRow,
            //       currentRfaToAddNewOrReplyOrEdit: {
            //          currentRfaNumber: rowData.rfaNumber,
            //          currentRfaRef: rowData['RFA Ref'],
            //          currentRfaData: rfaData,
            //          formRefType: typeBtn,
            //          isFormEditting: true
            //       },
            //    });
            // };
         };
         // } else {
         //    return message.warn('Woh Hup is submitting this RFA, please wait ...');
         // };
      } catch (err) {
         console.log(err);
      };
   };




   // roleTradeCompany.role === 'Consultant' ? 'reply' : roleTradeCompany.role === 'Document Controller' ? 'submission' : '',

   const checkIfEditBtnShown = (header) => {

      // if (header === 'RFA Ref' && (roleTradeCompany.role === 'Document Controller' || isUserCanSubmitBothSide)) {

      //    const userSubmission = getInfoValueFromRfaData(rowData, 'submission', 'user');
      //    const isEditTimeOver = checkIfEditTimeIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
      //    if (!isEditTimeOver && userSubmission === email) {
      //       setIsEditButtonShownInCell(true);
      //    } else {
      //       setIsEditButtonShownInCell(false);
      //    };

      // } else if (
      //    (isColumnWithReplyData(column.key) || isColumnConsultant(column.key) || column.key.includes('Version ')) &&
      //    (roleTradeCompany.role === 'Consultant' || isUserCanSubmitBothSide)
      // ) {
      //    const userReply = getInfoValueFromRfaData(rowData, 'reply', 'user', replyCompany);
      //    const isEditTimeOver = checkIfEditTimeIsOver(rowData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
      //    if (!isEditTimeOver && userReply === email) {
      //       setIsEditButtonShownInCell(true);
      //    } else {
      //       setIsEditButtonShownInCell(false);
      //    };
      // } else {
      //    setIsEditButtonShownInCell(false);
      // };
   };




   const applyChooseConsultantToReplyForAdminOnly = (consultantToReply) => {
      setModalPickConsultantForAdmin(false);

      if (pageSheetTypeName === 'page-rfam') {
         buttonPanelFunction('form-reply-multi-type');
      } else if (pageSheetTypeName === 'page-cvi' || pageSheetTypeName === 'page-dt') {
         // buttonPanelFunction('acknowledge-form');
      };

      getSheetRows({
         ...stateRow,
         currentRefToAddNewOrReplyOrEdit: {
            currentRefNumber: rowData[refKey],
            currentRefData: rowData,
            formRefType: 'form-reply-multi-type',
            isFormEditting: false,

            isAdminAction: true,
            isAdminActionWithNoEmailSent,
            adminActionConsultantToReply: consultantToReply
         },
      });
   };



   const openFormReplyForCvi = async (company) => {
      try {
         const linkFormReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', company);
         const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormReply, expire: 1000 } });
         window.open(res.data);

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
            }));

         };


         const rowChild = rowData.children[0];
         let rowOutput = { _id: rowChild.id, data: {} };

         rowOutput.data[`submission-${refType}-linkSignedOffFormSubmit-${company}`] = arrayFileName[0].fileLink;

         await Axios.post(`${SERVER_URL}/row-${refType}/save-rows-${refType}/`, { token, projectId, rows: [rowOutput] });

         
         await Axios.post('/api/rfa/mail', {
            token,
            data: {
               projectId, company, projectName,
               formSubmitType: refType,
               type: 'submit-signed-off-final',
               rowIds: [rowChild.id],
               emailSender: email,
            },
            momentToTriggerEmail: moment().add(moment.duration(0.5, 'minutes'))
         });



         message.success('Submitted Successfully', 3);

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



   const applyResubmitForAdminOnly = (isNoEmailSent) => {
      // buttonPanelFunction('form-resubmit-RFA');
      // getSheetRows({
      //    ...stateRow,
      //    currentRfaToAddNewOrReplyOrEdit: {
      //       currentRfaNumber: rowData.rfaNumber,
      //       currentRfaRef: rfaRefText,
      //       currentRfaData: rfaData,
      //       formRefType: 'form-resubmit-RFA',
      //       isFormEditting: false,

      //       isAdminAction: true,
      //       isAdminActionWithNoEmailSent: isNoEmailSent,
      //    },
      // });
   };




   // const additionalBtnToEdit = (isEditButtonShownInCell && pageSheetTypeName !== 'page-spreadsheet') ? ['Edit'] : [];
   // const additionalBtn3DModel = is3dModelAttached ? ['Open Form'] : [];

   let arrayButtonReplyAndResubmit = [];

   if (!rowData.treeLevel && column.key === expandedColumn) {
      if (isUserCanSubmitBothSide) {
         // if (thereIsDrawingWithNoRef) {
         //    arrayButtonReplyAndResubmit = [...arrayButtonReplyAndResubmit, 'plus-square'];
         // };
         // if (thereIsDrawingWithNoReplyAndConsultantAllowedReply) {
         //    arrayButtonReplyAndResubmit = [...arrayButtonReplyAndResubmit, 'form'];
         // };
      } else {
         if (thereIsDrawingWithNoReplyAndConsultantAllowedReply && roleTradeCompany.role === 'Consultant') {
            arrayButtonReplyAndResubmit = ['form'];
         }
         // } else if (thereIsDrawingWithNoRef && roleTradeCompany.role === 'Document Controller') {
         //    arrayButtonReplyAndResubmit = ['plus-square'];
         // };
      };

      const linkSignedOffFormSubmit = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
      if (!linkSignedOffFormSubmit && roleTradeCompany.role === 'Document Controller') {
         arrayButtonReplyAndResubmit = ['vertical-align-top', ...arrayButtonReplyAndResubmit];
      };
   };
   const additionalBtnToEdit = [];


   return (
      <div
         style={{
            width: '100%', height: '100%',
            position: 'relative', 
            display: 'flex',
            padding: 5, color: 'black',
            background: (column.key === 'Due Date' && overdueCount < 0)
               ? '#FFEBCD'
               : (colorTextRow[replyStatus] || 'transparent'),
         }}
         onMouseOver={() => {
            // if (
            //    !rowData.treeLevel &&
            //    (isColumnWithReplyData(column.key) || isColumnConsultant(column.key) || column.key === 'RFA Ref')
            // ) {
            //    checkIfEditBtnShown(column.key);
            // };

            if (!btnShown) setBtnShown(true);
         }}
         onMouseLeave={() => {
            if (btnShown) setBtnShown(false);
         }}
      >
         {(rowData.treeLevel && column.key === expandedColumn) ? (
            <div style={{ color: 'black', fontWeight: 'bold' }}>{rowData.title}</div>
         ) : !rowData.treeLevel ? (
            <div style={{ display: 'flex' }}>
               <span>{getCellFormData(rowData, column.key, refType, consultantsReply, replyCompany, replyStatus, replyDate, openFormReplyForCvi)}</span>
               {column.key === expandedColumn && (
                  <div style={{ 
                     display: 'flex',
                     marginLeft: rowData['revision'] === '0' ? 14 : 7
                  }}>
                     {rowData['btn'].map(btn => (
                        <ButtonForm
                           key={btn}
                           onClick={() => onClickRefDrawing(btn)}
                           isActive={btn === activeBtn}
                        >{btn}</ButtonForm>
                     ))}
                  </div>
               )}
            </div>
         ) : ''}



         {(
            btnShown &&
            !rowData.treeLevel &&
            (
               // (isColumnSubmitOrReply(column.key) === 'column-submit' && getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit')) ||
               (isColumnSubmitOrReply(column.key) === 'column-submit') ||
               ((isColumnConsultant(column.key) || isColumnWithReplyData(column.key)) && getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', replyCompany))
            )
         ) && (
               <>
                  {(isColumnSubmitOrReply(column.key) === 'column-submit'
                     ? ['Open Drawing List', 'Open Form', ...additionalBtnToEdit]
                     : ['Open Form', ...additionalBtnToEdit]
                  ).map((btn, i) => (
                     <Tooltip key={btn} placement='top' title={btn}>
                        <div
                           style={{
                              cursor: 'pointer',
                              marginLeft: i === 0 ? 10 : 5,
                              height: 17, width: 17,
                           }}
                           onClick={() => {
                              if (isColumnSubmitOrReply(column.key) === 'column-submit') {
                                 onMouseDownCellButtonRef(btn);
                              } else {
                                 onMouseDownCellButtonConsultant(btn);
                              };
                           }}
                        >
                           <Icon
                              type={btn === 'Open Drawing List' ? 'file' : btn === 'Open Form' ? 'shake' : 'edit'}
                              style={{ color: 'black', fontSize: 15 }}
                           />
                        </div>
                     </Tooltip>
                  ))}
               </>
            )}


         {arrayButtonReplyAndResubmit.map(button => (
            <Tooltip key={button} placement='top' title={button === 'form' ? `Reply To This ${refType.toUpperCase()}` : button === 'plus-square' ? `Resubmit This ${refType.toUpperCase()}` : null} >
               <Icon
                  type={button}
                  style={{
                     fontSize: 17,
                     transform: 'translateY(1.5px)',
                     position: 'absolute',
                     right: arrayButtonReplyAndResubmit.length === 2 ? (button === 'form' ? 30 : 3) : 3,
                     top: 0
                  }}
                  onClick={() => onClickSubmitOrReplyForm(
                     button === 'form' ? 'form-reply-multi-type' :
                        button === 'plus-square' ? 'form-resubmit-multi-form' :
                           button === 'vertical-align-top' ? 'form-upload-signed-off' :
                              null
                  )}
               />
            </Tooltip>
         ))}


         {modalListDrawingAttached && (
            <ModalStyled
               title={'Drawing List'}
               visible={modalListDrawingAttached !== null ? true : false}
               footer={null}
               destroyOnClose={true}
               centered={true}
               onCancel={() => {
                  setModalListDrawingAttached(null);
                  setBtnShown(false);
               }}
            >
               <div>{modalListDrawingAttached.map(dwgLink => {
                  const fileName = /[^/]*$/.exec(dwgLink)[0]
                  return (
                     <div
                        key={dwgLink}
                        onClick={() => openDrawingFromList(dwgLink)}
                        style={{ cursor: 'pointer' }}
                     >{fileName}</div>
                  );
               })}</div>
            </ModalStyled>
         )}


         {modalActionTypeForAdminSubmit && (
            <ModalStyled
               title={'Choose Action (Admin)'}
               visible={modalActionTypeForAdminSubmit === null ? false : true}
               footer={null}
               onCancel={() => setModalActionTypeForAdminSubmit(null)}
               destroyOnClose={true}
               centered={true}
            >
               <div style={{ flexDirection: 'column' }}>

                  <div style={{ color: 'black', marginBottom: 10 }}>{`Do you want to submit/reply ${refType.toUpperCase()} and send an email ? (Not sending email option allows you to migrate ${refType.toUpperCase()} already submitted previously)`}</div>
                  <div style={{ marginTop: 20, padding: 10, display: 'flex', flexDirection: 'row-reverse' }}>
                     <ButtonGroupComp
                        onClickApply={() => {
                           if (modalActionTypeForAdminSubmit === 'form-reply-multi-type') {
                              setModalPickConsultantForAdmin(true);
                              setIsAdminActionWithNoEmailSent(false);
                              setModalActionTypeForAdminSubmit(null);
                           } else if (modalActionTypeForAdminSubmit === 'form-resubmit-multi-type') {
                              setIsAdminActionWithNoEmailSent(false);
                              applyResubmitForAdminOnly(false);
                              setModalActionTypeForAdminSubmit(null);
                           };
                        }}
                        onClickCancel={() => {
                           if (modalActionTypeForAdminSubmit === 'form-reply-multi-type') {
                              setModalPickConsultantForAdmin(true);
                              setIsAdminActionWithNoEmailSent(true);
                              setModalActionTypeForAdminSubmit(null);
                           } else if (modalActionTypeForAdminSubmit === 'form-resubmit-multi-type') {
                              setIsAdminActionWithNoEmailSent(true);
                              applyResubmitForAdminOnly(true);
                              setModalActionTypeForAdminSubmit(null);
                           };
                        }}
                        newTextBtnApply='Send Email'
                        newTextBtnCancel={`Update ${refType.toUpperCase()} Without Sending Email`}
                     />
                  </div>
               </div>
            </ModalStyled>
         )}


         {modalPickConsultantForAdmin && (
            <ModalStyled
               title={'Choose Consultant To Reply'}
               footer={null} destroyOnClose={true} centered={true}
               visible={modalPickConsultantForAdmin}
               onCancel={() => setModalPickConsultantForAdmin(false)}
               width={window.innerWidth * 0.3}
            >
               <FormPickConsultantToReplyForAdmin
                  applyChooseConsultantToReplyForAdminOnly={applyChooseConsultantToReplyForAdminOnly}
                  onClickCancelModal={() => setModalPickConsultantForAdmin(false)}
                  listConsultants={consultantsNotReplyYet}
               />
            </ModalStyled>
         )}



         {panelUploadSignedOffFormShown && (
            <ModalStyled
               title={'Submit Signed Off Cover Form'}
               visible={panelUploadSignedOffFormShown}
               footer={null}
               onCancel={() => setPanelUploadSignedOffFormShown(false)}
               destroyOnClose={true}
               centered={true}
            >
               <div style={{ flexDirection: 'column' }}>
                  <div style={{ marginBottom: 20, display: 'flex' }}>
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
                     <div>{fileSignedOffFormPdf && Object.values(fileSignedOffFormPdf)[0].name}</div>
                  </div>


                  <div style={{ marginTop: 20, padding: 10, float: 'right' }}>
                     <ButtonGroupComp
                        onClickApply={submitSignedOffFormSendEmail}
                        onClickCancel={() => setPanelUploadSignedOffFormShown(false)}
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
      display: flex;
      justify-content: center;
   }
`;



const cloneRefData = (row, refKey) => {
   let obj = {};
   for (const key in row) {
      if (
         key.includes('reply') ||
         key.includes('submission') ||
         key === refKey ||
         key === 'revision' ||
         key === 'trade'
      ) {
         obj[key] = row[key];
      };
   };
   return obj;
};



const checkIfEditTimeIsOver = (rowData, replyCompany, editTimeAllowed, type) => {
   let result = false;
   let duration;

   if (type === 'consultant-check-if-rfa-ready-to-reply' || type === 'check-if-rfa-button-ready') {
      const dateSubmission = getInfoValueFromRfaData(rowData, 'submission', 'date');
      if (dateSubmission) {
         duration = moment.duration(moment(new Date()).diff(dateSubmission)).asMinutes();
      } else {
         return true;
      };
   } else if (type === 'check-if-status-button-ready') {
      const dateReply = getInfoValueFromRfaData(rowData, 'reply', 'date', replyCompany);

      if (typeof dateReply === 'string' && dateReply.length > 8) {
         duration = moment.duration(moment(new Date()).diff(dateReply)).asMinutes();
      } else if (typeof dateReply === 'string' && dateReply.length === 8) {
         return true;
      };
   } else if (type === 'wohhup-check-if-rfa-ready-to-resubmit') {
      const consultantLead = getInfoValueFromRfaData(rowData, 'submission', 'consultantMustReply')[0];
      const dateConsultantLeadReply = getInfoValueFromRfaData(rowData, 'reply', 'date', consultantLead);
      if (typeof dateConsultantLeadReply === 'string' && dateConsultantLeadReply.length > 8) {
         duration = moment.duration(moment(new Date()).diff(dateConsultantLeadReply)).asMinutes();

      } else if (typeof dateConsultantLeadReply === 'string' && dateConsultantLeadReply.length === 8) {
         return true;
      };
   };

   if (duration && duration > editTimeAllowed) {
      return true;
   };
   return result;
};



const isColumnSubmitOrReply = (header) => {
   if (
      header === 'RFAM Ref' ||
      header === 'RFI Ref' ||
      header === 'CVI Ref' ||
      header === 'DT Ref'
   ) return 'column-submit';
};

const getCellFormData = (row, header, refType, consultantsReply, replyCompany, replyStatus, replyDate, openFormReplyForCvi) => {

   if (
      header === 'RFAM Ref' ||
      header === 'RFI Ref' ||
      header === 'CVI Ref' ||
      header === 'DT Ref'
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
      return moment(dateDue).format('DD/MM/YY');

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
      return (
         <div style={{ display: 'flex' }}>
            {consultantsReply.map((cmp, i) => {

               const isAcknowledge = getInfoValueFromRefDataForm(row, 'reply', refType, 'acknowledge', cmp);
               const filePdfAttached = getInfoValueFromRefDataForm(row, 'reply', refType, 'linkFormReply', cmp);
               return (
                  <div
                     key={i}
                     style={{
                        marginRight: 5, paddingLeft: 4, paddingRight: 4,
                        background: isAcknowledge ? colorType.yellow : filePdfAttached ? colorType.green : 'white',
                        fontWeight: (isAcknowledge || filePdfAttached) ? 'bold' : 'normal',
                        border: `1px solid ${colorType.grey1}`,
                        display: 'flex'
                     }}
                  >
                     <div>{cmp}</div>
                     {filePdfAttached && (
                        <div
                           style={{ cursor: 'pointer' }}
                           onClick={() => openFormReplyForCvi(cmp)}
                        >
                           <Icon
                              type={'shake'}
                              style={{ color: 'black', marginLeft: 10, fontSize: 15, transform: 'translateY(1px)' }}
                           />
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      );
   } else if (isColumnConsultant(header) || isColumnWithReplyData(header)) {
      return replyStatus ? (
         <div>
            <span style={{ fontWeight: 'bold' }}>{replyCompany}</span>
            <span>{` - (${replyDate})`}</span>
         </div>
      ) : (
         <div>{replyCompany}</div>
      );
   };

   return 'xxx-xx';
};









const FormPickConsultantToReplyForAdmin = ({ applyChooseConsultantToReplyForAdminOnly, onClickCancelModal, listConsultants }) => {

   const [list, setList] = useState(listConsultants.map(cst => ({
      id: mongoObjectId(),
      header: cst,
      mode: 'hidden'
   })));

   const onClickApply = () => {
      const consultantToReply = list.find(x => x.mode === 'shown');
      if (!consultantToReply) {
         return message.warn('Please choose consultant to reply!');
      };
      applyChooseConsultantToReplyForAdminOnly(consultantToReply.header);
   };

   const setMode = (item) => {
      list.forEach(tag => {
         if (tag.id === item.id) {
            tag.mode = 'shown';
         } else {
            tag.mode = 'hidden';
         };
      });
      setList([...list]);
   };

   return (
      <div style={{ width: '100%', height: '100%' }}>
         <PanelStyled>
            <div style={{ fontSize: 11, paddingLeft: 20 }}>Click to select consultant to reply.</div>
            <div style={{ width: '100%', paddingTop: 20 }}>
               {list.map((tag, i) => (
                  <ButtonColumnTag
                     key={i}
                     tag={tag}
                     setMode={setMode}
                     actionType='admin-pick-consultant-to-reply'
                  />
               ))}
            </div>
         </PanelStyled>
         <div style={{ marginTop: 20, padding: 10, display: 'flex', flexDirection: 'row-reverse' }}>
            <ButtonGroupComp
               onClickCancel={onClickCancelModal}
               onClickApply={onClickApply}
            />
         </div>

      </div>
   );
};

const PanelStyled = styled.div`
   max-height: 60vh;
   width: 100%;
   /* overflow-y: scroll; */
   /* overflow-x: hidden; */
   border-bottom: 1px solid ${colorType.grey4};
`;


export const getConsultantReplyFormData = (rowData, header, refType, companies) => {

   let replyStatus, replyCompany, replyDate;

   const consultantHeaderNumber = parseInt(header.slice(12, header.length - 1));
   const listConsultantMustReply = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');

   if (!listConsultantMustReply || listConsultantMustReply.length === 0) return { replyStatus, replyCompany, replyDate };

   const consultantLeadName = listConsultantMustReply[0];
   if (isColumnWithReplyData(header)) {

      let listConsultantsAlreadyReply = [];
      for (const key in rowData) {
         if (key.includes(`reply-${refType}-status-`)) {
            const companyConsultant = key.slice(`reply-${refType}-status-`.length + 1, key.length);
            listConsultantsAlreadyReply.push(companyConsultant);
         };
      };
      listConsultantsAlreadyReply = [...new Set(listConsultantsAlreadyReply)];

      const listConsultantMustReplyRemaining = listConsultantMustReply.filter(x => x !== consultantLeadName);

      if (consultantHeaderNumber === 1) {
         replyStatus = rowData[`reply-${refType}-status-${consultantLeadName}`];
         replyCompany = consultantLeadName;
         replyDate = convertReplyOrSubmissionDate(rowData[`reply-${refType}-date-${consultantLeadName}`]);
      } else if (consultantHeaderNumber > 1) {
         let ConsultantIndex = 1;
         companies.forEach(cmp => {
            if (listConsultantMustReplyRemaining.indexOf(cmp.company) !== -1) {
               ConsultantIndex += 1;
               if (consultantHeaderNumber === ConsultantIndex) {
                  replyStatus = rowData[`reply-${refType}-status-${cmp.company}`];
                  replyCompany = cmp.company;
                  replyDate = convertReplyOrSubmissionDate(rowData[`reply-${refType}-date-${cmp.company}`]);
               };
            };
         });
      };
   };
   return { replyStatus, replyCompany, replyDate };
};


export const getInfoValueFromRefDataForm = (obj, typeSubmit, typeForm, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${typeSubmit}-${typeForm}-${info}-${company}`)) {
         return obj[key];
      };
   };
};
export const getInfoKeyFromRefDataForm = (obj, typeSubmit, typeForm, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${typeSubmit}-${typeForm}-${info}-${company}`)) {
         return key;
      };
   };
};

