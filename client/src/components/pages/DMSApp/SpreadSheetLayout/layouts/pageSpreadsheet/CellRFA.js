import { Icon, message, Modal, Tooltip } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, EDIT_DURATION_MIN } from '../../constants';
import { compareDates, mongoObjectId, replaceBreakLine } from '../../utils';
import ButtonColumnTag from '../generalComponents/ButtonColumnTag';
import ButtonGroupComp from '../generalComponents/ButtonGroupComp';




const CellRFA = (props) => {

   const { rowData, cellData, column, buttonPanelFunction, contextInput } = props;

   const { contextRow, contextProject } = contextInput;
   const { stateRow, getSheetRows } = contextRow;
   const { stateProject } = contextProject;

   const { rowsRfaAll, rowsRfaAllInit } = stateRow;

   const {
      roleTradeCompany, company, email, isBothSideActionUser, pageSheetTypeName,
   } = stateProject.allDataOneSheet;

   const [btnShown, setBtnShown] = useState(false);

   const [activeBtn, setActiveBtn] = useState('All');
   const [modalContent, setModalContent] = useState(null);

   const [modalPickConsultantForAdmin, setModalPickConsultantForAdmin] = useState(false);

   const [oneRowInThisRfaForParentRow, setOneRowInThisRfaForParentRow] = useState({});

   const [dataForDetailVersionTable, setDataForDetailVersionTable] = useState({});
   const [isDrawingDetailTableDms, setIsDrawingDetailTableDms] = useState(null);

   const [replyStatus, setReplyStatus] = useState(null);
   const [replyCompany, setReplyCompany] = useState(null);
   const [replyDate, setReplyDate] = useState(null);

   const [overdueCount, setOverdueCount] = useState(0);

   const [arrayButtonCell, setArrayButtonCell] = useState([]);

   

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

         const oneChildrenRow = rowsRfaAllInit.filter(x => x['RFA Ref'] === rfaRef)[0];
         setOneRowInThisRfaForParentRow(oneChildrenRow);

         const consultantMustReplyArray = getInfoValueFromRfaData(oneChildrenRow, 'submission', 'consultantMustReply') || [];

         let cellButtonArr = [];

         if (roleTradeCompany.role === 'Document Controller' && allRowsChildren.find(row => !row['RFA Ref'])) {
            cellButtonArr = [...cellButtonArr, 'btn-resubmit'];

         } else if (
            (
               roleTradeCompany.role === 'Consultant' && consultantMustReplyArray.indexOf(company) !== -1 &&
               !getInfoValueFromRfaData(oneChildrenRow, 'reply', 'status', company) &&
               checkIfEditTimeRfaIsOver(oneChildrenRow, null, EDIT_DURATION_MIN, 'check-if-submission-edit-is-over') <= 0
            ) ||
            (isBothSideActionUser &&
               consultantMustReplyArray.find(cmp => !getInfoValueFromRfaData(oneChildrenRow, 'reply', 'status', cmp))
            )
         ) {
            cellButtonArr = [...cellButtonArr, 'btn-reply'];
         };

         setArrayButtonCell([...new Set(cellButtonArr)]);

      } else if (!rowData.treeLevel) {

         if (column.key === 'RFA Ref') {

            let cellButtonArr = [];
            const isEditTimeSubmissionIsOver = checkIfEditTimeRfaIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-submission-edit-is-over');
            const isUserTheRfaCreator = getInfoValueFromRfaData(rowData, 'submission', 'user') === email;

            if (roleTradeCompany.role === 'Document Controller' && isEditTimeSubmissionIsOver > 0 && isUserTheRfaCreator) {
               cellButtonArr = [...cellButtonArr, 'btn-edit'];
               setEditTimeLeft(isEditTimeSubmissionIsOver);
            };

            const drawingLink = getInfoValueFromRfaData(rowData, 'submission', 'drawing');
            if (drawingLink && (isEditTimeSubmissionIsOver <= 0 || isUserTheRfaCreator)) {
               cellButtonArr = [...cellButtonArr, 'btn-drawing'];
            };

            const dwfxLink = getInfoValueFromRfaData(rowData, 'submission', 'dwfxLink');
            if (dwfxLink && (isEditTimeSubmissionIsOver <= 0 || isUserTheRfaCreator)) {
               cellButtonArr = [...cellButtonArr, 'btn-3d-model'];
            };

            setArrayButtonCell(cellButtonArr);

         } else if (isColumnWithReplyData(column.key)) {
            const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyData(rowData, column.key);

            setReplyStatus(replyStatusData);
            setReplyCompany(replyCompanyData);
            setReplyDate(convertReplyOrSubmissionDate(replyDateData));

            let cellButtonArr = [];

            const isEditTimeReplyIsOver = checkIfEditTimeRfaIsOver(rowData, replyCompanyData, EDIT_DURATION_MIN, 'check-if-reply-edit-is-over');
            const isUserTheRfaCreator = getInfoValueFromRfaData(rowData, 'reply', 'user', replyCompanyData) === email;

            if ((roleTradeCompany.role === 'Consultant' || isBothSideActionUser) && isEditTimeReplyIsOver > 0 && isUserTheRfaCreator) {
               cellButtonArr = [...cellButtonArr, 'btn-edit'];
               setEditTimeLeft(isEditTimeReplyIsOver);
            };

            const drawingLink = getInfoValueFromRfaData(rowData, 'reply', 'drawing', replyCompanyData);

            if (replyCompanyData && drawingLink && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
               cellButtonArr = [...cellButtonArr, 'btn-drawing'];
            };

            const commentText = getInfoValueFromRfaData(rowData, 'reply', 'comment', replyCompanyData);

            if (replyCompanyData && commentText && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
               cellButtonArr = [...cellButtonArr, 'btn-comment'];
            };

            setArrayButtonCell(cellButtonArr);


         } else if (isColumnConsultant(column.key)) {

            const consultantMustReplyValue = getInfoValueFromRfaData(rowData, 'submission', 'consultantMustReply');

            if (roleTradeCompany.role === 'Consultant' && consultantMustReplyValue.indexOf(company) !== -1) {
               let cellButtonArr = [];
               setReplyStatus(getInfoValueFromRfaData(rowData, 'reply', 'status', company));
               setReplyCompany(company);
               const dateInfo = getInfoValueFromRfaData(rowData, 'reply', 'date', company);
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               const isEditTimeReplyIsOver = checkIfEditTimeRfaIsOver(rowData, company, EDIT_DURATION_MIN, 'check-if-reply-edit-is-over');
               const isUserTheRfaCreator = getInfoValueFromRfaData(rowData, 'reply', 'user', company) === email;

               if (isEditTimeReplyIsOver > 0 && isUserTheRfaCreator) {
                  
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
                  setEditTimeLeft(isEditTimeReplyIsOver);
               };


               const drawingLink = getInfoValueFromRfaData(rowData, 'reply', 'drawing', company);

               if (drawingLink && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-drawing'];
               };
               const commentText = getInfoValueFromRfaData(rowData, 'reply', 'comment', company);

               if (commentText && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-comment'];
               };
               setArrayButtonCell(cellButtonArr);

            } else {
               let cellButtonArr = [];
               const consultantLead = consultantMustReplyValue[0];
               setReplyStatus(getInfoValueFromRfaData(rowData, 'reply', 'status', consultantLead));
               setReplyCompany(consultantLead);
               const dateInfo = getInfoValueFromRfaData(rowData, 'reply', 'date', consultantLead);
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               const isEditTimeReplyIsOver = checkIfEditTimeRfaIsOver(rowData, consultantLead, EDIT_DURATION_MIN, 'check-if-reply-edit-is-over');
               const isUserTheRfaCreator = getInfoValueFromRfaData(rowData, 'reply', 'user', consultantLead) === email;

               if (isBothSideActionUser && isEditTimeReplyIsOver > 0 && isUserTheRfaCreator) {
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
                  setEditTimeLeft(isEditTimeReplyIsOver);
               };


               const drawingLink = getInfoValueFromRfaData(rowData, 'reply', 'drawing', consultantLead);
               if (drawingLink && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-drawing'];
               };
               const commentText = getInfoValueFromRfaData(rowData, 'reply', 'comment', consultantLead);

               if (commentText && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-comment'];
               };
               setArrayButtonCell(cellButtonArr);
            };


         } else if (column.key === 'Due Date') {
            const consultantMustReplyArray = getInfoValueFromRfaData(rowData, 'submission', 'consultantMustReply');
            const leadConsultantStatus = getInfoValueFromRfaData(rowData, 'reply', 'status', consultantMustReplyArray[0]);
            if (!leadConsultantStatus) {
               const compare = compareDates(rowData['Consultant Reply (T)']);
               setOverdueCount(compare);
            };
         } else if (column.key.includes('Version ')) {
            const versionIndex = column.key.slice(8, column.key.length);
            const infoData = rowData['Info'];
            const dwgData = rowData[versionIndex];

            if (isColumnWithReplyData(infoData)) {

               let companyName = '';
               for (const key in dwgData) {
                  if (key.includes('reply-$$$-status-')) {
                     companyName = key.slice(17, key.length);
                  };
               };

               if (companyName) {
                  const dataStatus = getInfoValueFromRfaData(dwgData, 'reply', 'status', companyName); // No need company here
                  const dataDate = getInfoValueFromRfaData(dwgData, 'reply', 'date', companyName); // No need company here

                  setReplyStatus(dataStatus);
                  setReplyCompany(companyName);
                  setReplyDate(convertReplyOrSubmissionDate(dataDate));

                  setDataForDetailVersionTable(dwgData || {});

                  setIsDrawingDetailTableDms('drawing-detail-consultant-row');

                  let cellButtonArr = [];

                  const isEditTimeReplyIsOver = checkIfEditTimeRfaIsOver(dwgData, companyName, EDIT_DURATION_MIN, 'check-if-reply-edit-is-over');
                  const isUserTheRfaCreator = getInfoValueFromRfaData(dwgData, 'reply', 'user', companyName) === email;

                  const drawingLink = getInfoValueFromRfaData(dwgData, 'reply', 'drawing', companyName);
                  if (drawingLink && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
                     cellButtonArr = [...cellButtonArr, 'btn-drawing'];
                  };

                  const commentText = getInfoValueFromRfaData(dwgData, 'reply', 'comment', companyName);
                  if (commentText && (isEditTimeReplyIsOver <= 0 || isUserTheRfaCreator)) {
                     cellButtonArr = [...cellButtonArr, 'btn-comment'];
                  };
                  setArrayButtonCell(cellButtonArr);
               };

            } else if (infoData === 'RFA Ref') {

               setDataForDetailVersionTable(dwgData || {});
               setIsDrawingDetailTableDms('drawing-detail-rfa-row');


               let cellButtonArr = [];

               const isEditTimeSubmissionIsOver = checkIfEditTimeRfaIsOver(rowData, null, EDIT_DURATION_MIN, 'check-if-submission-edit-is-over');
               const isUserTheRfaCreator = getInfoValueFromRfaData(rowData, 'submission', 'user') === email;

               const drawingLink = getInfoValueFromRfaData(dwgData, 'submission', 'drawing');
               if (drawingLink && (isEditTimeSubmissionIsOver <= 0 || isUserTheRfaCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-drawing'];
               };

               const dwfxLink = getInfoValueFromRfaData(dwgData, 'submission', 'dwfxLink');
               if (dwfxLink && (isEditTimeSubmissionIsOver <= 0 || isUserTheRfaCreator)) {
                  cellButtonArr = [...cellButtonArr, 'btn-3d-model'];
               };
               setArrayButtonCell(cellButtonArr);
            };
         };
      };
   }, [activeBtn]);


   const [editTimeLeft, setEditTimeLeft] = useState(null);
   useEffect(() => {
      if (editTimeLeft > 0) {
         const timer = setTimeout(() => {
            if (column.key === 'RFA Ref' || isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) {
               setArrayButtonCell(arrayButtonCell.filter(btn => btn !== 'btn-edit'));
            };
         }, editTimeLeft * 60 * 1000);
         return () => clearTimeout(timer);
      };
   }, [editTimeLeft]);



   const onClickRfaVersion = (btn) => {
      const rfaCode = rowData['rfaNumber'];
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


   const onClickCellButton = async (btnName) => {
      try {
         if (btnName === 'btn-reply') {
            if (isBothSideActionUser) {
               setModalPickConsultantForAdmin(true);
            } else {
               buttonPanelFunction('form-reply-RFA');
               getSheetRows({
                  ...stateRow,
                  currentRefToAddNewOrReplyOrEdit: {
                     currentRefData: oneRowInThisRfaForParentRow,
                     formRefType: 'form-reply-RFA',
                     isFormEditting: false
                  }
               });
            };
         } else if (btnName === 'btn-resubmit') {
            if (isBothSideActionUser) {
               buttonPanelFunction('option-email-or-not-for-admin');
               getSheetRows({
                  ...stateRow,
                  currentRefToAddNewOrReplyOrEdit: {
                     tempRefData: oneRowInThisRfaForParentRow
                  },
               });
            } else {
               buttonPanelFunction('form-resubmit-RFA');
               getSheetRows({
                  ...stateRow,
                  currentRefToAddNewOrReplyOrEdit: {
                     currentRefData: oneRowInThisRfaForParentRow,
                     formRefType: 'form-resubmit-RFA',
                     isFormEditting: false
                  }
               });
            };

         } else if (btnName === 'btn-drawing') {

            let dwgLink;

            if (column.key === 'RFA Ref') {
               dwgLink = getInfoValueFromRfaData(rowData, 'submission', 'drawing');

            } else if (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) {
               dwgLink = getInfoValueFromRfaData(rowData, 'reply', 'drawing', replyCompany);

            } else if (column.key.includes('Version ') && isDrawingDetailTableDms === 'drawing-detail-consultant-row') {
               dwgLink = getInfoValueFromRfaData(dataForDetailVersionTable, 'reply', 'drawing', replyCompany);

            } else if (column.key.includes('Version ') && isDrawingDetailTableDms === 'drawing-detail-rfa-row') {
               dwgLink = getInfoValueFromRfaData(dataForDetailVersionTable, 'submission', 'drawing');

            };

            if (dwgLink) {
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
               window.open(res.data, '_blank');
            };

         } else if (btnName === 'btn-comment') {

            const rowDataInput = isDrawingDetailTableDms === 'drawing-detail-consultant-row' ? dataForDetailVersionTable : rowData;

            setModalContent(
               <div>
                  <div style={{ fontWeight: 'bold' }}>{getInfoValueFromRfaData(rowDataInput, 'reply', 'user', replyCompany) || ''}</div>
                  <div style={{ fontWeight: 'bold' }}>{getInfoValueFromRfaData(rowDataInput, 'reply', 'status', replyCompany) || ''}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{replaceBreakLine(getInfoValueFromRfaData(rowDataInput, 'reply', 'comment', replyCompany) || '')}</div>
               </div>
            );
         } else if (btnName === 'btn-3d-model') {

            const rowDataInput = isDrawingDetailTableDms === 'drawing-detail-rfa-row' ? dataForDetailVersionTable : rowData;

            const isEditTimeSubmissionIsOver = checkIfEditTimeRfaIsOver(rowDataInput, null, EDIT_DURATION_MIN, 'check-if-submission-edit-is-over');
            if (isEditTimeSubmissionIsOver > 0) {
               return message.warn('3D model is uploading, please wait ...');
            };
            const dwg3DLink = getInfoValueFromRfaData(rowDataInput, 'submission', 'dwfxLink');
            if (dwg3DLink) {
               window.open(dwg3DLink);
            };

         } else if (btnName === 'btn-edit') {

            let actionType, dataSendNoEmail;
            let objConsultantNameToReplyByBothSideActionUser = {};
            if (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) {
               actionType = 'form-reply-RFA';
               dataSendNoEmail = getInfoValueFromRfaData(rowData, 'reply', 'dateSendNoEmail', replyCompany);
               if (isBothSideActionUser) {
                  objConsultantNameToReplyByBothSideActionUser = {
                     consultantNameToReplyByBothSideActionUser: replyCompany
                  }
               };
            } else if (column.key === 'RFA Ref') {
               actionType = rowData['RFA Ref'] !== rowData.rfaNumber ? 'form-resubmit-RFA' : 'form-submit-RFA';
               dataSendNoEmail = getInfoValueFromRfaData(rowData, 'submission', 'dateSendNoEmail');
            };
            buttonPanelFunction(actionType);
            getSheetRows({
               ...stateRow,
               currentRefToAddNewOrReplyOrEdit: {
                  currentRefData: rowData,
                  formRefType: actionType,
                  isFormEditting: true,
                  isBothSideActionUserWithNoEmailSent: dataSendNoEmail ? true : false,
                  ...objConsultantNameToReplyByBothSideActionUser
               },
            });
         };
      } catch (err) {
         console.log(err);
      };
   };


   const viewEmailContent = () => {
      
   };


   const cellStyle = pageSheetTypeName === 'page-rfa' && rowData.treeLevel === 3 && column.key === 'Drawing Number'
   ? {}
   : { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' };

   return (
      <div
         style={{
            width: '100%', height: '100%', position: 'relative', padding: 5,
            ...cellStyle,
            color: replyStatus ? 'white' : 'black',
            background: (column.key === 'Due Date' && overdueCount < 0)
               ? '#FFEBCD'
               : (colorTextRow[replyStatus] || 'transparent'),
            fontWeight: (column.key === 'RFA Ref' && rowData.treeLevel) && 'bold'
         }}
         onMouseOver={() => {
            if (!btnShown) setBtnShown(true);
         }}
         onMouseLeave={() => {
            if (btnShown) setBtnShown(false);
         }}
      >
         {(pageSheetTypeName === 'page-rfa' && rowData.treeLevel <= 2 && column.key === 'RFA Ref')
            ? rowData.title
            : (pageSheetTypeName === 'page-rfa' && rowData.treeLevel === 3 && column.key === 'RFA Ref')
               ? (
                  <div style={{ display: 'flex', position: 'relative' }}>
                     <span style={{ marginRight: 5 }}>{rowData['rfaNumber']}</span>
                     <div style={{ display: 'flex' }}>
                        {[...rowData['btn'].sort(), 'All'].map(btn => (
                           <Tooltip key={btn} placement='top' title={btn === '-' ? '0' : btn === 'All' ? 'Consolidate latest drawings' : btn}>
                              <ButtonRFA
                                 onClick={() => onClickRfaVersion(btn)}
                                 isActive={btn === activeBtn}
                              >{btn === '-' ? '0' : btn}</ButtonRFA>
                           </Tooltip>
                        ))}
                     </div>

                     {arrayButtonCell.map((btn, i) => (
                        <Tooltip key={btn} placement='top' title={getTooltipRfaText(btn)}>
                           <Icon
                              type={getButtonRfaType(btn)}
                              style={{
                                 fontSize: 17, transform: 'translateY(1.5px)',
                                 position: 'absolute', right: getOffsetRight(i), top: 0
                              }}
                              onClick={() => onClickCellButton(btn)}
                           />
                        </Tooltip>
                     ))}
                  </div>
               ) : (pageSheetTypeName === 'page-rfa' && rowData.treeLevel === 3 && column.key === 'Drawing Number') ? (
                  <div style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                     {/* <Tooltip placement='top' title={'RFA Content'}>
                        <Icon
                           type={'file'}
                           style={{ fontSize: 15, transform: 'translateY(1.5px)', marginRight: 5 }}
                           onClick={viewEmailContent}
                        />
                     </Tooltip>  */}
                     {getRfaSubject(rowData, rowsRfaAllInit)}
                  </div>
               ) : (!rowData.treeLevel) 
               ? getCellDataRfaView(
                  rowData, column.key, replyCompany, replyStatus, replyDate, overdueCount,
                  isDrawingDetailTableDms, dataForDetailVersionTable, cellData
               ) : null}


         {btnShown && !rowData.treeLevel && (
            <>
               {arrayButtonCell.map((btn, i) => (
                  <Tooltip key={btn} placement='topLeft' title={getTooltipRfaText(btn)}>
                     <Icon
                        type={getButtonRfaType(btn)}
                        style={{
                           color: replyStatus ? 'white' : 'black', fontSize: 15,
                           cursor: 'pointer', position: 'absolute',
                           right: getOffsetRight(i),
                           top: 5, height: 17, width: 17
                        }}
                        onClick={() => onClickCellButton(btn)}
                     />
                  </Tooltip>
               ))}
            </>
         )}



         {modalContent && (
            <ModalStyledSetting
               title={'Drawing Comment'}
               visible={modalContent !== null ? true : false}
               footer={null}
               onCancel={() => {
                  setModalContent(null);
                  setBtnShown(false);
               }}
               destroyOnClose={true}
               centered={true}
               width='40%'
            >
               <div style={{ overflowY: 'auto', maxHeight: 600 }}>
                  {modalContent}
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
                  applyChooseConsultantToReplyForBothSideUser={(consultantName) => {
                     setModalPickConsultantForAdmin(false);
                     buttonPanelFunction('option-email-or-not-for-admin');
                     getSheetRows({
                        ...stateRow,
                        currentRefToAddNewOrReplyOrEdit: {
                           tempRefData: oneRowInThisRfaForParentRow,
                           tempConsultantToReply: consultantName,
                        },
                     });
                  }}
                  onClickCancelModal={() => setModalPickConsultantForAdmin(false)}
                  oneRowInThisRfaForParentRow={oneRowInThisRfaForParentRow}
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
      justify-content: center;
   }
`;


export const getConsultantReplyData = (rowData, header) => {
   let replyStatus, replyCompany, replyDate;
   const listConsultantMustReply = getInfoValueFromRfaData(rowData, 'submission', 'consultantMustReply');
   if (!listConsultantMustReply || listConsultantMustReply.length === 0) return { replyStatus, replyCompany, replyDate };
   const consultantHeaderNumber = parseInt(header.slice(12, header.length - 1));
   const consultantNameOfThisCell = listConsultantMustReply[consultantHeaderNumber - 1];
   return {
      replyStatus: rowData[`reply-$$$-status-${consultantNameOfThisCell}`],
      replyCompany: consultantNameOfThisCell,
      replyDate: convertReplyOrSubmissionDate(rowData[`reply-$$$-date-${consultantNameOfThisCell}`])
   };
};


const getCellDataRfaView = (row, header, replyCompany, replyStatus, replyDate, overdueCount, isDrawingDetailTableDms, dataForDetailVersionTable, cellData) => {

   if (header === 'Submission Date') {
      return row['Drg To Consultant (A)'];

   } else if (header === 'Requested By') {
      return getInfoValueFromRfaData(row, 'submission', 'requestedBy');

   } else if (header === 'Due Date') {
      return (
         <span style={{
            fontWeight: overdueCount < 0 && 'bold',
            color: overdueCount < 0 && 'red',
         }}>
            {row['Consultant Reply (T)']}
         </span>
      );
   } else if (isColumnWithReplyData(header) || isColumnConsultant(header)) {
      return replyStatus ? (
         <>
            <span style={{ fontWeight: 'bold' }}>{replyCompany}</span>
            <span>{` - (${replyDate})`}</span>
         </>
      ) : replyCompany;

   } else if (header.includes('Version ') && isDrawingDetailTableDms === 'drawing-detail-consultant-row' && replyStatus) {
      return (
         <span style={{ float: 'left', paddingLeft: 3, fontWeight: 'bold' }}>
            {replyCompany}
         </span>
      );
   } else if (header.includes('Version ') && isDrawingDetailTableDms === 'drawing-detail-rfa-row') {
      return (
         <span style={{ float: 'left', paddingLeft: 3, fontWeight: 'bold' }}>{dataForDetailVersionTable.rfaRef}</span>
      );

   } else {
      return cellData;
   };
};



export const isColumnWithReplyData = (header) => {
   return header.includes('Consultant (') && !header.includes('Drg To Consultant (') && header !== 'Consultant';
};
export const isColumnConsultant = (header) => {
   return header === 'Consultant';
};

export const getInfoValueFromRfaData = (obj, type, info, company) => {
   for (const key in obj) {
      if (key.includes(
         type === 'reply'
            ? `${type}-$$$-${info}-${company}`
            : `${type}-$$$-${info}-` // must have '-' ending 
      )) {
         return obj[key];
      };
   };
};
export const getInfoKeyFromRfaData = (obj, type, info, company) => {
   for (const key in obj) {
      if (key.includes(
         type === 'reply'
            ? `${type}-$$$-${info}-${company}`
            : `${type}-$$$-${info}-` // must have '-' ending 
      )) {
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


export const checkIfEditTimeRfaIsOver = (rowData, company, editTimeAllowed, type) => {

   if (type === 'check-if-submission-edit-is-over') {
      const dateNoSendEmailSubmission = getInfoValueFromRfaData(rowData, 'submission', 'dateSendNoEmail');
      const dateSubmission = getInfoValueFromRfaData(rowData, 'submission', 'date');
      const date = dateNoSendEmailSubmission || dateSubmission;

      if (typeof date === 'string' && date.length > 8) {
         const duration = moment.duration(moment(new Date()).diff(date)).asMinutes();
         return editTimeAllowed - duration;
      } else {
         return -1;
      };
   } else if (type === 'check-if-reply-edit-is-over') {

      const dateNoSendEmailReply = getInfoValueFromRfaData(rowData, 'reply', 'dateSendNoEmail', company);
      const dateReply = getInfoValueFromRfaData(rowData, 'reply', 'date', company);
      const date = dateNoSendEmailReply || dateReply;

      if (typeof date === 'string' && date.length > 8) {
         const duration = moment.duration(moment(new Date()).diff(date)).asMinutes();
         return editTimeAllowed - duration;
      } else {
         return -1;
      };
   };
};


const getOffsetRight = (index) => {
   if (index === 0) return 5;
   else {
      return 5 + index * 22;
   };
};


const FormPickConsultantToReplyForAdmin = ({ applyChooseConsultantToReplyForBothSideUser, onClickCancelModal, oneRowInThisRfaForParentRow }) => {

   const consultantMustReplyArray = getInfoValueFromRfaData(oneRowInThisRfaForParentRow, 'submission', 'consultantMustReply') || [];
   let arrayConsultantsNotReplyYet = [];
   consultantMustReplyArray.forEach(cmp => {
      const replyStatus = getInfoValueFromRfaData(oneRowInThisRfaForParentRow, 'reply', 'status', cmp);
      const isEditTimeSubmissionIsOver = checkIfEditTimeRfaIsOver(oneRowInThisRfaForParentRow, null, EDIT_DURATION_MIN, 'check-if-submission-edit-is-over');

      if (!replyStatus && isEditTimeSubmissionIsOver <= 0) {
         arrayConsultantsNotReplyYet = [...arrayConsultantsNotReplyYet, cmp];
      };
   });


   const [list, setList] = useState(arrayConsultantsNotReplyYet.map(cst => ({
      id: mongoObjectId(),
      header: cst,
      mode: 'hidden'
   })));

   const onClickApply = () => {
      const consultantToReply = list.find(x => x.mode === 'shown');
      if (!consultantToReply) {
         return message.warn('Please choose consultant to reply!');
      };
      applyChooseConsultantToReplyForBothSideUser(consultantToReply.header);
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
            {list.length > 0 && (
               <div style={{ fontSize: 12, paddingLeft: 20 }}>Click to select consultant to reply.</div>
            )}
            <div style={{ width: '100%', paddingTop: 20 }}>
               {list.length > 0 ? list.map((tag, i) => (
                  <ButtonColumnTag
                     key={i}
                     tag={tag}
                     setMode={setMode}
                     actionType='admin-pick-consultant-to-reply'
                  />
               )) : 'Woh Hup is submitting the form, please wait!'}

            </div>

         </PanelStyled>
         <div style={{ marginTop: 10, padding: 10, display: 'flex', flexDirection: 'row-reverse' }}>
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
   border-bottom: 1px solid ${colorType.grey4};
`;


const getTooltipRfaText = (btnName) => {
   let result = 'No Tooltip';
   if (btnName === 'btn-reply') {
      result = 'Reply To This RFA';
   } else if (btnName === 'btn-resubmit') {
      result = 'Resubmit This RFA';
   } else if (btnName === 'btn-drawing') {
      result = 'Open Drawing File';
   } else if (btnName === 'btn-comment') {
      result = 'See Note';
   } else if (btnName === 'btn-3d-model') {
      result = 'Open 3D File';
   } else if (btnName === 'btn-edit') {
      result = 'Edit';
   };
   return result;
};


const getButtonRfaType = (btnName) => {
   let result = 'xxx';
   if (btnName === 'btn-reply') {
      result = 'form';
   } else if (btnName === 'btn-resubmit') {
      result = 'plus-square';
   } else if (btnName === 'btn-drawing') {
      result = 'file';
   } else if (btnName === 'btn-comment') {
      result = 'message';
   } else if (btnName === 'btn-3d-model') {
      result = 'shake';
   } else if (btnName === 'btn-edit') {
      result = 'edit';
   };
   return result;
};

const getRfaSubject = (rowData, rowsRfaAllInit) => {
   let output = '';
   const rowFound = rowsRfaAllInit
      .sort((b, a) => (a['RFA Ref'] > b['RFA Ref'] ? 1 : -1))
      .find(r => r['RFA Ref'].includes(rowData.id) && getInfoValueFromRfaData(r, 'submission', 'emailTitle'));

   if (rowFound) {
      output = getInfoValueFromRfaData(rowFound, 'submission', 'emailTitle');
   };
   return output;
};