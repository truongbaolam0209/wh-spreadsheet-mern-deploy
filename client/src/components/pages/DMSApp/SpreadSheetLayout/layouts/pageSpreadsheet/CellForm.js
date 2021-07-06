import { Icon, message, Modal, Tooltip, Upload } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, EDIT_DURATION_MIN, SERVER_URL, tradeArrayForm, tradeArrayMeetingMinutesForm, versionTextArray } from '../../constants';
import { mongoObjectId } from '../../utils';
import ButtonColumnTag from '../generalComponents/ButtonColumnTag';
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
      pageSheetTypeName, isAdmin, isUserCanSubmitBothSide
   } = stateProject.allDataOneSheet;


   const expandedColumn = pageSheetTypeName === 'page-rfam' ? 'RFAM Ref'
      : pageSheetTypeName === 'page-rfi' ? 'RFI Ref'
         : pageSheetTypeName === 'page-cvi' ? 'CVI Ref'
            : pageSheetTypeName === 'page-dt' ? 'DT Ref'
               : pageSheetTypeName === 'page-mm' ? 'MM Ref'
                  : 'n/a';

   const [activeBtn, setActiveBtn] = useState(null);

   const [arrayButtonCell, setArrayButtonCell] = useState([]);


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
   const [consultantMustReply, setConsultantMustReply] = useState([]);

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

            let cellButtonArr = [];
            const consultantMustReplyArray = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');

            if (roleTradeCompany.role === 'Document Controller') {

               if (checkIfEditTimeIsOverMultiForm(rowData, null, EDIT_DURATION_MIN, refType, 'wohhup-check-if-submission-edit-is-over')) {
                  if (pageSheetTypeName !== 'page-mm') {
                     cellButtonArr = [...cellButtonArr, 'btn-submitSignedOffToConsultant'];
                  };
                  cellButtonArr = cellButtonArr.filter(btn => btn !== 'btn-edit');
               } else {
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
               };

               if (getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit')) {
                  cellButtonArr = cellButtonArr.filter(btn => btn !== 'btn-submitSignedOffToConsultant');
               };

               if (
                  getInfoValueFromRefDataForm(rowData, 'reply', refType, 'status', consultantMustReplyArray[0]) &&
                  checkIfEditTimeIsOverMultiForm(rowData, consultantMustReplyArray[0], EDIT_DURATION_MIN, refType, 'consultant-check-if-reply-edit-is-over')
               ) {
                  const versionTextIndex = versionTextArray.indexOf(rowData.revision);
                  const versionTextNext = versionTextArray[versionTextIndex + 1];
                  const rowVersionNext = rowsRefAllInit.find(r => r[refKey] === rowData[refKey] && r.revision === versionTextNext);
                  if (!rowVersionNext) {
                     cellButtonArr = [...cellButtonArr, 'btn-resubmit'];
                  };
               };
            };

            if (
               getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawings') ||
               getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawingsRfa')
            ) {
               cellButtonArr = [...cellButtonArr, 'btn-linkDrawings'];
            };
            if (getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkFormNoSignature') || getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit')) {
               cellButtonArr = [...cellButtonArr, 'btn-linkFormSubmitNoSignatureOrSignedOff'];
            };
            setArrayButtonCell(cellButtonArr);


         } else if (isColumnWithReplyData(column.key)) {

            let cellButtonArr = [];
            const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyFormData(rowData, column.key, refType);
            setReplyStatus(replyStatusData);
            setReplyCompany(replyCompanyData);
            setReplyDate(convertReplyOrSubmissionDate(replyDateData));

            if (roleTradeCompany.role === 'Consultant' && replyCompanyData === company) {
               if (
                  getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit') &&
                  (
                     (!rowData[`reply-${refType}-status-${company}`] && (pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')) ||
                     (!rowData[`reply-${refType}-acknowledge-${company}`] && pageSheetTypeName === 'page-dt') ||
                     ((!rowData[`reply-${refType}-acknowledge-${company}`] && !rowData[`reply-${refType}-status-${company}`]) && pageSheetTypeName === 'page-cvi')
                  )
               ) {
                  cellButtonArr = [...cellButtonArr, 'btn-reply'];

               } else if (
                  getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply') &&
                  !checkIfEditTimeIsOverMultiForm(rowData, replyCompanyData, EDIT_DURATION_MIN, refType, 'consultant-check-if-reply-edit-is-over')
               ) {
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
               };
            };


            if (getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', replyCompanyData)) {
               cellButtonArr = [...cellButtonArr, 'btn-linkFormReply'];
            };
            setArrayButtonCell(cellButtonArr);


         } else if (isColumnConsultant(column.key)) {
            const consultantMustReplyValue = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply');
            let cellButtonArr = [];
            if (roleTradeCompany.role === 'Consultant' && consultantMustReplyValue.indexOf(company) !== -1) {

               setReplyStatus(rowData[`reply-${refType}-status-${company}`]);
               setReplyCompany(company);
               const dateInfo = rowData[`reply-${refType}-date-${company}`];
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               if (
                  getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit') &&
                  (
                     (!rowData[`reply-${refType}-status-${company}`] && (pageSheetTypeName === 'page-rfam' || pageSheetTypeName === 'page-rfi')) ||
                     (!rowData[`reply-${refType}-acknowledge-${company}`] && pageSheetTypeName === 'page-dt') ||
                     ((!rowData[`reply-${refType}-acknowledge-${company}`] && !rowData[`reply-${refType}-status-${company}`]) && pageSheetTypeName === 'page-cvi')
                  )
               ) {
                  cellButtonArr = [...cellButtonArr, 'btn-reply'];
               } else if (
                  getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply') &&
                  !checkIfEditTimeIsOverMultiForm(rowData, company, EDIT_DURATION_MIN, refType, 'consultant-check-if-reply-edit-is-over')
               ) {
                  cellButtonArr = [...cellButtonArr, 'btn-edit'];
               };


               if (getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', company)) {
                  cellButtonArr = [...cellButtonArr, 'btn-linkFormReply'];
               };

            } else {
               const consultantLead = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply')[0];
               setReplyStatus(rowData[`reply-${refType}-status-${consultantLead}`]);
               setReplyCompany(consultantLead);
               const dateInfo = rowData[`reply-${refType}-date-${consultantLead}`];
               setReplyDate(convertReplyOrSubmissionDate(dateInfo));

               if (getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', consultantLead)) {
                  cellButtonArr = [...cellButtonArr, 'btn-linkFormReply'];
               };
            };
            setArrayButtonCell(cellButtonArr);
         } else if (column.key === 'Received By') {
            setConsultantMustReply(getInfoValueFromRefDataForm(rowData, 'submission', refType, 'consultantMustReply'));
         };
      };

   }, [activeBtn]);




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
         window.open(res.data);
      } catch (err) {
         console.log(err);
      };
   };



   const onClickCellButton = async (btnName, isCviReplyOption, companyCellTagCvi) => {
      try {
         if (btnName === 'btn-linkDrawings') {
            const dwgsLinkList = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawings') || [];
            const dwgsRfaLinkList = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkDrawingsRfa') || [];
            setModalListDrawingAttached([...dwgsLinkList, ...dwgsRfaLinkList]);

         } else if (btnName === 'btn-linkFormSubmitNoSignatureOrSignedOff') {
            const linkFormSignedOff = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkSignedOffFormSubmit');
            if (linkFormSignedOff) {
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormSignedOff, expire: 1000 } });
               window.open(res.data);
            } else {
               const linkFormNoSignature = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'linkFormNoSignature');
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormNoSignature, expire: 1000 } });
               window.open(res.data);
            };
         } else if (btnName === 'btn-linkFormReply') {
            const linkFormReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'linkFormReply', isCviReplyOption ? companyCellTagCvi : replyCompany);
            const res = await Axios.get('/api/issue/get-public-url', { params: { key: linkFormReply, expire: 1000 } });
            window.open(res.data);

         } else if (btnName === 'btn-submitSignedOffToConsultant') {
            setPanelUploadSignedOffFormShown(true);

         } else if (btnName === 'btn-edit') {

            let typeFormBtn = '';
            if (isCviReplyOption) {
               typeFormBtn = 'form-reply-multi-type';
            } else {
               if (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) {
                  typeFormBtn = 'form-reply-multi-type';
               } else {
                  if (rowData.revision !== '0') {
                     typeFormBtn = 'form-resubmit-multi-type';
                  } else {
                     typeFormBtn = 'form-submit-multi-type';
                  };
               };
            };

            buttonPanelFunction(typeFormBtn);
            getSheetRows({
               ...stateRow,
               currentRefToAddNewOrReplyOrEdit: {
                  currentRefData: rowData,
                  formRefType: typeFormBtn,
                  isFormEditting: true
               },
            });

         } else if (btnName === 'btn-resubmit') {
            buttonPanelFunction('form-resubmit-multi-type');
            getSheetRows({
               ...stateRow,
               currentRefToAddNewOrReplyOrEdit: {
                  currentRefData: rowData,
                  formRefType: 'form-resubmit-multi-type',
                  isFormEditting: false
               },
            });

         } else if (btnName === 'btn-reply') {
            if (isCviReplyOption) {
               if (pageSheetTypeName === 'page-dt') {
                  buttonPanelFunction('acknowledge-form');
               } else if (pageSheetTypeName === 'page-cvi') {
                  buttonPanelFunction('acknowledge-or-reply-form');
               };
            } else {
               buttonPanelFunction('form-reply-multi-type');
            };
            getSheetRows({
               ...stateRow,
               currentRefToAddNewOrReplyOrEdit: {
                  currentRefData: rowData,
                  formRefType: 'form-reply-multi-type',
                  isFormEditting: false
               },
            });
         };
      } catch (err) {
         console.log(err);
      };
   };




   const applyChooseConsultantToReplyForAdminOnly = (consultantToReply) => {

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

         await Axios.post('/api/rfa/mail', {
            token,
            data: {
               projectId, company, projectName,
               formSubmitType: refType,
               type: 'submit-signed-off-final',
               rowIds: [rowChild.id],
               emailSender: email,
            },
            momentToTriggerEmail: moment().add(moment.duration(0.1, 'minutes'))
         });


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





   return (
      <div
         style={{
            width: '100%', height: '100%',
            position: 'relative',
            display: 'flex',
            padding: 3, paddingLeft: 5, color: 'black',
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
               whiteSpace: 'nowrap'
            }}>
               <span>{getCellFormData(
                  rowData, column.key, refType, consultantMustReply, replyCompany,
                  replyStatus, replyDate, onClickCellButton, company, pageSheetTypeName
               )}</span>

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
                           right: getOffsetRight(i),
                           top: 6
                        }}
                        onClick={() => onClickCellButton(btn)}
                     />
                  </Tooltip>
               ))}
            </>
         )}


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




