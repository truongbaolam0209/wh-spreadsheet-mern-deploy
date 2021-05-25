import { Icon, message, Modal, Tooltip } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, EDIT_DURATION_MIN } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { compareDates, mongoObjectId } from '../../utils';
import ButtonColumnTag from '../generalComponents/ButtonColumnTag';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';




const CellRFA = (props) => {

   const { rowData, cellData, column, buttonPanelFunction } = props;

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { rowsRfaAll, rowsRfaAllInit } = stateRow;

   const {
      roleTradeCompany, companies, company, email, projectIsAppliedRfaView,
      isUserCanSubmitRfaBothSide, pageSheetTypeName,
   } = stateProject.allDataOneSheet;

   const [btnShown, setBtnShown] = useState(false);
   const [isEditButtonShownInCell, setIsEditButtonShownInCell] = useState(false);

   const [activeBtn, setActiveBtn] = useState('All');
   const [modalContent, setModalContent] = useState(null);

   const [modalActionTypeForAdminSubmit, setModalActionTypeForAdminSubmit] = useState(null);

   const [modalPickConsultantForAdmin, setModalPickConsultantForAdmin] = useState(false);

   const [thereIsDrawingWithNoReplyAndConsultantAllowedReply, setThereIsDrawingWithNoReplyAndConsultantAllowedReply] = useState(false);
   const [thereIsDrawingWithNoRfaRef, setThereIsDrawingWithNoRfaRef] = useState(false);
   const [requestedByCellData, setRequestedByCellData] = useState(null);

   const [rfaData, setRfaData] = useState({});
   const [rfaRefText, setRfaRefText] = useState(null);

   const [replyStatus, setReplyStatus] = useState(null);
   const [replyCompany, setReplyCompany] = useState(null);
   const [replyDate, setReplyDate] = useState(null);


   const [isAdminActionWithNoEmailSent, setIsAdminActionWithNoEmailSent] = useState(false);
   const [overdueCount, setOverdueCount] = useState(0);
   const [consultantsNotReplyYet, setConsultantsNotReplyYet] = useState([]);


   useEffect(() => {

      if (pageSheetTypeName === 'page-rfa' && rowData.treeLevel === 3 && column.key === 'RFA Ref') {

         const rfaNumber = rowData.id;
         const allBtn = rowData['btn'];
         const allRowsChildren = rowData.children;
         const lastBtn = allBtn[allBtn.length - 1];

         let rfaRef;
         if (activeBtn === '-') {
            rfaRef = rfaNumber;
         } else if (activeBtn === 'All') {
            rfaRef = rfaNumber + (lastBtn === '-' ? '' : lastBtn);
         } else if (activeBtn) { // A, B, C, ....
            rfaRef = rfaNumber + activeBtn;
         };

         const rowsWithThisRFA = rowsRfaAllInit.filter(x => x['RFA Ref'] === rfaRef);
         const oneRowChildren = rowsWithThisRFA[0];
         const rfaDataObj = cloneRfaData(oneRowChildren);
         setRfaRefText(rfaRef);
         setRfaData(rfaDataObj);

         const consultantMustReplyArray = getInfoValueFromRfaData(rfaDataObj, 'submission', 'consultantMustReply');

         if (isUserCanSubmitRfaBothSide) {
            if (allRowsChildren.find(row => !row['RFA Ref'])) {
               setThereIsDrawingWithNoRfaRef(true);
            } else {
               setThereIsDrawingWithNoRfaRef(false);
            };
            let arrayConsultantNotReplyYet = [];

            consultantMustReplyArray.forEach(cst => {
               const statusReply = getInfoValueFromRfaData(rfaDataObj, 'reply', 'status', cst);
               if (!statusReply) {
                  arrayConsultantNotReplyYet.push(cst);
               };
            });

            if (arrayConsultantNotReplyYet.length > 0) {
               setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
               setConsultantsNotReplyYet(arrayConsultantNotReplyYet);
            } else {
               setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
            };

         } else if (roleTradeCompany.role === 'Consultant') {
            if (
               !rfaDataObj[`reply-$$$-status-${roleTradeCompany.company}`] &&
               consultantMustReplyArray && consultantMustReplyArray.indexOf(company) !== -1
            ) {
               setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
            } else {
               setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
            };
         } else if (roleTradeCompany.role === 'Document Controller') {

            if (allRowsChildren.find(row => !row['RFA Ref'])) {
               setThereIsDrawingWithNoRfaRef(true);
            } else {
               setThereIsDrawingWithNoRfaRef(false);
            };
         };

      } else if (!rowData.treeLevel && rowData['rfaNumber'] && rowData['RFA Ref']) {

         const rfaDataObj = cloneRfaData(rowData);
         setRfaData(rfaDataObj);

         if (column.key === 'Requested By') {
            setRequestedByCellData(getInfoValueFromRfaData(rfaDataObj, 'submission', 'requestedBy'));

         } else if (isColumnWithReplyData(column.key)) {
            const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyData(rowData, column.key, companies);

            setReplyStatus(replyStatusData);
            setReplyCompany(replyCompanyData);
            setReplyDate(convertReplyOrSubmissionDate(replyDateData));

         } else if (isColumnConsultant(column.key)) {
            if (roleTradeCompany.role !== 'Consultant') {
               const consultantLead = getInfoValueFromRfaData(rfaDataObj, 'submission', 'consultantMustReply')[0];

               setReplyStatus(getInfoValueFromRfaData(rfaDataObj, 'reply', 'status', consultantLead));
               setReplyCompany(consultantLead);

               const dateInfo = getInfoValueFromRfaData(rfaDataObj, 'reply', 'date', consultantLead);
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));
            } else {
               const consultantMustReplyValue = getInfoValueFromRfaData(rfaDataObj, 'submission', 'consultantMustReply');
               if (consultantMustReplyValue.indexOf(company) !== -1) {

                  setReplyStatus(rfaDataObj[`reply-$$$-status-${company}`]);
                  setReplyCompany(company);
                  const dateInfo = rfaDataObj[`reply-$$$-date-${company}`];
                  setReplyDate(convertReplyOrSubmissionDate(dateInfo));
               };
            };

         } else if (column.key === 'Due Date') {
            const consultantMustReplyArray = getInfoValueFromRfaData(rfaDataObj, 'submission', 'consultantMustReply');
            if (!rowData[`reply-$$$-status-${consultantMustReplyArray[0]}`]) {
               const compare = compareDates(rowData['Consultant Reply (T)']);
               setOverdueCount(compare);
            };
         };
      };
   }, [activeBtn]);



   const [isDrawingDetailTableDms, setIsDrawingDetailTableDms] = useState(null);
   const [is3dModelAttached, setIs3dModelAttached] = useState(false);

   useEffect(() => {
      if (column.key.includes('Version ')) {
         const versionIndex = column.key.slice(8, column.key.length);
         const infoData = rowData['Info'];
         if (isColumnWithReplyData(infoData)) {
            const dataStatus = getInfoValueFromRfaData(rowData[versionIndex], 'reply', 'status');
            if (dataStatus) {
               const dataDate = getInfoValueFromRfaData(rowData[versionIndex], 'reply', 'date');
               const keyStatus = getInfoKeyFromRfaData(rowData[versionIndex], 'reply', 'status');
               const companyName = keyStatus.slice(17, keyStatus.length);

               setReplyStatus(dataStatus);
               setReplyCompany(companyName);
               setReplyDate(convertReplyOrSubmissionDate(dataDate));

               setRfaData(rowData[versionIndex] || {});

               setIsDrawingDetailTableDms('drawing-detail-consultant');
            };
         } else if (infoData === 'RFA Ref') {
            setRfaData(rowData[versionIndex] || {});

            setIsDrawingDetailTableDms('drawing-detail-rfa');

            const dwfxLink = getInfoValueFromRfaData(rowData[versionIndex], 'submission', 'dwfxLink');
            if (dwfxLink) {
               setIs3dModelAttached(true);
            };
         };
      };

      if (!rowData.treeLevel && projectIsAppliedRfaView && column.key === 'RFA Ref' && rowData['RFA Ref']) {
         const dwfxLink = getInfoValueFromRfaData(rowData, 'submission', 'dwfxLink');
         if (dwfxLink) {
            setIs3dModelAttached(true);
         };
      };
   }, []);







   const onClickRfaDrawing = (rfaCode, btn) => {
      const rowsNotThisRFA = rowsRfaAll.filter(r => r.rfaNumber !== rfaCode);

      const rowsThisRFAFiltered = rowsRfaAllInit.filter(r => {
         return r.rfaNumber === rfaCode && (
            btn === '-' ? r['RFA Ref'] === rfaCode
               : btn === 'All' ? !r['row']
                  : r['RFA Ref'] === rfaCode + btn
         );
      });
      getSheetRows({
         ...stateRow,
         rowsRfaAll: [...rowsNotThisRFA, ...rowsThisRFAFiltered]
      });
      setActiveBtn(btn);
   };

   const onClickSubmitOrReplyRFA = (btn) => {
      if (btn === 'form-reply-RFA') {
         const isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'consultant-check-if-rfa-ready-to-reply');
         if (!isEditTimeOver) {
            return message.warn('Woh Hup is submitting this RFA, please wait ...');
         };
      } else if (btn === 'form-resubmit-RFA') {
         const isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'wohhup-check-if-rfa-ready-to-resubmit');
         if (!isEditTimeOver) {
            return message.warn('Consultant is replying this RFA, please wait ...');
         };
      };


      if (isUserCanSubmitRfaBothSide) {
         setModalActionTypeForAdminSubmit(btn);
      } else {
         buttonPanelFunction(btn);
         getSheetRows({
            ...stateRow,
            currentRfaToAddNewOrReplyOrEdit: {
               currentRfaNumber: rowData.rfaNumber,
               currentRfaRef: rfaRefText,
               currentRfaData: rfaData,
               formRfaType: btn,
               isFormEditting: false
            },
         });
      };
   };




   const onMouseDownCellButtonConsultant = async (btn, replyCompany, rfaData) => {

      try {
         let userReply, isEditTimeOver;
         if (isDrawingDetailTableDms === 'drawing-detail-consultant') {
            userReply = getInfoValueFromRfaData(rfaData, 'reply', 'user', replyCompany);
            isEditTimeOver = checkIfEditTimeIsOver(rfaData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
         } else {
            userReply = getInfoValueFromRfaData(rowData, 'reply', 'user', replyCompany);
            isEditTimeOver = checkIfEditTimeIsOver(rowData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
         };

         if (isEditTimeOver || userReply === email) {
            if (btn === 'See Note') {
               setModalContent(
                  <div>
                     <div style={{ fontWeight: 'bold' }}>{rfaData[`reply-$$$-user-${replyCompany}`] || ''}</div>
                     <div style={{ fontWeight: 'bold' }}>{rfaData[`reply-$$$-status-${replyCompany}`] || ''}</div>
                     <div>{rfaData[`reply-$$$-comment-${replyCompany}`] || ''}</div>
                  </div>
               );

            } else if (btn === 'Open Drawing File') {
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: rfaData[`reply-$$$-drawing-${replyCompany}`], expire: 1000 } });
               window.open(res.data);

            } else if (btn === 'Open 3D File') {

            } else if (btn === 'Edit') {
               let adminEditData = {};
               const listEmailTo = getInfoValueFromRfaData(rfaData, 'reply', 'emailTo', replyCompany);
               if (isUserCanSubmitRfaBothSide) {
                  adminEditData = {
                     isAdminAction: true,
                     isAdminActionWithNoEmailSent: !listEmailTo || listEmailTo.length === 0,
                     adminActionConsultantToReply: replyCompany
                  };
               };

               buttonPanelFunction('form-reply-RFA');
               getSheetRows({
                  ...stateRow,
                  currentRfaToAddNewOrReplyOrEdit: {
                     currentRfaNumber: rowData.rfaNumber,
                     currentRfaRef: rowData['RFA Ref'],
                     currentRfaData: rfaData,
                     formRfaType: 'form-reply-RFA',
                     isFormEditting: true,
                     ...adminEditData
                  },
               });
            };
         } else {
            return message.warn('Consultant is replying this RFA, please wait ...');
         };
      } catch (err) {
         console.log(err);
      };
   };


   const onMouseDownCellButtonRfaRef = async (btn) => {
      try {
         let userSubmission, isEditTimeOver;
         if (isDrawingDetailTableDms === 'drawing-detail-rfa') {
            userSubmission = getInfoValueFromRfaData(rfaData, 'submission', 'user');
            isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
         } else {
            userSubmission = getInfoValueFromRfaData(rowData, 'submission', 'user');
            isEditTimeOver = checkIfEditTimeIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
         };

         if (!isEditTimeOver && userSubmission === email && btn === 'Open 3D File') {
            return message.warn('3D model is uploading, please wait ...');
         };

         if (isEditTimeOver || userSubmission === email) {
            if (btn === 'Open Drawing File') {
               const dwgLink = getInfoValueFromRfaData(rfaData, 'submission', 'drawing');
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
               window.open(res.data);
            } else if (btn === 'Open 3D File') {
               const dwgLink = getInfoValueFromRfaData(rfaData, 'submission', 'dwfxLink');
               if (dwgLink) {
                  window.open(dwgLink);
               } else {
                  message.info('There is no 3D model attached!');
               };

            } else if (btn === 'Edit') {
               const typeBtn = rowData['RFA Ref'] !== rowData.rfaNumber ? 'form-resubmit-RFA' : 'form-submit-RFA';


               let adminEditData = {};
               const listEmailTo = getInfoValueFromRfaData(rfaData, 'submission', 'emailTo', company);
               if (isUserCanSubmitRfaBothSide) {
                  adminEditData = {
                     isAdminAction: true,
                     isAdminActionWithNoEmailSent: !listEmailTo || listEmailTo.length === 0,
                  };
               };

               buttonPanelFunction(typeBtn);
               getSheetRows({
                  ...stateRow,
                  currentRfaToAddNewOrReplyOrEdit: {
                     currentRfaNumber: rowData.rfaNumber,
                     currentRfaRef: rowData['RFA Ref'],
                     currentRfaData: rfaData,
                     formRfaType: typeBtn,
                     isFormEditting: true,
                     ...adminEditData
                  },
               });
            };
         } else {
            return message.warn('Woh Hup is submitting this RFA, please wait ...');
         };
      } catch (err) {
         console.log(err);
      };
   };


   const onMouseDown = (e) => {
      if (e.button === 2) { // check mouse RIGHT CLICK ...
         if (!column.key.includes('Version ') && column.key !== 'Info') {
            // onRightClickCell(e, props);
         };
      };
   };

   // roleTradeCompany.role === 'Consultant' ? 'reply' : roleTradeCompany.role === 'Document Controller' ? 'submission' : '',

   const checkIfEditBtnShown = (header) => {

      if (header === 'RFA Ref' && (roleTradeCompany.role === 'Document Controller' || isUserCanSubmitRfaBothSide)) {
         const userSubmission = getInfoValueFromRfaData(rowData, 'submission', 'user');
         const isEditTimeOver = checkIfEditTimeIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
         if (!isEditTimeOver && userSubmission === email) {
            setIsEditButtonShownInCell(true);
         } else {
            setIsEditButtonShownInCell(false);
         };

      } else if (
         (isColumnWithReplyData(column.key) || isColumnConsultant(column.key) || column.key.includes('Version ')) &&
         (roleTradeCompany.role === 'Consultant' || isUserCanSubmitRfaBothSide)
      ) {
         const userReply = getInfoValueFromRfaData(rowData, 'reply', 'user', replyCompany);
         const isEditTimeOver = checkIfEditTimeIsOver(rowData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
         if (!isEditTimeOver && userReply === email) {
            setIsEditButtonShownInCell(true);
         } else {
            setIsEditButtonShownInCell(false);
         };
      } else {
         setIsEditButtonShownInCell(false);
      };
   };




   const applyChooseConsultantToReplyForAdminOnly = (consultantToReply) => {
      setModalPickConsultantForAdmin(false);
      buttonPanelFunction('form-reply-RFA');
      getSheetRows({
         ...stateRow,
         currentRfaToAddNewOrReplyOrEdit: {
            currentRfaNumber: rowData.rfaNumber,
            currentRfaRef: rfaRefText,
            currentRfaData: rfaData,
            formRfaType: 'form-reply-RFA',
            isFormEditting: false,

            isAdminAction: true,
            isAdminActionWithNoEmailSent,
            adminActionConsultantToReply: consultantToReply
         },
      });
   };

   const applyResubmitForAdminOnly = (isNoEmailSent) => {
      buttonPanelFunction('form-resubmit-RFA');
      getSheetRows({
         ...stateRow,
         currentRfaToAddNewOrReplyOrEdit: {
            currentRfaNumber: rowData.rfaNumber,
            currentRfaRef: rfaRefText,
            currentRfaData: rfaData,
            formRfaType: 'form-resubmit-RFA',
            isFormEditting: false,

            isAdminAction: true,
            isAdminActionWithNoEmailSent: isNoEmailSent,
         },
      });
   };




   const additionalBtnToEdit = (isEditButtonShownInCell && pageSheetTypeName !== 'page-spreadsheet') ? ['Edit'] : [];
   const additionalBtn3DModel = is3dModelAttached ? ['Open 3D File'] : [];

   let arrayButtonReplyAndResubmit = [];
   if (isUserCanSubmitRfaBothSide) {
      if (thereIsDrawingWithNoRfaRef) {
         arrayButtonReplyAndResubmit = [...arrayButtonReplyAndResubmit, 'plus-square'];
      };
      if (thereIsDrawingWithNoReplyAndConsultantAllowedReply) {
         arrayButtonReplyAndResubmit = [...arrayButtonReplyAndResubmit, 'edit'];
      };
   } else {
      if (thereIsDrawingWithNoReplyAndConsultantAllowedReply && roleTradeCompany.role === 'Consultant') {
         arrayButtonReplyAndResubmit = ['edit'];
      } else if (thereIsDrawingWithNoRfaRef && roleTradeCompany.role === 'Document Controller') {
         arrayButtonReplyAndResubmit = ['plus-square'];
      };
   };



   return (
      <div
         style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            padding: 5,
            color: 'black',
            background: (column.key === 'Due Date' && overdueCount < 0)
               ? '#FFEBCD'
               : (colorTextRow[replyStatus] || 'transparent'),
            fontWeight: (column.key === 'RFA Ref' && rowData.treeLevel) && 'bold'
         }}
         onMouseOver={() => {
            if (
               !rowData.treeLevel &&
               (isColumnWithReplyData(column.key) || isColumnConsultant(column.key) || column.key === 'RFA Ref')
            ) {
               checkIfEditBtnShown(column.key);
            };
            if (!btnShown) setBtnShown(true);
         }}
         onMouseLeave={() => {
            if (btnShown) setBtnShown(false);
         }}
         onMouseDown={onMouseDown}
      >
         {(pageSheetTypeName !== 'page-spreadsheet' && rowData.treeLevel === 3 && column.key === 'RFA Ref') ? (
            <div style={{ display: 'flex', position: 'relative' }}>
               <span style={{ marginRight: 5 }}>{rowData['rfaNumber']}</span>
               <div style={{ display: 'flex' }}>
                  {[...rowData['btn'].sort(), 'All'].map(btn => (
                     <ButtonRFA
                        key={btn}
                        onClick={() => onClickRfaDrawing(rowData['rfaNumber'], btn)}
                        isActive={btn === activeBtn}
                     >{btn === '-' ? '0' : btn}</ButtonRFA>
                  ))}
               </div>

               {arrayButtonReplyAndResubmit.map(button => (
                  <Tooltip key={button} placement='top' title={button === 'edit' ? 'Reply To This RFA' : button === 'plus-square' ? 'Add New RFA For This RFA' : null} >
                     <Icon
                        type={button}
                        style={{
                           fontSize: 17,
                           transform: 'translateY(1.5px)',
                           position: 'absolute',
                           right: arrayButtonReplyAndResubmit.length === 2 ? (button === 'edit' ? 30 : 3) : 3,
                           top: 0
                        }}
                        onClick={() => onClickSubmitOrReplyRFA(button === 'edit' ? 'form-reply-RFA' : button === 'plus-square' ? 'form-resubmit-RFA' : null)}
                     />
                  </Tooltip>
               ))}
            </div>
         ) : (pageSheetTypeName !== 'page-spreadsheet' && rowData.treeLevel >= 2 && column.key === 'RFA Ref') ? rowData.title

            : (!rowData.treeLevel && (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) && !replyStatus && rowData['RFA Ref']) ? (
               <div>{replyCompany}</div>

            ) : (!rowData.treeLevel && (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) && replyStatus) ? (
               <div>
                  <span style={{ fontWeight: 'bold' }}>{replyCompany}</span>
                  <span>{` - (${replyDate})`}</span>
               </div>

            ) : (
               !rowData.treeLevel &&
               column.key.includes('Version ') &&
               isDrawingDetailTableDms === 'drawing-detail-consultant' &&
               replyStatus
            ) ? (
               <div style={{ float: 'left', paddingLeft: 3, fontWeight: 'bold' }}>{replyCompany}</div>

            ) : (
               !rowData.treeLevel &&
               column.key.includes('Version ') &&
               isDrawingDetailTableDms === 'drawing-detail-rfa'
            ) ? (
               <div style={{ float: 'left', paddingLeft: 3, fontWeight: 'bold' }}>{rfaData.rfaRef}</div>

            ) : (!rowData.treeLevel && column.key === 'Due Date') ? (
               <span style={{
                  fontWeight: overdueCount < 0 && 'bold',
                  color: overdueCount < 0 && 'red',
               }}>
                  {rowData['Consultant Reply (T)']}
               </span>

            ) : (!rowData.treeLevel && column.key === 'Submission Date') ? (
               <span>{rowData['Drg To Consultant (A)']}</span>

            ) : (!rowData.treeLevel && column.key === 'Requested By') ? (
               <span>{requestedByCellData}</span>

            ) : (!rowData.treeLevel && !isColumnWithReplyData(column.key)) ? cellData
               : ''}


         {btnShown && !rowData.treeLevel && replyCompany && (
            isColumnWithReplyData(column.key) ||
            isColumnConsultant(column.key) ||
            (column.key.includes('Version ') && isDrawingDetailTableDms === 'drawing-detail-consultant')
         ) && (
               <>
                  {['See Note', 'Open Drawing File', ...additionalBtnToEdit].map(btn => (
                     <Tooltip key={btn} placement='topLeft' title={btn}>
                        <div
                           style={{
                              cursor: 'pointer', position: 'absolute',
                              right: btn === 'See Note' ? 27 : btn === 'Open Drawing File' ? 5 : 51,
                              top: 5, height: 17, width: 17,
                           }}
                           onMouseDown={() => onMouseDownCellButtonConsultant(btn, replyCompany, rfaData)}
                        >
                           <Icon
                              type={btn === 'See Note' ? 'message' : btn === 'Open Drawing File' ? 'file' : 'edit'}
                              style={{ color: replyStatus ? 'white' : 'black', fontSize: 15 }}
                           />
                        </div>
                     </Tooltip>
                  ))}
               </>
            )}

         {btnShown && !rowData.treeLevel && (
            (projectIsAppliedRfaView && column.key === 'RFA Ref' && rowData['RFA Ref']) ||
            (column.key.includes('Version ') && isDrawingDetailTableDms === 'drawing-detail-rfa')
         ) && (
               <>
                  {['Open Drawing File', ...additionalBtn3DModel, ...additionalBtnToEdit].map(btn => (
                     <Tooltip key={btn} placement='top' title={btn}>
                        <div
                           style={{
                              cursor: 'pointer', position: 'absolute',
                              right: btn === 'Open Drawing File' ? 5 : btn === 'Open 3D File' ? 27 : (additionalBtn3DModel.length === 1 ? 51 : 27),
                              top: 5, height: 17, width: 17,
                           }}
                           onMouseDown={() => onMouseDownCellButtonRfaRef(btn)}
                        >
                           <Icon
                              type={btn === 'Open Drawing File' ? 'file' : btn === 'Open 3D File' ? 'shake' : 'edit'}
                              style={{ color: 'black', fontSize: 15 }}
                           />
                        </div>
                     </Tooltip>
                  ))}
               </>
            )
         }


         {modalContent && (
            <ModalStyledSetting
               title={'Drawing comment'}
               visible={modalContent ? true : false}
               footer={null}
               onCancel={() => {
                  setModalContent(null);
                  setBtnShown(false);
               }}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.7}
            >
               {modalContent}
            </ModalStyledSetting>
         )}


         {modalActionTypeForAdminSubmit && (
            <ModalStyledSetting
               title={'Choose Action (Admin)'}
               visible={modalActionTypeForAdminSubmit === null ? false : true}
               footer={null}
               onCancel={() => setModalActionTypeForAdminSubmit(null)}
               destroyOnClose={true}
               centered={true}
            // width={window.innerWidth * 0.5}
            >
               <div style={{ flexDirection: 'column' }}>

                  <div style={{ color: 'black', marginBottom: 10 }}>Do you want to submit/reply RFA and send an email ? (Not sending email option allows you to migrate RFA drawings already submitted previously)</div>
                  <div style={{ marginTop: 20, padding: 10, display: 'flex', flexDirection: 'row-reverse' }}>
                     <ButtonGroupComp
                        onClickApply={() => {
                           if (modalActionTypeForAdminSubmit === 'form-reply-RFA') {
                              setModalPickConsultantForAdmin(true);
                              setIsAdminActionWithNoEmailSent(false);
                              setModalActionTypeForAdminSubmit(null);
                           } else if (modalActionTypeForAdminSubmit === 'form-resubmit-RFA') {
                              setIsAdminActionWithNoEmailSent(false);
                              applyResubmitForAdminOnly(false);
                              setModalActionTypeForAdminSubmit(null);
                           };
                        }}
                        onClickCancel={() => {
                           if (modalActionTypeForAdminSubmit === 'form-reply-RFA') {
                              setModalPickConsultantForAdmin(true);
                              setIsAdminActionWithNoEmailSent(true);
                              setModalActionTypeForAdminSubmit(null);
                           } else if (modalActionTypeForAdminSubmit === 'form-resubmit-RFA') {
                              setIsAdminActionWithNoEmailSent(true);
                              applyResubmitForAdminOnly(true);
                              setModalActionTypeForAdminSubmit(null);
                           };
                        }}
                        newTextBtnApply='Send Email'
                        newTextBtnCancel='Update RFA Without Sending Email'
                     />
                  </div>
               </div>


            </ModalStyledSetting>
         )}

         {modalPickConsultantForAdmin && (
            <ModalStyledSetting
               title={'Choose Consultant To Reply'}
               visible={modalPickConsultantForAdmin}
               footer={null}
               onCancel={() => setModalPickConsultantForAdmin(false)}
               destroyOnClose={true}
               centered={true}
               width={window.innerWidth * 0.3}
            >
               <FormPickConsultantToReplyForAdmin
                  applyChooseConsultantToReplyForAdminOnly={applyChooseConsultantToReplyForAdminOnly}
                  onClickCancelModal={() => setModalPickConsultantForAdmin(false)}
                  listConsultants={consultantsNotReplyYet}
               />
            </ModalStyledSetting>
         )}
      </div>
   );
};

