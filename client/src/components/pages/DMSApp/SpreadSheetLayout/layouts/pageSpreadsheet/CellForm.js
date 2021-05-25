import { Icon, message, Modal, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorType } from '../../constants';
import { mongoObjectId } from '../../utils';
import ButtonColumnTag from '../generalComponents/ButtonColumnTag';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';
import { getInfoValueFromRfaData } from './CellRFA';




const CellForm = (props) => {

   const { rowData, cellData, column, buttonPanelFunction, contextInput } = props;

   const arrayExpandedColumn = ['RFAM Ref'];

   const { contextCell, contextRow, contextProject } = contextInput;
   const { stateCell, getCellModifiedTemp, setCellActive } = contextCell;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const [activeBtn, setActiveBtn] = useState('All');

   const [btnShown, setBtnShown] = useState(false);

   const { rowsRfamAllInit, rowsRfamAll } = stateRow;

   const [refText, setRefText] = useState(null);
   const [refData, setRefData] = useState({});

   useEffect(() => {

      if (rowData.treeLevel === 3 && arrayExpandedColumn.indexOf(column.key) !== -1) {

         const refNumber = rowData.id;
         const allBtn = rowData['btn'];
         const allRowsChildren = rowData.children;
         const lastBtn = allBtn[allBtn.length - 1];


         let ref;
         if (activeBtn === '0') {
            ref = refNumber;
         } else if (activeBtn === 'All') {
            ref = refNumber + (lastBtn === '0' ? '' : lastBtn);
         } else if (activeBtn) { // A, B, C, ....
            ref = refNumber + activeBtn;
         };

         const rowsWithThisRef = rowsRfamAllInit.filter(x => {
            return x['rfamRef'] === rowData['rfamRef'];
         });
         const oneRowChildren = rowsWithThisRef[0];

         const refDataObj = cloneRefData(oneRowChildren);
         setRefText(ref);
         setRefData(refDataObj);

         // const consultantMustReplyArray = getInfoValueFromRfaData(refDataObj, 'submission', 'consultantMustReply');

         // if (isUserCanSubmitRfaBothSide) {
         //    if (allRowsChildren.find(row => !row['RFA Ref'])) {
         //       setThereIsDrawingWithNoRfaRef(true);
         //    } else {
         //       setThereIsDrawingWithNoRfaRef(false);
         //    };
         //    let arrayConsultantNotReplyYet = [];

         //    consultantMustReplyArray.forEach(cst => {
         //       const statusReply = getInfoValueFromRfaData(refDataObj, 'reply', 'status', cst);
         //       if (!statusReply) {
         //          arrayConsultantNotReplyYet.push(cst);
         //       };
         //    });

         //    if (arrayConsultantNotReplyYet.length > 0) {
         //       setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
         //       setConsultantsNotReplyYet(arrayConsultantNotReplyYet);
         //    } else {
         //       setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
         //    };

         // } else if (roleTradeCompany.role === 'Consultant') {
         //    if (
         //       !refDataObj[`reply-$$$-status-${roleTradeCompany.company}`] &&
         //       consultantMustReplyArray && consultantMustReplyArray.indexOf(company) !== -1
         //    ) {
         //       setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
         //    } else {
         //       setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
         //    };
         // } else if (roleTradeCompany.role === 'Document Controller') {

         //    if (allRowsChildren.find(row => !row['RFA Ref'])) {
         //       setThereIsDrawingWithNoRfaRef(true);
         //    } else {
         //       setThereIsDrawingWithNoRfaRef(false);
         //    };
         // };

      } else if (!rowData.treeLevel && rowData['rfaNumber'] && rowData['RFA Ref']) {

         // const refDataObj = cloneRefData(rowData);
         // setRefData(refDataObj);

         // if (column.key === 'Requested By') {
         //    setRequestedByCellData(getInfoValueFromRfaData(refDataObj, 'submission', 'requestedBy'));

         // } else if (isColumnWithReplyData(column.key)) {
         //    const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyData(rowData, column.key, companies);

         //    setReplyStatus(replyStatusData);
         //    setReplyCompany(replyCompanyData);
         //    setReplyDate(convertReplyOrSubmissionDate(replyDateData));

         // } else if (isColumnConsultant(column.key)) {
         //    if (roleTradeCompany.role !== 'Consultant') {
         //       const consultantLead = getInfoValueFromRfaData(refDataObj, 'submission', 'consultantMustReply')[0];

         //       setReplyStatus(getInfoValueFromRfaData(refDataObj, 'reply', 'status', consultantLead));
         //       setReplyCompany(consultantLead);

         //       const dateInfo = getInfoValueFromRfaData(refDataObj, 'reply', 'date', consultantLead);
         //       setReplyDate(convertReplyOrSubmissionDate(dateInfo));
         //    } else {
         //       const consultantMustReplyValue = getInfoValueFromRfaData(refDataObj, 'submission', 'consultantMustReply');
         //       if (consultantMustReplyValue.indexOf(company) !== -1) {

         //          setReplyStatus(refDataObj[`reply-$$$-status-${company}`]);
         //          setReplyCompany(company);
         //          const dateInfo = refDataObj[`reply-$$$-date-${company}`];
         //          setReplyDate(convertReplyOrSubmissionDate(dateInfo));
         //       };
         //    };

         // } else if (column.key === 'Due Date') {
         //    const consultantMustReplyArray = getInfoValueFromRfaData(refDataObj, 'submission', 'consultantMustReply');
         //    if (!rowData[`reply-$$$-status-${consultantMustReplyArray[0]}`]) {
         //       const compare = compareDates(rowData['Consultant Reply (T)']);
         //       setOverdueCount(compare);
         //    };
         // };
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

      const rowsNotThisRef = rowsRfamAll.filter(r => r['rfamRef'] !== refData['rfamRef']);

      let rowsThisRefFiltered;

      if (btn === 'All') {
         const rowsFilter = rowsRfamAllInit.filter(r => r['rfamRef'] === refData['rfamRef']);
         const arrayVersion = [...new Set(rowsFilter.map(x => x.revision))];
         const latestVersion = arrayVersion.sort()[arrayVersion.length - 1];

         rowsThisRefFiltered = rowsRfamAllInit.filter(r => {
            return r.revision === latestVersion && r['rfamRef'] === refData['rfamRef'];
         });
      } else {
         rowsThisRefFiltered = rowsRfamAllInit.filter(r => {
            return r.revision === btn && r['rfamRef'] === refData['rfamRef'];
         });
      };

      
      getSheetRows({
         ...stateRow,
         rowsRfamAll: [...rowsNotThisRef, ...rowsThisRefFiltered]
      });
      setActiveBtn(btn);
   };

   const onClickSubmitOrReplyRFA = (btn) => {
      // if (!isUserCanSubmitRfaBothSide) {
      //    if (btn === 'form-reply-RFA') {
      //       const isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'consultant-check-if-rfa-ready-to-reply');
      //       if (!isEditTimeOver) {
      //          return message.warn('Woh Hup is submitting this RFA, please wait ...');
      //       };
      //    } else if (btn === 'form-resubmit-RFA') {
      //       const isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'wohhup-check-if-rfa-ready-to-resubmit');
      //       if (!isEditTimeOver) {
      //          return message.warn('Consultant is replying this RFA, please wait ...');
      //       };
      //    };
      // };

      // if (isUserCanSubmitRfaBothSide) {
      //    setModalActionTypeForAdmin(btn);
      // } else {
      //    buttonPanelFunction(btn);
      //    getSheetRows({
      //       ...stateRow,
      //       currentRfaToAddNewOrReplyOrEdit: {
      //          currentRfaNumber: rowData.rfaNumber,
      //          currentRfaRef: rfaRefText,
      //          currentRfaData: rfaData,
      //          formRfaType: btn,
      //          isFormEditting: false
      //       },
      //    });
      // };
   };




   const onMouseDownCellButtonConsultant = async (btn, replyCompany, rfaData) => {

      // try {
      //    let userReply, isEditTimeOver;
      //    if (isDrawingDetailTableDms === 'drawing-detail-consultant') {
      //       userReply = getInfoValueFromRfaData(rfaData, 'reply', 'user', replyCompany);
      //       isEditTimeOver = checkIfEditTimeIsOver(rfaData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
      //    } else {
      //       userReply = getInfoValueFromRfaData(rowData, 'reply', 'user', replyCompany);
      //       isEditTimeOver = checkIfEditTimeIsOver(rowData, replyCompany, EDIT_DURATION_MIN, 'check-if-status-button-ready');
      //    };

      //    if (isEditTimeOver || userReply === email) {
      //       if (btn === 'See Note') {
      //          setModalContent(
      //             <div>
      //                <div style={{ fontWeight: 'bold' }}>{rfaData[`reply-$$$-user-${replyCompany}`] || ''}</div>
      //                <div style={{ fontWeight: 'bold' }}>{rfaData[`reply-$$$-status-${replyCompany}`] || ''}</div>
      //                <div>{rfaData[`reply-$$$-comment-${replyCompany}`] || ''}</div>
      //             </div>
      //          );

      //       } else if (btn === 'Open Drawing File') {
      //          const res = await Axios.get('/api/issue/get-public-url', { params: { key: rfaData[`reply-$$$-drawing-${replyCompany}`], expire: 1000 } });
      //          window.open(res.data);

      //       } else if (btn === 'Open Form') {

      //       } else if (btn === 'Edit') {
      //          let adminEditData = {};
      //          const listEmailTo = getInfoValueFromRfaData(rfaData, 'reply', 'emailTo', replyCompany);
      //          if (isUserCanSubmitRfaBothSide) {
      //             adminEditData = {
      //                isAdminAction: true,
      //                isAdminActionWithNoEmailSent: !listEmailTo || listEmailTo.length === 0,
      //                adminActionConsultantToReply: replyCompany
      //             };
      //          };

      //          buttonPanelFunction('form-reply-RFA');
      //          getSheetRows({
      //             ...stateRow,
      //             currentRfaToAddNewOrReplyOrEdit: {
      //                currentRfaNumber: rowData.rfaNumber,
      //                currentRfaRef: rowData['RFA Ref'],
      //                currentRfaData: rfaData,
      //                formRfaType: 'form-reply-RFA',
      //                isFormEditting: true,
      //                ...adminEditData
      //             },
      //          });
      //       };
      //    } else {
      //       return message.warn('Consultant is replying this RFA, please wait ...');
      //    };
      // } catch (err) {
      //    console.log(err);
      // };
   };


   const onMouseDownCellButtonRfaRef = async (btn) => {
      // try {
      //    let userSubmission, isEditTimeOver;
      //    if (isDrawingDetailTableDms === 'drawing-detail-rfa') {
      //       userSubmission = getInfoValueFromRfaData(rfaData, 'submission', 'user');
      //       isEditTimeOver = checkIfEditTimeIsOver(rfaData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
      //    } else {
      //       userSubmission = getInfoValueFromRfaData(rowData, 'submission', 'user');
      //       isEditTimeOver = checkIfEditTimeIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
      //    };

      //    if (!isEditTimeOver && userSubmission === email && btn === 'Open Form') {
      //       return message.warn('3D model is uploading, please wait ...');
      //    };

      //    if (isEditTimeOver || userSubmission === email) {
      //       if (btn === 'Open Drawing File') {
      //          const dwgLink = getInfoValueFromRfaData(rfaData, 'submission', 'drawing');
      //          const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
      //          window.open(res.data);
      //       } else if (btn === 'Open Form') {
      //          const dwgLink = getInfoValueFromRfaData(rfaData, 'submission', 'dwfxLink');
      //          if (dwgLink) {
      //             window.open(dwgLink);
      //          } else {
      //             message.info('There is no 3D model attached!');
      //          };

      //       } else if (btn === 'Edit') {
      //          const typeBtn = rowData['RFA Ref'] !== rowData.rfaNumber ? 'form-resubmit-RFA' : 'form-submit-RFA';
      //          if (isUserCanSubmitRfaBothSide) {

      //          } else {

      //             buttonPanelFunction(typeBtn);
      //             getSheetRows({
      //                ...stateRow,
      //                currentRfaToAddNewOrReplyOrEdit: {
      //                   currentRfaNumber: rowData.rfaNumber,
      //                   currentRfaRef: rowData['RFA Ref'],
      //                   currentRfaData: rfaData,
      //                   formRfaType: typeBtn,
      //                   isFormEditting: true
      //                },
      //             });
      //          };
      //       };
      //    } else {
      //       return message.warn('Woh Hup is submitting this RFA, please wait ...');
      //    };
      // } catch (err) {
      //    console.log(err);
      // };
   };




   // roleTradeCompany.role === 'Consultant' ? 'reply' : roleTradeCompany.role === 'Document Controller' ? 'submission' : '',

   const checkIfEditBtnShown = (header) => {

      // if (header === 'RFA Ref' && (roleTradeCompany.role === 'Document Controller' || isUserCanSubmitRfaBothSide)) {

      //    const userSubmission = getInfoValueFromRfaData(rowData, 'submission', 'user');
      //    const isEditTimeOver = checkIfEditTimeIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-rfa-button-ready');
      //    if (!isEditTimeOver && userSubmission === email) {
      //       setIsEditButtonShownInCell(true);
      //    } else {
      //       setIsEditButtonShownInCell(false);
      //    };

      // } else if (
      //    (isColumnWithReplyData(column.key) || isColumnConsultant(column.key) || column.key.includes('Version ')) &&
      //    (roleTradeCompany.role === 'Consultant' || isUserCanSubmitRfaBothSide)
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
      // setModalPickConsultantForAdmin(false);
      // buttonPanelFunction('form-reply-RFA');
      // getSheetRows({
      //    ...stateRow,
      //    currentRfaToAddNewOrReplyOrEdit: {
      //       currentRfaNumber: rowData.rfaNumber,
      //       currentRfaRef: rfaRefText,
      //       currentRfaData: rfaData,
      //       formRfaType: 'form-reply-RFA',
      //       isFormEditting: false,

      //       isAdminAction: true,
      //       isAdminActionWithNoEmailSent,
      //       adminActionConsultantToReply: consultantToReply
      //    },
      // });
   };

   const applyResubmitForAdminOnly = (isNoEmailSent) => {
      // buttonPanelFunction('form-resubmit-RFA');
      // getSheetRows({
      //    ...stateRow,
      //    currentRfaToAddNewOrReplyOrEdit: {
      //       currentRfaNumber: rowData.rfaNumber,
      //       currentRfaRef: rfaRefText,
      //       currentRfaData: rfaData,
      //       formRfaType: 'form-resubmit-RFA',
      //       isFormEditting: false,

      //       isAdminAction: true,
      //       isAdminActionWithNoEmailSent: isNoEmailSent,
      //    },
      // });
   };




   // const additionalBtnToEdit = (isEditButtonShownInCell && pageSheetTypeName !== 'page-spreadsheet') ? ['Edit'] : [];
   // const additionalBtn3DModel = is3dModelAttached ? ['Open Form'] : [];

   // let arrayButtonReplyAndResubmit = [];
   // if (isUserCanSubmitRfaBothSide) {
   //    if (thereIsDrawingWithNoRfaRef) {
   //       arrayButtonReplyAndResubmit = [...arrayButtonReplyAndResubmit, 'plus-square'];
   //    };
   //    if (thereIsDrawingWithNoReplyAndConsultantAllowedReply) {
   //       arrayButtonReplyAndResubmit = [...arrayButtonReplyAndResubmit, 'edit'];
   //    };
   // } else {
   //    if (thereIsDrawingWithNoReplyAndConsultantAllowedReply && roleTradeCompany.role === 'Consultant') {
   //       arrayButtonReplyAndResubmit = ['edit'];
   //    } else if (thereIsDrawingWithNoRfaRef && roleTradeCompany.role === 'Document Controller') {
   //       arrayButtonReplyAndResubmit = ['plus-square'];
   //    };
   // };


   const additionalBtnToEdit = [];


   return (
      <div
         style={{
            width: '100%', height: '100%',
            position: 'relative', padding: 5, color: 'black',
            // background: (column.key === 'Due Date' && overdueCount < 0)
            //    ? '#FFEBCD'
            //    : (colorTextRow[replyStatus] || 'transparent'),
            // fontWeight: (column.key === 'RFA Ref' && rowData.treeLevel) && 'bold'
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
         {(rowData.treeLevel === 3 && arrayExpandedColumn.indexOf(column.key) !== -1) ? (
            <div style={{ display: 'flex', position: 'relative', color: 'black', fontWeight: 'bold' }}>
               <span style={{ marginRight: 5 }}>{rowData['rfamRef']}</span>
               <div style={{ display: 'flex' }}>
                  {[...rowData['btn'].sort(), 'All'].map(btn => (
                     <ButtonForm
                        key={btn}
                        onClick={() => onClickRefDrawing(btn)}
                        isActive={btn === activeBtn}
                     >{btn}</ButtonForm>
                  ))}
               </div>

               {/* {arrayButtonReplyAndResubmit.map(button => (
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
               ))} */}
            </div>
         ) : (rowData.treeLevel >= 2 && arrayExpandedColumn.indexOf(column.key) !== -1) ? (
            <div style={{ color: 'black', fontWeight: 'bold' }}>{rowData.title}</div>
         )
            : (!rowData.treeLevel) ? (
               <div>{getCellFormData(rowData, column.key)}</div>
            ) : ''}



         {(btnShown && !rowData.treeLevel && isColumnSubmitOrReply(column.key) === 'column-submit') && (
               <>
                  {['Open Drawing File', 'Open Form', ...additionalBtnToEdit].map(btn => (
                     <Tooltip key={btn} placement='top' title={btn}>
                        <div
                           style={{
                              cursor: 'pointer', position: 'absolute',
                              right: btn === 'Open Drawing File' ? 5 : btn === 'Open Form' ? 27 : 51,
                              top: 5, height: 17, width: 17,
                           }}
                           onMouseDown={() => onMouseDownCellButtonRfaRef(btn)}
                        >
                           <Icon
                              type={btn === 'Open Drawing File' ? 'file' : btn === 'Open Form' ? 'shake' : 'edit'}
                              style={{ color: 'black', fontSize: 15 }}
                           />
                        </div>
                     </Tooltip>
                  ))}
               </>
            )
         }


      </div>
   );
};

export default CellForm;



const ButtonForm = styled.div`
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



const cloneRefData = (row) => {
   let obj = {};
   for (const key in row) {
      if (
         key.includes('reply') ||
         key.includes('submission') ||
         key === 'rfamRef' ||
         key === 'revision'
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
   if (header === 'RFAM Ref') return 'column-submit';
};

const getCellFormData = (row, header) => {

   if (header === 'RFAM Ref') return row['rfamRef'] + row.revision;
   if (header === 'Description') return getInfoValueFromRfaDataForm(row, 'submission', 'rfam',  'description');
   if (header === 'Requested By') return getInfoValueFromRfaDataForm(row, 'submission', 'rfam',  'requestedBy');

   return 'xxx';
};

export const getInfoValueFromRfaDataForm = (obj, typeSubmit, typeForm, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${typeSubmit}-${typeForm}-${info}-${company}`)) {
         return obj[key];
      };
   };
};
const getInfoKeyFromRfaDataForm = (obj, typeSubmit, typeForm, info, company = '') => {
   for (const key in obj) {
      if (key.includes(`${typeSubmit}-${typeForm}-${info}-${company}`)) {
         return key;
      };
   };
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