const getTooltipText = (btnName, pageSheetTypeName) => {
   let result = 'No Tooltip';
   if (btnName === 'btn-linkDrawings') {
      result = 'Open Documents Attached List';
   } else if (btnName === 'btn-linkFormSubmitNoSignatureOrSignedOff') {
      result = 'Open Submission Form';
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
      result = 'Reply Form';
   } else if (btnName === 'btn-linkFormReply') {
      result = 'Open Reply Form';
   };
   return result;
};

const getOffsetRight = (index) => {
   if (index === 0) return 5;
   else {
      return 5 + index * 22;
   };

};
const getButtonType = (btnName) => {
   let result = 'xxx';
   if (btnName === 'btn-linkDrawings') {
      result = 'file';
   } else if (btnName === 'btn-linkFormSubmitNoSignatureOrSignedOff') {
      result = 'shake';
   } else if (btnName === 'btn-submitSignedOffToConsultant') {
      result = 'vertical-align-top';
   } else if (btnName === 'btn-edit') {
      result = 'edit';
   } else if (btnName === 'btn-resubmit') {
      result = 'plus-square';
   } else if (btnName === 'btn-reply') {
      result = 'form';
   } else if (btnName === 'btn-linkFormReply') {
      result = 'shake';
   };
   return result;
};





