import { Icon, Modal, Tooltip } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { compareDates } from '../../utils';






const CellRFA = (props) => {

   const { rowData, cellData, column, buttonPanelFunction, onRightClickCell } = props;

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { rowsRfaAll, rowsRfaAllInit } = stateRow;

   const { roleTradeCompany, companies, company, email } = stateProject.allDataOneSheet;

   const [btnShown, setBtnShown] = useState(false);
   const [isEdittingAllowed, setIsEdittingAllowed] = useState(false);

   const [activeBtn, setActiveBtn] = useState('All');
   const [modalContent, setModalContent] = useState(null);

   const [thereIsDrawingWithNoReplyAndConsultantAllowedReply, setThereIsDrawingWithNoReplyAndConsultantAllowedReply] = useState(false);
   const [thereIsDrawingWithNoRfaRef, setThereIsDrawingWithNoRfaRef] = useState(false);
   const [requestedByCellData, setRequestedByCellData] = useState(null);

   const [rfaData, setRfaData] = useState({});
   const [rfaRefText, setRfaRefText] = useState(null);

   const [replyStatus, setReplyStatus] = useState(null);
   const [replyCompany, setReplyCompany] = useState(null);
   const [replyDate, setReplyDate] = useState(null);

   const [overdueCount, setOverdueCount] = useState(0);


   const cloneRfaData = (row) => {
      let obj = {};
      for (const key in row) {
         if (key.includes('reply') || key.includes('submission') || key === 'rfaNumber') {
            obj[key] = row[key];
         };
      };
      return obj;
   };

   useEffect(() => {
      if ((rowData.treeLevel === 3 && column.key === 'RFA Ref')) {
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

         if (roleTradeCompany.role === 'Consultant') {
            if (
               !rfaDataObj[`reply-$$$-user-${roleTradeCompany.company}`] &&
               consultantMustReplyArray && consultantMustReplyArray.indexOf(company) !== -1
            ) {
               setThereIsDrawingWithNoReplyAndConsultantAllowedReply(true);
            } else if (
               rfaDataObj[`reply-$$$-user-${roleTradeCompany.company}`] ||
               (consultantMustReplyArray && consultantMustReplyArray.indexOf(company) === -1)
            ) {
               setThereIsDrawingWithNoReplyAndConsultantAllowedReply(false);
            };
         } else {
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
            setReplyDate(replyDateData);

         } else if (isColumnConsultant(column.key)) {
            setReplyStatus(rfaDataObj[`reply-$$$-status-${company}`]);
            setReplyCompany(company);
            setReplyDate(rfaDataObj[`reply-$$$-date-${company}`]);
         } else if (column.key === 'Due Date') {
            const consultantMustReplyArray = getInfoValueFromRfaData(rfaDataObj, 'submission', 'consultantMustReply');
            if (!rowData[`reply-$$$-status-${consultantMustReplyArray[0]}`]) {
               const compare = compareDates(rowData['Consultant Reply (T)']);
               setOverdueCount(compare);
            };
         };
      };
   }, [activeBtn]);


   const [dataButtonRFA, setDataButtonRFA] = useState(null);
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
               setReplyDate(dataDate);
               setRfaData(rowData[versionIndex]);
            };
         } else if (infoData === 'RFA Ref') {
            setDataButtonRFA(rowData[versionIndex]);
         };
      };
   }, []);




   const onClickRfaDrawing = (rfaCode, btn) => {
      const rowsNotThisRFA = rowsRfaAll.filter(r => r.rfaNumber !== rfaCode);

      const rowsThisRFAFiltered = rowsRfaAllInit.filter(r => {
         return r.rfaNumber === rfaCode && (
            btn === '-'
               ? r['RFA Ref'] === rfaCode
               : btn === 'All'
                  ? !r['row']
                  : r['RFA Ref'] === rfaCode + btn
         );
      });
      getSheetRows({ ...stateRow, rowsRfaAll: [...rowsNotThisRFA, ...rowsThisRFAFiltered] });
      setActiveBtn(btn);
   };

   const onClickSubmitOrReplyRFA = (btn) => {
      buttonPanelFunction(btn);
      getSheetRows({
         ...stateRow,
         currentRfaToAddNewOrReplyOrEdit: {
            currentRfaNumber: rowData.rfaNumber,
            currentRfaRef: rfaRefText,
            currentRfaData: rfaData
         },
      });
   };




   const onMouseDownCellButton = async (btn, replyCompany, rfaData, isClickOnRFACell) => {
      try {
         if (btn === 'See Note') {
            setModalContent(
               <div>
                  <div style={{ fontWeight: 'bold' }}>{rfaData[`reply-$$$-user-${replyCompany}`] || ''}</div>
                  <div style={{ fontWeight: 'bold' }}>{rfaData[`reply-$$$-status-${replyCompany}`] || ''}</div>
                  <div>{rfaData[`reply-$$$-comment-${replyCompany}`] || ''}</div>
               </div>
            );

         } else if (btn === 'Open Drawing File') {
            if (isClickOnRFACell) {
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: dataButtonRFA[`submission-$$$-drawing-${replyCompany}`], expire: 1000 } });
               window.open(res.data);
            } else {
               const res = await Axios.get('/api/issue/get-public-url', { params: { key: rfaData[`reply-$$$-drawing-${replyCompany}`], expire: 1000 } });
               window.open(res.data);
            };


         } else if (btn === 'Open 3D File') {
            const dwgLink = getInfoValueFromRfaData(dataButtonRFA, 'submission', 'dwfx');
            if (dwgLink) {
               window.open(dwgLink);
            };

         } else if (btn === 'Edit') {
            // buttonPanelFunction('updateRFA-ICON');
            // getSheetRows({
            //    ...stateRow,
            //    currentRfaToAddNewOrReplyOrEdit: rowData['RFA Ref'],
            // });
         };
      } catch (err) {
         console.log(err);
      };
   };
   const onClickDrawingOpenRfaCell = async (btn) => {
      if (btn === 'Open Drawing File') {
         try {
            const dwgLink = getInfoValueFromRfaData(rfaData, 'submission', 'drawing');
            const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
            window.open(res.data);
         } catch (err) {
            console.log(err);
         };

      } else if (btn === 'Open 3D File') {
         const dwgLink = getInfoValueFromRfaData(rfaData, 'submission', 'dwfx');
         if (dwgLink) {
            window.open(dwgLink);
         };
      } else if (btn === 'Edit') {
         buttonPanelFunction('form-submit-edit-RFA');
         // getSheetRows({
         //    ...stateRow,
         //    currentRfaToAddNewOrReplyOrEdit: {
         //       currentRfaNumber: rowData.rfaNumber,
         //       currentRfaRef: rowData['RFA Ref']
         //    },
         // });
      };
   };

   const onMouseDown = (e) => {
      if (e.button === 2) { // check mouse RIGHT CLICK ...
         if (!column.key.includes('Version ') && column.key !== 'Info') {
            onRightClickCell(e, props);
         };
      };
   };


   const checkIfEdittingIsAllowed = (type) => {
      const tempRfaSaved = JSON.parse(localStorage.getItem(`editLastTime-${type}-${email}-${rowData['RFA Ref']}`));
      if (tempRfaSaved) {
         const duration = moment.duration(moment(new Date()).diff(tempRfaSaved.createdAt)).asMinutes();
         if (duration <= 100000) {
            setIsEdittingAllowed(true);
         } else {
            localStorage.removeItem(`editLastTime-${type}-${email}-${rowData['RFA Ref']}`);
            setIsEdittingAllowed(false);
         };
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
            if (!rowData.treeLevel && isColumnWithReplyData(column.key) && roleTradeCompany.role === 'Consultant') {
               checkIfEdittingIsAllowed('form-reply-RFA');
            } else if (!rowData.treeLevel && column.key === 'RFA Ref' && roleTradeCompany.role !== 'Consultant') {
               checkIfEdittingIsAllowed('form-submit-RFA');
            };
            if (!btnShown) setBtnShown(true);
         }}
         onMouseLeave={() => {
            if (btnShown) setBtnShown(false);
         }}
         onMouseDown={onMouseDown}
      >
         {(rowData.treeLevel === 3 && column.key === 'RFA Ref') ? (
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

               {(
                  (thereIsDrawingWithNoReplyAndConsultantAllowedReply && roleTradeCompany.role === 'Consultant') ||
                  (thereIsDrawingWithNoRfaRef && roleTradeCompany.role !== 'Consultant')
               ) && (
                     <Tooltip placement='top' title={roleTradeCompany.role === 'Consultant' ? 'Reply To This RFA' : 'Add New RFA For This RFA'} >
                        <Icon
                           type={roleTradeCompany.role === 'Consultant' ? 'edit' : 'plus-square'}
                           style={{
                              fontSize: 17,
                              transform: 'translateY(1.5px)',
                              position: 'absolute',
                              right: 3,
                              top: 0
                           }}
                           onClick={() => onClickSubmitOrReplyRFA(roleTradeCompany.role === 'Consultant' ? 'form-reply-RFA' : 'form-submit-RFA')}
                        />
                     </Tooltip>
                  )}
            </div>
         ) : (rowData.treeLevel >= 2 && column.key === 'RFA Ref') ? rowData.title
            : (!rowData.treeLevel && (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) && replyStatus) ? (
               <div>
                  <span style={{ fontWeight: 'bold' }}>{replyCompany}</span>
                  <span>{` - (${replyDate})`}</span>
               </div>
            ) : (!rowData.treeLevel && column.key.includes('Version ') && replyStatus) ? (
               <div>
                  <span style={{ float: 'left', paddingLeft: 3, fontWeight: 'bold' }}>{replyCompany}</span>
               </div>
            ) : (!rowData.treeLevel && column.key.includes('Version ') && dataButtonRFA) ? (
               <div>
                  <span style={{ float: 'left', paddingLeft: 3, fontWeight: 'bold' }}>{dataButtonRFA.rfaRef}</span>
               </div>

            ) : (!rowData.treeLevel && (isColumnWithReplyData(column.key) || isColumnConsultant(column.key)) && !replyStatus && rowData['RFA Ref']) ? (
               <div><span>{replyCompany}</span></div>

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


         {btnShown && !rowData.treeLevel && (
            (isColumnWithReplyData(column.key) && replyCompany) ||
            (column.key.includes('Version ') && (dataButtonRFA || replyCompany))
         ) && (
               <>
                  {/* {(isEdittingAllowed */}
                  {(dataButtonRFA
                     // ? ['Edit', 'See Note', 'Open Drawing File']
                     ? ['Open 3D File', 'Open Drawing File']
                     : ['See Note', 'Open Drawing File']
                  ).map(btn => (
                     <Tooltip key={btn} placement='top' title={btn}>
                        <div
                           style={{
                              cursor: 'pointer', position: 'absolute',
                              right: (btn === 'See Note' || btn === 'Open 3D File') ? 4 : btn === 'Open Drawing File' ? 24 : 44,
                              top: 5, height: 17, width: 17,
                              // backgroundImage: `url(${imgLink.btnDate})`,
                              // backgroundSize: 17
                           }}
                           onMouseDown={() => onMouseDownCellButton(
                              btn, 
                              replyCompany || company, 
                              rfaData || dataButtonRFA,
                              dataButtonRFA ? true : false
                           )}
                        >
                           <Icon
                              type={btn === 'See Note' ? 'message' : btn === 'Open Drawing File' ? 'file' : btn === 'Open 3D File' ? 'shake' : 'edit'}
                              style={{ color: dataButtonRFA ? 'black' : 'white' }}
                           />
                        </div>
                     </Tooltip>
                  ))}
               </>
            )}

         {btnShown && !rowData.treeLevel && column.key === 'RFA Ref' && rowData['RFA Ref'] && (
            <>
               {(isEdittingAllowed
                  // ? ['Edit', 'Open Drawing File', 'Open 3D File']
                  ? ['Open Drawing File', 'Open 3D File']
                  : ['Open Drawing File', 'Open 3D File']
               ).map(btn => (
                  <Tooltip key={btn} placement='top' title={btn}>
                     {/* <div
                        style={{
                           cursor: 'pointer', position: 'absolute',
                           right: btn === 'Open Drawing File' ? 4 : 24,
                           top: 5, height: 17, width: 17,
                           backgroundSize: 17,
                           backgroundImage: `url(${imgLink.btnFileUpload})`
                        }}
                        onMouseDown={() => onClickDrawingOpenRfaCell(btn)}
                     /> */}
                     <div
                        style={{
                           cursor: 'pointer', position: 'absolute',
                           right: btn === 'See Note' ? 4 : btn === 'Open Drawing File' ? 24 : btn === 'Open 3D File' ? 44 : 64,
                           top: 5, height: 17, width: 17,
                        }}
                        onMouseDown={() => onClickDrawingOpenRfaCell(btn)}
                     >
                        <Icon
                           type={btn === 'Open Drawing File' ? 'file' : btn === 'Open 3D File' ? 'shake' : 'edit'}
                           style={{ color: 'black' }}
                        />
                     </div>
                  </Tooltip>
               ))}
            </>
         )}


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
         replyDate = rowData[`reply-$$$-date-${consultantLeadName}`];
      } else if (consultantHeaderNumber > 1) {
         let ConsultantIndex = 1;
         companies.forEach(cmp => {
            if (listConsultantMustReplyRemaining.indexOf(cmp.company) !== -1) {
               ConsultantIndex += 1;
               if (consultantHeaderNumber === ConsultantIndex) {
                  replyStatus = rowData[`reply-$$$-status-${cmp.company}`];
                  replyCompany = cmp.company;
                  replyDate = rowData[`reply-$$$-date-${cmp.company}`];
               };
            };
         });
      };
   };
   return { replyStatus, replyCompany, replyDate };
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