export default CellRFA;



const ButtonRFA = styled.div`
   &:hover {
      cursor: pointer;
      /* background: yellow; */
   };
   border-radius: 0;
   border: 1px solid grey;
   background: ${props => props.isActive ? colorType.yellow : 'white'};
   min-width: 24px;
   margin-right: 3px;
   
   text-align: center;
   transition: 0.3s;
`;

const ModalStyledSetting = styled(Modal)`
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


export const getConsultantReplyData = (rowData, header, companies) => {

   let replyStatus, replyCompany, replyDate;

   const consultantHeaderNumber = parseInt(header.slice(12, header.length - 1));
   const listConsultantMustReply = getInfoValueFromRfaData(rowData, 'submission', 'consultantMustReply');

   if (!listConsultantMustReply || listConsultantMustReply.length === 0) return { replyStatus, replyCompany, replyDate };

   const consultantLeadName = listConsultantMustReply[0];
   if (isColumnWithReplyData(header)) {

      let listConsultantsAlreadyReply = [];
      for (const key in rowData) {
         if (key.includes('reply-$$$-status')) {
            const companyConsultant = key.slice(17, key.length);
            listConsultantsAlreadyReply.push(companyConsultant);
         };
      };
      listConsultantsAlreadyReply = [...new Set(listConsultantsAlreadyReply)];

      const listConsultantMustReplyRemaining = listConsultantMustReply.filter(x => x !== consultantLeadName);

      if (consultantHeaderNumber === 1) {
         replyStatus = rowData[`reply-$$$-status-${consultantLeadName}`];
         replyCompany = consultantLeadName;
         replyDate = convertReplyOrSubmissionDate(rowData[`reply-$$$-date-${consultantLeadName}`]);
      } else if (consultantHeaderNumber > 1) {
         let ConsultantIndex = 1;
         companies.forEach(cmp => {
            if (listConsultantMustReplyRemaining.indexOf(cmp.company) !== -1) {
               ConsultantIndex += 1;
               if (consultantHeaderNumber === ConsultantIndex) {
                  replyStatus = rowData[`reply-$$$-status-${cmp.company}`];
                  replyCompany = cmp.company;
                  replyDate = convertReplyOrSubmissionDate(rowData[`reply-$$$-date-${cmp.company}`]);
               };
            };
         });
      };
   };
   return { replyStatus, replyCompany, replyDate };
};

const cloneRfaData = (row) => {
   let obj = {};
   for (const key in row) {
      if (key.includes('reply') || key.includes('submission') || key === 'rfaNumber') {
         obj[key] = row[key];
      };
   };
   return obj;
};

export const isColumnWithReplyData = (header) => {
   return header.includes('Consultant (') && !header.includes('Drg To Consultant (') && header !== 'Consultant';
};
export const isColumnConsultant = (header) => {
   return header === 'Consultant';
};

export const getInfoValueFromRfaData = (obj, type, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${type}-$$$-${info}-${company}`)) {
         return obj[key];
      };
   };
};
export const getInfoKeyFromRfaData = (obj, type, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${type}-$$$-${info}-${company}`)) {
         return key;
      };
   };
};
export const getConsultantLeadName = (row) => {
   const consultantMustReplyArray = getInfoValueFromRfaData(row, 'submission', 'consultantMustReply');
   let consultantLead;
   if (consultantMustReplyArray) {
      consultantLead = consultantMustReplyArray[0];
   };
   return consultantLead;
};

export const convertReplyOrSubmissionDate = (date) => {

   let output;
   if (typeof date === 'string' && date.length === 8) {
      return date;
   } else if (typeof date === 'string' && date.length > 8) {
      return moment(date).format('DD/MM/YY');
   };

   return output;
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
   /* overflow-y: scroll;
   overflow-x: hidden; */
   border-bottom: 1px solid ${colorType.grey4};
`;