export const checkIfEditTimeIsOverMultiForm = (rowData, replyCompany, editTimeAllowed, refType, type) => {
   let result = false;
   let duration;

   if (type === 'wohhup-check-if-submission-edit-is-over') {
      const dateSubmission = getInfoValueFromRefDataForm(rowData, 'submission', refType, 'date');

      if (dateSubmission) {
         duration = moment.duration(moment(new Date()).diff(dateSubmission)).asMinutes();
      } else {
         return true;
      };
   } else if (type === 'consultant-check-if-reply-edit-is-over') {
      const dateReply = getInfoValueFromRefDataForm(rowData, 'reply', refType, 'date', replyCompany);
      if (typeof dateReply === 'string' && dateReply.length > 8) { // distinguish with old database
         duration = moment.duration(moment(new Date()).diff(dateReply)).asMinutes();
      } else if (typeof dateReply === 'string' && dateReply.length === 8) {
         return true;
      };
   };

   if (duration && duration > editTimeAllowed) {
      return true;
   };
   return result;
};



const getCellFormData = (row, header, refType, consultantMustReply, replyCompany, replyStatus, replyDate, onClickCellButton, company, pageSheetTypeName) => {

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
            {consultantMustReply.map((cmp, i) => {

               const isAcknowledge = getInfoValueFromRefDataForm(row, 'reply', refType, 'acknowledge', cmp);
               const filePdfAttached = getInfoValueFromRefDataForm(row, 'reply', refType, 'linkFormReply', cmp);

               let iconTagsArray = [];
               if (filePdfAttached) {
                  if (checkIfEditTimeIsOverMultiForm(row, cmp, EDIT_DURATION_MIN, refType, 'consultant-check-if-reply-edit-is-over')) {
                     iconTagsArray = [...iconTagsArray, 'btn-linkFormReply'];
                  };

                  if (
                     !checkIfEditTimeIsOverMultiForm(row, cmp, EDIT_DURATION_MIN, refType, 'consultant-check-if-reply-edit-is-over') &&
                     cmp === company
                  ) {
                     iconTagsArray = [...iconTagsArray, 'btn-edit'];
                  };
               } else {
                  if (cmp === company) {
                     iconTagsArray = [...iconTagsArray, 'btn-reply'];
                  };
               };

               if (pageSheetTypeName === 'page-dt' && isAcknowledge) {
                  iconTagsArray = iconTagsArray.filter(btn => btn !== 'btn-reply');
               };

               return (
                  <div
                     key={i}
                     style={{
                        marginRight: 5, paddingLeft: 4, paddingRight: 4,
                        background: (isAcknowledge || filePdfAttached) ? colorType.yellow : 'white',
                        fontWeight: (isAcknowledge || filePdfAttached) ? 'bold' : 'normal',
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
                              onClick={() => onClickCellButton(icon, true, cmp)}
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

