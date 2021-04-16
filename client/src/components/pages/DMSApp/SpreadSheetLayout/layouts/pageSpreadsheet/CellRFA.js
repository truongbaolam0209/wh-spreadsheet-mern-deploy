import { Icon, Modal, Tooltip } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { colorTextRow, colorType, imgLink } from '../../constants';
import { Context as ProjectContext } from '../../contexts/projectContext';
import { Context as RowContext } from '../../contexts/rowContext';
import { compareDates } from '../../utils';





const CellRFA = (props) => {

   const { rowData, cellData, column, buttonPanelFunction, onRightClickCell } = props;

   const { state: stateRow, getSheetRows } = useContext(RowContext);
   const { state: stateProject } = useContext(ProjectContext);

   const { roleTradeCompany, companies, company } = stateProject.allDataOneSheet;

   const [btnShown, setBtnShown] = useState(false);
   const [isEdittingAllowed, setIsEdittingAllowed] = useState(false);


   const [activeBtn, setActiveBtn] = useState('All');
   const [modalContent, setModalContent] = useState(null);

   let overdueCount;
   if (
      (column.key === 'Due Date') && 
      !rowData.treeLevel) {
      if (!companies) overdueCount = 0;
      const listConsultant = companies.filter(x => x.companyType === 'Consultant');
      if (listConsultant.length === 0) overdueCount = 0;
      let consultantLead = listConsultant.find(x => x.isLeadConsultant);
      if (!consultantLead) {
         consultantLead = listConsultant[0];
      };

      if (!rowData[`reply-$$$-status-${consultantLead.company}`]) {
         overdueCount = compareDates(rowData['Consultant Reply (T)']);
      };
   };


   const onClickRfaDrawing = (rfaCode, btn) => {
      const { rowsRfaAll, rowsRfaAllInit } = stateRow;
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



   const onClickSubmitOrReplyRFA = () => {
      buttonPanelFunction('addNewRFA-ICON');
      getSheetRows({
         ...stateRow,
         currentRfaToAddNewOrReply: rowData.id,
      });
   };

   let replyStatus, replyCompany, replyDate;
   if (column.key.includes('Consultant (') && !column.key.includes('Drg To Consultant (')) {
      const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyData(rowData, column.key, companies);
      replyStatus = replyStatusData;
      replyCompany = replyCompanyData;
      replyDate = replyDateData;
   } else if (column.key.includes('Version ')) {

      const infoData = rowData['Info'];
      let keyItem;
      if (infoData.includes('Consultant (') && !infoData.includes('Drg To Consultant (')) {
         keyItem = infoData;
      };

      const { replyStatus: replyStatusData, replyCompany: replyCompanyData, replyDate: replyDateData } = getConsultantReplyData(rowData, keyItem, companies);
      replyStatus = replyStatusData;
      replyCompany = replyCompanyData;
      replyDate = replyDateData;
   };

   // console.log({ replyStatus, replyCompany, replyDate });

   const [thereIsDrawingWithNoReply, setThereIsDrawingWithNoReply] = useState(false);
   const [thereIsDrawingWithNoRfaRef, setThereIsDrawingWithNoRfaRef] = useState(false);

   useEffect(() => {
      if (rowData.treeLevel === 3 && column.key === 'RFA Ref') {
         const allRowsChildren = rowData.children;
         if (roleTradeCompany.role === 'Consultant' && allRowsChildren.find(x => !x[`reply-$$$-status-${roleTradeCompany.company}`])) {
            setThereIsDrawingWithNoReply(true);
         };

         if (roleTradeCompany.role !== 'Consultant' && allRowsChildren.find(x => !x['RFA Ref'])) {
            setThereIsDrawingWithNoRfaRef(true);
         };
      };
   }, []);



   const onMouseDownCellButton = async (btn, replyCompany, rowData) => {
      try {
         if (btn === 'See Note') {
            const commentText = rowData[`reply-$$$-comment-${replyCompany}`] || ' ';
            setModalContent(commentText);

         } else if (btn === 'Open Drawing File') {
            const res = await Axios.get('/api/issue/get-public-url', { params: { key: rowData[`reply-$$$-drawing-${replyCompany}`], expire: 1000 } });
            window.open(res.data);

         } else if (btn === 'Edit') {

            // buttonPanelFunction('updateRFA-ICON');
            // getSheetRows({
            //    ...stateRow,
            //    currentRfaToAddNewOrReply: rowData['RFA Ref'],
            // });
        
         };
      } catch (err) {
         console.log(err);
      };
   };
   const onClickDrawingOpenRfaCell = async () => {
      try {
         let dwgLink;
         Object.keys(rowData).forEach(key => {
            if (key.includes('submission-$$$-drawing-')) {
               dwgLink = rowData[key];
            };
         });
         const res = await Axios.get('/api/issue/get-public-url', { params: { key: dwgLink, expire: 1000 } });
         window.open(res.data);
      } catch (err) {
         console.log(err);
      };
   };

   const onMouseDown = (e) => {
      if (e.button === 2) { // check mouse RIGHT CLICK ...
         onRightClickCell(e, props);
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
            background:
               column.key === 'Due Date'
                  ? overdueCount < 0 && '#FFEBCD'
                  : (colorTextRow[replyStatus] || 'transparent'),
            fontWeight: column.key === 'RFA Ref' && rowData.treeLevel && 'bold'
         }}
         onMouseOver={() => {
            if (
               !rowData.treeLevel &&
               column.key.includes('Consultant (') &&
               !column.key.includes('Drg To Consultant (') &&
               roleTradeCompany.role === 'Consultant'
            ) {
               const tempRowSavedTime = JSON.parse(localStorage.getItem(`editLastTime-reply-${rowData['RFA Ref']}-${rowData.id}`));
               console.log('tempRowSavedTime', tempRowSavedTime);
               if (tempRowSavedTime) {
                  const duration = moment.duration(moment(new Date()).diff(tempRowSavedTime)).asMinutes();
                  if (duration <= 100000) {
                     setIsEdittingAllowed(true);
                  } else {
                     localStorage.removeItem(`editLastTime-reply-${rowData['RFA Ref']}-${rowData.id}`)
                     setIsEdittingAllowed(false);
                  };
               };
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
                  (thereIsDrawingWithNoReply && roleTradeCompany.role === 'Consultant') ||
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
                           onClick={onClickSubmitOrReplyRFA}
                        />
                     </Tooltip>
                  )}
            </div>
         ) : (rowData.treeLevel >= 2 && column.key === 'RFA Ref') ? rowData.title
            : (
               !rowData.treeLevel && column.key.includes('Consultant (') &&
               !column.key.includes('Drg To Consultant (') && replyDate
            ) ? (
               <div>
                  <span style={{ fontWeight: 'bold' }}>{replyCompany}</span>
                  <span>{` - (${replyDate})`}</span>
               </div>
            ) : (!rowData.treeLevel && column.key === 'Due Date') ? (
               <span style={{
                  fontWeight: overdueCount < 0 && 'bold',
                  color: overdueCount < 0 && 'red',
               }}>
                  {rowData['Consultant Reply (T)']}
               </span>
            ) : (!rowData.treeLevel && column.key === 'Submission Date') ? (
               <span style={{}}>
                  {rowData['Drg To Consultant (A)']}
               </span>
            ) : (!rowData.treeLevel && !column.key.includes('Consultant (')) ? cellData
               : ''}


         {(
            btnShown && !rowData.treeLevel &&
            column.key.includes('Consultant (') &&
            !column.key.includes('Drg To Consultant (') &&
            replyCompany) && (
               <>
                  {(
                     (isEdittingAllowed && replyCompany === company)
                        ? ['Edit', 'See Note', 'Open Drawing File']
                        : ['See Note', 'Open Drawing File']
                  ).map(btn => (
                     <Tooltip key={btn} placement='top' title={btn}>
                        <div
                           style={{
                              cursor: 'pointer', position: 'absolute',
                              right: btn === 'See Note' ? 4 : btn === 'Open Drawing File' ? 24 : 44,
                              top: 5, height: 17, width: 17,
                              // backgroundImage: `url(${imgLink.btnDate})`,
                              // backgroundSize: 17
                           }}
                           onMouseDown={() => onMouseDownCellButton(btn, replyCompany, rowData)}
                        >
                           <Icon
                              type={btn === 'See Note' ? 'message' : btn === 'Open Drawing File' ? 'file' : 'edit'}
                              style={{ color: 'white' }}
                           />
                        </div>
                     </Tooltip>
                  ))}
               </>
            )}

         {(btnShown && !rowData.treeLevel &&
            column.key === 'RFA Ref' && rowData['RFA Ref']) && (
               <Tooltip key={'Open Drawing File'} placement='top' title={'Open Drawing File'}>
                  <div
                     style={{
                        cursor: 'pointer', position: 'absolute',
                        right: 4, top: 5, height: 17, width: 17,
                        backgroundSize: 17,
                        backgroundImage: `url(${imgLink.btnFileUpload})`
                     }}
                     onMouseDown={onClickDrawingOpenRfaCell}
                  />
               </Tooltip>
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
   if (header.includes('Consultant (') && !header.includes('Drg To Consultant (')) {

      if (!companies) return {};
      const listConsultant = companies.filter(x => x.companyType === 'Consultant');
      if (listConsultant.length === 0) return {};

      let listConsultantsReply = [];
      for (const key in rowData) {
         if (key.includes('reply-$$$-status')) {
            const companyConsultant = key.slice(17, key.length);
            listConsultantsReply.push(companyConsultant);
         };
      };
      listConsultantsReply = [...new Set(listConsultantsReply)];

      const consultantHeaderNumber = parseInt(header.slice(12, header.length - 1));

      let consultantLead = listConsultant.find(x => x.isLeadConsultant);
      if (!consultantLead) {
         consultantLead = listConsultant[0];
      };
      const consultantsRemaining = listConsultant.filter(x => x.company !== consultantLead.company);

      if (consultantHeaderNumber === 1) {
         if (listConsultantsReply.indexOf(consultantLead.company) !== -1) {
            replyStatus = rowData[`reply-$$$-status-${consultantLead.company}`];
            if (replyStatus) {
               replyCompany = consultantLead.company;
               const dateData = rowData[`reply-$$$-date-${consultantLead.company}`];
               // replyDate = moment(dateData).format('DD/MM/YY');
               replyDate = dateData;
            };
         };

      } else if (consultantHeaderNumber > 1) {
         let ConsultantIndex = 1;
         consultantsRemaining.forEach(cmp => {
            if (listConsultantsReply.indexOf(cmp.company) !== -1) {
               ConsultantIndex += 1;
               if (consultantHeaderNumber === ConsultantIndex) {
                  replyStatus = rowData[`reply-$$$-status-${cmp.company}`] || '';
                  replyCompany = cmp.company;
                  const dateData = rowData[`reply-$$$-date-${cmp.company}`];
                  replyDate = dateData || '';
               };
            };
         });
      };
   };
   return { replyStatus, replyCompany, replyDate };
};