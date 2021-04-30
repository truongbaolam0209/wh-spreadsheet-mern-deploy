const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { HTTP } = require('../errors');
const moment = require('moment');


function toObjectId(idStr, defaultValue) {
   try {
      if (!idStr) throw new Error('Empty id!');

      return ObjectId(idStr);

   } catch (err) {
      if (defaultValue === undefined) {
         throw new HTTP(400, 'Invalid id!');
      } else {
         return defaultValue;
      };
   };
};

function filterObject(src, ...fields) {
   let result = {};
   if (src instanceof Object) {
      for (let field in src) {
         if (fields.includes(field)) {
            result[field] = src[field]
         };
      };
   };
   return result;
};

function mongoObjectId() {
   var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
   return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
   }).toLowerCase();
};


const getInfoKeyFromRfaData = (obj, type, info) => {
   for (const key in obj) {
      if (key.includes(`${type}-$$$-${info}-`)) {
         return key;
      };
   };
};


const generateEmailInnerHTMLBackend = (company, emailType, rowsData) => {
   const headersArray = [
      '',
      'Drawing Number',
      'Drawing Name',
      // 'RFA Ref',
      // 'Drg To Consultant (A)',
      // 'Consultant Reply (T)',
      'Rev',
      'Status',
      // 'File'
   ];
   const typeInput = emailType === 'submit' ? 'submission' : emailType === 'reply' ? 'reply' : '';
   let emailTitle = '';
   let emailAdditionalNotes = '';
   let rfaRefText = '';
   let consultantMustReply = [];
   let contractorName = '';

   const rowContainsRfaData = rowsData.find(row => row[getInfoKeyFromRfaData(row, 'submission', 'consultantMustReply')]);
   if (rowContainsRfaData) {
      emailTitle = rowContainsRfaData[`${typeInput}-$$$-emailTitle-${company}`];
      emailAdditionalNotes = rowContainsRfaData[`${typeInput}-$$$-emailAdditionalNotes-${company}`];
      rfaRefText = rowContainsRfaData['RFA Ref'];
      consultantMustReply = rowContainsRfaData[`submission-$$$-consultantMustReply-${company}`];


      const keyConsultantMustReply = getInfoKeyFromRfaData(rowContainsRfaData, 'submission', 'consultantMustReply');
      contractorName = keyConsultantMustReply.slice(35, keyConsultantMustReply.length);
   };

   const th_td_style = `style='border: 1px solid #dddddd; text-align: left; padding: 8px; position: relative;'`;

   let tableBody = '';
   rowsData.forEach((rowData, i) => {
      let str = `<td ${th_td_style}>${i + 1}</td>`;
      headersArray.forEach((headerText, i) => {
         if (i !== 0) {
            if (headerText === 'Status' && emailType === 'reply') {
               str += `<td ${th_td_style}>${rowData[`reply-$$$-status-${company}`] || ''}</td>`;
            } else if (headerText === 'Status' && emailType === 'submit') {
               str += `<td ${th_td_style}>Consultant reviewing</td>`;
            } else if (headerText === 'Drawing Number') {
               str += `
                  <td ${th_td_style}>
                     <a style='text-decoration: none;' href='${rowData[`${typeInput}-$$$-drawing-${company}`]}' download>
                        ${rowData[headerText] || ''}
                     </a>
                  </td>
               `;
            } else {
               str += `<td ${th_td_style}>${rowData[headerText] || ''}</td>`;
            };
         };
      });
      tableBody += `<tr>${str}</tr>`;
   });


   let tableHeader = '';
   headersArray.forEach(headerText => {
      tableHeader += `<th ${th_td_style}>${headerText}</th>`;
   });
   tableHeader = `<tr style='background: #34495e; color: white;'>${tableHeader}</tr>`;


   const emailOutput = `
   <div style='line-height: 1.6; font-family: Arial, Helvetica, sans-serif;'>
      <div>Subject: <span style='font-weight: bold;'>${emailTitle}</span></div>
      <div>RFA Ref: <span style='font-weight: bold;'>${rfaRefText}</span></div>
      ${emailType === 'submit'
         ? `
         <div>Submission Date: <span style='font-weight: bold;'>${moment().format('MMM Do YYYY')}</span></div>
         <br />
         <div>Dear all,</div>
         <div>
            <span style='font-weight: bold;'>${company}</span> has submitted <span
               style='font-weight: bold;'>${rfaRefText}</span> for you to review, the
            drawings included in this RFA
            are in the list below.
            <div>${emailAdditionalNotes.replace('\n', '<br />')}</div>
         </div>
         <div>Please review and reply to us by <span style='font-weight: bold;'>${moment().add(14, 'days').format('MMM Do YYYY')}</span></div>
      ` : `
         <div>Reply Date: <span style='font-weight: bold;'>${moment().format('MMM Do YYYY')}</span></div>
         <br />
         <div>Dear all,</div>
         <div>
            <span style='font-weight: bold;'>${company}</span> has reply <span
               style='font-weight: bold;'>${rfaRefText}</span>, the
            replied drawings included in this RFA
            are in the list below.
            <div>${emailAdditionalNotes.replace('\n', '<br />')}</div>
         </div>
      `}
      
      <br />
      <div>Uploaded Documents</div>
      <table align='center' cellpadding='0' cellspacing='0' width='100%' style='border-collapse: collapse; font-size: 14px;'>
         ${tableHeader}
         ${tableBody}
      </table>
      <div style='font-size: 12px;'>Download links are valid for 24 hours.</div>
      <br />
      <a href="https://bim.wohhup.com/projects">Go to BIM APP</a>
      <div>This is an automatic email from <span style='font-weight: bold;'>${company}</span></div>
      <br />
   </div>
   `;
   return emailOutput;
};

module.exports = {
   toObjectId,
   filterObject,
   mongoObjectId,
   generateEmailInnerHTMLBackend
};
